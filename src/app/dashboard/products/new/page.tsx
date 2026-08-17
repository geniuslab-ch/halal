import { prisma } from "@/lib/prisma";
import { addExistingProductToShop, createProductAndAddToShop } from "@/app/actions/product";

// Always render fresh — this route reads live data from the database
// and must never be statically cached or pre-rendered at build time.
export const dynamic = "force-dynamic";


type Props = { searchParams: Promise<{ shop?: string }> };

export default async function NewProductPage({ searchParams }: Props) {
  const { shop: shopSlug } = await searchParams;
  const shop = shopSlug
    ? await prisma.shop.findFirst({ where: { slug: shopSlug } })
    : await prisma.shop.findFirst({ orderBy: { createdAt: "asc" } });
  if (!shop) return <p className="text-ink-soft">No demo shop found.</p>;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" }, take: 200 }),
    prisma.productCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-xl space-y-12">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Add a product — {shop.name}</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Search the global catalogue first — most products already exist.
        </p>
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Add existing product</h2>
        <form action={addExistingProductToShop} className="mt-4 space-y-4 rounded-2xl border border-line bg-paper p-5">
          <input type="hidden" name="shopId" value={shop.id} />
          <div>
            <label className="text-sm font-medium text-ink">Product</label>
            <select name="productId" required className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm">
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}{p.brand ? ` — ${p.brand}` : ""}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink">Your price (CHF)</label>
              <input name="price" type="number" step="0.05" min="0" required className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Availability</label>
              <select name="stockStatus" className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm">
                <option value="IN_STOCK">In stock</option>
                <option value="LIMITED">Limited</option>
                <option value="UNKNOWN">Unknown</option>
                <option value="OUT_OF_STOCK">Out of stock</option>
              </select>
            </div>
          </div>
          <button type="submit" className="rounded-full bg-pine px-5 py-2.5 text-sm font-medium text-linen hover:opacity-90">
            Add to my shop
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-ink">Create new product</h2>
        <p className="mt-1 text-xs text-ink-soft">
          Only if it truly doesn&apos;t exist yet — an admin may later merge duplicates.
        </p>
        <form action={createProductAndAddToShop} className="mt-4 space-y-4 rounded-2xl border border-line bg-paper p-5">
          <input type="hidden" name="shopId" value={shop.id} />
          <div>
            <label className="text-sm font-medium text-ink">Product name</label>
            <input name="name" required className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink">Brand</label>
              <input name="brand" className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Size / weight</label>
              <input name="size" placeholder="5kg" className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-ink">Category</label>
              <select name="category" className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm">
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Your price (CHF)</label>
              <input name="price" type="number" step="0.05" min="0" required className="mt-1 w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm" />
            </div>
          </div>
          <button type="submit" className="rounded-full border border-pine px-5 py-2.5 text-sm font-medium text-pine hover:bg-pine hover:text-linen">
            Create &amp; add to my shop
          </button>
        </form>
      </section>
    </div>
  );
}
