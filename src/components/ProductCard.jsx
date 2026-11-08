import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useStore } from '../context/store'
import { money } from '../lib/format'
import { href } from '../lib/router'
import { HeartButton, SmartImage, Stars } from './ui'

export const cartItemFor = (p) => ({
  key: p.id,
  kind: 'product',
  productId: p.id,
  name: p.name,
  price: p.price,
  image: p.image,
  meta: [p.cocoa && `${p.cocoa}% cocoa`, p.origin.country, p.weight].filter(Boolean).join(' · '),
})

export default function ProductCard({ product: p, className = '' }) {
  const { wishlist, toggleWish, addToCart, toast, setCartOpen } = useStore()

  const quickAdd = (e) => {
    e.preventDefault()
    addToCart(cartItemFor(p))
    toast(`${p.name} added to your bag`, { action: { label: 'View bag', onClick: () => setCartOpen(true) } })
  }

  return (
    <motion.article layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.45 }} className={`group ${className}`}>
      <a href={href(`product/${p.id}`)} className="glass block overflow-hidden rounded-[1.4rem] transition duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_30px_60px_-30px_rgba(212,162,86,0.35)]">
        <div className="relative">
          <SmartImage src={p.image} alt={p.alt} className="aspect-[4/5]" imgClassName="duration-[1400ms] group-hover:scale-110" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cocoa/70 via-transparent to-transparent" />
          {p.badge && <span className="absolute top-3 left-3 rounded-full bg-cocoa/55 px-3 py-1 text-[10px] tracking-[0.18em] text-[#f3d9a4] uppercase backdrop-blur-md">{p.badge}</span>}
          <HeartButton active={wishlist.includes(p.id)} onClick={() => toggleWish(p.id, p.name)} className="absolute top-3 right-3 h-9 w-9" size={16} />
          <button
            type="button"
            onClick={quickAdd}
            aria-label={`Add ${p.name} to bag`}
            className="absolute right-3 bottom-3 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#f3d9a4] via-gold to-copper text-cocoa shadow-lg transition duration-300 hover:scale-110 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
          >
            <Plus size={18} strokeWidth={2.2} />
          </button>
          {p.cocoa != null && (
            <span className="absolute bottom-3 left-3 font-display text-3xl text-cream/95 italic">
              {p.cocoa}
              <span className="text-base">%</span>
            </span>
          )}
        </div>
        <div className="p-4 sm:p-5">
          <p className="text-[10px] tracking-[0.24em] text-gold uppercase">{p.origin.country}</p>
          <h3 className="mt-1.5 font-display text-lg leading-snug text-ink sm:text-xl">{p.name}</h3>
          <div className="mt-3 flex items-center justify-between gap-2">
            <Stars rating={p.rating} size={12} count={p.reviews} />
            <span className="font-medium text-ink tabular-nums">{money(p.price)}</span>
          </div>
        </div>
      </a>
    </motion.article>
  )
}
