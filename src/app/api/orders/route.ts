import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { computePriceBreakdown } from "@/lib/fees";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const createOrderSchema = z.object({
  listingId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
});

/**
 * Escrow model: the buyer's payment is captured to the PLATFORM's Stripe
 * balance (no `transfer_data` here) so funds are held by us, not the seller,
 * until the escrow condition is met. The payout to the seller's connected
 * account happens later as an explicit Transfer — see
 * /api/orders/[id]/confirm and /api/orders/[id]/release. This is the
 * "separate charges and transfers" Connect pattern, which is what makes
 * real fund retention possible (destination charges pay out immediately).
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
    include: { event: true, seller: { include: { stripeConnect: true } } },
  });

  if (!listing || listing.status !== "ACTIVE") {
    return NextResponse.json({ error: "Listing is not available." }, { status: 404 });
  }
  if (listing.sellerId === session.user.id) {
    return NextResponse.json({ error: "You cannot buy your own listing." }, { status: 400 });
  }
  if (!listing.seller.stripeConnect?.payoutsEnabled) {
    return NextResponse.json(
      { error: "This seller has not finished payout setup yet." },
      { status: 409 },
    );
  }
  if (parsed.data.quantity > listing.quantity) {
    return NextResponse.json({ error: "Not enough tickets available." }, { status: 409 });
  }

  const pricing = computePriceBreakdown(listing.pricePerTicketCents, parsed.data.quantity);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: pricing.totalChargedCents,
    currency: listing.currency,
    automatic_payment_methods: { enabled: true },
    metadata: { listingId: listing.id },
  });

  const order = await prisma.order.create({
    data: {
      listingId: listing.id,
      buyerId: session.user.id,
      quantity: parsed.data.quantity,
      unitPriceCents: listing.pricePerTicketCents,
      sellerFeeCents: pricing.sellerFeeCents,
      buyerFeeCents: pricing.buyerFeeCents,
      totalChargedCents: pricing.totalChargedCents,
      currency: listing.currency,
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  await prisma.listing.update({
    where: { id: listing.id },
    data: { status: "PENDING_SALE" },
  });

  return NextResponse.json(
    { order, clientSecret: paymentIntent.client_secret },
    { status: 201 },
  );
}
