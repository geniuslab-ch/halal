"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function setShopStatus(formData: FormData) {
  const shopId = String(formData.get("shopId"));
  const status = String(formData.get("status"));
  await prisma.shop.update({ where: { id: shopId }, data: { status: status as never } });
  revalidatePath("/admin");
}

export async function mergeProducts(formData: FormData) {
  const keepId = String(formData.get("keepId"));
  const mergeId = String(formData.get("mergeId"));
  if (keepId === mergeId) throw new Error("Cannot merge a product into itself.");

  await prisma.$transaction([
    // Re-point every shop listing from the duplicate onto the canonical product.
    prisma.shopProduct.updateMany({ where: { productId: mergeId }, data: { productId: keepId } }),
    prisma.product.update({ where: { id: mergeId }, data: { mergedIntoId: keepId } }),
  ]);

  revalidatePath("/admin");
}
