# Halal Vaud — Web MVP

A product-first marketplace connecting halal shops, products and offers across the
Canton of Vaud, Switzerland. Built with Next.js (App Router), TypeScript, Tailwind CSS,
Prisma, and Postgres — deploys on Vercel with zero local setup.

## Why "product-first"

The catalogue is **not** `Shop → Products`. It's `Product → ShopProduct (price/stock) → Shop`.
A product like *Al Wadi Basmati Rice 5kg* exists once in the global catalogue; any number
of shops can list it with their own price and availability. This is what powers the
"Where to buy" price-comparison list on every product page, product-level search/SEO, and
future features (promotions, marketplace checkout, demand intelligence) without
re-architecting later. See `prisma/schema.prisma` for the full data model and
`src/lib/queries.ts` for how it's queried.

## Deploying on Vercel — no terminal required

Everything happens in Vercel's own build step: creating the database tables and loading
the demo data. You don't need to run Prisma, or anything else, from your own machine.

### 1. Push this repo to GitHub, then import it into Vercel
(You've already done the GitHub part.) In Vercel: **Add New → Project → import this repo.**

### 2. Attach a Postgres database
In your Vercel project → **Storage** tab → **Create Database** → **Postgres**. This
provisions a Neon database and automatically adds `DATABASE_URL` to your project's
environment variables — nothing to copy/paste. (Supabase or Neon directly also work: just
add `DATABASE_URL` yourself under **Settings → Environment Variables** in that case.)

### 3. Deploy
Trigger a deploy (Vercel does this automatically after step 1, or click **Redeploy**).
The build command (see `package.json`) does three things in order:

```
prisma generate            # generate the Prisma client
prisma db push              # create/update all tables to match schema.prisma
tsx prisma/seed.ts          # load demo data — 6 cities, 16 shops, ~20 products
next build
```

First deploy: creates every table and loads the demo data. Every deploy after that: the
seed step checks if data already exists and skips itself, so redeploying is always safe
and never duplicates data.

That's it — your Vercel URL is now a fully working, seeded demo you can show a shop owner.

## Local development (optional)

Only needed if you want to run this on your own machine too — not required for the
Vercel deploy above.

```bash
npm install
# create a .env file with DATABASE_URL pointing at any Postgres instance
# (reuse the same one Vercel created, or run one locally via Docker)
npx prisma db push
npx prisma db seed   # or: npm run db:seed
npm run dev
```

Open http://localhost:3000.

## A note on `prisma db push` vs migrations

This project uses `prisma db push` (schema sync on every build) rather than versioned
migration files, because it needs to work with zero local terminal access — Vercel's
build creates and updates tables itself, no migration files to generate and commit.

This is the right tool **for this MVP/demo stage**. Once real shops start adding real
data you don't want to lose, switch to Prisma's versioned migrations instead (`prisma
migrate dev` locally to generate a migration, commit `prisma/migrations/`, and change the
build command to `prisma migrate deploy`) — `db push` can drop columns/tables to force a
match with the schema, which is fine for a seeded demo but not for live merchant data.

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
                             (idempotent — safe to run on every build)
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

## Useful scripts (optional, local-only)

| Command              | What it does                                             |
|-----------------------|-----------------------------------------------------------|
| `npm run dev`         | Start the dev server                                      |
| `npm run db:seed`     | Load demo data into whatever `DATABASE_URL` points to     |
| `npm run db:studio`   | Open Prisma Studio to browse/edit data visually            |
| `npm run build`       | What Vercel runs: push schema, seed, build                |
