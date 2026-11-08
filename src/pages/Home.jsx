import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Award, ChevronDown, Coffee, Gift, Leaf, Plus, Truck } from 'lucide-react'
import ProductCard, { cartItemFor } from '../components/ProductCard'
import { Counter, DripDivider, Reveal, SectionHeading, SmartImage, Stars } from '../components/ui'
import { useStore } from '../context/store'
import { useCatalog } from '../context/catalog'
import { PLANS, STATS, pairingOfTheDay } from '../data/content'
import { money } from '../lib/format'
import { href } from '../lib/router'

const EASE = [0.16, 1, 0.3, 1]

function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1.2])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const line = (text, delay, className = '') => (
    <span className="block overflow-hidden pb-2">
      <motion.span className={`block ${className}`} initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1.2, ease: EASE, delay }}>
        {text}
      </motion.span>
    </span>
  )

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden">
      <motion.div className="absolute inset-0 -z-10" style={{ y, scale }}>
        <SmartImage src="/images/hero-chocolate-flow.jpg" alt="Molten dark chocolate flowing in slow glossy folds" eager className="h-full w-full" imgClassName="object-[50%_40%]" />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_70%_30%,transparent_0%,rgba(26,15,10,.55)_60%,rgba(26,15,10,.9)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1a0f0a] via-[#1a0f0a]/30 to-[#1a0f0a]/50" />

      <motion.div style={{ opacity: fade }} className="mx-auto w-full max-w-7xl px-4 pt-32 pb-28 sm:px-6 lg:px-8 lg:pb-16">
        <motion.p initial={{ opacity: 0, letterSpacing: '0.6em' }} animate={{ opacity: 1, letterSpacing: '0.32em' }} transition={{ duration: 1.6, ease: EASE }} className="eyebrow mb-6 text-[#e6bf7c]">
          Bean to bar · Since 2014
        </motion.p>
        <h1 className="max-w-4xl font-display text-[2.9rem] leading-[1.02] font-medium text-cream sm:text-7xl lg:text-[6.2rem]">
          {line('Crafted slowly.', 0.15)}
          {line('Savoured deeply.', 0.35, 'foil italic font-normal')}
        </h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.8, ease: EASE }} className="mt-6 max-w-lg text-base leading-relaxed text-cream/75 sm:text-lg">
          Single-origin chocolate, roasted in tiny batches and tempered by hand on marble — from fourteen family farms to your table.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1, ease: EASE }} className="mt-9 flex flex-wrap gap-3">
          <a href={href('shop')} className="btn-gold px-7 py-4 text-[0.95rem]">
            Shop the Collection <ArrowRight size={17} />
          </a>
          <a href={href('build')} className="btn-ghost border-cream/25 bg-cream/5 px-7 py-4 text-cream backdrop-blur-md hover:border-[#d4a256]">
            <Gift size={17} /> Build a gift box
          </a>
        </motion.div>

        <motion.dl initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 1.2, ease: EASE }} className="mt-14 grid max-w-3xl grid-cols-3 divide-x divide-[#d4a256]/20 rounded-3xl border border-[#d4a256]/20 bg-[#1a0f0a]/40 py-5 backdrop-blur-xl">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col-reverse px-3 text-center sm:px-6">
              <dt className="mt-1 text-[10px] tracking-[0.14em] text-cream/60 uppercase sm:text-xs">{s.label}</dt>
              <dd className="foil font-display text-3xl sm:text-5xl">
                <Counter value={s.value} suffix={s.suffix} />
              </dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      <motion.a href="#collection" aria-label="Scroll to the collection" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-cream/60 lg:block" animate={{ y: [0, 8, 0] }} transition={{ duration: 2.4, repeat: Infinity }}>
        <ChevronDown size={22} />
      </motion.a>
    </section>
  )
}

