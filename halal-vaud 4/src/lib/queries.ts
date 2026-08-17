import { prisma } from "@/lib/prisma";
import type { ProductCardData } from "@/components/ProductCard";
import type { ShopCardData } from "@/components/ShopCard";
import type { PromotionCardData } from "@/components/PromotionCard";

function priceRange(shopProducts: { price: number }[]) {
  if (shopProducts.length === 0) return { minPrice: null, maxPrice: null };
  const prices = shopProducts.map((sp) => sp.price);
  return { minPrice: Math.min(...prices), maxPrice: Math.max(...prices) };
}

export function toProductCard(product: {
  slug: string;
  name: string;
  brand: string | null;
  image: string | null;
  shopProducts: { price: number }[];
}): ProductCardData {
  const { minPrice, maxPrice } = priceRange(product.shopProducts);
  return {
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    image: product.image,
    minPrice,
    maxPrice,
    shopCount: product.shopProducts.length,
  };
}

export function toShopCard(shop: {
  slug: string;
  name: string;
  logo: string | null;
  status: string;
  description: string | null;
  city: { name: string; slug: string } | null;
}): ShopCardData {
  return {
    slug: shop.slug,
    name: shop.name,
    logo: shop.logo,
    status: shop.status,
    description: shop.description,
    cityName: shop.city?.name ?? null,
    citySlug: shop.city?.slug ?? null,
  };
}

export async function getFeaturedShops(limit = 4) {
  const shops = await prisma.shop.findMany({
    where: { status: "VERIFIED" },
    include: { city: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return shops.map(toShopCard);
}

export async function getPopularProducts(limit = 8): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    include: { shopProducts: { select: { price: true } } },
    take: limit,
    orderBy: { createdAt: "asc" },
  });
  return products
    .filter((p) => p.shopProducts.length > 0)
    .map(toProductCard);
}

export async function getActivePromotions(limit = 8): Promise<PromotionCardData[]> {
  const now = new Date();
  const promos = await prisma.promotion.findMany({
    where: { startDate: { lte: now }, endDate: { gte: now } },
    include: {
      shopProduct: { include: { product: true } },
      shop: { include: { city: true } },
    },
    orderBy: { endDate: "asc" },
    take: limit,
  });
  return promos.map((p) => ({
    id: p.id,
    productName: p.shopProduct.product.name,
    productSlug: p.shopProduct.product.slug,
    productImage: p.shopProduct.product.image,
    shopName: p.shop.name,
    cityName: p.shop.city?.name,
    originalPrice: p.originalPrice,
    promoPrice: p.promoPrice,
    endDate: p.endDate,
  }));
}

export async function getTopCategories(limit = 8) {
  return prisma.productCategory.findMany({
    where: { parentId: null },
    take: limit,
    orderBy: { name: "asc" },
  });
}

export async function getDemandSignals(limit = 4) {
  const grouped = await prisma.customerRequest.groupBy({
    by: ["productText", "cityText"],
    _count: { productText: true },
    orderBy: { _count: { productText: "desc" } },
    take: limit,
  });
  return grouped.map((g) => ({
    product: g.productText,
    city: g.cityText,
    count: g._count.productText,
  }));
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      shopProducts: {
        include: {
          shop: { include: { city: true } },
          promotions: {
            where: { startDate: { lte: new Date() }, endDate: { gte: new Date() } },
          },
        },
      },
    },
  });
}

export async function getRelatedProducts(categoryId: string | null, excludeId: string, limit = 4) {
  if (!categoryId) return [];
  const products = await prisma.product.findMany({
    where: { categoryId, id: { not: excludeId } },
    include: { shopProducts: { select: { price: true } } },
    take: limit,
  });
  return products.map(toProductCard);
}

export async function getShopByCityAndSlug(citySlug: string, shopSlug: string) {
  return prisma.shop.findFirst({
    where: { slug: shopSlug, city: { slug: citySlug } },
    include: {
      city: true,
      openingHours: { orderBy: { dayOfWeek: "asc" } },
      reviews: { orderBy: { createdAt: "desc" }, take: 10 },
      shopProducts: {
        include: {
          product: { include: { category: true } },
          promotions: {
            where: { startDate: { lte: new Date() }, endDate: { gte: new Date() } },
          },
        },
      },
    },
  });
}

export async function searchProducts(q: string, limit = 20) {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { tags: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { shopProducts: { select: { price: true } } },
    take: limit,
  });
  return products.map(toProductCard);
}

export async function searchShops(q: string, city?: string, limit = 20) {
  const shops = await prisma.shop.findMany({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        city ? { city: { name: { contains: city, mode: "insensitive" } } } : {},
      ],
    },
    include: { city: true },
    take: limit,
  });
  return shops.map(toShopCard);
}

export async function getShopAnalyticsSummary(shopId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const events = await prisma.analyticsEvent.groupBy({
    by: ["type"],
    where: { shopId, createdAt: { gte: since } },
    _count: { type: true },
  });

  const summary: Record<string, number> = {};
  for (const e of events) summary[e.type] = e._count.type;
  return summary;
}
