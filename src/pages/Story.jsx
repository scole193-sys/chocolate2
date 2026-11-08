import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { DripDivider, Reveal, SectionHeading, SmartImage } from '../components/ui'
import { CHOCOLATIERS, JOURNEY } from '../data/content'
import { href } from '../lib/router'

function StoryHero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  return (
    <section ref={ref} className="relative isolate flex min-h-[85svh] items-end overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 -z-10 scale-110">
        <SmartImage src="/images/hands-cacao-beans.jpg" alt="Cupped hands holding freshly fermented cacao beans" eager className="h-full w-full" imgClassName="object-[50%_45%]" />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1a0f0a] via-[#1a0f0a]/50 to-[#1a0f0a]/30" />
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="eyebrow mb-5 text-[#e6bf7c]">
          Our story
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="max-w-3xl font-display text-5xl leading-[1.02] text-cream sm:text-7xl">
          From pod to bar, <em className="foil">by hand</em>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }} className="mt-6 max-w-xl text-lg text-cream/75">
          Every Velvet Cacao bar takes 36 days and five careful steps. Scroll to follow the journey.
        </motion.p>
      </div>
    </section>
  )
}

function Timeline() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section ref={ref} className="relative mx-auto max-w-6xl px-4 pt-20 sm:px-6 lg:px-8">
      <div className="absolute top-20 bottom-0 left-[27px] w-px bg-line sm:left-[35px] md:left-1/2" aria-hidden>
        <motion.div style={{ scaleY }} className="h-full w-full origin-top bg-gradient-to-b from-[#f3d9a4] via-gold to-copper shadow-[0_0_12px_rgba(212,162,86,.6)]" />
      </div>
      <ol className="space-y-20 md:space-y-32">
        {JOURNEY.map((s, i) => {
          const right = i % 2 === 1
          return (
            <li key={s.step} className="relative grid items-center gap-6 pl-16 sm:pl-20 md:grid-cols-2 md:gap-16 md:pl-0">
              <motion.span
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: '-40% 0px' }}
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                className="glow absolute top-0 left-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-base text-xs font-semibold text-gold ring-1 ring-gold sm:left-5 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
              >
                {String(i + 1).padStart(2, '0')}
              </motion.span>
              <Reveal y={40} className={right ? 'md:order-2' : ''}>
                <SmartImage src={s.image} alt={s.alt} className="aspect-[4/3] rounded-[1.75rem] md:aspect-[4/5]" imgClassName="transition duration-[1600ms] hover:scale-105" />
              </Reveal>
              <Reveal delay={0.1} className={right ? 'md:order-1 md:text-right' : ''}>
                <p className="eyebrow">
                  {s.step} · {s.days}
                </p>
                <h3 className="mt-3 font-display text-3xl sm:text-4xl">{s.title}</h3>
                <p className={`mt-4 max-w-md leading-relaxed text-muted ${right ? 'md:ml-auto' : ''}`}>{s.text}</p>
              </Reveal>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function Chocolatiers() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
      <SectionHeading align="center" eyebrow="The hands behind the bar" title={<>Meet the <em className="text-gold">chocolatiers</em></>} sub="A small team of three — and every one of them tastes every batch." />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CHOCOLATIERS.map((c, i) => (
          <Reveal key={c.name} delay={i * 0.12} className="group">
            <div className="glass overflow-hidden rounded-[1.75rem]">
              <div className="relative">
                <SmartImage src={c.image} alt={c.alt} className="aspect-[4/5]" imgClassName="object-top grayscale-[35%] sepia-[15%] transition duration-[1200ms] group-hover:scale-105 group-hover:grayscale-0 group-hover:sepia-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0a]/90 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-cream">
                  <p className="text-[10px] tracking-[0.24em] text-[#e6bf7c] uppercase">{c.role}</p>
                  <h3 className="mt-1 font-display text-2xl">{c.name}</h3>
                </div>
              </div>
              <p className="p-6 text-sm leading-relaxed text-muted">{c.bio}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-16 text-center">
        <a href={href('shop')} className="btn-gold">
          Taste the result <ArrowRight size={16} />
        </a>
      </Reveal>
    </section>
  )
}

export default function Story() {
  return (
    <>
      <StoryHero />
      <DripDivider />
      <Timeline />
      <Chocolatiers />
    </>
  )
}
