// Creates the tables (idempotent) and seeds the catalogue from src/data.
// Usage: npm run db:setup
import { readFile } from 'node:fs/promises'
import { products } from '../src/data/products.js'
import { REVIEWS } from '../src/data/content.js'
import { requireDatabase } from './db.js'

const sql = requireDatabase()

const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8')
const statements = schema
  .replace(/--.*$/gm, '')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean)
await sql.transaction(statements.map((s) => sql.query(s)))
console.log(`✓ Schema ready (${statements.length} statements)`)

const productRows = products.map((p) => ({
  id: p.id,
  name: p.name,
  subtitle: p.subtitle,
  tags: p.tags,
  cocoa: p.cocoa,
  origin: p.origin,
  price_cents: Math.round(p.price * 100),
  rating: p.rating,
  review_count: p.reviews,
  popularity: p.popularity,
  added_on: p.added,
  weight: p.weight,
  badge: p.badge ?? null,
  image: p.image,
  gallery: p.gallery,
  alt: p.alt,
  notes: p.notes,
  description: p.description,
  ingredients: p.ingredients,
  allergens: p.allergens,
}))

const reviewRows = REVIEWS.map((r) => ({ name: r.name, place: r.place, rating: r.rating, product: r.product, body: r.text, reviewed_on: r.date }))

await sql.transaction([
  sql.query(
    `insert into products (id, name, subtitle, tags, cocoa, origin, price_cents, rating, review_count, popularity,
       added_on, weight, badge, image, gallery, alt, notes, description, ingredients, allergens)
     select id, name, subtitle, tags, cocoa, origin, price_cents, rating, review_count, popularity,
       added_on, weight, badge, image, gallery, alt, notes, description, ingredients, allergens
     from jsonb_populate_recordset(null::products, $1::jsonb)
     on conflict (id) do update set
       name = excluded.name, subtitle = excluded.subtitle, tags = excluded.tags, cocoa = excluded.cocoa,
       origin = excluded.origin, price_cents = excluded.price_cents, rating = excluded.rating,
       review_count = excluded.review_count, popularity = excluded.popularity, added_on = excluded.added_on,
       weight = excluded.weight, badge = excluded.badge, image = excluded.image, gallery = excluded.gallery,
       alt = excluded.alt, notes = excluded.notes, description = excluded.description,
       ingredients = excluded.ingredients, allergens = excluded.allergens, updated_at = now()`,
    [JSON.stringify(productRows)],
  ),
  // Reviews have no natural key, so the seed replaces them wholesale.
  sql`truncate reviews restart identity`,
  sql.query(
    `insert into reviews (name, place, rating, product, body, reviewed_on)
     select name, place, rating, product, body, reviewed_on from jsonb_populate_recordset(null::reviews, $1::jsonb)`,
    [JSON.stringify(reviewRows)],
  ),
])

const [counts] = await sql`select (select count(*) from products)::int as products, (select count(*) from reviews)::int as reviews`
console.log(`✓ Seeded ${counts.products} products and ${counts.reviews} reviews`)
