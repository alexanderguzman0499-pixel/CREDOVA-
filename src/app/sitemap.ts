import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await prisma.event.findMany({
    where: { eventDate: { gte: new Date() } },
    select: { id: true, updatedAt: true },
    take: 5000,
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: APP_URL, changeFrequency: "daily", priority: 1 },
    { url: `${APP_URL}/events`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${APP_URL}/how-it-works`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${APP_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${APP_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${APP_URL}/refund-policy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const eventRoutes: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${APP_URL}/events/${event.id}`,
    lastModified: event.updatedAt,
    changeFrequency: "hourly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...eventRoutes];
}
