import { prisma } from "@/lib/prisma";
import { setShopStatus, mergeProducts } from "@/app/actions/admin";

// Always render fresh — this route reads live data from the database
// and must never be statically cached or pre-rendered at build time.
export const dynamic = "force-dynamic";


export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const [shops, products] = await Promise.all([
    prisma.shop.findMany({ include: { city: true }, orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ where: { mergedIntoId: null }, orderBy: { name: "asc" }, take: 300 }),
  ]);

  const pending = shops.filter((s) => s.status === "PENDING");
  const rest = shops.filter((s) => s.status !== "PENDING");

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 space-y-14">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Admin</h1>
        <p className="text-sm text-ink-soft">Verify shops, manage the product catalogue.</p>
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold text-ink">Pending verification ({pending.length})</h2>
        <ShopTable shops={pending} />
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-ink">All shops</h2>
        <ShopTable shops={rest} />
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-ink">Merge duplicate products</h2>
        <p className="text-sm text-ink-soft">
          Shop listings move to the canonical product; nothing is deleted.
        </p>
        <form action={mergeProducts} className="mt-4 flex flex-wrap items-end gap-4 rounded-2xl border border-line bg-paper p-5">
          <div>
            <label className="text-sm font-medium text-ink">Duplicate product</label>
            <select name="mergeId" required className="mt-1 rounded-xl border border-line bg-paper px-3 py-2 text-sm">
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Merge into (canonical)</label>
            <select name="keepId" required className="mt-1 rounded-xl border border-line bg-paper px-3 py-2 text-sm">
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="rounded-full bg-pine px-5 py-2.5 text-sm font-medium text-linen hover:opacity-90">
            Merge
          </button>
        </form>
      </section>
    </div>
  );
}

type ShopRow = {
  id: string;
  name: string;
  status: string;
  city: { name: string } | null;
};

function ShopTable({ shops }: { shops: ShopRow[] }) {
  if (shops.length === 0) return <p className="mt-3 text-sm text-ink-soft">Nothing here.</p>;
  return (
    <table className="mt-4 w-full overflow-hidden rounded-2xl border border-line bg-paper text-sm">
      <thead className="bg-linen text-left text-xs uppercase tracking-wide text-ink-soft">
        <tr>
          <th className="px-4 py-3">Shop</th>
          <th className="px-4 py-3">City</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {shops.map((s) => (
          <tr key={s.id}>
            <td className="px-4 py-3 font-medium text-ink">{s.name}</td>
            <td className="px-4 py-3 text-ink-soft">{s.city?.name ?? "—"}</td>
            <td className="px-4 py-3 text-ink-soft">{s.status}</td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                {s.status !== "VERIFIED" && (
                  <form action={setShopStatus}>
                    <input type="hidden" name="shopId" value={s.id} />
                    <input type="hidden" name="status" value="VERIFIED" />
                    <button className="rounded-full border border-pine px-3 py-1 text-xs font-medium text-pine hover:bg-pine hover:text-linen">
                      Verify
                    </button>
                  </form>
                )}
                {s.status !== "REJECTED" && (
                  <form action={setShopStatus}>
                    <input type="hidden" name="shopId" value={s.id} />
                    <input type="hidden" name="status" value="REJECTED" />
                    <button className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-soft hover:border-clay hover:text-clay">
                      Reject
                    </button>
                  </form>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
