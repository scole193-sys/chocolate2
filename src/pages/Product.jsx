import { Suspense, lazy, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ChevronLeft, ChevronRight, Expand, Leaf, MapPin, PackageSearch, ShoppingBag, Sparkles, Truck, X } from 'lucide-react'
import ProductCard, { cartItemFor } from '../components/ProductCard'
import { EmptyState, HeartButton, QtyStepper, Reveal, SmartImage, Stars } from '../components/ui'
import { useStore } from '../context/store'
import { FREE_SHIPPING_AT } from '../data/content'
import { useCatalog } from '../context/catalog'
import { money } from '../lib/format'
import { href, navigate } from '../lib/router'

const OriginMap = lazy(() => import('../components/OriginMap'))

function Gallery({ product }) {
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(null)
  const [lightbox, setLightbox] = useState(false)
  const images = product.gallery
  const go = (d) => setIndex((i) => (i + d + images.length) % images.length)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  const alt = (i) => (i === 0 ? product.alt : `${product.name} — detail ${i + 1}`)

  return (
    <div className="lg:sticky lg:top-24">
      <div
        className="relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-[1.75rem] border border-line"
        onMouseMove={(e) => {
          if (!window.matchMedia('(hover: hover)').matches) return
          const r = e.currentTarget.getBoundingClientRect()
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
        }}
        onMouseLeave={() => setZoom(null)}
        onClick={() => setLightbox(true)}
      >
        <AnimatePresence mode="wait">
          <motion.div key={images[index]} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            <SmartImage
              src={images[index]}
              alt={alt(index)}
              eager={index === 0}
              className="h-full w-full"
              imgClassName="!duration-300"
              imgStyle={zoom ? { transform: 'scale(2)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
          </motion.div>
        </AnimatePresence>
        <span className="pointer-events-none absolute right-4 bottom-4 flex items-center gap-1.5 rounded-full bg-cocoa/55 px-3 py-1.5 text-xs text-cream backdrop-blur-md">
          <Expand size={13} /> Tap to enlarge
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {images.map((src, i) => (
          <button key={src} type="button" onClick={() => setIndex(i)} aria-label={`Show image ${i + 1}`} aria-current={i === index} className={`overflow-hidden rounded-2xl border-2 transition ${i === index ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'}`}>
            <SmartImage src={src} alt="" className="aspect-square" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0d0705]/95 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(false)} role="dialog" aria-modal="true" aria-label="Image viewer">
            <motion.img key={images[index]} src={images[index]} alt={alt(index)} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
            <button type="button" className="absolute top-5 right-5 grid h-11 w-11 place-items-center rounded-full bg-cream/10 text-cream hover:bg-cream/20" aria-label="Close" onClick={() => setLightbox(false)}>
              <X size={20} />
            </button>
            {[-1, 1].map((d) => (
              <button
                key={d}
                type="button"
                aria-label={d < 0 ? 'Previous image' : 'Next image'}
                onClick={(e) => {
                  e.stopPropagation()
                  go(d)
                }}
                className={`absolute top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-cream/10 text-cream hover:bg-cream/20 ${d < 0 ? 'left-3 sm:left-8' : 'right-3 sm:right-8'}`}
              >
                {d < 0 ? <ChevronLeft /> : <ChevronRight />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Product({ id }) {
  const { products, getProduct } = useCatalog()
  const p = getProduct(id)
  const { addToCart, toast, wishlist, toggleWish, setCartOpen } = useStore()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  if (!p) {
    return (
      <div className="pt-32">
        <EmptyState
          icon={PackageSearch}
          title="We couldn’t find that chocolate"
          text="It may have sold out or moved. Our full collection is just one tap away."
          action={
            <a href={href('shop')} className="btn-gold">
              Browse the collection
            </a>
          }
        />
      </div>
    )
  }

  const related = products.filter((x) => x.id !== p.id && x.tags.some((t) => p.tags.includes(t))).slice(0, 4)

  const add = () => {
    addToCart(cartItemFor(p), qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
    toast(`${qty} × ${p.name} added to your bag`, { action: { label: 'View bag', onClick: () => setCartOpen(true) } })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8 lg:pt-32">
      <button type="button" onClick={() => (window.history.length > 1 ? window.history.back() : navigate('shop'))} className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-gold">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Gallery product={p} />

        <div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="eyebrow flex items-center gap-2">
              <MapPin size={13} /> {p.origin.region}, {p.origin.country}
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">{p.name}</h1>
            <p className="mt-2 text-muted">
              {p.subtitle} · {p.weight}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              <span className="foil font-display text-4xl">{money(p.price)}</span>
              <Stars rating={p.rating} size={16} showValue count={`${p.reviews} reviews`} />
              {p.cocoa != null && <span className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold">{p.cocoa}% cocoa</span>}
            </div>
            <p className="mt-7 leading-relaxed text-ink/85">{p.description}</p>

            <div className="mt-8">
              <h2 className="eyebrow mb-3">Tasting notes</h2>
              <ul className="flex flex-wrap gap-2">
                {p.notes.map((n, i) => (
                  <motion.li key={n} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.08 }} className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm">
                    <Sparkles size={13} className="text-gold" /> {n}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="mt-9 flex items-center gap-3">
              <QtyStepper value={qty} onChange={setQty} />
              <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={add} className="btn-gold relative flex-1 overflow-hidden py-4">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={String(added)} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} className="flex items-center gap-2">
                    {added ? <>Added ✦</> : <><ShoppingBag size={17} /> Add to bag · {money(p.price * qty)}</>}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
              <HeartButton active={wishlist.includes(p.id)} onClick={() => toggleWish(p.id, p.name)} className="h-12 w-12 shrink-0 border border-line" size={19} />
            </div>

            <ul className="mt-6 grid gap-3 text-sm text-muted sm:grid-cols-2">
              <li className="flex items-center gap-2.5">
                <Truck size={16} className="text-gold" /> Free shipping over {money(FREE_SHIPPING_AT)}
              </li>
              <li className="flex items-center gap-2.5">
                <Leaf size={16} className="text-gold" /> Compostable gold-foil wrap
              </li>
            </ul>
          </motion.div>

          <Reveal className="mt-12 space-y-8 border-t border-line pt-10">
            <section>
              <h2 className="mb-4 font-display text-2xl">Origin</h2>
              <Suspense fallback={<div className="aspect-[4/1] animate-pulse rounded-2xl bg-raised" />}>
                <OriginMap lat={p.origin.lat} lng={p.origin.lng} label={p.origin.country} sub={p.origin.farm} />
              </Suspense>
            </section>
            <section className="grid gap-6 sm:grid-cols-2">
              <div>
                <h2 className="mb-2 font-display text-xl">Ingredients</h2>
                <p className="text-sm leading-relaxed text-muted">{p.ingredients}</p>
              </div>
              <div>
                <h2 className="mb-2 font-display text-xl">Allergens</h2>
                <ul className="space-y-1 text-sm text-muted">
                  {p.allergens.map((a) => (
                    <li key={a} className="flex gap-2">
                      <span className="text-gold">•</span> {a}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </Reveal>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 font-display text-3xl sm:text-4xl">
            You may also <em className="text-gold">love</em>
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
