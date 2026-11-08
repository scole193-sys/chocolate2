import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Gift, Heart, Home, Info, Menu, Moon, ShoppingBag, Store, Sun, X } from 'lucide-react'
import { useStore } from '../context/store'
import { href, useRoute } from '../lib/router'
import { credits } from '../data/credits'
import { useCatalog } from '../context/catalog'
import { api } from '../lib/api'
import { Wordmark } from './ui'

const LINKS = [
  { name: 'shop', label: 'Shop' },
  { name: 'build', label: 'Build a Box' },
  { name: 'story', label: 'Our Story' },
  { name: 'gifting', label: 'Subscriptions & Gifting' },
]

function IconButton({ label, onClick, children, badge, className = '' }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={`relative grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-gold/10 hover:text-gold ${className}`}>
      {children}
      <AnimatePresence>
        {badge > 0 && (
          <motion.span
            key={badge}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 18 }}
            className="absolute -top-0.5 -right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold px-1 text-[10px] font-semibold text-cocoa"
          >
            {badge}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useStore()
  return (
    <IconButton label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.25 }}>
          {theme === 'dark' ? <Sun size={19} strokeWidth={1.6} /> : <Moon size={19} strokeWidth={1.6} />}
        </motion.span>
      </AnimatePresence>
    </IconButton>
  )
}

