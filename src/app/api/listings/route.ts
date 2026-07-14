import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { computePriceBreakdown } from "@/lib/fees";
import { prisma } from "@/lib/prisma";
import { storeTicketFile } from "@/lib/storage";

const listingFieldsSchema = z.object({
  eventId: z.string().min(1),
  title: z.string().min(1).max(200),
  section: z.string().max(80).optional(),
  row: z.string().max(80).optional(),
  quantity: z.coerce.number().int().min(1).max(20),
  pricePerTicketCents: z.coerce.number().int().min(100),
  currency: z.string().length(3).default("usd"),
});

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["application/pdf", "image/png", "image/jpeg"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  const q = searchParams.get("q")?.trim();
  const city = searchParams.get("city")?.trim();
  const category = searchParams.get("category");

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      ...(eventId ? { eventId } : {}),
      event: {
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
        ...(category ? { category: category as never } : {}),
      },
    },
    include: { event: true },
    orderBy: { pricePerTicketCents: "asc" },
    take: 100,
  });

  const withPricing = listings.map((listing) => ({
    ...listing,
    pricing: computePriceBreakdown(listing.pricePerTicketCents, 1),
  }));

  return NextResponse.json({ listings: withPricing });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "A ticket file (PDF or screenshot) is required." },
      { status: 400 },
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File too large (max 10MB)." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use PDF, PNG or JPEG." },
      { status: 400 },
    );
  }

  const parsed = listingFieldsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const event = await prisma.event.findUnique({ where: { id: parsed.data.eventId } });
  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const stored = await storeTicketFile(file);

  // Duplicate ticket detection: the same underlying file (barcode/PDF) cannot
  // back two live listings, whether from the same seller or two different
  // accounts trying to resell one ticket twice.
  const duplicate = await prisma.listing.findFirst({
    where: { fileHash: stored.sha256, status: { in: ["ACTIVE", "PENDING_SALE", "SOLD"] } },
  });
  if (duplicate) {
    return NextResponse.json(
      {
        error:
          "This ticket file matches a listing that already exists on the platform. Duplicate or already-sold tickets cannot be listed again.",
      },
      { status: 409 },
    );
  }

  const listing = await prisma.listing.create({
    data: {
      sellerId: session.user.id,
      eventId: parsed.data.eventId,
      title: parsed.data.title,
      section: parsed.data.section,
      row: parsed.data.row,
      quantity: parsed.data.quantity,
      pricePerTicketCents: parsed.data.pricePerTicketCents,
      currency: parsed.data.currency,
      fileKey: stored.key,
      fileHash: stored.sha256,
    },
  });

  return NextResponse.json({ listing }, { status: 201 });
}