function Featured() {
  const { products } = useCatalog()
  const featured = [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 4)
  return (
    <section id="collection" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-16 sm:px-6 lg:px-8 lg:pt-24">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading eyebrow="The collection" title={<>Small batches, <em className="text-gold">big character</em></>} sub="Our most-loved bars, truffles and boxes — each traceable to a single farm and a single roast." />
        <Reveal>
          <a href={href('shop')} className="btn-ghost">
            View all {products.length} <ArrowRight size={16} />
          </a>
        </Reveal>
      </div>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4 lg:gap-6">
        {featured.map((p) => (
          <ProductCard key={p.id} product={p} className="w-[72%] shrink-0 snap-start sm:w-[45%] md:w-auto" />
        ))}
      </div>
    </section>
  )
}

function Pairing() {
  const { addToCart, toast } = useStore()
  const { getProduct } = useCatalog()
  const pairing = pairingOfTheDay()
  const p = getProduct(pairing.productId)
  if (!p) return null
  return (
    <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
      <Reveal className="glass relative grid overflow-hidden rounded-[2rem] md:grid-cols-2">
        <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gold/15 blur-3xl" />
        <SmartImage src={pairing.image} alt={pairing.alt} className="aspect-[4/3] md:aspect-auto md:min-h-[460px]" imgClassName="object-[50%_60%]" />
        <div className="relative flex flex-col justify-center p-7 sm:p-12">
          <p className="eyebrow mb-4 flex items-center gap-2">
            <Coffee size={14} /> Pairing of the day
          </p>
          <h2 className="font-display text-3xl leading-tight sm:text-5xl">{pairing.title}</h2>
          <p className="mt-5 leading-relaxed text-muted">{pairing.note}</p>
          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-line bg-base/40 p-3">
            <SmartImage src={p.image} alt={p.alt} className="h-16 w-16 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg">{p.name}</p>
              <p className="text-sm text-muted">
                {money(p.price)} · pairs with {pairing.pair.toLowerCase()}
              </p>
            </div>
            <button
              type="button"
              className="btn-gold h-11 w-11 shrink-0 p-0"
              aria-label={`Add ${p.name} to bag`}
              onClick={() => {
                addToCart(cartItemFor(p))
                toast(`${p.name} added to your bag`)
              }}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function BuildTeaser() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-28 sm:px-6 md:grid-cols-2 lg:px-8">
      <div className="relative order-2 md:order-1">
        <Reveal className="grid grid-cols-2 gap-4">
          <SmartImage src="/images/jewel-bonbon-box.jpg" alt="A box of hand-painted jewel bonbons" className="aspect-[3/4] rounded-3xl" imgClassName="transition duration-[1400ms] hover:scale-110" />
          <div className="space-y-4 pt-12">
            <SmartImage src="/images/cocoa-dusted-truffles.jpg" alt="Cocoa-dusted truffles on a dark plate" className="aspect-square rounded-3xl" imgClassName="transition duration-[1400ms] hover:scale-110" />
            <SmartImage src="/images/truffle-duo-box.jpg" alt="Two truffles in a small gift box" className="aspect-[4/3] rounded-3xl" imgClassName="transition duration-[1400ms] hover:scale-110" />
          </div>
        </Reveal>
        <div className="glass glow absolute -bottom-6 left-6 rounded-2xl px-5 py-3 text-sm">
          <span className="foil font-display text-2xl">8</span> <span className="text-muted">signature truffles</span>
        </div>
      </div>
      <div className="order-1 md:order-2">
        <SectionHeading eyebrow="Build your own box" title={<>A box as <em className="text-gold">personal</em> as a handwritten letter</>} sub="Choose 6, 12 or 24 pieces, tap to fill every slot with your favourite truffles, then finish with a silk ribbon and a gift note." />
        <Reveal delay={0.1} className="mt-8 flex flex-wrap gap-3">
          <a href={href('build')} className="btn-gold">
            Start building <ArrowRight size={16} />
          </a>
          <a href={href('shop?type=Gift%20Boxes')} className="btn-ghost">
            Ready-made boxes
          </a>
        </Reveal>
      </div>
    </section>
  )
}

