import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await prisma.stripeConnectAccount.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({
    connected: Boolean(account),
    chargesEnabled: account?.chargesEnabled ?? false,
    payoutsEnabled: account?.payoutsEnabled ?? false,
    detailsSubmitted: account?.detailsSubmitted ?? false,
  });
}
