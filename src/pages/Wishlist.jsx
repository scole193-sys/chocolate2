import { AnimatePresence, motion } from 'framer-motion'
import { Heart, ShoppingBag } from 'lucide-react'
import ProductCard, { cartItemFor } from '../components/ProductCard'
import { EmptyState } from '../components/ui'
import { useStore } from '../context/store'
import { useCatalog } from '../context/catalog'
import { href } from '../lib/router'

export default function Wishlist() {
  const { wishlist, addToCart, toast } = useStore()
  const { getProduct } = useCatalog()
  const items = wishlist.map(getProduct).filter(Boolean)

  const addAll = () => {
    items.forEach((p) => addToCart(cartItemFor(p)))
    toast(`Added ${items.length} saved ${items.length === 1 ? 'piece' : 'pieces'} to your bag`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:px-8 lg:pt-36">
      <header className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow mb-4">Wishlist</p>
          <h1 className="font-display text-5xl leading-none sm:text-6xl">
            Saved for <em className="foil">later</em>
          </h1>
        </div>
        {items.length > 0 && (
          <button type="button" onClick={addAll} className="btn-gold self-start sm:self-auto">
            <ShoppingBag size={16} /> Add all to bag
          </button>
        )}
      </header>

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favourites yet"
          text="Tap the heart on any chocolate to keep it here — perfect for planning gifts or your next treat."
          action={
            <a href={href('shop')} className="btn-gold">
              Discover the collection
            </a>
          }
        />
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
