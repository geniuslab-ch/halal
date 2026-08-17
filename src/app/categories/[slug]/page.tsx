import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";
import { toProductCard } from "@/lib/queries";

// Always render fresh — this route reads live data from the database
// and must never be statically cached or pre-rendered at build time.
export const dynamic = "force-dynamic";


type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.productCategory.findUnique({ where: { slug } });
  if (!category) return {};
  return { title: `${category.name} — Halal products in Vaud` };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await prisma.productCategory.findUnique({
    where: { slug },
    include: {
      products: { include: { shopProducts: { select: { price: true } } } },
      children: true,
    },
  });
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-3xl font-semibold text-ink">{category.name}</h1>

      {category.children.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {category.children.map((c) => (
            <a key={c.slug} href={`/categories/${c.slug}`} className="rounded-full border border-line px-3 py-1.5 text-sm text-ink-soft hover:border-pine hover:text-pine">
              {c.name}
            </a>
          ))}
        </div>
      )}

      {category.products.length === 0 ? (
        <p className="mt-10 text-ink-soft">No products in this category yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {category.products.map((p) => (
            <ProductCard key={p.slug} product={toProductCard(p)} />
          ))}
        </div>
      )}
    </div>
  );
}
