import Link from "next/link";
import { Tile } from "./Tile";
import { MapPin, BadgeCheck } from "lucide-react";

export type ShopCardData = {
  slug: string;
  name: string;
  cityName?: string | null;
  citySlug?: string | null;
  logo?: string | null;
  status: string;
  description?: string | null;
};

export function ShopCard({ shop }: { shop: ShopCardData }) {
  return (
    <Link
      href={`/shops/${shop.citySlug ?? "vaud"}/${shop.slug}`}
      className="group flex gap-4 rounded-2xl border border-line bg-paper p-4 transition-shadow hover:shadow-md hv-focus"
    >
      <Tile label={shop.name} imageUrl={shop.logo} className="h-16 w-16 shrink-0 rounded-xl text-lg" />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="truncate font-medium text-ink">{shop.name}</p>
          {shop.status === "VERIFIED" && (
            <BadgeCheck className="h-4 w-4 shrink-0 text-pine" aria-label="Verified shop" />
          )}
        </div>
        {shop.cityName && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
            <MapPin className="h-3 w-3" /> {shop.cityName}
          </p>
        )}
        {shop.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{shop.description}</p>
        )}
      </div>
    </Link>
  );
}
