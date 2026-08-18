import { PromotionCard } from "@/components/PromotionCard";
import { getActivePromotions } from "@/lib/queries";
import { Percent } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = { title: "Offres & Promotions | Halal Vaud" };

export default async function OffersPage() {
  const promotions = await getActivePromotions(50);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-brand text-white shadow">
          <Percent className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-pine">Offres du moment</h1>
          <p className="mt-0.5 text-sm text-ink-soft">
            Promotions et réductions actives dans les boutiques halal du Canton de Vaud.
          </p>
        </div>
      </div>

      {promotions.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line p-12 text-center text-ink-soft">
          Aucune offre promotionnelle pour le moment — repassez bientôt !
        </div>
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
