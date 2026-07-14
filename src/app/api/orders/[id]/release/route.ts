import { NextResponse } from "next/server";

import { releaseEscrowToSeller } from "@/lib/escrow";
import { prisma } from "@/lib/prisma";

/**
 * Automatic escrow release once the holding window has elapsed with no
 * open refund request. Intended to be called by a scheduled job (e.g.
 * Vercel Cron hitting this per due order) rather than end users directly —
 * protect this route with a shared cron secret in production.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const cronSecret = request.headers.get("x-cron-secret");
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
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
