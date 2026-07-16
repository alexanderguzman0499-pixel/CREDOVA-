import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const bulkEventSchema = z.object({
  events: z
    .array(
      z.object({
        name: z.string().min(1),
        category: z.enum(["CONCERT", "SPORTS", "THEATER", "OTHER"]),
        venue: z.string().min(1),
        city: z.string().min(1),
        country: z.string().min(1),
        eventDate: z.string().datetime(),
      }),
    )
    .min(1)
    .max(500),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bulkEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const result = await prisma.event.createMany({
    data: parsed.data.events.map((e) => ({ ...e, eventDate: new Date(e.eventDate) })),
  });

  return NextResponse.json({ created: result.count }, { status: 201 });
}
