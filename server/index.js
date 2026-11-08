// Local API for Velvet Cacao, backed by Neon Postgres. Vite proxies /api here in dev.
import { randomInt } from 'node:crypto'
import express from 'express'
import { BOX_SIZES, CYCLES, PLANS, RIBBONS, SHIPPING, TRUFFLES, planPrice, shippingCost } from '../src/data/content.js'
import { hasDatabase, sql } from './db.js'

const PORT = Number(process.env.API_PORT) || 8787
const app = express()
app.use(express.json({ limit: '32kb' }))

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

app.use('/api', (req, res, next) => {
  if (hasDatabase || req.path === '/health') return next()
  next(new HttpError(503, 'The database isn’t configured yet. Add DATABASE_URL to velvet-cacao/.env and run npm run db:setup.'))
})

const toProduct = (r) => ({
  id: r.id,
  name: r.name,
  subtitle: r.subtitle,
  tags: r.tags,
  cocoa: r.cocoa,
  origin: r.origin,
  price: r.price_cents / 100,
  rating: Number(r.rating),
  reviews: r.review_count,
  popularity: r.popularity,
  added: r.added_on,
  weight: r.weight,
  badge: r.badge ?? undefined,
  image: r.image,
  gallery: r.gallery,
  alt: r.alt,
  notes: r.notes,
  description: r.description,
  ingredients: r.ingredients,
  allergens: r.allergens,
})

const PRODUCT_COLUMNS = sql
  ? sql.unsafe(`id, name, subtitle, tags, cocoa, origin, price_cents, rating, review_count, popularity,
      to_char(added_on, 'YYYY-MM-DD') as added_on, weight, badge, image, gallery, alt, notes, description, ingredients, allergens`)
  : null

app.get('/api/health', async (_req, res) => {
  if (!hasDatabase) return res.status(503).json({ ok: false, database: 'not configured' })
  const [row] = await sql`
    select (select count(*) from products)::int as products,
           (select count(*) from reviews)::int as reviews,
           (select count(*) from orders)::int as orders,
           (select count(*) from newsletter_subscribers)::int as subscribers`
  res.json({ ok: true, database: 'neon', ...row })
})

app.get('/api/products', async (_req, res) => {
  const rows = await sql`select ${PRODUCT_COLUMNS} from products order by popularity desc`
  res.json(rows.map(toProduct))
})

app.get('/api/products/:id', async (req, res) => {
  const [row] = await sql`select ${PRODUCT_COLUMNS} from products where id = ${req.params.id}`
  if (!row) throw new HttpError(404, 'We couldn’t find that chocolate.')
  res.json(toProduct(row))
})

app.get('/api/reviews', async (_req, res) => {
  const rows = await sql`
    select name, place, rating, product, body as text, to_char(reviewed_on, 'YYYY-MM-DD') as date
    from reviews order by reviewed_on desc`
  res.json(rows)
})

const EMAIL = /^\S+@\S+\.\S+$/
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

// Price every line on the server; the client's prices are never trusted.
function priceItem(item, productsById) {
  const qty = Number(item?.qty)
  if (!Number.isInteger(qty) || qty < 1 || qty > 20) throw new HttpError(400, 'Each item needs a quantity between 1 and 20.')
  const kind = item.kind ?? (item.productId ? 'product' : null)
  const config = item.config ?? {}

  if (kind === 'product') {
    const p = productsById.get(item.productId)
    if (!p) throw new HttpError(400, 'One of the items in your bag is no longer available.')
    return { kind, product_id: p.id, name: p.name, meta: p.weight, config: null, unit_price_cents: p.price_cents, quantity: qty }
  }
  if (kind === 'box') {
    const size = BOX_SIZES.find((b) => b.size === config.size)
    const slots = Array.isArray(config.slots) ? config.slots : []
    const ribbon = RIBBONS.find((r) => r.id === config.ribbon)
    if (!size || !ribbon || slots.length !== size.size || !slots.every((id) => TRUFFLES.some((t) => t.id === id))) {
      throw new HttpError(400, 'Your custom box looks incomplete — please rebuild it and add it again.')
    }
    const message = str(config.message, 150)
    return {
      kind,
      product_id: null,
      name: `Custom ${size.label} Box · ${size.size}`,
      meta: `${ribbon.name} ribbon`,
      config: { size: size.size, slots, ribbon: ribbon.id, message },
      unit_price_cents: size.price * 100,
      quantity: qty,
    }
  }
  if (kind === 'plan') {
    const plan = PLANS.find((p) => p.id === config.planId)
    const cycle = CYCLES.find((c) => c.id === config.cycleId)
    if (!plan || !cycle) throw new HttpError(400, 'That subscription plan isn’t available any more.')
    return { kind, product_id: null, name: `${plan.name} Tasting Box`, meta: cycle.label, config: { planId: plan.id, cycleId: cycle.id }, unit_price_cents: planPrice(plan, cycle) * 100, quantity: qty }
  }
  throw new HttpError(400, 'One of the items in your bag couldn’t be read — please remove it and add it again.')
}

