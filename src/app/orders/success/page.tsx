import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Suspense } from "react";

async function SuccessContent({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-brand shadow-lg animate-pulse-green">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
        </div>

        <h1 className="font-display text-3xl font-bold text-pine mb-3">
          Commande confirmée !
        </h1>
        <p className="text-ink-soft mb-6">
          Votre paiement a été accepté. La boutique prépare votre commande.
        </p>

        {ref && (
          <div className="rounded-2xl bg-green-light border border-green/20 p-6 mb-8">
            <p className="text-xs text-ink-soft mb-1">Référence de commande</p>
            <p className="font-mono text-2xl font-bold text-pine">{ref}</p>
            <p className="text-xs text-ink-soft mt-2">
              Conservez cette référence pour suivre votre commande.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link href="/orders" className="btn-primary justify-center">
            <Package className="h-4 w-4" />
            Suivre ma commande
          </Link>
          <Link href="/search" className="btn-outline justify-center">
            Continuer mes achats
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center" />}>
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  );
}
