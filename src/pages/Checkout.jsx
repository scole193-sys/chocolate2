import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Loader2, Lock, ShoppingBag, Truck } from 'lucide-react'
import { EmptyState, SmartImage } from '../components/ui'
import { useStore } from '../context/store'
import { FREE_SHIPPING_AT, SHIPPING, shippingCost as costFor } from '../data/content'
import { api } from '../lib/api'
import { money } from '../lib/format'
import { href } from '../lib/router'

const EMPTY = { email: '', name: '', address: '', city: '', postcode: '', country: 'United States', card: '', expiry: '', cvc: '' }

function validate(f) {
  const e = {}
  if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Please enter a valid email so we can send your receipt.'
  if (f.name.trim().length < 2) e.name = 'Who should we address the parcel to?'
  if (f.address.trim().length < 4) e.address = 'We need a street address to deliver to.'
  if (!f.city.trim()) e.city = 'Please add a city.'
  if (f.postcode.trim().length < 3) e.postcode = 'Please add a postcode.'
  if (f.card.replace(/\s/g, '').length !== 16) e.card = 'Card numbers have 16 digits — try 4242 4242 4242 4242.'
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(f.expiry)) e.expiry = 'Use MM/YY.'
  if (!/^\d{3,4}$/.test(f.cvc)) e.cvc = '3 or 4 digits.'
  return e
}

function Field({ id, label, error, className = '', ...props }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs tracking-wide text-muted">
        {label}
      </label>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={`field ${error ? '!border-red-400/70' : ''}`} {...props} />
      <AnimatePresence>
        {error && (
          <motion.p id={`${id}-err`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-1.5 text-xs text-red-400">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function Confirmation({ order }) {
  const sparks = Array.from({ length: 18 })
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 pt-36 text-center">
      <div className="relative mb-10 grid h-36 w-36 place-items-center">
        {sparks.map((_, i) => {
          const a = (i / sparks.length) * Math.PI * 2
          return (
            <motion.span
              key={i}
              className="absolute h-2 w-2 rounded-full bg-gradient-to-br from-[#f3d9a4] to-copper"
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{ x: Math.cos(a) * 110, y: Math.sin(a) * 110, opacity: 0, scale: [0, 1.4, 0.6] }}
              transition={{ duration: 1.4, delay: 0.55, ease: 'easeOut' }}
            />
          )
        })}
        <motion.div className="glow absolute inset-0 rounded-full bg-gradient-to-br from-[#f3d9a4] via-gold to-copper" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }} />
        <svg viewBox="0 0 52 52" className="relative h-16 w-16">
          <motion.path d="M14 27 l8 8 l16 -18" fill="none" stroke="#1a0f0a" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }} />
        </svg>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <p className="eyebrow mb-3">Order {order.id}</p>
        <h1 className="font-display text-4xl sm:text-5xl">
          Thank you, <em className="foil">{order.name}</em>
        </h1>
        <p className="mt-4 leading-relaxed text-muted">
          Your chocolate is being wrapped by hand. A confirmation is on its way to <span className="text-ink">{order.email}</span>, and we’ll send tracking once it leaves our kitchen.
        </p>
        <p className="mt-6 rounded-2xl border border-line px-5 py-3 text-sm text-muted">
          Total paid <span className="ml-2 font-display text-xl text-gold">{money(order.total)}</span>
        </p>
        <a href={href('shop')} className="btn-gold mt-8">
          Continue shopping <ArrowRight size={16} />
        </a>
        <p className="mt-6 text-xs text-muted">This is a demo — no payment was taken.</p>
      </motion.div>
    </div>
  )
}

