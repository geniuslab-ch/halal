import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { formatPrice, formatRelativeDate } from "@/lib/format";

type Props = { searchParams: Promise<{ shop?: string }> };

export default async function DashboardProductsPage({ searchParams }: Props) {
  const { shop: shopSlug } = await searchParams;
  const shop = shopSlug
    ? await prisma.shop.findFirst({ where: { slug: shopSlug } })
    : await prisma.shop.findFirst({ orderBy: { createdAt: "asc" } });

  if (!shop) return <p className="text-ink-soft">No demo shop found.</p>;

  const shopProducts = await prisma.shopProduct.findMany({
    where: { shopId: shop.id },
    include: { product: true, promotions: { where: { status: "ACTIVE" } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Products — {shop.name}</h1>
        <Link
          href={`/dashboard/products/new?shop=${shop.slug}`}
          className="rounded-full bg-pine px-4 py-2 text-sm font-medium text-linen hover:opacity-90"
        >
          Add product
        </Link>
      </div>

      {shopProducts.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line p-8 text-center text-ink-soft">
          No products yet — add one from the global catalogue or create a new one.
        </p>
      ) : (
        <table className="mt-6 w-full overflow-hidden rounded-2xl border border-line bg-paper text-sm">
          <thead className="bg-linen text-left text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Availability</th>
              <th className="px-4 py-3">Last updated</th>
              <th className="px-4 py-3">Promotion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {shopProducts.map((sp) => (
              <tr key={sp.id}>
                <td className="px-4 py-3 font-medium text-ink">
                  <Link href={`/products/${sp.product.slug}`} className="hover:text-pine">{sp.product.name}</Link>
                </td>
                <td className="px-4 py-3">{formatPrice(sp.price, sp.currency)}</td>
                <td className="px-4 py-3"><AvailabilityBadge status={sp.stockStatus} /></td>
                <td className="px-4 py-3 text-ink-soft">{formatRelativeDate(sp.lastAvailabilityUpdate)}</td>
                <td className="px-4 py-3">
                  {sp.promotions[0] ? (
                    <span className="rounded-full bg-saffron-soft px-2 py-1 text-xs font-medium text-[#6b4d0e]">Active</span>
                  ) : (
                    <span className="text-ink-soft">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
