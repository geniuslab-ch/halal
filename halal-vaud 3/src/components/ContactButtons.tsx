"use client";

import { MessageCircle, Phone, Navigation, Globe } from "lucide-react";

async function track(shopId: string, type: string) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopId, type }),
    });
  } catch {
    // best-effort analytics, never block the user action
  }
}

export function ContactButtons({
  shopId,
  whatsapp,
  phone,
  address,
  website,
}: {
  shopId: string;
  whatsapp?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => track(shopId, "WHATSAPP_CLICK")}
          className="flex items-center gap-2 rounded-full bg-pine px-4 py-2 text-sm font-medium text-linen hover:opacity-90"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone}`}
          onClick={() => track(shopId, "PHONE_CLICK")}
          className="flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink hover:border-pine"
        >
          <Phone className="h-4 w-4" /> Call
        </a>
      )}
      {address && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => track(shopId, "DIRECTIONS_CLICK")}
          className="flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink hover:border-pine"
        >
          <Navigation className="h-4 w-4" /> Directions
        </a>
      )}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noreferrer"
          onClick={() => track(shopId, "WEBSITE_CLICK")}
          className="flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink hover:border-pine"
        >
          <Globe className="h-4 w-4" /> Website
        </a>
      )}
    </div>
  );
}
