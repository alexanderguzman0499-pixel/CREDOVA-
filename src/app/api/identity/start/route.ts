import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  if (user.identityVerified) {
    return NextResponse.json({ error: "Identity already verified." }, { status: 409 });
  }

  try {
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: "document",
      metadata: { userId: user.id },
      options: { document: { require_matching_selfie: true } },
      return_url: `${APP_URL}/dashboard?identity=complete`,
    });

    if (!verificationSession.url) {
      throw new Error("Stripe did not return a verification URL.");
    }

    return NextResponse.json({ url: verificationSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Couldn't start identity verification: ${message}` },
      { status: 502 },
    );
  }
}
