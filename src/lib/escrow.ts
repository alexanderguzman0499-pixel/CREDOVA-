import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

/**
 * Orders whose holding window has elapsed with no open refund request —
 * i.e. ready for the automatic escrow release cron to pay the seller.
 */
export function findDueEscrowOrders() {
  return prisma.order.findMany({
    where: {
      status: { in: ["PAID_ESCROW", "DELIVERED"] },
      escrowReleaseAt: { lte: new Date() },
      refundRequests: { none: { status: { in: ["REQUESTED", "APPROVED"] } } },
    },
    select: { id: true },
  });
}

/**
 * Releases escrowed funds to the seller's connected account and marks the
 * order complete. Called either when the buyer explicitly confirms the
 * ticket was valid, or automatically once the event date has passed with
 * no open refund request (see /api/orders/[id]/release).
 */
export async function releaseEscrowToSeller(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { listing: { include: { seller: { include: { stripeConnect: true } } } } },
  });

  if (!order) throw new Error("Order not found");
  if (order.status === "COMPLETED") return order;
  if (order.status !== "PAID_ESCROW" && order.status !== "CONFIRMED" && order.status !== "DELIVERED") {
    throw new Error(`Cannot release funds for order in status ${order.status}`);
  }

  const destination = order.listing.seller.stripeConnect?.stripeAccountId;
  if (!destination) throw new Error("Seller has no connected Stripe account");

  await stripe.transfers.create({
    amount: order.listing.pricePerTicketCents * order.quantity - order.sellerFeeCents,
    currency: order.currency,
    destination,
    transfer_group: order.id,
    metadata: { orderId: order.id },
  });

  return prisma.order.update({
    where: { id: orderId },
    data: { status: "COMPLETED" },
  });
}