export default function Checkout() {
  const { cart, subtotal, clearCart, toast } = useStore()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [ship, setShip] = useState('standard')
  const [status, setStatus] = useState('idle')
  const [order, setOrder] = useState(null)

  if (order) return <Confirmation order={order} />

  if (cart.length === 0) {
    return (
      <div className="pt-32">
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to check out yet"
          text="Your bag is empty. Discover a bar, a box or a monthly tasting first."
          action={
            <a href={href('shop')} className="btn-gold">
              Shop the Collection
            </a>
          }
        />
      </div>
    )
  }

  const shippingCost = costFor(ship, subtotal)
  const total = subtotal + shippingCost

  const set = (k) => (e) => {
    let v = e.target.value
    if (k === 'card') v = v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
    if (k === 'expiry') v = v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2')
    if (k === 'cvc') v = v.replace(/\D/g, '').slice(0, 4)
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length) {
      toast('A few details need another look', { tone: 'error' })
      document.getElementById(Object.keys(errs)[0])?.focus()
      return
    }
    setStatus('processing')
    try {
      // Card details stay in the browser: this is a demo and nothing payment-related is sent or stored.
      const { card: _card, expiry: _expiry, cvc: _cvc, ...customer } = form
      const placed = await api('/orders', {
        body: {
          customer,
          shipping: ship,
          items: cart.map(({ kind, productId, config, qty }) => ({ kind, productId, config, qty })),
        },
      })
      setOrder({ id: placed.orderNumber, name: form.name.split(' ')[0], email: form.email, total: placed.total })
      clearCart()
      window.scrollTo({ top: 0 })
    } catch (err) {
      toast(err.message, { tone: 'error' })
      setStatus('idle')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-28 sm:px-6 lg:px-8 lg:pt-36">
      <h1 className="mb-2 font-display text-4xl sm:text-5xl">Checkout</h1>
      <p className="mb-10 flex items-center gap-2 text-sm text-muted">
        <Lock size={14} className="text-gold" /> Demo checkout — no real payment is taken.
      </p>

      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <form onSubmit={submit} noValidate className="space-y-8">
          <fieldset className="glass space-y-4 rounded-3xl p-5 sm:p-7">
            <legend className="float-left mb-2 w-full font-display text-xl">Contact & delivery</legend>
            <Field id="email" label="Email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="you@example.com" />
            <Field id="name" label="Full name" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} placeholder="Amara Okafor" />
            <Field id="address" label="Address" autoComplete="street-address" value={form.address} onChange={set('address')} error={errors.address} placeholder="12 Cocoa Lane" />
            <div className="grid grid-cols-2 gap-4">
              <Field id="city" label="City" autoComplete="address-level2" value={form.city} onChange={set('city')} error={errors.city} />
              <Field id="postcode" label="Postcode" autoComplete="postal-code" value={form.postcode} onChange={set('postcode')} error={errors.postcode} />
            </div>
            <div>
              <label htmlFor="country" className="mb-1.5 block text-xs tracking-wide text-muted">Country</label>
              <select id="country" value={form.country} onChange={set('country')} className="field">
                {['United States', 'United Kingdom', 'Canada', 'Australia', 'France', 'Germany'].map((c) => (
                  <option key={c} className="bg-surface">{c}</option>
                ))}
              </select>
            </div>
          </fieldset>

          <fieldset className="glass rounded-3xl p-5 sm:p-7">
            <legend className="float-left mb-4 w-full font-display text-xl">Shipping</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {SHIPPING.map((s) => {
                const free = s.id === 'standard' && subtotal >= FREE_SHIPPING_AT
                return (
                  <label key={s.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${ship === s.id ? 'border-gold bg-gold/10' : 'border-line hover:border-gold/50'}`}>
                    <input type="radio" name="ship" value={s.id} checked={ship === s.id} onChange={() => setShip(s.id)} className="accent-[#d4a256]" />
                    <Truck size={18} className="text-gold" />
                    <span className="flex-1">
                      <span className="block text-sm text-ink">{s.label}</span>
                      <span className="block text-xs text-muted">{s.detail}</span>
                    </span>
                    <span className="text-sm text-ink">{free ? 'Free' : money(s.price)}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <fieldset className="glass space-y-4 rounded-3xl p-5 sm:p-7">
            <legend className="float-left mb-2 w-full font-display text-xl">Payment</legend>
            <Field id="card" label="Card number" inputMode="numeric" autoComplete="cc-number" value={form.card} onChange={set('card')} error={errors.card} placeholder="4242 4242 4242 4242" />
            <div className="grid grid-cols-2 gap-4">
              <Field id="expiry" label="Expiry" inputMode="numeric" autoComplete="cc-exp" value={form.expiry} onChange={set('expiry')} error={errors.expiry} placeholder="MM/YY" />
              <Field id="cvc" label="CVC" inputMode="numeric" autoComplete="cc-csc" value={form.cvc} onChange={set('cvc')} error={errors.cvc} placeholder="123" />
            </div>
          </fieldset>

          <button type="submit" disabled={status === 'processing'} className="btn-gold w-full py-4 text-base">
            {status === 'processing' ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Wrapping your order…
              </>
            ) : (
              <>
                <Lock size={16} /> Place order · {money(total)}
              </>
            )}
          </button>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="glass rounded-3xl p-5 sm:p-7">
            <h2 className="mb-5 font-display text-xl">Order summary</h2>
            <ul className="space-y-4">
              {cart.map((i) => (
                <li key={i.key} className="flex items-center gap-3">
                  <div className="relative">
                    <SmartImage src={i.image} alt={i.name} className="h-16 w-14 rounded-xl" />
                    <span className="absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-semibold text-cocoa">{i.qty}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">{i.name}</p>
                    {i.meta && <p className="truncate text-xs text-muted">{i.meta}</p>}
                  </div>
                  <span className="text-sm tabular-nums">{money(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
              <div className="flex justify-between text-muted">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{money(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Shipping</dt>
                <dd className="tabular-nums">{shippingCost === 0 ? 'Free' : money(shippingCost)}</dd>
              </div>
              <div className="flex items-baseline justify-between pt-2 text-ink">
                <dt>Total</dt>
                <dd className="foil font-display text-3xl tabular-nums">{money(total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}
