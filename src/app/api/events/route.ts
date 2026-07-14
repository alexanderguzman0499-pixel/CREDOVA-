import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createEventSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.enum(["CONCERT", "SPORTS", "THEATER", "OTHER"]),
  venue: z.string().min(1).max(200),
  city: z.string().min(1).max(120),
  country: z.string().min(1).max(120),
  eventDate: z.string().datetime(),
  imageUrl: z.string().url().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const city = searchParams.get("city")?.trim();
  const category = searchParams.get("category");

  const events = await prisma.event.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(category ? { category: category as never } : {}),
      eventDate: { gte: new Date() },
    },
    orderBy: { eventDate: "asc" },
    take: 50,
  });

  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const event = await prisma.event.create({
    data: {
      ...parsed.data,
      eventDate: new Date(parsed.data.eventDate),
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}
