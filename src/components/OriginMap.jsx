import { feature } from 'topojson-client'
import land from 'world-atlas/land-110m.json'

// Equirectangular projection, cropped to the band where cacao grows (±40°).
const W = 720
const H = 360
const project = ([lng, lat]) => [((lng + 180) / 360) * W, ((90 - lat) / 180) * H]

function ringsToPath(rings) {
  return rings
    .map((ring) => {
      let d = ''
      let prev = null
      for (const pt of ring) {
        const [x, y] = project(pt)
        // Start a new sub-path where a ring wraps across the antimeridian.
        d += prev == null || Math.abs(pt[0] - prev) > 180 ? `M${x.toFixed(1)},${y.toFixed(1)}` : `L${x.toFixed(1)},${y.toFixed(1)}`
        prev = pt[0]
      }
      return d + 'Z'
    })
    .join('')
}

const geo = feature(land, land.objects.land)
const LAND_PATH = geo.features
  .map((f) => (f.geometry.type === 'Polygon' ? ringsToPath(f.geometry.coordinates) : f.geometry.coordinates.map(ringsToPath).join('')))
  .join('')

export default function OriginMap({ lat, lng, label, sub }) {
  const [x, y] = project([lng, lat])
  const top = project([0, 40])[1]
  const bottom = project([0, -40])[1]
  const beltTop = project([0, 20])[1]
  const beltBottom = project([0, -20])[1]
  // Keep the label inside the frame on either edge.
  const anchor = x > W * 0.7 ? 'end' : x < W * 0.3 ? 'start' : 'middle'
  const dx = anchor === 'end' ? -14 : anchor === 'start' ? 14 : 0

  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-base/60">
      <svg viewBox={`0 ${top} ${W} ${bottom - top}`} className="block w-full" role="img" aria-label={`Map pin: ${label}`}>
        <rect x="0" y={beltTop} width={W} height={beltBottom - beltTop} fill="var(--c-gold)" opacity=".07" />
        <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="var(--c-gold)" strokeOpacity=".25" strokeDasharray="2 5" />
        <path d={LAND_PATH} fill="var(--c-muted)" fillOpacity=".28" stroke="var(--c-gold)" strokeOpacity=".25" strokeWidth=".6" />
        <g transform={`translate(${x},${y})`}>
          <circle r="5" fill="var(--c-gold)" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'pulse-ring 2.2s ease-out infinite' }} />
          <circle r="4.5" fill="var(--c-gold)" stroke="var(--c-bg)" strokeWidth="1.5" />
          <text x={dx} y="-12" textAnchor={anchor} fontSize="13" fill="var(--c-ink)" fontFamily="Playfair Display, serif" fontStyle="italic">
            {label}
          </text>
        </g>
      </svg>
      <figcaption className="flex items-center justify-between border-t border-line px-4 py-2.5 text-xs text-muted">
        <span>{sub}</span>
        <span className="tabular-nums">
          {Math.abs(lat).toFixed(1)}°{lat >= 0 ? 'N' : 'S'} · {Math.abs(lng).toFixed(1)}°{lng >= 0 ? 'E' : 'W'}
        </span>
      </figcaption>
    </figure>
  )
}
