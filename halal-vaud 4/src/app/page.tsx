import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { ShopCard } from "@/components/ShopCard";
import { ProductCard } from "@/components/ProductCard";
import { PromotionCard } from "@/components/PromotionCard";
import { CategoryCard } from "@/components/CategoryCard";
import {
  getFeaturedShops,
  getPopularProducts,
  getActivePromotions,
  getTopCategories,
  getDemandSignals,
} from "@/lib/queries";

// Always render fresh — this route reads live data from the database
// and must never be statically cached or pre-rendered at build time.
export const dynamic = "force-dynamic";


export default async function HomePage() {
  const [shops, products, promotions, categories, demand] = await Promise.all([
    getFeaturedShops(4),
    getPopularProducts(8),
    getActivePromotions(4),
    getTopCategories(8),
    getDemandSignals(3),
  ]);

  return (
    <div>
      {/* ---- Hero ---- */}
      <section className="hv-texture border-b border-line">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-widest text-saffron">
            Canton de Vaud
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Find halal shops, products &amp; offers near you.
          </h1>
          <p className="mt-4 max-w-xl text-ink-soft">
            One product can live in many shops. Search a product, see who sells it,
            compare prices, and get there — Lausanne, Renens, Morges, Vevey and beyond.
          </p>
          <div className="mt-8 max-w-2xl">
            <SearchBar />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm text-ink-soft">
            <span>Popular:</span>
            {["Basmati rice", "Halal chicken", "Frozen lamb", "Ethiopian products"].map((t) => (
              <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="underline decoration-line underline-offset-4 hover:text-pine">
                {t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-14 space-y-16">
        {/* ---- Popular products ---- */}
        <section>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold text-ink">Popular products</h2>
            <Link href="/search" className="text-sm font-medium text-pine hover:underline">
              See all
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>

        {/* ---- Today's offers ---- */}
        {promotions.length > 0 && (
          <section>
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl font-semibold text-ink">Today&apos;s offers</h2>
              <Link href="/offers" className="text-sm font-medium text-pine hover:underline">
                See all offers
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {promotions.map((p) => (
                <PromotionCard key={p.id} promo={p} />
              ))}
            </div>
          </section>
        )}

        {/* ---- Popular near you ---- */}
        <section>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold text-ink">Popular shops</h2>
            <Link href="/search?tab=shops" className="text-sm font-medium text-pine hover:underline">
              See all
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {shops.map((s) => (
              <ShopCard key={s.slug} shop={s} />
            ))}
          </div>
        </section>

        {/* ---- Categories ---- */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-ink">Explore categories</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((c) => (
              <CategoryCard key={c.slug} name={c.name} slug={c.slug} />
            ))}
          </div>
        </section>

        {/* ---- Demand ---- */}
        {demand.length > 0 && (
          <section className="rounded-2xl border border-line bg-paper p-8">
            <h2 className="font-display text-2xl font-semibold text-ink">
              What people are looking for
            </h2>
            <ul className="mt-4 space-y-2 text-ink-soft">
              {demand.map((d, i) => (
                <li key={i}>
                  Customers{d.city ? ` near ${d.city}` : ""} are looking for{" "}
                  <span className="font-medium text-ink">{d.product}</span> ({d.count} requests)
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ---- For businesses ---- */}
        <section className="flex flex-col items-start gap-4 rounded-2xl bg-pine px-8 py-10 text-linen sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold">Your shop deserves to be found online.</h2>
            <p className="mt-2 max-w-xl text-linen/80">
              Halal Vaud helps independent halal retailers get discovered by customers
              searching for products, shops and offers near them.
            </p>
          </div>
          <Link
            href="/for-business"
            className="shrink-0 rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-ink hover:opacity-90"
          >
            Get your shop online
          </Link>
        </section>
      </div>
    </div>
  );
}
