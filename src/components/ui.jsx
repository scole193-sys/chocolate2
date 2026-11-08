import { useEffect, useId, useRef, useState } from 'react'
import { animate, motion, useInView } from 'framer-motion'
import { Heart, ImageOff, Star } from 'lucide-react'

const EASE = [0.16, 1, 0.3, 1]

/** Photo with a warm blurred fallback colour while loading and if the file fails. */
export function SmartImage({ src, alt, className = '', imgClassName = '', eager = false, style, imgStyle }) {
  // Keyed by src so a new image starts from 'loading' without an effect.
  const [result, setResult] = useState({ src: null, ok: false })
  const state = result.src === src ? (result.ok ? 'loaded' : 'error') : 'loading'

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: 'var(--c-img-fallback)', ...style }}>
      {state !== 'error' ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : undefined}
          decoding="async"
          onLoad={() => setResult({ src, ok: true })}
          onError={() => setResult({ src, ok: false })}
          style={imgStyle}
          className={`h-full w-full object-cover transition-[opacity,filter,transform] duration-700 ease-out ${
            state === 'loaded' ? 'opacity-100 blur-0' : 'opacity-0 blur-lg'
          } ${imgClassName}`}
        />
      ) : (
        <div role="img" aria-label={alt} className="absolute inset-0 grid place-items-center text-cream/50 backdrop-blur-2xl">
          <ImageOff size={22} strokeWidth={1.5} aria-hidden />
        </div>
      )}
    </div>
  )
}

export function Reveal({ children, delay = 0, y = 28, className = '', as = 'div' }) {
  const M = motion[as]
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </M>
  )
}

export function Counter({ value, suffix = '', duration = 2.2 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, { duration, ease: EASE, onUpdate: (v) => setN(Math.round(v)) })
    return () => controls.stop()
  }, [inView, value, duration])
  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString('en-US')}
      {suffix}
    </span>
  )
}

export function Stars({ rating, size = 14, showValue = false, count }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Rated ${rating} out of 5`}>
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.max(0, Math.min(1, rating - i + 1))
          return (
            <span key={i} className="relative" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 text-gold/30" strokeWidth={1.5} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={size} className="fill-gold text-gold" strokeWidth={1.5} />
              </span>
            </span>
          )
        })}
      </span>
      {showValue && <span className="text-xs font-medium text-ink">{rating.toFixed(1)}</span>}
      {count != null && <span className="text-xs text-muted">({count})</span>}
    </span>
  )
}

export function HeartButton({ active, onClick, className = '', size = 18 }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.8 }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      aria-pressed={active}
      aria-label={active ? 'Remove from wishlist' : 'Save to wishlist'}
      className={`grid place-items-center rounded-full backdrop-blur-md transition-colors ${
        active ? 'bg-gold/90 text-cocoa' : 'bg-cocoa/45 text-cream hover:bg-cocoa/70'
      } ${className}`}
    >
      <motion.span key={String(active)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}>
        <Heart size={size} className={active ? 'fill-current' : ''} strokeWidth={1.8} />
      </motion.span>
    </motion.button>
  )
}

/** Cacao pod emblem; shared by the wordmark and favicon. */
export function PodMark({ className = 'h-7 w-7' }) {
  const id = useId()
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3D9A4" />
          <stop offset=".45" stopColor="#D4A256" />
          <stop offset="1" stopColor="#A5612D" />
        </linearGradient>
      </defs>
      <path d="M32 6c10 6.5 14.5 16 14.5 26S42 51.5 32 58C22 51.5 17.5 42 17.5 32S22 12.5 32 6z" fill="none" stroke={`url(#${id})`} strokeWidth="3" strokeLinejoin="round" />
      <path d="M32 10v44M25 15.5c-2.2 4.8-3.3 10.3-3.3 16.5s1.1 11.7 3.3 16.5M39 15.5c2.2 4.8 3.3 10.3 3.3 16.5S41.2 43.7 39 48.5" fill="none" stroke={`url(#${id})`} strokeWidth="1.7" strokeLinecap="round" opacity=".85" />
    </svg>
  )
}

export function Wordmark({ className = '', tagline = false, size = 'text-[1.35rem]' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <PodMark className="h-8 w-8 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className={`foil font-display font-semibold tracking-[0.01em] ${size}`}>
          Velvet <span className="font-normal italic">Cacao</span>
        </span>
        {tagline && <span className="mt-1.5 text-[0.58rem] tracking-[0.42em] text-muted uppercase">Bean to bar · Est. 2014</span>}
      </span>
    </span>
  )
}

