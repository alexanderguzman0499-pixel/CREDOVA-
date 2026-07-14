import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const refundRequestSchema = z.object({
  reason: z.enum(["INVALID_TICKET", "EVENT_CANCELLED", "SELLER_NO_SHOW", "BUYER_REQUEST", "OTHER"]),
  notes: z.string().max(2000).optional(),
});

/**
 * Buyer guarantee: invalid ticket / cancelled event / seller no-show are
 * auto-approved and refunded immediately, since funds are still sitting on
 * the platform's Stripe balance (escrow) at this point in the flow.
 * Anything else is queued for manual review.
 */
const AUTO_APPROVE_REASONS = new Set(["INVALID_TICKET", "EVENT_CANCELLED", "SELLER_NO_SHOW"]);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = refundRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.buyerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!["PAID_ESCROW", "DELIVERED", "CONFIRMED"].includes(order.status)) {
    return NextResponse.json(
      { error: `Cannot request a refund for order in status ${order.status}.` },
      { status: 409 },
    );
  }

  const canAutoApprove = AUTO_APPROVE_REASONS.has(parsed.data.reason) && order.status !== "CONFIRMED";

  const refundRequest = await prisma.refundRequest.create({
    data: {
      orderId: order.id,
      reason: parsed.data.reason,
      notes: parsed.data.notes,
      status: canAutoApprove ? "APPROVED" : "REQUESTED",
    },
  });

  await prisma.order.update({ where: { id: order.id }, data: { status: "REFUND_REQUESTED" } });

  if (canAutoApprove) {
    if (order.stripePaymentIntentId) {
      await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });
    }
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: "REFUNDED" } }),
      prisma.refundRequest.update({
        where: { id: refundRequest.id },
        data: { status: "PROCESSED", resolvedAt: new Date() },
      }),
      prisma.listing.update({
        where: { id: order.listingId },
        data: { status: parsed.data.reason === "INVALID_TICKET" ? "REMOVED" : "ACTIVE" },
      }),
    ]);
  }

  return NextResponse.json({ refundRequest }, { status: 201 });
}
