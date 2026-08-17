import Link from "next/link";

export function CategoryCard({ name, slug }: { name: string; slug: string }) {
  return (
    <Link
      href={`/categories/${slug}`}
      className="flex items-center justify-center rounded-xl border border-line bg-paper px-4 py-6 text-center text-sm font-medium text-ink transition-colors hover:border-pine hover:text-pine hv-focus"
    >
      {name}
    </Link>
  );
}
