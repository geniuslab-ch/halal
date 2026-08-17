import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-linen/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2 hv-focus rounded">
          <span className="font-display text-xl font-semibold tracking-tight text-pine">
            Halal Vaud
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex">
          <Link href="/search" className="hover:text-ink transition-colors">Products</Link>
          <Link href="/search?tab=shops" className="hover:text-ink transition-colors">Shops</Link>
          <Link href="/offers" className="hover:text-ink transition-colors">Offers</Link>
          <Link href="/for-business" className="hover:text-ink transition-colors">For businesses</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/for-business"
            className="hidden rounded-full border border-pine px-4 py-2 text-sm font-medium text-pine transition-colors hover:bg-pine hover:text-linen sm:inline-block"
          >
            Add my shop
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-pine px-4 py-2 text-sm font-medium text-linen transition-opacity hover:opacity-90"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
