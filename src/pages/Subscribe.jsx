import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Gift, Heart, Sparkles } from 'lucide-react'
import { Reveal, SectionHeading, SmartImage, Stars } from '../components/ui'
import { useStore } from '../context/store'
import { useCatalog } from '../context/catalog'
import { CYCLES, PLANS, planPrice } from '../data/content'
import { money, shortDate } from '../lib/format'
import { href } from '../lib/router'

const DISTRIBUTION = [
  { stars: 5, pct: 89 },
  { stars: 4, pct: 8 },
  { stars: 3, pct: 2 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 0 },
]

export default function Subscribe() {
  const { addToCart, toast, setCartOpen } = useStore()
  const [cycle, setCycle] = useState(CYCLES[0])
  const { reviews } = useCatalog()

  const subscribe = (plan) => {
    addToCart({
      key: `plan-${plan.id}-${cycle.id}`,
      kind: 'plan',
      config: { planId: plan.id, cycleId: cycle.id },
      name: `${plan.name} Tasting Box`,
      price: planPrice(plan, cycle),
      image: plan.image,
      meta: cycle.months === 1 ? 'Monthly subscription · cancel anytime' : `${cycle.months} boxes prepaid · save 10%`,
    })
    toast(`${plan.name} subscription added`, { action: { label: 'View bag', onClick: () => setCartOpen(true) } })
  }

  return (
    <div className="pt-28 lg:pt-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4">Subscriptions & gifting</p>
          <h1 className="font-display text-5xl leading-[1.02] sm:text-6xl">
            A tasting journey, <em className="foil">delivered</em>
          </h1>
          <p className="mt-5 text-muted">Each month we send new single-origin bars and seasonal truffles with tasting notes from our chocolatiers. Pause, skip or gift anytime.</p>
        </header>

        <div className="mt-10 flex justify-center">
          <div className="relative inline-flex rounded-full border border-line p-1" role="radiogroup" aria-label="Billing">
            {CYCLES.map((c) => (
              <button key={c.id} type="button" role="radio" aria-checked={cycle.id === c.id} onClick={() => setCycle(c)} className={`relative rounded-full px-5 py-2.5 text-sm transition ${cycle.id === c.id ? 'text-cocoa' : 'text-muted hover:text-ink'}`}>
                {cycle.id === c.id && <motion.span layoutId="cycle-pill" className="absolute inset-0 rounded-full bg-gradient-to-r from-[#f3d9a4] via-gold to-copper" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <span className="relative">
                  {c.label}
                  {c.discount > 0 && <span className="ml-1.5 text-xs opacity-80">−10%</span>}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => {
            const monthly = plan.price * (1 - cycle.discount)
            return (
              <Reveal key={plan.id} delay={i * 0.1} className={`relative flex flex-col overflow-hidden rounded-[1.75rem] ${plan.featured ? 'glow border border-gold/60 bg-gradient-to-b from-raised to-surface lg:-translate-y-4' : 'glass'}`}>
                {plan.featured && (
                  <span className="absolute top-4 right-4 z-10 flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-cocoa uppercase">
                    <Sparkles size={11} /> Most loved
                  </span>
                )}
                <SmartImage src={plan.image} alt={`${plan.name} tasting box contents`} className="aspect-[16/9]" imgClassName="transition duration-[1400ms] hover:scale-105" />
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <p className="text-xs tracking-[0.2em] text-gold uppercase">{plan.tagline}</p>
                  <h2 className="mt-2 font-display text-3xl">{plan.name}</h2>
                  <p className="mt-4 flex items-baseline gap-1.5">
                    <span className="foil font-display text-5xl tabular-nums">{money(Math.round(monthly))}</span>
                    <span className="text-sm text-muted">/ month</span>
                  </p>
                  {cycle.discount > 0 && <p className="mt-1 text-xs text-muted">Billed {money(planPrice(plan, cycle))} every 6 months</p>}
                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-ink/90">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                          <Check size={12} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => subscribe(plan)} className={`mt-8 w-full py-3.5 ${plan.featured ? 'btn-gold' : 'btn-ghost'}`}>
                    Subscribe to {plan.name}
                  </button>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal className="mt-16 grid gap-4 md:grid-cols-2">
          <a href={href('shop?type=Gift%20Boxes')} className="glass group flex items-center gap-5 rounded-3xl p-6 transition hover:border-gold/50">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gold/12 text-gold">
              <Gift size={22} strokeWidth={1.6} />
            </span>
            <span className="flex-1">
              <span className="block font-display text-xl">Ready-made gift boxes</span>
              <span className="block text-sm text-muted">Wrapped in gold foil, delivered in two days.</span>
            </span>
            <ArrowRight size={18} className="text-gold transition group-hover:translate-x-1" />
          </a>
          <a href={href('build')} className="glass group flex items-center gap-5 rounded-3xl p-6 transition hover:border-gold/50">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gold/12 text-gold">
              <Heart size={22} strokeWidth={1.6} />
            </span>
            <span className="flex-1">
              <span className="block font-display text-xl">Build a custom gift box</span>
              <span className="block text-sm text-muted">Pick every truffle, choose a ribbon and add a handwritten note.</span>
            </span>
            <ArrowRight size={18} className="text-gold transition group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>

      <section className="mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <SectionHeading eyebrow="Reviews" title="4.9 out of 5" sub="From 4,900+ verified customers and subscribers." />
            <Reveal className="mt-8 space-y-2.5">
              {DISTRIBUTION.map((d) => (
                <div key={d.stars} className="flex items-center gap-3 text-sm">
                  <span className="w-8 text-muted tabular-nums">{d.stars}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-raised">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-copper to-gold" initial={{ width: 0 }} whileInView={{ width: `${d.pct}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} />
                  </div>
                  <span className="w-10 text-right text-muted tabular-nums">{d.pct}%</span>
                </div>
              ))}
            </Reveal>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {reviews.map((r, i) => (
              <Reveal key={`${r.name}-${r.date}`} delay={(i % 2) * 0.1} className="glass flex flex-col rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <Stars rating={r.rating} size={14} />
                  <span className="text-xs text-muted">{shortDate(r.date)}</span>
                </div>
                <p className="mt-4 flex-1 leading-relaxed text-ink/90">“{r.text}”</p>
                <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-gold to-copper font-display text-sm text-cocoa">{r.name[0]}</span>
                  <div className="text-sm">
                    <p className="text-ink">
                      {r.name} <span className="text-muted">· {r.place}</span>
                    </p>
                    <p className="text-xs text-gold">{r.product}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
