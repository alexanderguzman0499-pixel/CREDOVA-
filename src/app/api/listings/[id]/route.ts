import { NextResponse } from "next/server";

import { computePriceBreakdown } from "@/lib/fees";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { event: true, seller: { select: { id: true, name: true } } },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  return NextResponse.json({
    listing: { ...listing, pricing: computePriceBreakdown(listing.pricePerTicketCents, 1) },
  });
}
