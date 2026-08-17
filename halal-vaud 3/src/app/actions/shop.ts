"use server";

import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Simplified single-step version of the 9-step business registration flow
// described in the product spec (account -> business info -> address ->
// contact -> categories -> logo -> cover -> products -> submit). All the
// fields collected here map 1:1 onto the Shop model, so the multi-step
// wizard can be layered on top later without changing the data model.
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
    create: { email, role: "SHOP_OWNER", name: undefined },
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
