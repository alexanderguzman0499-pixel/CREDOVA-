import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { computePriceBreakdown, formatCents } from "@/lib/fees";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return {};

  const title = `${event.name} tickets — ${event.city} | Global Ticket Resale`;
  const description = `Buy tickets for ${event.name} at ${event.venue}, ${event.city} on ${new Date(
    event.eventDate,
  ).toLocaleDateString("en-US", { dateStyle: "long" })}. All-inclusive pricing, escrow-protected, 7% + 7% fees.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: event.imageUrl ? [event.imageUrl] : undefined,
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      listings: {
        where: { status: "ACTIVE" },
        orderBy: { pricePerTicketCents: "asc" },
        include: { seller: { select: { identityVerified: true } } },
      },
    },
  });

  if (!event) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-gold-700 dark:text-gold-400">{event.category}</p>
      <h1 className="mt-1 text-3xl font-bold text-navy-900 dark:text-white">{event.name}</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        {event.venue} · {event.city}, {event.country} ·{" "}
        {new Date(event.eventDate).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
      </p>

      <h2 className="mt-10 text-xl font-bold text-navy-900 dark:text-white">
        Available tickets ({event.listings.length})
      </h2>

      <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {event.listings.map((listing) => {
          const pricing = computePriceBreakdown(listing.pricePerTicketCents, 1);
          return (
            <div key={listing.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  {listing.title}
                  {listing.seller.identityVerified && (
                    <span
                      title="Seller identity verified"
                      className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-950"
                    >
                      ✓ Verified
                    </span>
                  )}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {listing.section ? `Section ${listing.section}` : "General admission"}
                  {listing.row ? ` · Row ${listing.row}` : ""} · {listing.quantity} available
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCents(pricing.totalChargedCents, listing.currency)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">All-inclusive total price</p>
                <Link
                  href={`/listings/${listing.id}/checkout`}
                  className="mt-2 inline-block rounded-full bg-navy-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-navy-800"
                >
                  Buy
                </Link>
              </div>
            </div>
          );
        })}
        {event.listings.length === 0 && (
          <p className="p-6 text-slate-500 dark:text-slate-400">
            No tickets have been listed for this event yet.{" "}
            <Link href="/sell/new" className="font-medium text-gold-700 hover:underline dark:text-gold-400">
              Be the first to sell one
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
