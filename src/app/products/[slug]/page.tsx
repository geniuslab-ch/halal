import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Tile } from "@/components/Tile";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice, formatRelativeDate, splitCsv } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { Truck, ShieldCheck, MapPin, Store, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} — Oû acheter dans le Vaud`,
    description: `Comparez les prix et la disponibilité pour ${product.name} dans les boutiques halal du Canton de Vaud.`,
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
    image: product.image ?? undefined,
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

      <nav className="text-sm text-ink-soft flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-pine transition-colors">Accueil</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-pine transition-colors">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-ink font-medium">{product.name}</span>
      </nav>

      {/* ---- Product header with photo ---- */}
      <div className="mt-6 grid gap-8 md:grid-cols-[380px_1fr]">
        {/* Main image container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-line bg-paper shadow-md">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 380px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center gradient-brand">
              <span className="text-8xl font-bold text-white/80">
                {product.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Halal badge */}
          <div className="absolute top-4 left-4">
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-pine shadow backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4 text-green" />
              Certifié Halal
            </span>
          </div>
        </div>

        {/* Product details */}
        <div>
          {product.brand && (
            <p className="text-xs uppercase tracking-widest text-green font-bold">{product.brand}</p>
          )}
          <h1 className="mt-1 font-display text-3xl md:text-4xl font-bold text-ink">{product.name}</h1>
          <p className="mt-2 text-sm font-medium text-ink-soft">
            {[product.size, product.weight, product.unit].filter(Boolean).join(" · ")}
          </p>

          {product.description && (
            <p className="mt-4 text-ink-soft leading-relaxed text-sm">{product.description}</p>
          )}

          {attributes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {attributes.map((a) => (
                <span key={a} className="rounded-full bg-green-light px-3 py-1 text-xs font-semibold text-pine border border-green/20">
                  {a}
                </span>
              ))}
            </div>
          )}

          {/* Price Summary Card */}
          <div className="mt-6 rounded-2xl border border-line bg-paper p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide font-semibold text-ink-soft">Fourchette de prix</p>
            <p className="mt-1 font-display text-3xl font-bold text-pine">
              {listings.length
                ? `${formatPrice(Math.min(...listings.map((l) => l.price)))} – ${formatPrice(
                    Math.max(...listings.map((l) => l.price))
                  )}`
                : "Non disponible actuellement"}
            </p>
            <div className="mt-2 flex items-center gap-4 text-xs text-ink-soft">
              <span className="flex items-center gap-1">
                <Store className="h-3.5 w-3.5 text-green" />
                {listings.length} boutique{listings.length > 1 ? "s" : ""} disponible{listings.length > 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-green" />
                Livraison à domicile
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Where to buy / Listings with direct checkout ---- */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-pine">Où acheter dans le Canton de Vaud</h2>
            <p className="text-xs text-ink-soft mt-0.5">Comparez les prix et commandez en livraison auprès des boutiques locales.</p>
          </div>
          <div className="flex gap-2 text-xs font-semibold">
            <Link
              href="?sort=price"
              className={`rounded-full px-3 py-1.5 transition-all ${sort === "price" ? "gradient-brand text-white shadow" : "border border-line bg-paper text-ink-soft hover:text-ink"}`}
            >
              Prix le plus bas
            </Link>
            <Link
              href="?sort=updated"
              className={`rounded-full px-3 py-1.5 transition-all ${sort === "updated" ? "gradient-brand text-white shadow" : "border border-line bg-paper text-ink-soft hover:text-ink"}`}
            >
              Récemment mis à jour
            </Link>
          </div>
        </div>

        {listings.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center text-ink-soft">
            Aucune boutique ne liste ce produit pour le moment.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {listings.map((listing) => {
              const activePromo = listing.promotions[0];
              return (
                <li
                  key={listing.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-line bg-paper shadow-sm hover:border-green transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Tile label={listing.shop.name} imageUrl={listing.shop.logo} className="h-14 w-14 shrink-0 rounded-xl text-base" />
                    <div>
                      <Link
                        href={`/shops/${listing.shop.city?.slug ?? "vaud"}/${listing.shop.slug}`}
                        className="font-semibold text-ink hover:text-pine transition-colors"
                      >
                        {listing.shop.name}
                      </Link>
                      <p className="flex items-center gap-1 text-xs text-ink-soft mt-0.5">
                        <MapPin className="h-3 w-3" /> {listing.shop.city?.name ?? "Vaud"}
                      </p>
                      <div className="mt-1">
                        <AvailabilityBadge status={listing.stockStatus} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-6 sm:justify-end">
                    <div className="text-right">
                      {activePromo ? (
                        <>
                          <p className="font-display text-xl font-bold text-pine">{formatPrice(activePromo.promoPrice)}</p>
                          <p className="text-xs text-ink-soft line-through">{formatPrice(activePromo.originalPrice)}</p>
                        </>
                      ) : (
                        <p className="font-display text-xl font-bold text-ink">{formatPrice(listing.price, listing.currency)}</p>
                      )}
                      <p className="text-[10px] text-ink-soft mt-0.5">{formatRelativeDate(listing.lastAvailabilityUpdate)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/checkout?product=${listing.id}`}
                        className="btn-primary text-xs py-2 px-4"
                      >
                        <Truck className="h-3.5 w-3.5" />
                        Commander
                      </Link>
                      <Link
                        href={`/shops/${listing.shop.city?.slug ?? "vaud"}/${listing.shop.slug}`}
                        className="btn-outline text-xs py-2 px-3 hidden md:inline-flex"
                      >
                        Boutique
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {tags.length > 0 && (
        <section className="mt-10 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="rounded-full border border-line bg-paper px-3 py-1 text-xs text-ink-soft">
              #{t}
            </span>
          ))}
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-pine">Produits similaires</h2>
            <Link href="/search" className="flex items-center gap-1 text-xs font-semibold text-green hover:text-pine">
              Voir tout <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