app.post('/api/orders', async (req, res) => {
  const { customer = {}, shipping, items } = req.body ?? {}
  const c = {
    email: str(customer.email, 254),
    name: str(customer.name, 120),
    address: str(customer.address, 200),
    city: str(customer.city, 100),
    postcode: str(customer.postcode, 20),
    country: str(customer.country, 60),
  }
  if (!EMAIL.test(c.email)) throw new HttpError(400, 'Please enter a valid email address.')
  if (c.name.length < 2 || c.address.length < 4 || !c.city || c.postcode.length < 3 || !c.country) {
    throw new HttpError(400, 'Please complete your delivery details.')
  }
  if (!SHIPPING.some((s) => s.id === shipping)) throw new HttpError(400, 'Please choose a shipping option.')
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) throw new HttpError(400, 'Your bag is empty.')

  const ids = items.filter((i) => i?.productId).map((i) => String(i.productId))
  const rows = ids.length ? await sql`select id, name, weight, price_cents from products where id = any(${ids})` : []
  const lines = items.map((i) => priceItem(i, new Map(rows.map((r) => [r.id, r]))))

  const subtotal = lines.reduce((n, l) => n + l.unit_price_cents * l.quantity, 0)
  const ship = shippingCost(shipping, subtotal / 100) * 100
  const total = subtotal + ship

  // Retry on the (very unlikely) chance of an order-number collision.
  for (let attempt = 0; attempt < 3; attempt++) {
    const orderNumber = `VC-${randomInt(100000, 1000000)}`
    try {
      const [[order]] = await sql.transaction([
        sql`insert into orders (order_number, email, full_name, address, city, postcode, country,
              shipping_method, subtotal_cents, shipping_cents, total_cents)
            values (${orderNumber}, ${c.email}, ${c.name}, ${c.address}, ${c.city}, ${c.postcode}, ${c.country},
              ${shipping}, ${subtotal}, ${ship}, ${total})
            returning order_number, total_cents, created_at`,
        sql.query(
          `insert into order_items (order_id, kind, product_id, name, meta, config, unit_price_cents, quantity)
           select (select id from orders where order_number = $1), kind, product_id, name, meta, config, unit_price_cents, quantity
           from jsonb_to_recordset($2::jsonb)
             as x(kind text, product_id text, name text, meta text, config jsonb, unit_price_cents int, quantity smallint)`,
          [orderNumber, JSON.stringify(lines)],
        ),
      ])
      return res.status(201).json({
        orderNumber: order.order_number,
        subtotal: subtotal / 100,
        shipping: ship / 100,
        total: order.total_cents / 100,
        createdAt: order.created_at,
      })
    } catch (err) {
      if (err.code === '23505' && attempt < 2) continue
      throw err
    }
  }
})

app.post('/api/newsletter', async (req, res) => {
  const email = str(req.body?.email, 254).toLowerCase()
  if (!EMAIL.test(email)) throw new HttpError(400, 'That email doesn’t look quite right — mind checking it?')
  const rows = await sql`insert into newsletter_subscribers (email) values (${email}) on conflict do nothing returning email`
  res.status(rows.length ? 201 : 200).json({ subscribed: true, alreadySubscribed: rows.length === 0 })
})

app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Not found')))

// Express 5 forwards rejected async handlers here.
app.use((err, _req, res, _next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message })
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'That request couldn’t be read.' })
  console.error(err)
  res.status(500).json({ error: 'Something went wrong on our side. Please try again in a moment.' })
})

app.listen(PORT, () => {
  console.log(`Velvet Cacao API on http://localhost:${PORT} · database: ${hasDatabase ? 'Neon (DATABASE_URL set)' : 'NOT CONFIGURED — add DATABASE_URL to .env'}`)
})
