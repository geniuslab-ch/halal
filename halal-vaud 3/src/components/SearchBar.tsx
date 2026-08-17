import { Search, MapPin } from "lucide-react";

export function SearchBar({
  defaultQuery,
  defaultCity,
}: {
  defaultQuery?: string;
  defaultCity?: string;
}) {
  return (
    <form action="/search" className="flex w-full flex-col gap-2 rounded-2xl border border-line bg-paper p-2 shadow-sm sm:flex-row">
      <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-ink-soft" />
        <input
          name="q"
          defaultValue={defaultQuery}
          placeholder="What are you looking for? Rice, chicken, Al Wadi…"
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink-soft/70 outline-none"
        />
      </div>
      <div className="hidden w-px self-stretch bg-line sm:block" />
      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 sm:w-48">
        <MapPin className="h-4 w-4 shrink-0 text-ink-soft" />
        <input
          name="city"
          defaultValue={defaultCity}
          placeholder="Where? Lausanne…"
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink-soft/70 outline-none"
        />
      </div>
      <button
        type="submit"
        className="rounded-xl bg-pine px-6 py-2.5 text-sm font-medium text-linen transition-opacity hover:opacity-90"
      >
        Search
      </button>
    </form>
  );
}
