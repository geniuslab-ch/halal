import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold text-pine">Halal Vaud</p>
          <p className="mt-2 text-sm text-ink-soft">
            The local discovery network for halal shops, products and offers across the
            Canton of Vaud.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Discover</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li><Link href="/search">Products</Link></li>
            <li><Link href="/search?tab=shops">Shops</Link></li>
            <li><Link href="/offers">Offers</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Business</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li><Link href="/for-business">Add my shop</Link></li>
            <li><Link href="/dashboard">Merchant dashboard</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li><Link href="/privacy">Privacy policy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} Halal Vaud — Canton de Vaud, Suisse
      </div>
    </footer>
  );
}
