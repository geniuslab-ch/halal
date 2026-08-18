"use server";

import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Simplified single-step version of the business registration flow
export async function createShopLead(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const cityName = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name || !cityName || !email) {
    throw new Error("Name, city and email are required.");
  }

  const citySlug = slugify(cityName, { lower: true, strict: true });
  const city = await prisma.city.upsert({
    where: { slug: citySlug },
    update: {},
    create: { name: cityName, slug: citySlug },
  });

  const owner = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, role: "SHOP_OWNER" },
  });

  const baseSlug = slugify(name, { lower: true, strict: true });
  let slug = baseSlug;
  let n = 1;
  while (await prisma.shop.findFirst({ where: { slug, cityId: city.id } })) {
    slug = `${baseSlug}-${++n}`;
  }

  const shop = await prisma.shop.create({
    data: {
      name,
      slug,
      description: description || undefined,
      address: address || undefined,
      phone: phone || undefined,
      whatsapp: whatsapp || undefined,
      cityId: city.id,
      status: "PENDING",
      owners: { connect: { id: owner.id } },
    },
  });

  revalidatePath("/admin");
  redirect(`/for-business/thank-you?shop=${shop.id}`);
}

export async function registerShop(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    const cityName = String(formData.get("cityName") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!name || !cityName || !phone) {
      return { error: "Le nom de la boutique, la ville et le téléphone sont obligatoires." };
    }

    const citySlug = slugify(cityName, { lower: true, strict: true });
    const city = await prisma.city.upsert({
      where: { slug: citySlug },
      update: {},
      create: { name: cityName, slug: citySlug },
    });

    const baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let n = 1;
    while (await prisma.shop.findFirst({ where: { slug, cityId: city.id } })) {
      slug = `${baseSlug}-${++n}`;
    }

    await prisma.shop.create({
      data: {
        name,
        slug,
        phone,
        address: address || undefined,
        description: description || undefined,
        cityId: city.id,
        status: "PENDING",
      },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error("registerShop error:", err);
    return { error: err?.message || "Erreur lors de l'enregistrement de la boutique." };
  }
}
