import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Tile } from "@/components/Tile";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { ContactButtons } from "@/components/ContactButtons";
import { formatPrice, splitCsv } from "@/lib/format";
import { getShopByCityAndSlug } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { BadgeCheck, MapPin, Clock } from "lucide-react";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  params: Promise<{ city: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, slug } = await params;
  const shop = await getShopByCityAndSlug(city, slug);
  if (!shop) return {};
  return {
    title: `${shop.name} — Halal Shop in ${shop.city?.name ?? "Vaud"}`,
    description: shop.description ?? `${shop.name}, halal shop in ${shop.city?.name}.`,
    alternates: { canonical: `/shops/${city}/${slug}` },
  };
}

export default async function ShopPage({ params }: Props) {
  const { city, slug } = await params;
  const shop = await getShopByCityAndSlug(city, slug);
  if (!shop) notFound();

  // best-effort view tracking, never blocks rendering
  prisma.analyticsEvent.create({ data: { type: "SHOP_VIEW", shopId: shop.id } }).catch(() => {});

  const grouped = new Map<string, typeof shop.shopProducts>();
  for (const sp of shop.shopProducts) {
    const cat = sp.product.category?.name ?? "Other";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(sp);
  }

  const avgRating =
    shop.reviews.length > 0
      ? shop.reviews.reduce((sum, r) => sum + r.rating, 0) / shop.reviews.length
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: shop.name,
    address: shop.address,
    telephone: shop.phone ?? undefined,
    url: shop.website ?? undefined,
    geo: shop.latitude && shop.longitude ? { "@type": "GeoCoordinates", latitude: shop.latitude, longitude: shop.longitude } : undefined,
  };

  return (
    <div>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Tile label={shop.name} imageUrl={shop.cover} className="h-48 w-full text-4xl sm:h-64" />

      <div className="mx-auto max-w-6xl px-5">
        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Tile
              label={shop.name}
              imageUrl={shop.logo}
              className="h-24 w-24 shrink-0 rounded-2xl border-4 border-linen text-2xl shadow-sm"
            />
            <div className="pb-1">
              <div className="flex items-center gap-1.5">
                <h1 className="font-display text-2xl font-semibold text-ink">{shop.name}</h1>
                {shop.status === "VERIFIED" && <BadgeCheck className="h-5 w-5 text-pine" aria-label="Verified" />}
              </div>
              <p className="flex items-center gap-1 text-sm text-ink-soft">
                <MapPin className="h-3.5 w-3.5" /> {shop.address ?? shop.city?.name}
                {avgRating && ` · ${avgRating.toFixed(1)}★ (${shop.reviews.length})`}
              </p>
            </div>
          </div>
          <ContactButtons
            shopId={shop.id}
            whatsapp={shop.whatsapp}
            phone={shop.phone}
            address={shop.address ?? shop.city?.name}
            website={shop.website}
          />
        </div>

        {shop.description && <p className="mt-6 max-w-2xl text-ink-soft">{shop.description}</p>}

        <div className="mt-6 flex flex-wrap gap-2">
          {splitCsv(shop.paymentMethods).map((m) => (
            <span key={m} className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft">{m}</span>
          ))}
          {shop.delivery && <span className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft">Delivery</span>}
          {shop.pickup && <span className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft">Pickup</span>}
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_280px]">
          {/* ---- Products ---- */}
          <section>
            <h2 className="font-display text-2xl font-semibold text-ink">Products available here</h2>
            {shop.shopProducts.length === 0 ? (
              <p className="mt-4 text-ink-soft">This shop hasn&apos;t added any products yet.</p>
            ) : (
              <div className="mt-4 space-y-8">
                {[...grouped.entries()].map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">{category}</h3>
                    <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-paper">
                      {items.map((sp) => (
                        <li key={sp.id} className="flex items-center justify-between gap-4 p-4">
                          <Link href={`/products/${sp.product.slug}`} className="flex items-center gap-3 hover:text-pine">
                            <Tile label={sp.product.name} imageUrl={sp.product.image} className="h-12 w-12 rounded-lg text-sm" />
                            <div>
                              <p className="font-medium">{sp.product.name}</p>
                              <AvailabilityBadge status={sp.stockStatus} />
                            </div>
                          </Link>
                          <div className="text-right">
                            {sp.promotions[0] ? (
                              <>
                                <p className="font-semibold text-pine">{formatPrice(sp.promotions[0].promoPrice)}</p>
                                <p className="text-xs text-ink-soft line-through">{formatPrice(sp.promotions[0].originalPrice)}</p>
                              </>
                            ) : (
                              <p className="font-semibold text-ink">{formatPrice(sp.price, sp.currency)}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {shop.reviews.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-2xl font-semibold text-ink">Reviews</h2>
                <ul className="mt-4 space-y-4">
                  {shop.reviews.map((r) => (
                    <li key={r.id} className="rounded-xl border border-line bg-paper p-4">
                      <p className="font-medium text-ink">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</p>
                      {r.comment && <p className="mt-1 text-sm text-ink-soft">{r.comment}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* ---- Opening hours ---- */}
          <aside className="h-fit rounded-2xl border border-line bg-paper p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <Clock className="h-4 w-4" /> Opening hours
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm">
              {shop.openingHours.length === 0 && <li className="text-ink-soft">Not provided</li>}
              {shop.openingHours.map((h) => (
                <li key={h.id} className="flex justify-between text-ink-soft">
                  <span>{DAY_LABELS[h.dayOfWeek]}</span>
                  <span>{h.closed ? "Closed" : `${h.opensAt} – ${h.closesAt}`}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
