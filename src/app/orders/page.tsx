"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Clock, CheckCircle, XCircle, Truck, ChefHat, Loader2 } from "lucide-react";

type Order = {
  id: string;
  paymentRef: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  customerName: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryZip: string;
  shop: { name: string; slug: string; city?: { slug: string } | null };
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  PENDING_PAYMENT: { label: "En attente de paiement", icon: Clock, color: "text-gold" },
  PAID: { label: "Payé", icon: CheckCircle, color: "text-green" },
  PREPARING: { label: "En préparation", icon: ChefHat, color: "text-pine" },
  READY: { label: "Prêt pour la livraison", icon: Package, color: "text-pine" },
  DELIVERED: { label: "Livré", icon: Truck, color: "text-pine" },
  CANCELLED: { label: "Annulé", icon: XCircle, color: "text-hv-red" },
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?next=/orders");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => { setOrders(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  if (loading || status === "loading") {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-pine">Mes commandes</h1>
        <p className="mt-1 text-ink-soft">Suivi de toutes vos commandes en livraison.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-16 text-center">
          <Package className="mx-auto h-12 w-12 text-ink-soft mb-4" />
          <p className="font-semibold text-ink">Aucune commande</p>
          <p className="text-sm text-ink-soft mt-1">Vos commandes apparaîtront ici une fois passées.</p>
          <Link href="/search" className="btn-primary mt-6 inline-flex">
            Explorer les produits
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING_PAYMENT;
            const Icon = statusCfg.icon;
            return (
              <div key={order.id} className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs text-ink-soft">Référence commande</p>
                    <p className="font-mono font-bold text-pine text-sm">{order.paymentRef}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusCfg.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {statusCfg.label}
                  </div>
                </div>

                <div className="mt-4 border-t border-line pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink">{order.shop.name}</p>
                      <p className="text-xs text-ink-soft mt-0.5">
                        {order.deliveryAddress}, {order.deliveryZip} {order.deliveryCity}
                      </p>
                    </div>
                    <p className="font-display text-xl font-bold text-pine">
                      CHF {order.totalAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-3 space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-ink-soft">{item.productName} × {item.quantity}</span>
                        <span className="font-medium text-ink">CHF {(item.unitPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-ink-soft">
                    Passé le {new Date(order.createdAt).toLocaleDateString("fr-CH", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <Link
                    href={`/shops/${order.shop.city?.slug ?? "vaud"}/${order.shop.slug}`}
                    className="text-xs font-semibold text-green hover:text-pine transition-colors"
                  >
                    Voir la boutique
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
