"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  User,
  LogOut,
  Package,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 hv-focus rounded-lg">
          <div className="relative h-10 w-10">
            <Image
              src="/logo.svg"
              alt="Halal Vaud"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <span className="font-display text-lg font-bold text-pine">Halal</span>
            <span className="font-display text-lg font-bold text-green"> Vaud</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-soft md:flex">
          <Link
            href="/search"
            className="flex items-center gap-1.5 hover:text-pine transition-colors rounded-lg px-2 py-1 hover:bg-green-light"
          >
            <Search className="h-3.5 w-3.5" />
            Produits
          </Link>
          <Link
            href="/search?tab=shops"
            className="flex items-center gap-1.5 hover:text-pine transition-colors rounded-lg px-2 py-1 hover:bg-green-light"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Boutiques
          </Link>
          <Link
            href="/offers"
            className="hover:text-pine transition-colors rounded-lg px-2 py-1 hover:bg-green-light"
          >
            Offres
          </Link>
          <Link
            href="/for-business"
            className="hover:text-pine transition-colors rounded-lg px-2 py-1 hover:bg-green-light"
          >
            Pro
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:border-green hover:text-pine transition-all"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full gradient-brand text-white text-xs font-bold">
                  {session.user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className="hidden sm:block max-w-[100px] truncate">
                  {session.user.name?.split(" ")[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-ink-soft" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-line bg-paper shadow-lg overflow-hidden z-50">
                  <div className="border-b border-line px-4 py-3">
                    <p className="text-xs text-ink-soft">Connecté en tant que</p>
                    <p className="text-sm font-semibold text-ink truncate">{session.user.email}</p>
                  </div>
                  <nav className="p-2 space-y-0.5">
                    <Link
                      href="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink hover:bg-green-light hover:text-pine transition-colors"
                    >
                      <Package className="h-4 w-4" />
                      Mes commandes
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink hover:bg-green-light hover:text-pine transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { signOut(); setUserMenuOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-hv-red hover:bg-red-soft transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </button>
                  </nav>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full border-2 border-pine px-4 py-1.5 text-sm font-semibold text-pine hover:bg-pine hover:text-white transition-all sm:inline-block"
              >
                Connexion
              </Link>
              <Link
                href="/login?mode=register"
                className="btn-primary text-xs"
              >
                <User className="h-3.5 w-3.5" />
                S&apos;inscrire
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg border border-line p-2 text-ink-soft hover:bg-green-light hover:text-pine transition-all md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-line bg-paper px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {[
              { href: "/search", label: "Produits" },
              { href: "/search?tab=shops", label: "Boutiques" },
              { href: "/offers", label: "Offres" },
              { href: "/for-business", label: "Pour les professionnels" },
              { href: "/for-business", label: "Ajouter ma boutique" },
            ].map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-ink hover:bg-green-light hover:text-pine transition-colors"
              >
                {item.label}
              </Link>
            ))}
            {!session?.user && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-2 btn-primary justify-center"
              >
                Se connecter
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
