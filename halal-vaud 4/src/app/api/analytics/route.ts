import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AnalyticsEventType } from "@prisma/client";

// Lightweight, best-effort event tracking (WhatsApp/phone/directions/website clicks,
// shop/product views). Powers the merchant analytics dashboard.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shopId, type, metadata } = body as {
      shopId?: string;
      type: string;
      metadata?: Record<string, unknown>;
    };

    if (!type || !(type in AnalyticsEventType)) {
      return NextResponse.json({ error: "valid type is required" }, { status: 400 });
    }

    await prisma.analyticsEvent.create({
      data: {
        type: type as AnalyticsEventType,
        shopId: shopId ?? undefined,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("analytics error", err);
    // Analytics failures should never break the user's experience.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
