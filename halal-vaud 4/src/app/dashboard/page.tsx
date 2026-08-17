import { prisma } from "@/lib/prisma";
import { getShopAnalyticsSummary } from "@/lib/queries";

// Always render fresh — this route reads live data from the database
// and must never be statically cached or pre-rendered at build time.
export const dynamic = "force-dynamic";


type Props = { searchParams: Promise<{ shop?: string }> };

const METRIC_LABELS: Record<string, string> = {
  SHOP_VIEW: "Profile views",
  PRODUCT_VIEW: "Product views",
  PROMOTION_VIEW: "Offer views",
  SEARCH: "Search appearances",
  WHATSAPP_CLICK: "WhatsApp clicks",
  PHONE_CLICK: "Phone clicks",
  DIRECTIONS_CLICK: "Directions clicks",
  WEBSITE_CLICK: "Website clicks",
  CUSTOMER_REQUEST: "Customer requests",
};

export default async function DashboardOverview({ searchParams }: Props) {
  const { shop: shopSlug } = await searchParams;

  const shop = shopSlug
    ? await prisma.shop.findFirst({ where: { slug: shopSlug } })
    : await prisma.shop.findFirst({ orderBy: { createdAt: "asc" } });

  if (!shop) {
    return <p className="text-ink-soft">No demo shop found — run the seed script first.</p>;
  }

  const [summary, productCount, promoCount] = await Promise.all([
    getShopAnalyticsSummary(shop.id),
    prisma.shopProduct.count({ where: { shopId: shop.id } }),
    prisma.promotion.count({ where: { shopId: shop.id, status: "ACTIVE" } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">{shop.name}</h1>
      <p className="text-sm text-ink-soft">
        {shop.status} · {productCount} products listed · {promoCount} active promotions
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {Object.entries(METRIC_LABELS).map(([key, label]) => (
          <div key={key} className="rounded-2xl border border-line bg-paper p-5">
            <p className="text-xs uppercase tracking-wide text-ink-soft">{label}</p>
            <p className="mt-1 font-display text-3xl font-semibold text-pine">{summary[key] ?? 0}</p>
            <p className="text-xs text-ink-soft">last 30 days</p>
          </div>
        ))}
      </div>

      {Object.keys(summary).length === 0 && (
        <p className="mt-6 text-sm text-ink-soft">
          No activity yet — views and clicks will appear here once customers start visiting
          this shop&apos;s public page.
        </p>
      )}
    </div>
  );
}
