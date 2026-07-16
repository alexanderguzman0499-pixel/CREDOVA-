import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { sendOrderConfirmedEmail, sendTicketSoldEmail } from "@/lib/email";
import { formatCents } from "@/lib/fees";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const ESCROW_HOLD_HOURS_AFTER_EVENT = 48;

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await request.text();

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing webhook signature/secret." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const order = await prisma.order.findUnique({
        where: { stripePaymentIntentId: paymentIntent.id },
        include: {
          listing: { include: { event: true, seller: true } },
          buyer: true,
        },
      });
      if (order && order.status === "PENDING_PAYMENT") {
        const escrowReleaseAt = new Date(
          order.listing.event.eventDate.getTime() + ESCROW_HOLD_HOURS_AFTER_EVENT * 60 * 60 * 1000,
        );
        await prisma.$transaction([
          prisma.order.update({
            where: { id: order.id },
            data: { status: "PAID_ESCROW", escrowReleaseAt },
          }),
          prisma.listing.update({
            where: { id: order.listingId },
            data: { status: "SOLD" },
          }),
        ]);

        const eventName = order.listing.event.name;
        await Promise.all([
          sendOrderConfirmedEmail(
            order.buyer.email,
            eventName,
            formatCents(order.totalChargedCents, order.currency),
          ),
          sendTicketSoldEmail(
            order.listing.seller.email,
            eventName,
            formatCents(order.listing.pricePerTicketCents * order.quantity - order.sellerFeeCents, order.currency),
          ),
        ]);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const order = await prisma.order.findUnique({
        where: { stripePaymentIntentId: paymentIntent.id },
      });
      if (order && order.status === "PENDING_PAYMENT") {
        await prisma.$transaction([
          prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } }),
          prisma.listing.update({ where: { id: order.listingId }, data: { status: "ACTIVE" } }),
        ]);
      }
      break;
    }

    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      await prisma.stripeConnectAccount.updateMany({
        where: { stripeAccountId: account.id },
        data: {
          chargesEnabled: account.charges_enabled ?? false,
          payoutsEnabled: account.payouts_enabled ?? false,
          detailsSubmitted: account.details_submitted ?? false,
        },
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
