"use server";

import { prisma } from "@/lib/prisma";
import { StockStatus } from "@prisma/client";
import slugify from "slugify";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Shop owners should not have to recreate products that already exist —
// this links an existing global Product to their Shop via a ShopProduct row.
export async function addExistingProductToShop(formData: FormData) {
  const shopId = String(formData.get("shopId"));
  const productId = String(formData.get("productId"));
  const price = Number(formData.get("price"));
  const stockStatusRaw = String(formData.get("stockStatus") ?? "UNKNOWN");
  const stockStatus = stockStatusRaw in StockStatus ? (stockStatusRaw as StockStatus) : StockStatus.UNKNOWN;

  if (!shopId || !productId || Number.isNaN(price)) {
    throw new Error("Shop, product and price are required.");
  }

  await prisma.shopProduct.upsert({
    where: { productId_shopId: { productId, shopId } },
    update: { price, stockStatus, lastPriceUpdate: new Date(), lastAvailabilityUpdate: new Date() },
    create: { shopId, productId, price, stockStatus },
  });

  revalidatePath("/dashboard/products");
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  redirect(`/dashboard/products?shop=${shop?.slug ?? ""}`);
}

// When the product genuinely doesn't exist yet in the global catalogue,
// the shop owner can create it — admin can merge duplicates later
// (see ProductMergeHistory-style relation on Product.mergedInto).
export async function createProductAndAddToShop(formData: FormData) {
  const shopId = String(formData.get("shopId"));
  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const size = String(formData.get("size") ?? "").trim();
  const price = Number(formData.get("price"));
  const categorySlug = String(formData.get("category") ?? "");

  if (!shopId || !name || Number.isNaN(price)) {
    throw new Error("Shop, product name and price are required.");
  }

  const category = categorySlug
    ? await prisma.productCategory.findUnique({ where: { slug: categorySlug } })
    : null;

  const baseSlug = slugify(`${name} ${size}`, { lower: true, strict: true });
  let slug = baseSlug;
  let n = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++n}`;
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      brand: brand || undefined,
      size: size || undefined,
      categoryId: category?.id,
    },
  });

  await prisma.shopProduct.create({
    data: { shopId, productId: product.id, price, stockStatus: "UNKNOWN" },
  });

  revalidatePath("/dashboard/products");
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  redirect(`/dashboard/products?shop=${shop?.slug ?? ""}`);
}

export async function createPromotion(formData: FormData) {
  const shopId = String(formData.get("shopId"));
  const shopProductId = String(formData.get("shopProductId"));
  const promoPrice = Number(formData.get("promoPrice"));
  const startDate = new Date(String(formData.get("startDate")));
  const endDate = new Date(String(formData.get("endDate")));
  const description = String(formData.get("description") ?? "").trim();

  if (!shopId || !shopProductId || Number.isNaN(promoPrice)) {
    throw new Error("Product and promotional price are required.");
  }

  const shopProduct = await prisma.shopProduct.findUnique({ where: { id: shopProductId } });
  if (!shopProduct) throw new Error("Product listing not found.");

  const now = new Date();
  const status = now < startDate ? "SCHEDULED" : now > endDate ? "EXPIRED" : "ACTIVE";

  await prisma.promotion.create({
    data: {
      shopId,
      shopProductId,
      originalPrice: shopProduct.price,
      promoPrice,
      startDate,
      endDate,
      description: description || undefined,
      status,
    },
  });

  revalidatePath("/dashboard/promotions");
  revalidatePath("/offers");
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  redirect(`/dashboard/promotions?shop=${shop?.slug ?? ""}`);
}
