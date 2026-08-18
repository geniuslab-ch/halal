import Link from "next/link";
import Image from "next/image";
import { MapPin, BadgeCheck, Truck, Clock } from "lucide-react";

export type ShopCardData = {
  slug: string;
  name: string;
  cityName?: string | null;
  citySlug?: string | null;
  logo?: string | null;
  cover?: string | null;
  status: string;
  description?: string | null;
  delivery?: boolean;
};

export function ShopCard({ shop }: { shop: ShopCardData }) {
  return (
    <Link
      href={`/shops/${shop.citySlug ?? "vaud"}/${shop.slug}`}
      className="group block overflow-hidden rounded-2xl border border-line bg-paper transition-all hover:shadow-lg hover:border-green hover:-translate-y-1 hv-focus card-shimmer"
    >
      {/* Cover image / gradient banner */}
      <div className="relative h-28 w-full overflow-hidden">
        {shop.cover ? (
          <Image
            src={shop.cover}
            alt={`${shop.name} cover`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full gradient-brand opacity-80" />
        )}
        {/* Logo overlay */}
        <div className="absolute -bottom-5 left-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-xl border-2 border-white bg-paper shadow-md">
            {shop.logo ? (
              <Image src={shop.logo} alt={shop.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center gradient-brand text-white font-bold text-lg">
                {shop.name[0]}
              </div>
            )}
          </div>
        </div>
        {/* Verified badge */}
        {shop.status === "VERIFIED" && (
          <div className="absolute top-2 right-2">
            <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-pine backdrop-blur-sm">
              <BadgeCheck className="h-3 w-3" />
              Vérifié
            </span>
          </div>
        )}
      </div>

      <div className="px-4 pt-7 pb-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-ink group-hover:text-pine transition-colors">{shop.name}</p>
        </div>

        {shop.cityName && (
          <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
            <MapPin className="h-3 w-3" />
            {shop.cityName}
          </p>
        )}

        {shop.description && (
          <p className="mt-2 line-clamp-2 text-xs text-ink-soft leading-relaxed">{shop.description}</p>
        )}

        <div className="mt-3 flex gap-2">
          {shop.delivery && (
            <span className="flex items-center gap-1 rounded-full bg-green-light px-2 py-0.5 text-xs font-medium text-pine">
              <Truck className="h-3 w-3" />
              Livraison
            </span>
          )}
          <span className="flex items-center gap-1 rounded-full bg-green-light px-2 py-0.5 text-xs font-medium text-pine">
            <Clock className="h-3 w-3" />
            Ouvert
          </span>
        </div>
      </div>
    </Link>
  );
}
