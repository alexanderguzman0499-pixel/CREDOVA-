import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { releaseEscrowToSeller } from "@/lib/escrow";
import { prisma } from "@/lib/prisma";

/**
 * Buyer confirms the ticket was valid / they got into the event.
 * Releases escrow to the seller immediately instead of waiting for the
 * default post-event holding window.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.buyerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (order.status !== "PAID_ESCROW" && order.status !== "DELIVERED") {
    return NextResponse.json(
      { error: `Order cannot be confirmed from status ${order.status}.` },
      { status: 409 },
    );
  }

  await prisma.order.update({
    where: { id },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  });

  const updated = await releaseEscrowToSeller(id);
  return NextResponse.json({ order: updated });
}
