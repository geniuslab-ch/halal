import Link from "next/link";
import { Tile } from "./Tile";
import { formatPrice } from "@/lib/format";

export type ProductCardData = {
  slug: string;
  name: string;
  brand?: string | null;
  image?: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  shopCount: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-paper transition-shadow hover:shadow-md hv-focus"
    >
      <Tile
        label={product.name}
        imageUrl={product.image}
        className="h-36 w-full rounded-none text-2xl"
      />
      <div className="p-4">
        {product.brand && (
          <p className="text-xs uppercase tracking-wide text-ink-soft">{product.brand}</p>
        )}
        <p className="mt-0.5 font-medium leading-snug text-ink line-clamp-2">
          {product.name}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-pine">
            {product.minPrice != null
              ? product.minPrice === product.maxPrice
                ? formatPrice(product.minPrice)
                : `${formatPrice(product.minPrice)}–${formatPrice(product.maxPrice ?? product.minPrice)}`
              : "Price varies"}
          </p>
          <p className="text-xs text-ink-soft">
            {product.shopCount} {product.shopCount === 1 ? "shop" : "shops"}
          </p>
        </div>
      </div>
    </Link>
  );
}
