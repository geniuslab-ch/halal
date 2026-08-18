import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, generatePaymentRef } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const {
      shopProductId,
      quantity,
      customerName,
      deliveryAddress,
      deliveryCity,
      deliveryZip,
      customerPhone,
      notes,
    } = body;

    if (!shopProductId || !customerName || !deliveryAddress || !deliveryCity || !deliveryZip) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const shopProduct = await prisma.shopProduct.findUnique({
      where: { id: shopProductId },
      include: { shop: true, product: true },
    });

    if (!shopProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const qty = quantity || 1;
    const totalAmount = shopProduct.price * qty;
    const paymentRef = generatePaymentRef();

    // Create order in DB
    const order = await prisma.order.create({
      data: {
        customerId: session?.user ? (session.user as { id?: string }).id : undefined,
        shopId: shopProduct.shopId,
        deliveryAddress,
        deliveryCity,
        deliveryZip,
        customerName,
        customerPhone,
        totalAmount,
        currency: shopProduct.currency,
        paymentRef,
        notes,
        items: {
          create: {
            shopProductId,
            quantity: qty,
            unitPrice: shopProduct.price,
            productName: shopProduct.product.name,
          },
        },
      },
    });

    // Create Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: shopProduct.currency.toLowerCase(),
            product_data: {
              name: shopProduct.product.name,
              description: `Delivery to ${deliveryAddress}, ${deliveryZip} ${deliveryCity}`,
              images: shopProduct.product.image ? [shopProduct.product.image] : [],
            },
            unit_amount: Math.round(shopProduct.price * 100),
          },
          quantity: qty,
        },
      ],
      mode: "payment",
      metadata: {
        orderId: order.id,
        paymentRef,
      },
      success_url: `${process.env.NEXTAUTH_URL || ""}/orders/success?ref=${paymentRef}`,
      cancel_url: `${process.env.NEXTAUTH_URL || ""}/checkout?cancelled=true`,
    });

    // Update order with Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    });

    return NextResponse.json({
      orderId: order.id,
      paymentRef,
      stripeUrl: stripeSession.url,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  const orders = await prisma.order.findMany({
    where: { customerId: userId },
    include: {
      shop: { select: { name: true, slug: true, city: { select: { slug: true } } } },
      items: {
        include: {
          shopProduct: { include: { product: { select: { name: true, image: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
