# Velvet Cacao

A luxury bean-to-bar chocolate shop (demo). React 19 + Vite + Tailwind CSS v4 + Framer Motion + lucide-react.

```bash
npm install
cp .env.example .env   # then paste your Neon DATABASE_URL into .env
npm run db:setup       # creates tables and seeds products + reviews (safe to re-run)
npm run dev            # web on http://localhost:5175, API on http://localhost:8787
npm run build
```

## Database (Neon Postgres)

- `server/schema.sql` — products, reviews, orders, order_items, newsletter_subscribers (money in cents)
- `server/setup.js` — applies the schema and upserts the catalogue from `src/data`
- `server/index.js` — Express API: `GET /api/health`, `/api/products`, `/api/products/:id`, `/api/reviews`,
  `POST /api/orders`, `POST /api/newsletter`. Order totals are recomputed on the server; card details are never sent.

The browser only talks to `/api` (proxied by Vite), so `DATABASE_URL` never reaches the client. Without a database
the site still runs on its bundled sample catalogue; the footer shows which source is live.

- `src/data/` — mock products, editorial content and photo credits
- `src/context/store.jsx` — cart, wishlist, theme and toasts (persisted to localStorage)
- `src/components/` — shared UI (navbar, cart drawer, product card, drip divider, origin map…)
- `src/pages/` — Home, Shop, Product, Build a Box, Checkout, Story, Subscriptions & Gifting, Wishlist
- `public/images/` — all photography, downloaded locally from Unsplash (credits in the footer)

Routing is hash-based (`#/shop`, `#/product/esmeraldas-72`). Checkout saves the order to Postgres but takes no payment.
