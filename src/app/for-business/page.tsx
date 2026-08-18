"use client";
import { useState } from "react";
import Link from "next/link";
import { registerShop } from "@/app/actions/shop";
import { CheckCircle, Store, TrendingUp, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

export default function ForBusinessPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await registerShop(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero section */}
      <section className="hero-mesh hv-texture-dark py-20 px-5 text-center text-white relative overflow-hidden">
        <div className="mx-auto max-w-4xl relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green/30 bg-green/10 px-4 py-1.5 text-sm font-semibold text-green-soft">
            <Store className="h-4 w-4" />
            Pour les commerçants du Canton de Vaud 🇨🇭
          </div>
          <h1 className="font-display text-4xl font-bold md:text-6xl leading-tight">
            Développez votre boutique <span style={{ color: "#81C784" }}>halal en ligne</span>
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            Rejoignez Halal Vaud pour présenter vos produits, proposer la livraison et toucher des milliers de clients locaux.
          </p>
          <div className="mt-8">
            <a href="#register-form" className="btn-primary py-3.5 px-8 text-base">
              Ajouter ma boutique gratuitement
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: <TrendingUp className="h-8 w-8 text-green" />,
              title: "Plus de visibilité",
              desc: "Soyez référencé auprès de milliers de clients cherchant des produits halal dans votre ville.",
            },
            {
              icon: <Store className="h-8 w-8 text-green" />,
              title: "Commandes en livraison",
              desc: "Proposez la commande en ligne avec paiement direct sur votre compte bancaire via Stripe.",
            },
            {
              icon: <ShieldCheck className="h-8 w-8 text-green" />,
              title: "Badge Boutique Vérifiée",
              desc: "Gagnez la confiance des consommateurs grâce au label Halal Vaud certifié.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-line bg-paper p-8 shadow-sm">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-light">
                {item.icon}
              </div>
              <h3 className="font-display text-xl font-bold text-pine mb-2">{item.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Registration Form */}
      <section id="register-form" className="bg-green-light py-16 px-5">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-line bg-paper p-8 md:p-12 shadow-lg">
            <h2 className="font-display text-3xl font-bold text-pine text-center mb-2">
              Inscrivez votre boutique
            </h2>
            <p className="text-sm text-ink-soft text-center mb-8">
              Remplissez le formulaire ci-dessous. Notre équipe examinera votre demande sous 24h.
            </p>

            {success ? (
              <div className="rounded-2xl bg-green-light border border-green/30 p-8 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green mb-3" />
                <h3 className="font-display text-xl font-bold text-pine mb-1">Demande envoyée avec succès !</h3>
                <p className="text-sm text-ink-soft mb-6">
                  Nous avons bien reçu votre inscription. Notre équipe validera votre profil dans les plus brefs délais.
                </p>
                <Link href="/" className="btn-primary">Retour à l&apos;accueil</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-xl bg-red-soft border border-red-200 p-4 text-sm font-medium text-hv-red">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Nom de la boutique *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Boucherie Al-Madina"
                    required
                    className="w-full rounded-xl border border-line bg-bg py-3 px-4 text-sm focus:border-green focus:ring-2 focus:ring-green/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Ville *</label>
                    <input
                      type="text"
                      name="cityName"
                      placeholder="Lausanne"
                      required
                      className="w-full rounded-xl border border-line bg-bg py-3 px-4 text-sm focus:border-green focus:ring-2 focus:ring-green/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">Téléphone *</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+41 21 000 00 00"
                      required
                      className="w-full rounded-xl border border-line bg-bg py-3 px-4 text-sm focus:border-green focus:ring-2 focus:ring-green/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Adresse postale</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Rue de la Gare 5"
                    className="w-full rounded-xl border border-line bg-bg py-3 px-4 text-sm focus:border-green focus:ring-2 focus:ring-green/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">Description de la boutique</label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Boucherie et épicerie spécialisée dans les viandes fraîches certifiées halal..."
                    className="w-full rounded-xl border border-line bg-bg py-3 px-4 text-sm focus:border-green focus:ring-2 focus:ring-green/20 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-4 text-base rounded-xl mt-4"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Soumettre ma boutique"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
