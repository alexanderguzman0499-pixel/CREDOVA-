import { NextResponse } from "next/server";

import { isAuthorizedCronRequest } from "@/lib/cronAuth";
import { releaseEscrowToSeller } from "@/lib/escrow";
import { prisma } from "@/lib/prisma";

/**
 * Manual/ops trigger to release a single order's escrow early — the
 * scheduled bulk release is /api/cron/release-escrow. Protected by the same
 * CRON_SECRET bearer token so it isn't exposed to end users.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { refundRequests: true },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.status !== "PAID_ESCROW" && order.status !== "DELIVERED") {
    return NextResponse.json(
      { error: `Nothing to release for status ${order.status}.` },
      { status: 409 },
    );
  }
  if (!order.escrowReleaseAt || order.escrowReleaseAt > new Date()) {
    return NextResponse.json({ error: "Escrow release window has not elapsed yet." }, { status: 409 });
  }
  const hasOpenRefund = order.refundRequests.some((r) => r.status === "REQUESTED" || r.status === "APPROVED");
  if (hasOpenRefund) {
    return NextResponse.json({ error: "Order has an open refund request." }, { status: 409 });
  }

  const updated = await releaseEscrowToSeller(id);
  return NextResponse.json({ order: updated });
}