export function SectionHeading({ eyebrow, title, sub, align = 'left', className = '' }) {
  return (
    <Reveal className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-2xl ${className}`}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 className="font-display text-3xl leading-[1.1] text-ink sm:text-4xl md:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-[0.95rem] leading-relaxed text-muted sm:text-base">{sub}</p>}
    </Reveal>
  )
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-sm flex-col items-center px-6 py-16 text-center"
    >
      <div className="glow mb-6 grid h-20 w-20 place-items-center rounded-full bg-gold/10 text-gold">
        <Icon size={30} strokeWidth={1.4} />
      </div>
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
      {action && <div className="mt-7">{action}</div>}
    </motion.div>
  )
}

const DRIPS = [
  { x: 70, w: 26, l: 46, d: 0 },
  { x: 210, w: 18, l: 70, d: 1.2 },
  { x: 330, w: 34, l: 38, d: 2.4 },
  { x: 480, w: 22, l: 84, d: 0.6 },
  { x: 640, w: 30, l: 52, d: 1.8 },
  { x: 790, w: 16, l: 64, d: 3 },
  { x: 930, w: 28, l: 92, d: 0.3 },
  { x: 1080, w: 20, l: 44, d: 2.1 },
  { x: 1210, w: 32, l: 74, d: 1 },
  { x: 1360, w: 22, l: 56, d: 2.7 },
]

/** Melted-chocolate band with slowly stretching drips and falling droplets. */
export function DripDivider({ className = '', flip = false }) {
  const id = useId().replace(/:/g, '')
  return (
    <div className={`pointer-events-none relative z-10 -my-px ${className}`} aria-hidden style={flip ? { transform: 'scaleY(-1)' } : undefined}>
      <svg viewBox="0 0 1440 150" preserveAspectRatio="none" className="block h-20 w-full sm:h-28">
        <defs>
          <filter id={`goo-${id}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
            <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
          </filter>
          <linearGradient id={`choc-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--c-drip-hi)' }} />
            <stop offset="1" style={{ stopColor: 'var(--c-drip)' }} />
          </linearGradient>
          <linearGradient id={`gold-${id}`} x1="0" x2="1">
            <stop offset="0" stopColor="#d4a256" stopOpacity="0" />
            <stop offset=".5" stopColor="#d4a256" stopOpacity=".7" />
            <stop offset="1" stopColor="#d4a256" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g filter={`url(#goo-${id})`} fill={`url(#choc-${id})`}>
          <rect x="-20" y="-10" width="1480" height="40" />
          {DRIPS.map((d) => (
            <motion.rect
              key={d.x}
              x={d.x - d.w / 2}
              y={10}
              width={d.w}
              height={d.l}
              rx={d.w / 2}
              style={{ transformBox: 'fill-box', transformOrigin: 'top' }}
              animate={{ scaleY: [0.55, 1, 0.55] }}
              transition={{ duration: 7 + (d.x % 4), repeat: Infinity, ease: 'easeInOut', delay: d.d }}
            />
          ))}
          {DRIPS.filter((_, i) => i % 3 === 1).map((d) => (
            <motion.circle
              key={`drop-${d.x}`}
              cx={d.x}
              r={d.w / 2.6}
              initial={{ cy: d.l, opacity: 0 }}
              animate={{ cy: [d.l, d.l + 8, 150], opacity: [0, 1, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 4 + d.d, ease: 'easeIn', delay: d.d + 2 }}
            />
          ))}
        </g>
        <rect x="0" y="0" width="1440" height="1.5" fill={`url(#gold-${id})`} />
      </svg>
    </div>
  )
}

export function QtyStepper({ value, onChange, min = 1, max = 20, size = 'md' }) {
  const s = size === 'sm' ? 'h-8 w-8 text-sm' : 'h-11 w-11'
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-surface/60">
      <button type="button" className={`${s} grid place-items-center rounded-full text-ink transition hover:text-gold disabled:opacity-30`} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        −
      </button>
      <span className="min-w-7 text-center text-sm font-medium tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" className={`${s} grid place-items-center rounded-full text-ink transition hover:text-gold disabled:opacity-30`} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        +
      </button>
    </div>
  )
}
