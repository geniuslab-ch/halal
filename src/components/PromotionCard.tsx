import Link from "next/link";
import { Tile } from "./Tile";
import { formatPrice } from "@/lib/format";

export type PromotionCardData = {
  id: string;
  productName: string;
  productSlug: string;
  productImage?: string | null;
  shopName: string;
  cityName?: string | null;
  originalPrice: number;
  promoPrice: number;
  endDate: Date | string;
};

export function PromotionCard({ promo }: { promo: PromotionCardData }) {
  const discount = Math.round((1 - promo.promoPrice / promo.originalPrice) * 100);
  const endDate = new Date(promo.endDate);
  return (
    <Link
      href={`/products/${promo.productSlug}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-paper transition-shadow hover:shadow-md hv-focus"
    >
      <div className="relative">
        <Tile label={promo.productName} imageUrl={promo.productImage} className="h-36 w-full rounded-none text-2xl" />
        <span className="absolute left-3 top-3 rounded-full bg-saffron px-2.5 py-1 text-xs font-semibold text-ink">
          -{discount}%
        </span>
      </div>
      <div className="p-4">
        <p className="font-medium leading-snug text-ink line-clamp-2">{promo.productName}</p>
        <p className="mt-0.5 text-xs text-ink-soft">{promo.shopName}{promo.cityName ? ` · ${promo.cityName}` : ""}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-sm font-semibold text-pine">{formatPrice(promo.promoPrice)}</p>
          <p className="text-xs text-ink-soft line-through">{formatPrice(promo.originalPrice)}</p>
        </div>
        <p className="mt-1 text-xs text-ink-soft">
          Until {endDate.toLocaleDateString("fr-CH", { day: "numeric", month: "short" })}
        </p>
      </div>
    </Link>
  );
}
