"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Truck, CreditCard, User, Phone, MapPin, Loader2, ShieldCheck } from "lucide-react";

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shopProductId = searchParams.get("product") ?? "";
  const quantity = parseInt(searchParams.get("qty") ?? "1");

  const [step] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryZip: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopProductId,
          quantity,
          ...form,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        setLoading(false);
        return;
      }

      if (data.stripeUrl) {
        window.location.href = data.stripeUrl;
      } else {
        router.push(`/orders/success?ref=${data.paymentRef}`);
      }
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-pine">Commander en livraison</h1>
        <p className="mt-1 text-ink-soft">Remplissez vos informations de livraison pour finaliser votre commande.</p>
      </div>

      <div className="mb-8 flex items-center gap-3">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                step >= s ? "gradient-brand text-white" : "border-2 border-line text-ink-soft"
              }`}
            >
              {s}
            </div>
            <span className={`text-sm font-medium ${step >= s ? "text-pine" : "text-ink-soft"}`}>
              {s === 1 ? "Livraison" : "Paiement"}
            </span>
            {s < 2 && <div className="h-0.5 w-8 bg-line" />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        {error && (
          <div className="mb-6 rounded-xl bg-red-soft border border-red-200 px-4 py-3 text-sm font-medium text-hv-red">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              <User className="inline h-3.5 w-3.5 mr-1" />Nom complet *
            </label>
            <input
              type="text"
              placeholder="Jean Dupont"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              required
              className="w-full rounded-xl border border-line bg-bg py-3 px-4 text-sm focus:border-green focus:ring-2 focus:ring-green/20 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              <Phone className="inline h-3.5 w-3.5 mr-1" />Téléphone
            </label>
            <input
              type="tel"
              placeholder="+41 79 000 00 00"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              className="w-full rounded-xl border border-line bg-bg py-3 px-4 text-sm focus:border-green focus:ring-2 focus:ring-green/20 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              <MapPin className="inline h-3.5 w-3.5 mr-1" />Adresse de livraison *
            </label>
            <input
              type="text"
              placeholder="Rue de l'Avenir 12"
              value={form.deliveryAddress}
              onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
              required
              className="w-full rounded-xl border border-line bg-bg py-3 px-4 text-sm focus:border-green focus:ring-2 focus:ring-green/20 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Code postal *</label>
              <input
                type="text"
                placeholder="1000"
                value={form.deliveryZip}
                onChange={(e) => setForm({ ...form, deliveryZip: e.target.value })}
                required
                className="w-full rounded-xl border border-line bg-bg py-3 px-4 text-sm focus:border-green focus:ring-2 focus:ring-green/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Ville *</label>
              <input
                type="text"
                placeholder="Lausanne"
                value={form.deliveryCity}
                onChange={(e) => setForm({ ...form, deliveryCity: e.target.value })}
                required
                className="w-full rounded-xl border border-line bg-bg py-3 px-4 text-sm focus:border-green focus:ring-2 focus:ring-green/20 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">Notes (optionnel)</label>
            <textarea
              placeholder="Instructions pour la livraison, allergies, etc."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-line bg-bg py-3 px-4 text-sm focus:border-green focus:ring-2 focus:ring-green/20 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-green-light px-4 py-3">
            <ShieldCheck className="h-4 w-4 text-pine shrink-0" />
            <p className="text-xs text-pine font-medium">
              Paiement sécurisé par Stripe. Vos données sont chiffrées et protégées.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-4 text-base rounded-xl"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Payer avec Stripe
              </>
            )}
          </button>

          <p className="text-center text-xs text-ink-soft">
            <Truck className="inline h-3 w-3 mr-1" />
            La livraison est organisée directement par la boutique.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-green" /></div>}>
      <CheckoutForm />
    </Suspense>
  );
}
