import { PromotionCard } from "@/components/PromotionCard";
import { getActivePromotions } from "@/lib/queries";

// Always render fresh — this route reads live data from the database
// and must never be statically cached or pre-rendered at build time.
export const dynamic = "force-dynamic";


export const metadata = { title: "Offers" };

export default async function OffersPage() {
  const promotions = await getActivePromotions(50);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">Today&apos;s offers</h1>
      <p className="mt-2 text-ink-soft">
        Active promotions from halal shops across the Canton of Vaud.
      </p>

      {promotions.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-line p-8 text-center text-ink-soft">
          No active offers right now — check back soon.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {promotions.map((p) => (
            <PromotionCard key={p.id} promo={p} />
          ))}
        </div>
      )}
    </div>
  );
}
