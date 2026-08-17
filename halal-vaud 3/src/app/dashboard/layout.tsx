import Link from "next/link";
import { prisma } from "@/lib/prisma";

// NOTE: this MVP dashboard is not behind auth yet — it demos against a
// selectable demo shop via ?shop=<slug>. Wiring real merchant auth
// (Supabase Auth / NextAuth) is the next step before this goes to real
// shop owners; the data layer (queries.ts) is already shop-scoped so that
// swap doesn't touch the schema.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const shops = await prisma.shop.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } });

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-5 py-10">
      <aside className="w-56 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Merchant</p>
        <nav className="mt-3 space-y-1 text-sm">
          <Link href="/dashboard" className="block rounded-lg px-3 py-2 font-medium text-ink hover:bg-paper">Overview</Link>
          <Link href="/dashboard/products" className="block rounded-lg px-3 py-2 font-medium text-ink hover:bg-paper">Products</Link>
          <Link href="/dashboard/promotions" className="block rounded-lg px-3 py-2 font-medium text-ink hover:bg-paper">Promotions</Link>
        </nav>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-soft">Demo shop</p>
        <ul className="mt-2 space-y-1 text-sm">
          {shops.slice(0, 8).map((s) => (
            <li key={s.slug}>
              <Link href={`/dashboard?shop=${s.slug}`} className="block truncate rounded-lg px-3 py-1.5 text-ink-soft hover:bg-paper hover:text-ink">
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
