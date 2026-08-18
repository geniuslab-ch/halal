import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = { title: "Toutes les catégories | Halal Vaud" };

const CATEGORY_ICONS: Record<string, string> = {
  viandes: "🥩",
  volailles: "🍗",
  cereales: "🌾",
  prepares: "🧆",
  laitiers: "🥛",
  conserves: "🫙",
  confiserie: "🍬",
  bio: "🌿",
  epices: "🧂",
  boissons: "🧃",
  surgeles: "🧊",
  boulangerie: "🥖",
};

export default async function CategoriesPage() {
  const categories = await prisma.productCategory.findMany({
    where: { parentId: null },
    include: {
      children: true,
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold text-pine">Toutes les catégories</h1>
        <p className="mt-2 text-ink-soft max-w-xl mx-auto">
          Explorez l&apos;ensemble de notre catalogue de produits halal disponible chez les commerçants du Canton de Vaud.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const icon = CATEGORY_ICONS[cat.slug] ?? "🛍️";
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group block rounded-3xl border border-line bg-paper p-6 shadow-sm hover:shadow-md hover:border-green hover:-translate-y-1 transition-all card-shimmer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-light text-3xl group-hover:scale-110 transition-transform">
                    {icon}
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-bold text-ink group-hover:text-pine transition-colors">
                      {cat.name}
                    </h2>
                    <p className="text-xs font-semibold text-green mt-0.5">
                      {cat._count.products} produit{cat._count.products > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-ink-soft group-hover:text-green group-hover:translate-x-1 transition-all" />
              </div>

              {cat.children.length > 0 && (
                <div className="mt-4 border-t border-line pt-3 flex flex-wrap gap-1.5">
                  {cat.children.map((sub) => (
                    <span
                      key={sub.id}
                      className="rounded-full bg-bg px-2.5 py-1 text-xs font-medium text-ink-soft"
                    >
                      {sub.name}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