function StoryTeaser() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])
  const pillars = [
    { icon: Leaf, title: 'Direct trade', text: 'We pay farmers at least 2.5× the Fairtrade minimum.' },
    { icon: Award, title: 'Award-winning', text: '11 Academy of Chocolate golds since 2018.' },
    { icon: Truck, title: 'Carbon-neutral', text: 'Cool-packed, compostable and delivered in 2 days.' },
  ]
  return (
    <section className="pt-28">
      <div ref={ref} className="relative isolate mx-4 overflow-hidden rounded-[2rem] sm:mx-6 lg:mx-auto lg:max-w-7xl">
        <motion.div style={{ y }} className="absolute -inset-y-[15%] inset-x-0 -z-10">
          <SmartImage src="/images/chef-holding-cacao-pods.jpg" alt="A chocolatier holding two ripe cacao pods" className="h-full w-full" imgClassName="object-[50%_35%]" />
        </motion.div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#1a0f0a]/95 via-[#1a0f0a]/70 to-[#1a0f0a]/20" />
        <div className="max-w-xl px-7 py-20 text-cream sm:px-14 sm:py-28">
          <Reveal>
            <p className="eyebrow mb-5 text-[#e6bf7c]">Our story</p>
            <blockquote className="font-display text-3xl leading-snug italic sm:text-[2.6rem]">“Great chocolate isn’t made in a factory. It’s grown on a farm and finished by hand.”</blockquote>
            <p className="mt-5 text-sm text-cream/70">— Kenji Arata, founder & head chocolatier</p>
            <a href={href('story')} className="btn-gold mt-9">
              From pod to bar <ArrowRight size={16} />
            </a>
          </Reveal>
        </div>
      </div>
      <div className="mx-auto mt-10 grid max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
        {pillars.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 0.1} className="glass flex gap-4 rounded-2xl p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/12 text-gold">
              <Icon size={19} strokeWidth={1.6} />
            </span>
            <div>
              <h3 className="font-display text-lg">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function ReviewsStrip() {
  const { reviews } = useCatalog()
  return (
    <section className="mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:px-8">
      <SectionHeading align="center" eyebrow="Kind words" title="Loved in 42 countries" />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {reviews.slice(0, 3).map((r, i) => (
          <Reveal key={r.name} delay={i * 0.1} className="glass flex flex-col rounded-3xl p-7">
            <Stars rating={r.rating} size={15} />
            <p className="mt-5 flex-1 font-display text-xl leading-relaxed">“{r.text}”</p>
            <p className="mt-6 text-sm">
              <span className="text-ink">{r.name}</span> <span className="text-muted">· {r.place} · {r.product}</span>
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function SubscribeBand() {
  const plan = PLANS.find((p) => p.featured)
  return (
    <section className="mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:px-8">
      <Reveal className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-gradient-to-br from-raised via-surface to-base p-8 sm:p-14">
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-copper/25 blur-3xl" />
        <div className="pointer-events-none absolute -top-20 right-10 h-60 w-60 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-xl">
            <p className="eyebrow mb-4">Monthly tasting box</p>
            <h2 className="font-display text-3xl leading-tight sm:text-5xl">
              A new origin at your door, <em className="foil">every month</em>
            </h2>
            <p className="mt-4 text-muted">
              Plans from {money(PLANS[0].price)}/month. Our {plan.name} box is the favourite: {plan.features[0].toLowerCase()}, plus a guided video tasting.
            </p>
          </div>
          <a href={href('gifting')} className="btn-gold shrink-0 px-8 py-4">
            Explore plans <ArrowRight size={16} />
          </a>
        </div>
      </Reveal>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <Hero />
      <DripDivider className="-mt-px" />
      <Featured />
      <Pairing />
      <BuildTeaser />
      <StoryTeaser />
      <ReviewsStrip />
      <SubscribeBand />
    </>
  )
}
