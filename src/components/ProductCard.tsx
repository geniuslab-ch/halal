import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Store } from "lucide-react";
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
      className="group block overflow-hidden rounded-2xl border border-line bg-paper transition-all hover:shadow-lg hover:border-green hover:-translate-y-1 hv-focus card-shimmer"
    >
      {/* Image area */}
      <div className="relative h-44 w-full overflow-hidden bg-green-light">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center gradient-brand">
            <span className="text-5xl font-bold text-white/80">
              {product.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {/* Shop count badge */}
        <div className="absolute bottom-2 right-2">
          <span className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
            <Store className="h-3 w-3" />
            {product.shopCount}
          </span>
        </div>
      </div>

      <div className="p-4">
        {product.brand && (
          <p className="text-xs uppercase tracking-wide text-ink-soft font-medium">{product.brand}</p>
        )}
        <p className="mt-0.5 font-semibold leading-snug text-ink line-clamp-2 group-hover:text-pine transition-colors">
          {product.name}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <p className="font-display text-lg font-bold text-pine">
            {product.minPrice != null
              ? product.minPrice === product.maxPrice
                ? formatPrice(product.minPrice)
                : `${formatPrice(product.minPrice)}–${formatPrice(product.maxPrice ?? product.minPrice)}`
              : "Prix variables"}
          </p>
          <button className="flex h-8 w-8 items-center justify-center rounded-full gradient-brand text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-sm">
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
