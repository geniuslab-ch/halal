import { initials } from "@/lib/format";

const PALETTE = [
  { bg: "#1f3d2b", fg: "#f6f4ee" }, // pine
  { bg: "#d99a1b", fg: "#1c1b17" }, // saffron
  { bg: "#7a6a4f", fg: "#f6f4ee" }, // stone
  { bg: "#2f5940", fg: "#f6f4ee" }, // pine light
  { bg: "#b5473a", fg: "#f6f4ee" }, // clay
];

function pick(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function Tile({
  label,
  className = "",
  imageUrl,
}: {
  label: string;
  className?: string;
  imageUrl?: string | null;
}) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={label} className={`object-cover ${className}`} />;
  }
  const { bg, fg } = pick(label);
  return (
    <div
      className={`flex items-center justify-center font-display font-semibold ${className}`}
      style={{ backgroundColor: bg, color: fg }}
      aria-hidden
    >
      <span>{initials(label)}</span>
    </div>
  );
}