export function Navbar() {
  const { count, wishlist, setCartOpen } = useStore()
  const { name } = useRoute()
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const solid = scrolled || name !== 'home'

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${solid ? 'glass border-x-0 border-t-0 py-2' : 'border-b border-transparent py-4'}`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main">
          <a href={href('')} aria-label="Velvet Cacao home" className="rounded-lg">
            <Wordmark />
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <li key={l.name}>
                <a
                  href={href(l.name)}
                  className={`relative rounded-full px-4 py-2 text-[0.85rem] tracking-wide transition hover:text-gold ${name === l.name ? 'text-gold' : 'text-ink/85'}`}
                >
                  {l.label}
                  {name === l.name && <motion.span layoutId="nav-underline" className="absolute inset-x-4 -bottom-0.5 h-px bg-gold" />}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-0.5">
            <ThemeToggle />
            <a href={href('wishlist')} aria-label={`Wishlist, ${wishlist.length} items`} className="relative hidden h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-gold/10 hover:text-gold lg:grid">
              <Heart size={19} strokeWidth={1.6} className={name === 'wishlist' ? 'fill-gold text-gold' : ''} />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold px-1 text-[10px] font-semibold text-cocoa">{wishlist.length}</span>
              )}
            </a>
            <IconButton label={`Open bag, ${count} items`} onClick={() => setCartOpen(true)} badge={count}>
              <ShoppingBag size={19} strokeWidth={1.6} />
            </IconButton>
            <IconButton label="Open menu" onClick={() => setMenu(true)} className="lg:hidden">
              <Menu size={20} strokeWidth={1.6} />
            </IconButton>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-cocoa/70 backdrop-blur-sm" onClick={() => setMenu(false)} />
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative m-3 rounded-3xl border border-line bg-surface p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <Wordmark />
                <IconButton label="Close menu" onClick={() => setMenu(false)}>
                  <X size={20} />
                </IconButton>
              </div>
              <ul className="space-y-1">
                {[{ name: '', label: 'Home' }, ...LINKS, { name: 'wishlist', label: 'Wishlist' }].map((l, i) => (
                  <motion.li key={l.label} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                    <a href={href(l.name)} onClick={() => setMenu(false)} className="block rounded-2xl px-4 py-3 font-display text-2xl text-ink transition hover:bg-gold/10 hover:text-gold">
                      {l.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function BottomNav() {
  const { name } = useRoute()
  const { count, wishlist, setCartOpen } = useStore()
  const items = [
    { name: 'home', path: '', label: 'Home', icon: Home },
    { name: 'shop', path: 'shop', label: 'Shop', icon: Store },
    { name: 'build', path: 'build', label: 'Build', icon: Gift },
    { name: 'wishlist', path: 'wishlist', label: 'Saved', icon: Heart, badge: wishlist.length },
  ]
  return (
    <nav className="glass fixed inset-x-3 bottom-3 z-40 rounded-[1.6rem] pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Mobile">
      <ul className="grid grid-cols-5">
        {items.map(({ name: n, path, label, icon: Icon, badge }) => {
          const active = name === n
          return (
            <li key={n}>
              <a href={href(path)} className={`relative flex flex-col items-center gap-1 py-2.5 text-[10px] tracking-wide transition ${active ? 'text-gold' : 'text-muted'}`} aria-current={active ? 'page' : undefined}>
                {active && <motion.span layoutId="bottom-pill" className="absolute inset-x-3 inset-y-1.5 -z-10 rounded-2xl bg-gold/12" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <span className="relative">
                  <Icon size={20} strokeWidth={1.6} className={active && n === 'wishlist' ? 'fill-current' : ''} />
                  {badge > 0 && <span className="absolute -top-1 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-semibold text-cocoa">{badge}</span>}
                </span>
                {label}
              </a>
            </li>
          )
        })}
        <li>
          <button type="button" onClick={() => setCartOpen(true)} className="relative flex w-full flex-col items-center gap-1 py-2.5 text-[10px] tracking-wide text-muted">
            <span className="relative">
              <ShoppingBag size={20} strokeWidth={1.6} />
              {count > 0 && <span className="absolute -top-1 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-semibold text-cocoa">{count}</span>}
            </span>
            Bag
          </button>
        </li>
      </ul>
    </nav>
  )
}

export function Toasts() {
  const { toasts, dismissToast } = useStore()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-8" aria-live="polite" role="status">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-surface/90 py-3 pr-2 pl-3"
          >
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${t.tone === 'error' ? 'bg-red-500/15 text-red-400' : 'bg-gold/15 text-gold'}`}>
              {t.tone === 'love' ? <Heart size={15} className="fill-current" /> : t.tone === 'error' || t.tone === 'neutral' ? <Info size={15} /> : <Check size={15} />}
            </span>
            <p className="flex-1 text-sm text-ink">{t.message}</p>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action.onClick()
                  dismissToast(t.id)
                }}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-gold hover:bg-gold/10"
              >
                {t.action.label}
              </button>
            )}
            <button type="button" onClick={() => dismissToast(t.id)} aria-label="Dismiss" className="grid h-8 w-8 place-items-center rounded-full text-muted hover:text-ink">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function Footer() {
  const { toast } = useStore()
  const { source } = useCatalog()
  const [email, setEmail] = useState('')
  const [joining, setJoining] = useState(false)
  return (
    <footer className="relative mt-24 border-t border-line bg-surface/50 pb-32 lg:pb-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-16 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr_1.4fr] lg:px-8">
        <div>
          <Wordmark tagline size="text-2xl" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">Small-batch, bean-to-bar chocolate, roasted and tempered by hand. Crafted slowly. Savoured deeply.</p>
        </div>
        <div>
          <h3 className="eyebrow mb-4">Shop</h3>
          <ul className="space-y-2.5 text-sm text-muted">
            <li><a className="hover:text-gold" href={href('shop')}>All chocolate</a></li>
            <li><a className="hover:text-gold" href={href('shop?type=Truffles')}>Truffles</a></li>
            <li><a className="hover:text-gold" href={href('shop?type=Gift%20Boxes')}>Gift boxes</a></li>
            <li><a className="hover:text-gold" href={href('build')}>Build your own box</a></li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow mb-4">House</h3>
          <ul className="space-y-2.5 text-sm text-muted">
            <li><a className="hover:text-gold" href={href('story')}>Our story</a></li>
            <li><a className="hover:text-gold" href={href('gifting')}>Tasting subscriptions</a></li>
            <li><a className="hover:text-gold" href={href('wishlist')}>Wishlist</a></li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow mb-4">The tasting letter</h3>
          <p className="mb-4 text-sm text-muted">New origins, limited batches and pairing notes. Monthly, never more.</p>
          <form
            className="flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!/^\S+@\S+\.\S+$/.test(email)) return toast('That email doesn’t look quite right — mind checking it?', { tone: 'error' })
              setJoining(true)
              try {
                const res = await api('/newsletter', { body: { email } })
                toast(res.alreadySubscribed ? 'You’re already on the list — see you next month ✦' : 'Welcome to the tasting letter ✦')
                setEmail('')
              } catch (err) {
                toast(err.message, { tone: 'error' })
              } finally {
                setJoining(false)
              }
            }}
          >
            <label htmlFor="newsletter" className="sr-only">Email address</label>
            <input id="newsletter" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="field rounded-full py-2.5" />
            <button className="btn-gold shrink-0 px-5 py-2.5" disabled={joining}>
              {joining ? '…' : 'Join'}
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <details className="group rounded-2xl border border-line bg-base/40 p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-ink">
            <span><span className="eyebrow mr-3">Photo credits</span><span className="text-muted">{credits.length} photographs via Unsplash</span></span>
            <span className="text-gold transition group-open:rotate-45">+</span>
          </summary>
          <ul className="mt-5 grid gap-x-8 gap-y-2 text-xs text-muted sm:grid-cols-2 lg:grid-cols-3">
            {credits.map((c) => (
              <li key={c.file} className="flex justify-between gap-3 border-b border-line/60 pb-2">
                <span className="truncate">{c.file.replace('.jpg', '').replace(/-/g, ' ')}</span>
                <a href={c.url} target="_blank" rel="noreferrer" className="shrink-0 text-ink/80 hover:text-gold">
                  {c.photographer} · {c.source}
                </a>
              </li>
            ))}
          </ul>
        </details>
        <div className="mt-8 flex flex-col justify-between gap-3 text-xs text-muted sm:flex-row">
          <p>© 2026 Velvet Cacao. Demo store — no real orders or payments.</p>
          <p className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${source === 'database' ? 'bg-emerald-400' : source === 'bundled' ? 'bg-amber-400' : 'bg-muted'}`} aria-hidden />
            {source === 'database' ? 'Catalogue live from Neon Postgres' : source === 'bundled' ? 'Showing sample catalogue (database offline)' : 'Connecting…'}
          </p>
        </div>
      </div>
    </footer>
  )
}
