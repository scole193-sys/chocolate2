import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, SearchX, SlidersHorizontal } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { EmptyState } from '../components/ui'
import { useCatalog } from '../context/catalog'
import { CATEGORIES, COCOA_RANGES, SORTS } from '../data/products'
import { useRoute } from '../lib/router'

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative shrink-0 rounded-full border px-4 py-2 text-sm transition ${active ? 'border-gold text-cocoa' : 'border-line text-ink/80 hover:border-gold/60 hover:text-ink'}`}
    >
      {active && <motion.span layoutId="chip-active" className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-[#f3d9a4] via-gold to-copper" />}
      <span className="relative">{children}</span>
    </button>
  )
}

export default function Shop() {
  const { query } = useRoute()
  const { products } = useCatalog()
  const initialType = query.get('type')
  const [type, setType] = useState(CATEGORIES.includes(initialType) ? initialType : 'All')
  const [cocoa, setCocoa] = useState('any')
  const [sort, setSort] = useState('popular')

  const list = useMemo(() => {
    const range = COCOA_RANGES.find((r) => r.id === cocoa)
    const filtered = products.filter((p) => (type === 'All' || p.tags.includes(type)) && range.test(p.cocoa))
    const sorters = {
      popular: (a, b) => b.popularity - a.popularity,
      newest: (a, b) => b.added.localeCompare(a.added),
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
    }
    return filtered.sort(sorters[sort])
  }, [products, type, cocoa, sort])

  const reset = () => {
    setType('All')
    setCocoa('any')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:px-8 lg:pt-36">
      <header className="mb-10 max-w-2xl">
        <p className="eyebrow mb-4">The collection</p>
        <h1 className="font-display text-5xl leading-none sm:text-6xl">
          Shop <em className="foil">chocolate</em>
        </h1>
        <p className="mt-4 text-muted">Bars, truffles and gift boxes made from beans we buy directly from fourteen farms.</p>
      </header>

      <div className="sticky top-[57px] z-30 -mx-4 mb-8 border-y border-line bg-base/85 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-2xl lg:border lg:px-5">
        <div className="no-scrollbar isolate flex gap-2 overflow-x-auto pb-1">
          {['All', ...CATEGORIES].map((c) => (
            <Chip key={c} active={type === c} onClick={() => setType(c)}>
              {c}
            </Chip>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto" role="group" aria-label="Cocoa percentage">
            <SlidersHorizontal size={15} className="mr-1 shrink-0 text-gold" aria-hidden />
            {COCOA_RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setCocoa(r.id)}
                aria-pressed={cocoa === r.id}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs transition ${cocoa === r.id ? 'bg-gold/15 text-gold ring-1 ring-gold/50' : 'text-muted hover:text-ink'}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <label className="relative flex items-center gap-2 text-xs text-muted">
            <span className="sr-only sm:not-sr-only">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="field cursor-pointer appearance-none rounded-full py-2 pr-9 pl-4 text-sm">
              {SORTS.map((s) => (
                <option key={s.id} value={s.id} className="bg-surface">
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 text-gold" />
          </label>
        </div>
      </div>

      <p className="mb-5 text-sm text-muted" aria-live="polite">
        {list.length} {list.length === 1 ? 'piece' : 'pieces'}
        {type !== 'All' && <> in <span className="text-ink">{type}</span></>}
      </p>

      {list.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nothing matches — yet"
          text="We don’t make that combination right now. Try a different cocoa percentage or browse everything."
          action={
            <button className="btn-gold" onClick={reset}>
              Clear filters
            </button>
          }
        />
      ) : (
        <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
