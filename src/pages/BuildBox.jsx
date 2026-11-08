import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Gift, RotateCcw, Shuffle, X } from 'lucide-react'
import { useStore } from '../context/store'
import { BOX_SIZES, RIBBONS, TRUFFLES } from '../data/content'
import { money } from '../lib/format'

const truffle = (id) => TRUFFLES.find((t) => t.id === id)

function TruffleDot({ t, className = '' }) {
  return (
    <span className={`relative block overflow-hidden rounded-full shadow-[inset_0_-6px_12px_rgba(0,0,0,.45),0_6px_14px_-4px_rgba(0,0,0,.6)] ${className}`} style={{ background: 'var(--c-img-fallback)' }}>
      <img src={t.image} alt="" loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: t.pos, transform: `scale(${t.zoom})`, transformOrigin: t.pos }} />
      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(255,240,215,.35),transparent_45%)]" />
    </span>
  )
}

function Step({ n, title, children, done }) {
  return (
    <section className="glass rounded-3xl p-5 sm:p-6">
      <h2 className="mb-4 flex items-center gap-3 font-display text-xl">
        <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-sans transition ${done ? 'bg-gold text-cocoa' : 'border border-gold/50 text-gold'}`}>{done ? <Check size={15} /> : n}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function BuildBox() {
  const { addToCart, toast, setCartOpen } = useStore()
  const [size, setSize] = useState(BOX_SIZES[1])
  const [slots, setSlots] = useState([])
  const [ribbon, setRibbon] = useState(RIBBONS[0])
  const [message, setMessage] = useState('')

  const full = slots.length === size.size
  const remaining = size.size - slots.length

  const chooseSize = (s) => {
    setSize(s)
    if (slots.length > s.size) toast(`Kept your first ${s.size} truffles`, { tone: 'neutral' })
    setSlots((cur) => cur.slice(0, s.size))
  }
  const add = (id) => {
    if (full) return toast('Your box is full — tap a truffle in the box to swap it out', { tone: 'neutral' })
    setSlots((cur) => [...cur, id])
  }
  const removeAt = (i) => setSlots((cur) => cur.filter((_, j) => j !== i))
  const fillRandom = () => setSlots((cur) => [...cur, ...Array.from({ length: size.size - cur.length }, () => TRUFFLES[Math.floor(Math.random() * TRUFFLES.length)].id)])

  const addBox = () => {
    const counts = slots.reduce((m, id) => ({ ...m, [id]: (m[id] || 0) + 1 }), {})
    const summary = Object.entries(counts)
      .map(([id, n]) => `${n}× ${truffle(id).name}`)
      .join(', ')
    addToCart(
      {
        key: `box-${Date.now()}`,
        kind: 'box',
        config: { size: size.size, slots, ribbon: ribbon.id, message: message.trim() },
        name: `Your ${size.label} Box · ${size.size}`,
        price: size.price,
        image: '/images/jewel-bonbon-box.jpg',
        meta: `${ribbon.name} ribbon · ${summary}${message ? ` · Note: “${message}”` : ''}`,
      },
      1,
    )
    toast('Your custom box is in the bag ✦', { action: { label: 'View bag', onClick: () => setCartOpen(true) } })
    setSlots([])
    setMessage('')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:px-8 lg:pt-36">
      <header className="mb-10 max-w-2xl">
        <p className="eyebrow mb-4">Build your own box</p>
        <h1 className="font-display text-5xl leading-none sm:text-6xl">
          Fill it with <em className="foil">favourites</em>
        </h1>
        <p className="mt-4 text-muted">Choose a size, tap truffles to fill each slot, then finish with a ribbon and a handwritten note.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        {/* Box visual */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <motion.div layout className="relative rounded-[2rem] bg-gradient-to-br from-[#3a2216] via-[#25150d] to-[#140a06] p-5 shadow-[0_40px_80px_-30px_rgba(0,0,0,.7),inset_0_1px_0_rgba(255,220,170,.12)] sm:p-8">
            {/* Ribbon */}
            <motion.div layout className="pointer-events-none absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 opacity-90 sm:w-4" style={{ background: ribbon.color }} />
            <motion.div layout className="pointer-events-none absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 opacity-90 sm:h-4" style={{ background: ribbon.color }} />
            <motion.div key={ribbon.id} initial={{ scale: 0.6, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="absolute -top-6 left-1/2 z-20 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full shadow-lg ring-2 ring-black/20" style={{ background: ribbon.color }}>
              <Gift size={18} className={ribbon.id === 'ivory' ? 'text-[#6b4630]' : 'text-cream'} />
            </motion.div>

            <div className="relative z-10 rounded-[1.4rem] border border-[#d4a256]/25 bg-[#120804] p-3 sm:p-5">
              <div className="grid gap-2.5 sm:gap-3.5" style={{ gridTemplateColumns: `repeat(${size.cols}, minmax(0, 1fr))` }}>
                {Array.from({ length: size.size }).map((_, i) => {
                  const id = slots[i]
                  return (
                    <button
                      key={`${size.size}-${i}`}
                      type="button"
                      onClick={() => id && removeAt(i)}
                      aria-label={id ? `Remove ${truffle(id).name} from slot ${i + 1}` : `Empty slot ${i + 1}`}
                      className="group relative aspect-square rounded-[30%] bg-[radial-gradient(circle_at_50%_40%,#2b1810,#0c0503)] p-[12%] shadow-[inset_0_4px_10px_rgba(0,0,0,.8)]"
                    >
                      <AnimatePresence>
                        {id ? (
                          <motion.span key={id + i} className="absolute inset-[12%]" initial={{ scale: 0, y: -30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 18 }}>
                            <TruffleDot t={truffle(id)} className="h-full w-full" />
                            <span className="absolute inset-0 grid place-items-center rounded-full bg-cocoa/60 opacity-0 transition group-hover:opacity-100">
                              <X size={16} className="text-cream" />
                            </span>
                          </motion.span>
                        ) : (
                          <span className="absolute inset-[18%] rounded-full border border-dashed border-[#d4a256]/25" />
                        )}
                      </AnimatePresence>
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-muted">{full ? 'Box complete' : `${remaining} slot${remaining === 1 ? '' : 's'} to fill`}</span>
                <span className="tabular-nums text-ink">
                  {slots.length}/{size.size}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-raised">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-copper via-gold to-[#f3d9a4]" animate={{ width: `${(slots.length / size.size) * 100}%` }} transition={{ type: 'spring', stiffness: 140, damping: 20 }} />
              </div>
            </div>
            <button type="button" onClick={fillRandom} disabled={full} className="btn-ghost px-4 py-2.5 text-xs disabled:opacity-40">
              <Shuffle size={14} /> Surprise me
            </button>
            <button type="button" onClick={() => setSlots([])} disabled={!slots.length} aria-label="Empty the box" className="btn-ghost px-3 py-2.5 disabled:opacity-40">
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-5 pb-4">
          <Step n={1} title="Choose your box" done>
            <div className="grid grid-cols-3 gap-3">
              {BOX_SIZES.map((s) => (
                <button key={s.size} type="button" onClick={() => chooseSize(s)} aria-pressed={size.size === s.size} className={`rounded-2xl border p-4 text-left transition ${size.size === s.size ? 'glow border-gold bg-gold/10' : 'border-line hover:border-gold/50'}`}>
                  <span className="block font-display text-3xl">{s.size}</span>
                  <span className="block text-xs text-muted">{s.label} · pieces</span>
                  <span className="mt-2 block text-sm font-medium text-gold">{money(s.price)}</span>
                </button>
              ))}
            </div>
          </Step>

          <Step n={2} title="Tap to add truffles" done={full}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TRUFFLES.map((t) => {
                const n = slots.filter((s) => s === t.id).length
                return (
                  <motion.button key={t.id} type="button" whileTap={{ scale: 0.92 }} onClick={() => add(t.id)} className="group relative flex flex-col items-center rounded-2xl border border-line p-3 text-center transition hover:border-gold/60 hover:bg-gold/5">
                    <TruffleDot t={t} className="h-16 w-16 transition duration-500 group-hover:scale-110 group-hover:rotate-6" />
                    <span className="mt-2.5 text-sm leading-tight text-ink">{t.name}</span>
                    <span className="mt-0.5 text-[11px] text-muted">{t.note}</span>
                    <AnimatePresence>
                      {n > 0 && (
                        <motion.span key={n} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute top-2 right-2 grid h-6 min-w-6 place-items-center rounded-full bg-gold px-1.5 text-xs font-semibold text-cocoa">
                          {n}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </div>
          </Step>

          <Step n={3} title="Pick a ribbon" done>
            <div className="flex flex-wrap gap-3">
              {RIBBONS.map((r) => (
                <button key={r.id} type="button" onClick={() => setRibbon(r)} aria-pressed={ribbon.id === r.id} className={`flex items-center gap-2.5 rounded-full border py-1.5 pr-4 pl-1.5 text-sm transition ${ribbon.id === r.id ? 'border-gold bg-gold/10' : 'border-line hover:border-gold/50'}`}>
                  <span className="h-7 w-7 rounded-full ring-1 ring-black/20" style={{ background: r.color }} />
                  {r.name}
                </button>
              ))}
            </div>
          </Step>

          <Step n={4} title="Add a gift message" done={message.trim().length > 0}>
            <label htmlFor="gift-msg" className="sr-only">Gift message</label>
            <textarea id="gift-msg" rows={3} maxLength={150} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Happy birthday, Mum — the dark ones are all yours." className="field resize-none" />
            <div className="mt-2 flex items-center justify-between text-xs text-muted">
              <span>Handwritten on a letterpress card</span>
              <span className="tabular-nums">{message.length}/150</span>
            </div>
            <AnimatePresence>
              {message.trim() && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden rounded-2xl border border-gold/30 bg-[#f7efe2] p-5 font-display text-lg text-[#3b2417] italic shadow-inner">
                  {message}
                </motion.p>
              )}
            </AnimatePresence>
          </Step>

          <div className="glass sticky bottom-24 z-20 flex items-center justify-between gap-4 rounded-3xl bg-surface/90 p-4 sm:p-5 lg:bottom-6">
            <div>
              <p className="text-xs text-muted">{size.label} box · {size.size} pieces</p>
              <p className="foil font-display text-3xl">{money(size.price)}</p>
            </div>
            <button type="button" onClick={addBox} disabled={!full} className="btn-gold py-4">
              {full ? (
                <>
                  <Gift size={17} /> Add box to bag
                </>
              ) : (
                `Add ${remaining} more`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
