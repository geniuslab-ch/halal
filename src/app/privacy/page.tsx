import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export const metadata = { title: "Politique de confidentialité | Halal Vaud" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <div className="mb-10 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full gradient-brand text-white mb-4 shadow">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl font-bold text-pine">Politique de confidentialité</h1>
        <p className="mt-2 text-ink-soft">Dernière mise à jour : 18 août 2026 • Canton de Vaud, Suisse</p>
      </div>

      <div className="space-y-8 rounded-3xl border border-line bg-paper p-8 md:p-12 shadow-sm text-ink-soft leading-relaxed text-sm">
        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-3 flex items-center gap-2">
            <Lock className="h-5 w-5 text-green" /> 1. Protection de vos données
          </h2>
          <p>
            Halal Vaud attache une importance capitale à la protection de la vie privée de ses utilisateurs conformément à la Loi fédérale suisse sur la protection des données (LPD). Nous ne collectons que les informations strictement nécessaires au bon fonctionnement de la plateforme.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-3 flex items-center gap-2">
            <Eye className="h-5 w-5 text-green" /> 2. Informations collectées
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Compte utilisateur :</strong> Nom, adresse email et mot de passe chiffré lors de l&apos;inscription.</li>
            <li><strong>Commandes en livraison :</strong> Adresse de livraison, numéro de téléphone et détails de la commande transmis à la boutique partenaire.</li>
            <li><strong>Données de paiement :</strong> Les transactions sont traitées de manière chiffrée via Stripe. Halal Vaud ne stocke aucune donnée bancaire sur ses serveurs.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-green" /> 3. Utilisation des données
          </h2>
          <p>
            Vos informations sont utilisées exclusivement pour vous fournir les services demandés (traitement des commandes, suivi de livraison, gestion de profil). Aucune donnée personnelle n&apos;est vendue ou cédée à des tiers à des fins publicitaires.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-ink mb-3">4. Vos droits</h2>
          <p>
            Vous disposez à tout moment d&apos;un droit d&apos;accès, de rectification et de suppression de vos données personnelles. Pour toute demande, contactez notre équipe à <span className="text-pine font-semibold">privacy@halalvaud.ch</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
