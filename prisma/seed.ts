import { PrismaClient, StockStatus } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

const slug = (s: string) => slugify(s, { lower: true, strict: true });

async function main() {
  console.log("Seeding Halal Vaud demo data…");

  // Safe to run on every deploy: if demo data is already there, skip entirely
  // instead of risking duplicate customer-requests/reviews on redeploy.
  const alreadySeeded = await prisma.product.count();
  if (alreadySeeded > 0) {
    console.log(`Database already has ${alreadySeeded} products — skipping seed.`);
    return;
  }

  // ---------- Cities ----------
  const cityNames = ["Lausanne", "Renens", "Morges", "Vevey", "Montreux", "Yverdon-les-Bains"];
  const cities: Record<string, { id: string }> = {};
  for (const name of cityNames) {
    cities[name] = await prisma.city.upsert({
      where: { slug: slug(name) },
      update: {},
      create: { name, slug: slug(name) },
    });
  }

  // ---------- Categories ----------
  async function makeCategory(name: string, parentId?: string) {
    return prisma.productCategory.upsert({
      where: { slug: slug(name) },
      update: {},
      create: { name, slug: slug(name), parentId },
    });
  }

  const meat = await makeCategory("Meat");
  const chicken = await makeCategory("Chicken", meat.id);
  const lamb = await makeCategory("Lamb", meat.id);
  const beef = await makeCategory("Beef", meat.id);

  const riceGrains = await makeCategory("Rice & Grains");
  const basmati = await makeCategory("Basmati", riceGrains.id);
  const couscousCat = await makeCategory("Couscous", riceGrains.id);

  const frozen = await makeCategory("Frozen");
  const frozenMeat = await makeCategory("Frozen Meat", frozen.id);
  const frozenPastries = await makeCategory("Frozen Pastries", frozen.id);

  const african = await makeCategory("African Products");
  const turkish = await makeCategory("Turkish Products");
  const arab = await makeCategory("Arab Products");

  const drinks = await makeCategory("Drinks");
  const oils = await makeCategory("Oils");
  const spices = await makeCategory("Spices");
  const sauces = await makeCategory("Sauces");
  const bakery = await makeCategory("Bakery");

  // ---------- Products (global catalogue) ----------
  type ProductSeed = {
    name: string;
    brand?: string;
    categoryId?: string;
    size?: string;
    unit?: string;
    description?: string;
    attributes?: string;
    tags?: string;
  };

  const productSeeds: ProductSeed[] = [
    { name: "Al Wadi Basmati Rice 5kg", brand: "Al Wadi", categoryId: basmati.id, size: "5kg", attributes: "halal,imported", tags: "rice,basmati,al wadi", description: "Long-grain basmati rice, aged for extra aroma." },
    { name: "Tilda Basmati Rice 5kg", brand: "Tilda", categoryId: basmati.id, size: "5kg", attributes: "imported", tags: "rice,basmati" },
    { name: "Chicken Breast", categoryId: chicken.id, unit: "kg", attributes: "halal,fresh", tags: "chicken,poultry" },
    { name: "Whole Chicken", categoryId: chicken.id, attributes: "halal,fresh", tags: "chicken,poultry" },
    { name: "Frozen Lamb Shoulder", categoryId: frozenMeat.id, attributes: "halal,frozen", tags: "lamb,frozen" },
    { name: "Lamb Chops", categoryId: lamb.id, attributes: "halal,fresh", tags: "lamb" },
    { name: "Beef Mince 1kg", categoryId: beef.id, size: "1kg", attributes: "halal,fresh", tags: "beef,mince" },
    { name: "Turkish Sucuk 400g", brand: "Namet", categoryId: turkish.id, size: "400g", attributes: "halal,imported", tags: "turkish,sucuk,sausage" },
    { name: "Ethiopian Injera (pack of 5)", categoryId: african.id, attributes: "imported", tags: "injera,ethiopian,bread" },
    { name: "Harissa Sauce 200g", brand: "Le Phare du Cap Bon", categoryId: sauces.id, size: "200g", attributes: "imported,spicy", tags: "harissa,sauce,arab" },
    { name: "Zaatar Spice Mix 250g", categoryId: spices.id, size: "250g", attributes: "imported", tags: "zaatar,spices,arab" },
    { name: "Extra Virgin Olive Oil 1L", brand: "Terra Delyssa", categoryId: oils.id, size: "1L", attributes: "imported", tags: "oil,olive" },
    { name: "Couscous 1kg", brand: "Ferrero", categoryId: couscousCat.id, size: "1kg", tags: "couscous,grains,arab" },
    { name: "Medjool Dates 1kg", categoryId: arab.id, size: "1kg", attributes: "imported", tags: "dates,ramadan" },
    { name: "Baklava Selection Box", categoryId: bakery.id, attributes: "imported", tags: "baklava,dessert,turkish" },
    { name: "Ayran Yoghurt Drink 1L", categoryId: drinks.id, size: "1L", tags: "drink,turkish,ayran" },
    { name: "Berbere Spice Mix 100g", categoryId: spices.id, size: "100g", attributes: "imported,spicy", tags: "berbere,ethiopian,spices" },
    { name: "Moroccan Mint Tea 250g", categoryId: drinks.id, size: "250g", attributes: "imported", tags: "tea,morocco" },
    { name: "Frozen Samosas (pack of 12)", categoryId: frozenPastries.id, attributes: "halal,frozen", tags: "samosa,frozen,snack" },
    { name: "Halal Marshmallows 200g", categoryId: bakery.id, size: "200g", attributes: "halal", tags: "sweets,marshmallow" },
  ];

  const products: { id: string; slug: string; name: string }[] = [];
  for (const p of productSeeds) {
    const productSlug = slug(`${p.name}`);
    const product = await prisma.product.upsert({
      where: { slug: productSlug },
      update: {},
      create: {
        name: p.name,
        slug: productSlug,
        brand: p.brand,
        categoryId: p.categoryId,
        size: p.size,
        unit: p.unit,
        description: p.description ?? `${p.name}${p.brand ? ` by ${p.brand}` : ""}.`,
        attributes: p.attributes,
        tags: p.tags,
        verification: "UNVERIFIED",
      },
    });
    products.push(product);
  }
  const productBySlugMap = new Map(products.map((p) => [p.slug, p]));
  const getProduct = (name: string) => {
    const p = productBySlugMap.get(slug(name));
    if (!p) throw new Error(`Seed error: product not found: ${name}`);
    return p;
  };

  // ---------- Shops ----------
  type ShopSeed = {
    name: string;
    city: string;
    address: string;
    phone: string;
    whatsapp: string;
    description: string;
    status: "VERIFIED" | "PENDING" | "UNCLAIMED";
    plan: "FREE" | "GROWTH" | "PRO";
    delivery: boolean;
    pickup: boolean;
  };

  const shopSeeds: ShopSeed[] = [
    { name: "Alima Supermarché", city: "Renens", address: "Rue de Lausanne 12, Renens", phone: "+41213400001", whatsapp: "41791110001", description: "Full-range halal supermarket with fresh butchery counter.", status: "VERIFIED", plan: "PRO", delivery: true, pickup: true },
    { name: "Bilal Halal Market", city: "Lausanne", address: "Rue de Genève 45, Lausanne", phone: "+41213400002", whatsapp: "41791110002", description: "Neighbourhood grocer specialising in East African products.", status: "VERIFIED", plan: "GROWTH", delivery: false, pickup: true },
    { name: "Al Baraka Boucherie", city: "Morges", address: "Grand-Rue 8, Morges", phone: "+41213400003", whatsapp: "41791110003", description: "Halal butcher, fresh cuts daily.", status: "VERIFIED", plan: "GROWTH", delivery: false, pickup: true },
    { name: "Marhaba Épicerie", city: "Vevey", address: "Rue du Simplon 21, Vevey", phone: "+41213400004", whatsapp: "41791110004", description: "Arab and Turkish grocery with a large spice selection.", status: "VERIFIED", plan: "FREE", delivery: false, pickup: false },
    { name: "Sahara Grocery", city: "Montreux", address: "Avenue des Alpes 6, Montreux", phone: "+41213400005", whatsapp: "41791110005", description: "Family-run shop, North & East African specialities.", status: "VERIFIED", plan: "GROWTH", delivery: true, pickup: true },
    { name: "Nour Halal Shop", city: "Yverdon-les-Bains", address: "Rue du Lac 3, Yverdon-les-Bains", phone: "+41213400006", whatsapp: "41791110006", description: "Everyday essentials, halal meat and frozen goods.", status: "VERIFIED", plan: "FREE", delivery: false, pickup: true },
    { name: "Ozgur Market", city: "Lausanne", address: "Avenue de Morges 60, Lausanne", phone: "+41213400007", whatsapp: "41791110007", description: "Turkish supermarket — bakery, sucuk, and imported drinks.", status: "VERIFIED", plan: "PRO", delivery: true, pickup: true },
    { name: "Le Souk Vaudois", city: "Renens", address: "Avenue du 24 Janvier 5, Renens", phone: "+41213400008", whatsapp: "41791110008", description: "Arab grocery and spice house.", status: "VERIFIED", plan: "GROWTH", delivery: false, pickup: true },
    { name: "Habesha Market", city: "Lausanne", address: "Rue des Terreaux 9, Lausanne", phone: "+41213400009", whatsapp: "41791110009", description: "Ethiopian & Eritrean grocery — injera baked weekly.", status: "VERIFIED", plan: "FREE", delivery: false, pickup: true },
    { name: "Boucherie Zaman", city: "Morges", address: "Rue Louis-de-Savoie 14, Morges", phone: "+41213400010", whatsapp: "41791110010", description: "Halal butchery and fresh poultry.", status: "PENDING", plan: "FREE", delivery: false, pickup: true },
    { name: "Épicerie Al Amin", city: "Vevey", address: "Rue du Torrent 2, Vevey", phone: "+41213400011", whatsapp: "41791110011", description: "Neighbourhood halal grocer.", status: "VERIFIED", plan: "FREE", delivery: false, pickup: false },
    { name: "Marché du Bosphore", city: "Montreux", address: "Rue de la Paix 11, Montreux", phone: "+41213400012", whatsapp: "41791110012", description: "Turkish bakery and grocery.", status: "VERIFIED", plan: "GROWTH", delivery: false, pickup: true },
    { name: "Dar Al Khair", city: "Yverdon-les-Bains", address: "Rue de Neuchâtel 18, Yverdon-les-Bains", phone: "+41213400013", whatsapp: "41791110013", description: "Halal supermarket with a small restaurant counter.", status: "VERIFIED", plan: "PRO", delivery: true, pickup: true },
    { name: "Petit Maghreb", city: "Lausanne", address: "Rue Beau-Séjour 4, Lausanne", phone: "+41213400014", whatsapp: "41791110014", description: "Moroccan and Tunisian specialities.", status: "VERIFIED", plan: "GROWTH", delivery: false, pickup: true },
    { name: "Fresh Halal Renens", city: "Renens", address: "Rue de la Gare 22, Renens", phone: "+41213400015", whatsapp: "41791110015", description: "Fresh produce and halal meat, open late.", status: "PENDING", plan: "FREE", delivery: false, pickup: true },
    { name: "Al Noor Épicerie", city: "Morges", address: "Rue de la Gare 9, Morges", phone: "+41213400016", whatsapp: "41791110016", description: "General halal grocery and frozen goods.", status: "UNCLAIMED", plan: "FREE", delivery: false, pickup: false },
  ];

  const shops: { id: string; slug: string; name: string; cityId: string }[] = [];
  for (const s of shopSeeds) {
    const shopSlug = slug(s.name);
    const shop = await prisma.shop.upsert({
      where: { cityId_slug: { cityId: cities[s.city].id, slug: shopSlug } },
      update: {},
      create: {
        name: s.name,
        slug: shopSlug,
        cityId: cities[s.city].id,
        address: s.address,
        phone: s.phone,
        whatsapp: s.whatsapp,
        description: s.description,
        status: s.status,
        plan: s.plan,
        delivery: s.delivery,
        pickup: s.pickup,
        paymentMethods: "Cash,TWINT,Card",
        languages: "Français,English,العربية",
      },
    });
    shops.push({ id: shop.id, slug: shop.slug, name: shop.name, cityId: shop.cityId! });

    // Standard opening hours: Mon–Sat 08:00–19:00, closed Sunday.
    const alreadyHasHours = await prisma.openingHour.findFirst({ where: { shopId: shop.id } });
    if (!alreadyHasHours) {
      for (let day = 0; day <= 6; day++) {
        await prisma.openingHour.create({
          data: {
            shopId: shop.id,
            dayOfWeek: day,
            opensAt: day === 0 ? undefined : "08:00",
            closesAt: day === 0 ? undefined : "19:00",
            closed: day === 0,
          },
        });
      }
    }
  }

  const getShop = (name: string) => {
    const s = shops.find((sh) => sh.name === name);
    if (!s) throw new Error(`Seed error: shop not found: ${name}`);
    return s;
  };

  // ---------- Shop products (the product-first join table) ----------
  // Deliberately list the SAME products across MULTIPLE shops so the
  // product → "where to buy" experience has something real to show.
  type Listing = { shop: string; product: string; price: number; stock: StockStatus };

  const listings: Listing[] = [
    // Al Wadi Basmati Rice 5kg — in 5 shops, price ladder
    { shop: "Alima Supermarché", product: "Al Wadi Basmati Rice 5kg", price: 12.9, stock: "IN_STOCK" },
    { shop: "Bilal Halal Market", product: "Al Wadi Basmati Rice 5kg", price: 13.5, stock: "IN_STOCK" },
    { shop: "Le Souk Vaudois", product: "Al Wadi Basmati Rice 5kg", price: 14.9, stock: "UNKNOWN" },
    { shop: "Sahara Grocery", product: "Al Wadi Basmati Rice 5kg", price: 13.2, stock: "LIMITED" },
    { shop: "Dar Al Khair", product: "Al Wadi Basmati Rice 5kg", price: 12.5, stock: "IN_STOCK" },

    { shop: "Marhaba Épicerie", product: "Tilda Basmati Rice 5kg", price: 15.9, stock: "IN_STOCK" },
    { shop: "Petit Maghreb", product: "Tilda Basmati Rice 5kg", price: 16.5, stock: "IN_STOCK" },

    // Chicken — in 4 shops
    { shop: "Al Baraka Boucherie", product: "Chicken Breast", price: 11.9, stock: "IN_STOCK" },
    { shop: "Boucherie Zaman", product: "Chicken Breast", price: 12.5, stock: "IN_STOCK" },
    { shop: "Fresh Halal Renens", product: "Chicken Breast", price: 10.9, stock: "LIMITED" },
    { shop: "Alima Supermarché", product: "Chicken Breast", price: 12.9, stock: "IN_STOCK" },

    { shop: "Al Baraka Boucherie", product: "Whole Chicken", price: 9.9, stock: "IN_STOCK" },
    { shop: "Boucherie Zaman", product: "Whole Chicken", price: 10.5, stock: "IN_STOCK" },
    { shop: "Nour Halal Shop", product: "Whole Chicken", price: 9.5, stock: "UNKNOWN" },

    // Frozen lamb
    { shop: "Alima Supermarché", product: "Frozen Lamb Shoulder", price: 18.9, stock: "IN_STOCK" },
    { shop: "Dar Al Khair", product: "Frozen Lamb Shoulder", price: 19.5, stock: "IN_STOCK" },
    { shop: "Al Noor Épicerie", product: "Frozen Lamb Shoulder", price: 17.9, stock: "UNKNOWN" },

    { shop: "Al Baraka Boucherie", product: "Lamb Chops", price: 24.9, stock: "IN_STOCK" },
    { shop: "Boucherie Zaman", product: "Lamb Chops", price: 26.5, stock: "LIMITED" },

    { shop: "Al Baraka Boucherie", product: "Beef Mince 1kg", price: 14.5, stock: "IN_STOCK" },
    { shop: "Alima Supermarché", product: "Beef Mince 1kg", price: 15.2, stock: "IN_STOCK" },
    { shop: "Fresh Halal Renens", product: "Beef Mince 1kg", price: 13.9, stock: "IN_STOCK" },

    // Turkish products
    { shop: "Ozgur Market", product: "Turkish Sucuk 400g", price: 8.9, stock: "IN_STOCK" },
    { shop: "Marché du Bosphore", product: "Turkish Sucuk 400g", price: 9.5, stock: "IN_STOCK" },

    { shop: "Ozgur Market", product: "Ayran Yoghurt Drink 1L", price: 3.5, stock: "IN_STOCK" },
    { shop: "Marché du Bosphore", product: "Ayran Yoghurt Drink 1L", price: 3.9, stock: "IN_STOCK" },
    { shop: "Marhaba Épicerie", product: "Ayran Yoghurt Drink 1L", price: 3.6, stock: "IN_STOCK" },

    { shop: "Ozgur Market", product: "Baklava Selection Box", price: 12.9, stock: "IN_STOCK" },
    { shop: "Marché du Bosphore", product: "Baklava Selection Box", price: 13.9, stock: "LIMITED" },

    // African products
    { shop: "Habesha Market", product: "Ethiopian Injera (pack of 5)", price: 7.9, stock: "IN_STOCK" },
    { shop: "Sahara Grocery", product: "Ethiopian Injera (pack of 5)", price: 8.5, stock: "LIMITED" },

    { shop: "Habesha Market", product: "Berbere Spice Mix 100g", price: 6.5, stock: "IN_STOCK" },
    { shop: "Sahara Grocery", product: "Berbere Spice Mix 100g", price: 6.9, stock: "IN_STOCK" },

    // Arab products
    { shop: "Le Souk Vaudois", product: "Harissa Sauce 200g", price: 4.5, stock: "IN_STOCK" },
    { shop: "Petit Maghreb", product: "Harissa Sauce 200g", price: 4.9, stock: "IN_STOCK" },
    { shop: "Marhaba Épicerie", product: "Harissa Sauce 200g", price: 4.2, stock: "IN_STOCK" },

    { shop: "Le Souk Vaudois", product: "Zaatar Spice Mix 250g", price: 5.9, stock: "IN_STOCK" },
    { shop: "Marhaba Épicerie", product: "Zaatar Spice Mix 250g", price: 6.2, stock: "IN_STOCK" },

    { shop: "Petit Maghreb", product: "Couscous 1kg", price: 4.9, stock: "IN_STOCK" },
    { shop: "Le Souk Vaudois", product: "Couscous 1kg", price: 5.2, stock: "IN_STOCK" },
    { shop: "Dar Al Khair", product: "Couscous 1kg", price: 4.6, stock: "IN_STOCK" },

    { shop: "Le Souk Vaudois", product: "Medjool Dates 1kg", price: 11.9, stock: "IN_STOCK" },
    { shop: "Petit Maghreb", product: "Medjool Dates 1kg", price: 12.5, stock: "IN_STOCK" },
    { shop: "Marhaba Épicerie", product: "Medjool Dates 1kg", price: 10.9, stock: "LIMITED" },

    { shop: "Petit Maghreb", product: "Moroccan Mint Tea 250g", price: 5.5, stock: "IN_STOCK" },
    { shop: "Le Souk Vaudois", product: "Moroccan Mint Tea 250g", price: 5.9, stock: "IN_STOCK" },

    // Oils & frozen goods, spread out
    { shop: "Alima Supermarché", product: "Extra Virgin Olive Oil 1L", price: 13.9, stock: "IN_STOCK" },
    { shop: "Marhaba Épicerie", product: "Extra Virgin Olive Oil 1L", price: 14.5, stock: "IN_STOCK" },
    { shop: "Nour Halal Shop", product: "Extra Virgin Olive Oil 1L", price: 13.5, stock: "IN_STOCK" },

    { shop: "Alima Supermarché", product: "Frozen Samosas (pack of 12)", price: 6.9, stock: "IN_STOCK" },
    { shop: "Dar Al Khair", product: "Frozen Samosas (pack of 12)", price: 7.5, stock: "IN_STOCK" },

    { shop: "Nour Halal Shop", product: "Halal Marshmallows 200g", price: 3.2, stock: "IN_STOCK" },
    { shop: "Alima Supermarché", product: "Halal Marshmallows 200g", price: 3.5, stock: "IN_STOCK" },
  ];

  const shopProductIds: Record<string, string> = {};
  for (const l of listings) {
    const shop = getShop(l.shop);
    const product = getProduct(l.product);
    const sp = await prisma.shopProduct.upsert({
      where: { productId_shopId: { productId: product.id, shopId: shop.id } },
      update: { price: l.price, stockStatus: l.stock },
      create: { shopId: shop.id, productId: product.id, price: l.price, stockStatus: l.stock },
    });
    shopProductIds[`${l.shop}|${l.product}`] = sp.id;
  }

  // ---------- Promotions ----------
  const now = new Date();
  const inDays = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  type PromoSeed = { shop: string; product: string; promoPrice: number; start: Date; end: Date; description?: string };
  const promoSeeds: PromoSeed[] = [
    { shop: "Alima Supermarché", product: "Al Wadi Basmati Rice 5kg", promoPrice: 10.9, start: inDays(-2), end: inDays(5), description: "Ramadan stock-up offer" },
    { shop: "Le Souk Vaudois", product: "Medjool Dates 1kg", promoPrice: 8.9, start: inDays(-1), end: inDays(6), description: "Fresh delivery this week" },
    { shop: "Ozgur Market", product: "Baklava Selection Box", promoPrice: 9.9, start: inDays(-3), end: inDays(2), description: "Weekend special" },
    { shop: "Dar Al Khair", product: "Couscous 1kg", promoPrice: 3.9, start: inDays(-1), end: inDays(4) },
  ];

  for (const p of promoSeeds) {
    const spId = shopProductIds[`${p.shop}|${p.product}`];
    const shop = getShop(p.shop);
    const sp = await prisma.shopProduct.findUnique({ where: { id: spId } });
    if (!sp) continue;
    const existing = await prisma.promotion.findFirst({ where: { shopProductId: spId } });
    if (existing) continue;
    await prisma.promotion.create({
      data: {
        shopId: shop.id,
        shopProductId: spId,
        originalPrice: sp.price,
        promoPrice: p.promoPrice,
        startDate: p.start,
        endDate: p.end,
        description: p.description,
        status: "ACTIVE",
      },
    });
  }

  // ---------- Demand intelligence (customer requests) ----------
  const demandSeeds: { product: string; city: string }[] = [
    { product: "Ethiopian injera", city: "Lausanne" },
    { product: "Ethiopian injera", city: "Lausanne" },
    { product: "Ethiopian injera", city: "Renens" },
    { product: "Fresh halal lamb", city: "Vevey" },
    { product: "Fresh halal lamb", city: "Vevey" },
    { product: "Halal chicken nuggets", city: "Montreux" },
  ];
  for (const d of demandSeeds) {
    await prisma.customerRequest.create({
      data: { productText: d.product, cityText: d.city },
    });
  }

  // ---------- Demo users & reviews ----------
  const admin = await prisma.user.upsert({
    where: { email: "admin@halalvaud.ch" },
    update: {},
    create: { email: "admin@halalvaud.ch", name: "Halal Vaud Admin", role: "ADMIN" },
  });

  const reviewer = await prisma.user.upsert({
    where: { email: "customer.demo@halalvaud.ch" },
    update: {},
    create: { email: "customer.demo@halalvaud.ch", name: "Amina B.", role: "CUSTOMER", city: "Lausanne" },
  });

  await prisma.review.create({
    data: {
      shopId: getShop("Alima Supermarché").id,
      userId: reviewer.id,
      rating: 5,
      quality: 5,
      price: 4,
      service: 5,
      comment: "Great selection and the butcher counter is excellent. Always fresh.",
    },
  });
  await prisma.review.create({
    data: {
      shopId: getShop("Alima Supermarché").id,
      userId: admin.id,
      rating: 4,
      comment: "Good prices, gets busy on weekends.",
    },
  });

  console.log(`Seeded ${cityNames.length} cities, ${shops.length} shops, ${products.length} products, ${listings.length} listings, ${promoSeeds.length} promotions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
