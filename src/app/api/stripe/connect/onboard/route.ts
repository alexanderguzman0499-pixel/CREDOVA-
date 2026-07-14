import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Creates (or reuses) a Stripe Express connected account for the current
 * user and returns an onboarding link. Sellers must complete this before
 * they can receive escrow payouts — see /api/orders/[id]/confirm.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { stripeConnect: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  let stripeAccountId = user.stripeConnect?.stripeAccountId;

  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
    });
    stripeAccountId = account.id;

    await prisma.stripeConnectAccount.create({
      data: { userId: user.id, stripeAccountId },
    });
  }

  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${APP_URL}/sell/onboarding?refresh=1`,
    return_url: `${APP_URL}/sell/onboarding?complete=1`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
