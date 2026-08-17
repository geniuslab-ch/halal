# Halal Vaud — Web MVP

A product-first marketplace connecting halal shops, products and offers across the
Canton of Vaud, Switzerland. Built with Next.js (App Router), TypeScript, Tailwind CSS,
Prisma, and Postgres — ready to deploy on Vercel.

## Why "product-first"

The catalogue is **not** `Shop → Products`. It's `Product → ShopProduct (price/stock) → Shop`.
A product like *Al Wadi Basmati Rice 5kg* exists once in the global catalogue; any number
of shops can list it with their own price and availability. This is what powers the
"Where to buy" price-comparison list on every product page, product-level search/SEO, and
future features (promotions, marketplace checkout, demand intelligence) without
re-architecting later. See `prisma/schema.prisma` for the full data model and
`src/lib/queries.ts` for how it's queried.

## Deploying on Vercel (recommended path)

### 1. Get a Postgres database
On [vercel.com](https://vercel.com), open your project → **Storage** tab → **Create Database**
→ choose **Postgres** (this provisions a Neon database and wires `DATABASE_URL` into your
project's environment variables automatically). Supabase or Neon directly also work fine —
just paste the connection string into the `DATABASE_URL` env var yourself in that case.

### 2. Generate the first migration (one-time, from your machine)
Prisma migrations are SQL files that get committed to the repo — Vercel doesn't generate
them for you, it only *applies* them during build.

```bash
git clone <your-repo-url> halal-vaud
cd halal-vaud
npm install
```

Pull the same `DATABASE_URL` Vercel just created (needs the [Vercel CLI](https://vercel.com/docs/cli), `npm i -g vercel`):

```bash
vercel link          # connect this folder to your Vercel project
vercel env pull .env # writes DATABASE_URL (and others) into .env
```

Then create and apply the migration, and load demo data:

```bash
npm run db:migrate    # creates prisma/migrations/..._init/ — COMMIT this folder
npm run db:seed       # loads 6 cities, 16 shops, ~20 products, promotions — into the SAME db Vercel uses
git add prisma/migrations && git commit -m "Add initial migration"
git push
```

### 3. Deploy
Push to GitHub and import the repo in Vercel (or `vercel --prod` from the CLI). The build
command already runs `prisma generate && prisma migrate deploy && next build` (see
`package.json`), so every deploy automatically applies any new migrations — you only need
to run `npm run db:migrate` locally again when you actually change `schema.prisma`.

That's it — the live URL will show the same seeded data you just loaded, so it's ready to
show a shop owner immediately.

## Local development

Same steps as above, minus the Vercel-specific ones — just point `DATABASE_URL` (in `.env`)
at any Postgres instance (the same Vercel/Neon one is easiest, or a local Postgres via
Docker: `docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres`).

```bash
npm install
npm run db:migrate   # first time only, or after schema changes
npm run db:seed
npm run dev
```

Open http://localhost:3000.

## What's actually implemented in this MVP

- **Product-first catalogue**: `Product`, `ShopProduct` (price/stock per shop), `Promotion`
- **Customer site**: homepage, product detail (`/products/[slug]`) with sortable
  "where to buy" list, shop pages (`/shops/[city]/[slug]`), free-text search across
  products & shops, `/offers`, category pages, all mobile-first
- **SEO**: per-product and per-shop canonical URLs, `Product`/`LocalBusiness` JSON-LD,
  metadata via `generateMetadata`
- **Merchant tools**: `/dashboard` (30-day analytics from real click/view events),
  `/dashboard/products` (add an existing catalogue product to your shop, or create a new
  one), `/dashboard/promotions` (create a promotion from an existing listing)
- **Admin**: `/admin` — verify/reject shops, merge duplicate products (listings move to
  the canonical product, nothing is deleted)
- **Analytics events**: shop views, WhatsApp/phone/directions/website clicks, searches —
  logged via `/api/analytics` and a Prisma model, ready to plug into charts
- **Demand intelligence**: `CustomerRequest` model + a "what people are looking for"
  homepage section, aggregated with `groupBy` (no individual customer data is ever shown)
- **`/for-business`**: value proposition, configurable pricing (`src/lib/plans.ts`), and a
  working "Add my shop" form that creates a `PENDING` shop for admin review

## What's intentionally NOT built yet (see spec §55, "do not overbuild")

- **Authentication** — the merchant dashboard and admin panel are not behind login yet.
  They're fully functional against real data, but scoped by a `?shop=` selector instead
  of a session. On Vercel this means `/dashboard` and `/admin` are publicly reachable —
  fine for a private demo link shown to one shop owner, but wire real auth (Supabase Auth
  / NextAuth / Clerk + Vercel middleware) before a public launch. `queries.ts` is already
  shop-scoped so this won't touch the schema.
- Payments, delivery logistics, native mobile app, full marketplace checkout —
  all deliberately deferred, per the product spec.

## Project structure

```
prisma/schema.prisma       Data model (see comments — Product vs ShopProduct)
prisma/seed.ts              Demo data: 6 cities, 16 shops, ~20 products, 4 promotions
src/lib/queries.ts          All read queries (data-access layer used by pages)
src/app/actions/            Server actions (writes): shop registration, product
                             management, promotions, admin verification/merge
src/app/(site pages)        page.tsx, products/[slug], shops/[city]/[slug],
                             search, offers, categories/[slug], for-business
src/app/dashboard/          Merchant dashboard
src/app/admin/              Admin panel
src/components/             Navbar, ProductCard, ShopCard, PromotionCard, Tile
                             (placeholder art — no external image hosting needed), etc.
```

## Images

Shops/products render colour-coded initials (`src/components/Tile.tsx`) when no image is
set, so there's zero setup needed to demo this. When you add real photos, just store the
URL on `Product.image` / `Shop.logo` / `Shop.cover` — they render as plain `<img>` tags,
so no `next.config` remote-image allowlist changes are needed, on Vercel or anywhere else.

## Useful scripts

| Command              | What it does                                             |
|-----------------------|-----------------------------------------------------------|
| `npm run dev`         | Start the dev server                                      |
| `npm run db:migrate`  | Create a new migration from schema changes & apply it     |
| `npm run db:seed`     | Load demo data into whatever `DATABASE_URL` points to     |
| `npm run db:reset`    | Wipe and re-seed the database                              |
| `npm run db:studio`   | Open Prisma Studio to browse/edit data visually            |
| `npm run build`       | Production build (also applies pending migrations)        |
