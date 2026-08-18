import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ShopCard } from "@/components/ShopCard";
import { ProductCard } from "@/components/ProductCard";
import { Search, Truck, Star, ShieldCheck, MapPin, ArrowRight, Percent } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredShops, featuredProducts, promotions] = await Promise.all([
    prisma.shop.findMany({
      where: { status: "VERIFIED" },
      take: 6,
      orderBy: { updatedAt: "desc" },
      include: { city: { select: { name: true, slug: true } } },
    }),
    prisma.product.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        shopProducts: {
          select: { price: true, shop: true },
          take: 1,
          orderBy: { price: "asc" },
        },
        _count: { select: { shopProducts: true } },
      },
    }),
    prisma.promotion.findMany({
      where: { status: "ACTIVE" },
      take: 3,
      include: {
        shopProduct: { include: { product: { select: { name: true, image: true } } } },
        shop: { select: { name: true, slug: true, city: { select: { slug: true, name: true } } } },
      },
    }),
  ]);

  const categories = [
    { icon: "🥩", name: "Viandes", slug: "viandes" },
    { icon: "🍗", name: "Volailles", slug: "volailles" },
    { icon: "🌾", name: "Céréales", slug: "cereales" },
    { icon: "🧆", name: "Préparés", slug: "prepares" },
    { icon: "🥛", name: "Produits laitiers", slug: "laitiers" },
    { icon: "🫙", name: "Conserves", slug: "conserves" },
    { icon: "🍬", name: "Confiserie", slug: "confiserie" },
    { icon: "🌿", name: "Bio & Nature", slug: "bio" },
  ];

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="hero-mesh hv-texture-dark relative overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-green/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-pine-mid/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 py-24 md:py-32 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green/30 bg-green/10 px-4 py-1.5 text-sm font-medium text-green-soft">
            <span className="h-2 w-2 rounded-full bg-green animate-pulse" />
            100% Halal certifié • Canton de Vaud 🇨🇭
          </div>

          <h1 className="font-display text-4xl font-bold text-white md:text-6xl lg:text-7xl leading-tight">
            Trouvez des produits
            <span className="block mt-1" style={{ color: "#81C784" }}>halal près de chez vous</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Comparez les prix, découvrez les offres et commandez en livraison auprès des meilleures boutiques halal du Canton de Vaud.
          </p>

          {/* Search bar */}
          <form action="/search" className="mx-auto mt-10 flex max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex flex-1 items-center gap-3 px-5">
              <Search className="h-5 w-5 shrink-0 text-ink-soft" />
              <input
                type="text"
                name="q"
                placeholder="Rechercher un produit, une boutique..."
                className="flex-1 py-4 text-sm font-medium text-ink placeholder:text-ink-soft outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="m-2 rounded-xl gradient-brand px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity"
            >
              Chercher
            </button>
          </form>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green" />
              <span>Boutiques vérifiées</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green" />
              <span>6 villes dans le Vaud</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-green" />
              <span>Livraison à domicile</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-green" />
              <span>Meilleurs prix garantis</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold text-pine md:text-3xl">
            Catégories
          </h2>
          <Link href="/categories" className="flex items-center gap-1 text-sm font-semibold text-green hover:text-pine transition-colors">
            Tout voir <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-line bg-paper p-4 text-center hover:border-green hover:bg-green-light transition-all hover:shadow-sm card-shimmer"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-xs font-semibold text-ink-soft group-hover:text-pine transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== PROMOTIONS ===== */}
      {promotions.length > 0 && (
        <section className="bg-green-light">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-brand">
                  <Percent className="h-5 w-5 text-white" />
                </div>
                <h2 className="font-display text-2xl font-bold text-pine md:text-3xl">
                  Offres du moment
                </h2>
              </div>
              <Link href="/offers" className="flex items-center gap-1 text-sm font-semibold text-green hover:text-pine transition-colors">
                Toutes les offres <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {promotions.map((promo) => (
                <Link
                  key={promo.id}
                  href={`/shops/${promo.shop.city?.slug ?? "vaud"}/${promo.shop.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-line bg-paper shadow-sm hover:shadow-md transition-all card-shimmer"
                >
                  <div className="absolute top-3 left-3 z-10">
                    <span className="rounded-full gradient-brand px-3 py-1 text-xs font-bold text-white shadow">
                      -{Math.round((1 - promo.promoPrice / promo.originalPrice) * 100)}%
                    </span>
                  </div>
                  <div className="h-40 bg-green-light flex items-center justify-center">
                    {promo.shopProduct.product.image ? (
                      <Image
                        src={promo.shopProduct.product.image}
                        alt={promo.shopProduct.product.name}
                        width={160}
                        height={160}
                        className="object-contain h-32"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-brand text-4xl text-white font-bold">
                        {promo.shopProduct.product.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-ink-soft">{promo.shop.name}</p>
                    <p className="font-semibold text-ink mt-0.5 line-clamp-1">{promo.shopProduct.product.name}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-display text-xl font-bold text-pine">CHF {promo.promoPrice.toFixed(2)}</span>
                      <span className="text-sm text-ink-soft line-through">CHF {promo.originalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FEATURED SHOPS ===== */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold text-pine md:text-3xl">
            Boutiques recommandées
          </h2>
          <Link href="/search?tab=shops" className="flex items-center gap-1 text-sm font-semibold text-green hover:text-pine transition-colors">
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredShops.map((shop) => (
            <ShopCard
              key={shop.id}
              shop={{
                slug: shop.slug,
                name: shop.name,
                cityName: shop.city?.name,
                citySlug: shop.city?.slug,
                logo: shop.logo,
                status: shop.status,
                description: shop.description,
              }}
            />
          ))}
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="bg-green-light">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-bold text-pine md:text-3xl">
              Produits populaires
            </h2>
            <Link href="/search" className="flex items-center gap-1 text-sm font-semibold text-green hover:text-pine transition-colors">
              Tout voir <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.slug}
                product={{
                  slug: product.slug,
                  name: product.name,
                  brand: product.brand,
                  image: product.image,
                  minPrice:
                    product.shopProducts[0]?.price ?? null,
                  maxPrice:
                    product.shopProducts[0]?.price ?? null,
                  shopCount: product._count.shopProducts,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="relative overflow-hidden rounded-3xl gradient-brand p-10 md:p-16 text-center">
          <div className="hv-texture-dark absolute inset-0" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Vous êtes commerçant ?
            </h2>
            <p className="mt-3 text-white/80 text-lg max-w-xl mx-auto">
              Rejoignez Halal Vaud et touchez des milliers de clients dans le Canton de Vaud. Création de profil gratuite.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/for-business"
                className="rounded-full bg-white px-8 py-3 text-sm font-bold text-pine hover:bg-green-light transition-colors shadow-lg"
              >
                Ajouter ma boutique gratuitement
              </Link>
              <Link
                href="/search?tab=shops"
                className="rounded-full border-2 border-white/50 px-8 py-3 text-sm font-bold text-white hover:border-white transition-colors"
              >
                Explorer les boutiques
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
