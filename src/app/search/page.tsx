import Link from "next/link";
import { Suspense } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ProductCard } from "@/components/ProductCard";
import { ShopCard } from "@/components/ShopCard";
import { searchProducts, searchShops } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; city?: string; tab?: string }>;
};

export const metadata = { title: "Recherche | Halal Vaud" };

async function SearchResults({ searchParams }: Props) {
  const { q = "", city = "", tab = "all" } = await searchParams;

  if (q) {
    prisma.analyticsEvent.create({ data: { type: "SEARCH", metadata: JSON.stringify({ q, city }) } }).catch(() => {});
  }

  const [products, shops] = await Promise.all([
    q ? searchProducts(q) : [],
    q || city ? searchShops(q, city) : [],
  ]);

  const tabs = [
    { id: "all", label: "Tout" },
    { id: "products", label: `Produits (${products.length})` },
    { id: "shops", label: `Boutiques (${shops.length})` },
  ];

  const showProducts = tab === "all" || tab === "products";
  const showShops = tab === "all" || tab === "shops";

  return (
    <div>
      <SearchBar defaultQuery={q} defaultCity={city} />

      <div className="mt-6 flex gap-2 border-b border-line">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/search?q=${encodeURIComponent(q)}&city=${encodeURIComponent(city)}&tab=${t.id}`}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition-all ${
              tab === t.id ? "border-green text-pine" : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {!q && !city && (
        <p className="mt-10 text-center text-ink-soft">Entrez un nom de produit ou une boutique pour commencer la recherche.</p>
      )}

      {showProducts && products.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-2xl font-bold text-pine mb-4">Produits</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {showShops && shops.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-2xl font-bold text-pine mb-4">Boutiques</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((s) => (
              <ShopCard key={s.slug} shop={s} />
            ))}
          </div>
        </section>
      )}

      {q && products.length === 0 && shops.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-line p-12 text-center text-ink-soft">
          Aucun résultat pour &ldquo;{q}&rdquo;. Essayez un autre mot-clé.
        </div>
      )}
    </div>
  );
}

export default function SearchPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-green" /></div>}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
