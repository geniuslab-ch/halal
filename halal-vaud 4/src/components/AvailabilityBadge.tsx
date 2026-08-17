const CONFIG: Record<string, { label: string; dot: string; text: string }> = {
  IN_STOCK: { label: "In stock", dot: "bg-emerald-600", text: "text-emerald-800" },
  LIMITED: { label: "Limited availability", dot: "bg-saffron", text: "text-[#8a6410]" },
  UNKNOWN: { label: "Availability unknown", dot: "bg-ink-soft", text: "text-ink-soft" },
  OUT_OF_STOCK: { label: "Out of stock", dot: "bg-clay", text: "text-clay" },
};

export function AvailabilityBadge({ status }: { status: string }) {
  const cfg = CONFIG[status] ?? CONFIG.UNKNOWN;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
