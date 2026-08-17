import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Tile } from "@/components/Tile";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice, formatRelativeDate, splitCsv } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} — Where to Buy in Vaud`,
    description: `Compare prices and availability for ${product.name} across halal shops in the Canton of Vaud.`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} — Halal Vaud`,
      description: product.description ?? undefined,
    },
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort = "price" } = await searchParams;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const listings = [...product.shopProducts].sort((a, b) => {
    if (sort === "updated") {
      return (
        new Date(b.lastAvailabilityUpdate).getTime() -
        new Date(a.lastAvailabilityUpdate).getTime()
      );
    }
    return a.price - b.price;
  });

  const related = await getRelatedProducts(product.categoryId, product.id, 4);
  const tags = splitCsv(product.tags);
  const attributes = splitCsv(product.attributes);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: product.brand ?? undefined,
    description: product.description ?? undefined,
    offers: listings.map((l) => ({
      "@type": "Offer",
      price: l.price,
      priceCurrency: l.currency,
      availability:
        l.stockStatus === "IN_STOCK"
          ? "https://schema.org/InStock"
          : l.stockStatus === "OUT_OF_STOCK"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/LimitedAvailability",
      seller: { "@type": "LocalBusiness", name: l.shop.name },
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-sm text-ink-soft">
        <Link href="/" className="hover:text-pine">Home</Link>
        {product.category && (
          <>
            {" / "}
            <Link href={`/categories/${product.category.slug}`} className="hover:text-pine">
              {product.category.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-ink">{product.name}</span>
      </nav>

      {/* ---- Product header ---- */}
      <div className="mt-6 grid gap-8 md:grid-cols-[320px_1fr]">
        <Tile label={product.name} imageUrl={product.image} className="aspect-square w-full rounded-2xl text-5xl" />
        <div>
          {product.brand && <p className="text-sm uppercase tracking-wide text-ink-soft">{product.brand}</p>}
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">{product.name}</h1>
          <p className="mt-2 text-sm text-ink-soft">
            {[product.size, product.weight, product.unit].filter(Boolean).join(" · ")}
          </p>
          {product.description && <p className="mt-4 max-w-xl text-ink-soft">{product.description}</p>}

          {attributes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {attributes.map((a) => (
                <span key={a} className="rounded-full bg-saffron-soft px-3 py-1 text-xs font-medium text-[#6b4d0e]">
                  {a}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 rounded-xl border border-line bg-paper p-4">
            <p className="text-xs uppercase tracking-wide text-ink-soft">Price range</p>
            <p className="mt-1 font-display text-2xl font-semibold text-pine">
              {listings.length
                ? `${formatPrice(Math.min(...listings.map((l) => l.price)))} – ${formatPrice(
                    Math.max(...listings.map((l) => l.price))
                  )}`
                : "Not currently listed"}
            </p>
            <p className="text-xs text-ink-soft">
              across {listings.length} {listings.length === 1 ? "shop" : "shops"}
            </p>
          </div>
        </div>
      </div>

      {/* ---- Where to buy ---- */}
      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold text-ink">Where to buy</h2>
          <div className="flex gap-2 text-sm">
            <Link
              href={`?sort=price`}
              className={`rounded-full border px-3 py-1.5 ${sort === "price" ? "border-pine bg-pine text-linen" : "border-line text-ink-soft"}`}
            >
              Lowest price
            </Link>
            <Link
              href={`?sort=updated`}
              className={`rounded-full border px-3 py-1.5 ${sort === "updated" ? "border-pine bg-pine text-linen" : "border-line text-ink-soft"}`}
            >
              Recently updated
            </Link>
          </div>
        </div>

        {listings.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-line p-6 text-center text-ink-soft">
            No shop currently lists this product.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-paper">
            {listings.map((listing) => {
              const activePromo = listing.promotions[0];
              return (
                <li key={listing.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Tile label={listing.shop.name} imageUrl={listing.shop.logo} className="h-12 w-12 rounded-lg text-sm" />
                    <div>
                      <Link href={`/shops/${listing.shop.city?.slug ?? "vaud"}/${listing.shop.slug}`} className="font-medium text-ink hover:text-pine">
                        {listing.shop.name}
                      </Link>
                      <p className="text-xs text-ink-soft">{listing.shop.city?.name}</p>
                      <AvailabilityBadge status={listing.stockStatus} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-6 sm:justify-end">
                    <div className="text-right">
                      {activePromo ? (
                        <>
                          <p className="font-display text-lg font-semibold text-pine">{formatPrice(activePromo.promoPrice)}</p>
                          <p className="text-xs text-ink-soft line-through">{formatPrice(activePromo.originalPrice)}</p>
                        </>
                      ) : (
                        <p className="font-display text-lg font-semibold text-ink">{formatPrice(listing.price, listing.currency)}</p>
                      )}
                      <p className="text-xs text-ink-soft">{formatRelativeDate(listing.lastAvailabilityUpdate)}</p>
                    </div>
                    <Link
                      href={`/shops/${listing.shop.city?.slug ?? "vaud"}/${listing.shop.slug}`}
                      className="rounded-full border border-pine px-4 py-2 text-sm font-medium text-pine hover:bg-pine hover:text-linen"
                    >
                      View shop
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-3 text-xs text-ink-soft">
          Prices and availability are set by each merchant and may not reflect real-time inventory.
        </p>
      </section>

      {tags.length > 0 && (
        <section className="mt-10 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft">
              #{t}
            </span>
          ))}
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-ink">Related products</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
