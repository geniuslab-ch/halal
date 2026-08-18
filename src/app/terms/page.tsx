import Link from "next/link";
import { Scale, CheckCircle } from "lucide-react";

export const metadata = { title: "Conditions d'utilisation | Halal Vaud" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <div className="mb-10 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full gradient-brand text-white mb-4 shadow">
          <Scale className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl font-bold text-pine">Conditions d&apos;utilisation</h1>
        <p className="mt-2 text-ink-soft">Dernière mise à jour : 18 août 2026 • Canton de Vaud, Suisse</p>
      </div>

      <div className="space-y-8 rounded-3xl border border-line bg-paper p-8 md:p-12 shadow-sm text-ink-soft leading-relaxed text-sm">
        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-3">1. Présentation du service</h2>
          <p>
            Halal Vaud est une plateforme de mise en relation et de découverte de produits halal reliant les consommateurs aux boutiques et épiceries partenaires situées dans le Canton de Vaud (Suisse).
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-3">2. Engagement d&apos;authenticité Halal</h2>
          <p>
            Toutes les boutiques partenaires référencées sur la plateforme certifient proposer des produits 100% halal. Chaque commerçant est responsable de la conformité des articles vendus au sein de son établissement.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-3">3. Commandes et livraison</h2>
          <p>
            Les commandes effectuées en livraison via la plateforme sont préparées et expédiées directement par les boutiques partenaires. Les tarifs de livraison et les délais sont fixés par chaque établissement.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-3">4. Paiements</h2>
          <p>
            Les paiements en ligne sont sécurisés et traités par notre partenaire Stripe. Les fonds sont reversés directement aux commerçants partenaires.
          </p>
        </section>
      </div>
    </div>
  );
}
