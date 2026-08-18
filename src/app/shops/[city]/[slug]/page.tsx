import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Tile } from "@/components/Tile";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { ContactButtons } from "@/components/ContactButtons";
import { formatPrice, splitCsv } from "@/lib/format";
import { getShopByCityAndSlug } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { BadgeCheck, MapPin, Clock, Truck, ShieldCheck, CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

type Props = {
  params: Promise<{ city: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, slug } = await params;
  const shop = await getShopByCityAndSlug(city, slug);
  if (!shop) return {};
  return {
    title: `${shop.name} — Boutique Halal à ${shop.city?.name ?? "Vaud"}`,
    description: shop.description ?? `${shop.name}, boutique halal à ${shop.city?.name}.`,
    alternates: { canonical: `/shops/${city}/${slug}` },
  };
}

export default async function ShopPage({ params }: Props) {
  const { city, slug } = await params;
  const shop = await getShopByCityAndSlug(city, slug);
  if (!shop) notFound();

  prisma.analyticsEvent.create({ data: { type: "SHOP_VIEW", shopId: shop.id } }).catch(() => {});

  const grouped = new Map<string, typeof shop.shopProducts>();
  for (const sp of shop.shopProducts) {
    const cat = sp.product.category?.name ?? "Autres";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(sp);
  }

  const avgRating =
    shop.reviews.length > 0
      ? shop.reviews.reduce((sum, r) => sum + r.rating, 0) / shop.reviews.length
      : null;

  return (
    <div>
      {/* Cover Banner */}
      <Tile label={shop.name} imageUrl={shop.cover} className="h-56 w-full text-4xl sm:h-72" />

      <div className="mx-auto max-w-6xl px-5">
        <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Tile
              label={shop.name}
              imageUrl={shop.logo}
              className="h-28 w-28 shrink-0 rounded-2xl border-4 border-white text-3xl shadow-lg"
            />
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl font-bold text-ink">{shop.name}</h1>
                {shop.status === "VERIFIED" && <BadgeCheck className="h-6 w-6 text-green" aria-label="Vérifié" />}
              </div>
              <p className="flex items-center gap-1.5 text-sm text-ink-soft mt-1">
                <MapPin className="h-4 w-4 text-green" /> {shop.address ?? shop.city?.name}
                {avgRating && ` · ${avgRating.toFixed(1)}★ (${shop.reviews.length} avis)`}
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

        {shop.description && <p className="mt-6 max-w-2xl text-ink-soft leading-relaxed">{shop.description}</p>}

        <div className="mt-6 flex flex-wrap gap-2">
          {splitCsv(shop.paymentMethods).map((m) => (
            <span key={m} className="rounded-full bg-green-light px-3 py-1 text-xs font-semibold text-pine border border-green/20">
              <CreditCard className="inline h-3 w-3 mr-1" />{m}
            </span>
          ))}
          {shop.delivery && (
            <span className="rounded-full bg-green-light px-3 py-1 text-xs font-semibold text-pine border border-green/20">
              <Truck className="inline h-3 w-3 mr-1" />Livraison disponible
            </span>
          )}
          <span className="rounded-full bg-green-light px-3 py-1 text-xs font-semibold text-pine border border-green/20">
            <ShieldCheck className="inline h-3 w-3 mr-1" />100% Halal
          </span>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-[1fr_300px]">
          {/* ---- Products ---- */}
          <section>
            <h2 className="font-display text-2xl font-bold text-pine mb-4">Produits disponibles dans cette boutique</h2>
            {shop.shopProducts.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line p-8 text-center text-ink-soft">
                Cette boutique n&apos;a pas encore ajouté de produits.
              </p>
            ) : (
              <div className="space-y-8">
                {[...grouped.entries()].map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-green mb-3">{category}</h3>
                    <ul className="divide-y divide-line rounded-2xl border border-line bg-paper shadow-sm">
                      {items.map((sp) => (
                        <li key={sp.id} className="flex items-center justify-between gap-4 p-4 hover:bg-green-light/30 transition-colors">
                          <Link href={`/products/${sp.product.slug}`} className="flex items-center gap-3 hover:text-pine">
                            <Tile label={sp.product.name} imageUrl={sp.product.image} className="h-12 w-12 rounded-xl text-sm shrink-0" />
                            <div>
                              <p className="font-semibold text-ink">{sp.product.name}</p>
                              <AvailabilityBadge status={sp.stockStatus} />
                            </div>
                          </Link>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              {sp.promotions[0] ? (
                                <>
                                  <p className="font-bold text-pine">{formatPrice(sp.promotions[0].promoPrice)}</p>
                                  <p className="text-xs text-ink-soft line-through">{formatPrice(sp.promotions[0].originalPrice)}</p>
                                </>
                              ) : (
                                <p className="font-bold text-ink">{formatPrice(sp.price, sp.currency)}</p>
                              )}
                            </div>
                            <Link
                              href={`/checkout?product=${sp.id}`}
                              className="btn-primary text-xs py-1.5 px-3"
                            >
                              Commander
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ---- Opening hours ---- */}
          <aside className="h-fit rounded-2xl border border-line bg-paper p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-pine mb-4">
              <Clock className="h-4 w-4 text-green" /> Horaires d&apos;ouverture
            </h2>
            <ul className="space-y-2 text-sm">
              {shop.openingHours.length === 0 && <li className="text-ink-soft">Non renseignés</li>}
              {shop.openingHours.map((h) => (
                <li key={h.id} className="flex justify-between text-ink-soft font-medium">
                  <span>{DAY_LABELS[h.dayOfWeek]}</span>
                  <span className={h.closed ? "text-hv-red font-semibold" : "text-ink"}>
                    {h.closed ? "Fermé" : `${h.opensAt} – ${h.closesAt}`}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
}
