import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, Trash2, Truck, X } from 'lucide-react'
import { useStore } from '../context/store'
import { FREE_SHIPPING_AT } from '../data/content'
import { money } from '../lib/format'
import { navigate } from '../lib/router'
import { EmptyState, QtyStepper, SmartImage } from './ui'

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, subtotal, setQty, removeFromCart, addToCart, toast } = useStore()
  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal)
  const progress = Math.min(1, subtotal / FREE_SHIPPING_AT)

  useEffect(() => {
    if (!cartOpen) return
    const onKey = (e) => e.key === 'Escape' && setCartOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [cartOpen, setCartOpen])

  const remove = (item) => {
    removeFromCart(item.key)
    toast(`Removed ${item.name}`, { tone: 'neutral', action: { label: 'Undo', onClick: () => addToCart(item, item.qty) } })
  }

  return (
    <AnimatePresence>
      {cartOpen && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-cocoa/70 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-base shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="font-display text-2xl">Your bag</h2>
              <button type="button" onClick={() => setCartOpen(false)} aria-label="Close bag" className="grid h-10 w-10 place-items-center rounded-full hover:bg-gold/10 hover:text-gold">
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-1 items-center">
                <EmptyState
                  icon={ShoppingBag}
                  title="Your bag is empty"
                  text="Nothing here yet — but a single square of Esmeraldas 72% is a very good place to start."
                  action={
                    <button
                      className="btn-gold"
                      onClick={() => {
                        setCartOpen(false)
                        navigate('shop')
                      }}
                    >
                      Shop the Collection
                    </button>
                  }
                />
              </div>
            ) : (
              <>
                <div className="border-b border-line px-6 py-4">
                  <p className="mb-2.5 flex items-center gap-2 text-sm text-ink">
                    <Truck size={16} className="text-gold" />
                    {remaining > 0 ? (
                      <span>
                        You’re <strong className="text-gold">{money(remaining)}</strong> away from free shipping
                      </span>
                    ) : (
                      <span>You’ve unlocked <strong className="text-gold">free shipping</strong> ✦</span>
                    )}
                  </p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-raised" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-copper via-gold to-[#f3d9a4]" initial={false} animate={{ width: `${progress * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
                  </div>
                </div>

                <ul className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                  <AnimatePresence initial={false}>
                    {cart.map((item) => (
                      <motion.li key={item.key} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30, height: 0 }} className="flex gap-4">
                        <SmartImage src={item.image} alt={item.name} className="h-24 w-20 shrink-0 rounded-xl" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-display text-lg leading-tight">{item.name}</p>
                              {item.meta && <p className="mt-0.5 line-clamp-2 text-xs text-muted">{item.meta}</p>}
                            </div>
                            <button type="button" onClick={() => remove(item)} aria-label={`Remove ${item.name}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:text-gold">
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <QtyStepper size="sm" value={item.qty} min={0} onChange={(q) => (q === 0 ? remove(item) : setQty(item.key, q))} />
                            <span className="text-sm font-medium tabular-nums">{money(item.price * item.qty)}</span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <div className="border-t border-line px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                  <div className="mb-1 flex justify-between text-sm text-muted">
                    <span>Subtotal</span>
                    <span className="text-lg font-medium text-ink tabular-nums">{money(subtotal)}</span>
                  </div>
                  <p className="mb-4 text-xs text-muted">Shipping & taxes calculated at checkout.</p>
                  <button
                    className="btn-gold w-full py-4"
                    onClick={() => {
                      setCartOpen(false)
                      navigate('checkout')
                    }}
                  >
                    Checkout · {money(subtotal)}
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
