import { NextResponse } from "next/server";

import { findDueEscrowOrders, releaseEscrowToSeller } from "@/lib/escrow";
import { isAuthorizedCronRequest } from "@/lib/cronAuth";

/**
 * Scheduled job (see vercel.json `crons`) that pays out every order whose
 * escrow holding window has elapsed with no open refund request. Runs
 * hourly; each order is released independently so one failure (e.g. a
 * seller's Connect account got restricted) doesn't block the rest — failures
 * are reported in the response body for observability rather than thrown.
 */
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dueOrders = await findDueEscrowOrders();

  const results = await Promise.allSettled(
    dueOrders.map((order) => releaseEscrowToSeller(order.id)),
  );

  const released = results.filter((r) => r.status === "fulfilled").length;
  const failed = results
    .map((r, i) => (r.status === "rejected" ? { orderId: dueOrders[i].id, error: String(r.reason) } : null))
    .filter((x): x is { orderId: string; error: string } => x !== null);

  return NextResponse.json({ checked: dueOrders.length, released, failed });
}
