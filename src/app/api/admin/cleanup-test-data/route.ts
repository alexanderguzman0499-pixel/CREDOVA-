import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Deletes events (and their listings/orders/refund requests) whose name
 * contains "test" (case-insensitive) — matches the smoke-test data created
 * while verifying the deploy (e.g. "Concierto E2E Test"). Scoped to a name
 * match rather than a blanket wipe so it can't accidentally take out real
 * listings.
 */
export async function POST() {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const testEvents = await prisma.event.findMany({
    where: { name: { contains: "test", mode: "insensitive" } },
    select: { id: true, name: true },
  });

  if (testEvents.length === 0) {
    return NextResponse.json({ deletedEvents: 0, eventNames: [] });
  }

  const eventIds = testEvents.map((e) => e.id);
  const listings = await prisma.listing.findMany({
    where: { eventId: { in: eventIds } },
    select: { id: true },
  });
  const listingIds = listings.map((l) => l.id);
  const orders = await prisma.order.findMany({
    where: { listingId: { in: listingIds } },
    select: { id: true },
  });
  const orderIds = orders.map((o) => o.id);

  await prisma.$transaction([
    prisma.refundRequest.deleteMany({ where: { orderId: { in: orderIds } } }),
    prisma.order.deleteMany({ where: { id: { in: orderIds } } }),
    prisma.listing.deleteMany({ where: { id: { in: listingIds } } }),
    prisma.event.deleteMany({ where: { id: { in: eventIds } } }),
  ]);

  return NextResponse.json({ deletedEvents: testEvents.length, eventNames: testEvents.map((e) => e.name) });
}
