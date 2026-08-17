import { prisma } from "@/lib/prisma";
import { createPromotion } from "@/app/actions/product";
import { formatPrice } from "@/lib/format";

// Always render fresh — this route reads live data from the database
// and must never be statically cached or pre-rendered at build time.
export const dynamic = "force-dynamic";


type Props = { searchParams: Promise<{ shop?: string }> };

export default async function DashboardPromotionsPage({ searchParams }: Props) {
  const { shop: shopSlug } = await searchParams;
  const shop = shopSlug
    ? await prisma.shop.findFirst({ where: { slug: shopSlug } })
    : await prisma.shop.findFirst({ orderBy: { createdAt: "asc" } });
  if (!shop) return <p className="text-ink-soft">No demo shop found.</p>;

  const [promotions, shopProducts] = await Promise.all([
    prisma.promotion.findMany({
      where: { shopId: shop.id },
      include: { shopProduct: { include: { product: true } } },
      orderBy: { startDate: "desc" },
    }),
    prisma.shopProduct.findMany({ where: { shopId: shop.id }, include: { product: true } }),
  ]);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Promotions — {shop.name}</h1>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Create promotion</h2>
        <form action={createPromotion} className="mt-4 space-y-4 rounded-2xl border border-line bg-paper p-5">
          <input type="hidden" name="shopId" value={shop.id} />
          <div>
            <label className="text-sm font-medium text-ink">Product</label>
            <select name="shopProductId" required className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm">
              {shopProducts.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.product.name} — current price {formatPrice(sp.price, sp.currency)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Promotional price (CHF)</label>
            <input name="promoPrice" type="number" step="0.05" min="0" required className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink">Start date</label>
              <input name="startDate" type="date" defaultValue={todayStr} required className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">End date</label>
              <input name="endDate" type="date" required className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Description</label>
            <input name="description" className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded-full bg-pine px-5 py-2.5 text-sm font-medium text-linen hover:opacity-90">
            Create promotion
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">All promotions</h2>
        {promotions.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">No promotions yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-paper">
            {promotions.map((p) => (
              <li key={p.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <p className="font-medium text-ink">{p.shopProduct.product.name}</p>
                  <p className="text-ink-soft">
                    {formatPrice(p.originalPrice)} → {formatPrice(p.promoPrice)} ·{" "}
                    {new Date(p.startDate).toLocaleDateString("fr-CH")} – {new Date(p.endDate).toLocaleDateString("fr-CH")}
                  </p>
                </div>
                <span className="rounded-full border border-line px-2.5 py-1 text-xs text-ink-soft">{p.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
