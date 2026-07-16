import Link from "next/link";
import { notFound } from "next/navigation";

import { computePriceBreakdown, formatCents } from "@/lib/fees";
import { prisma } from "@/lib/prisma";

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
        {new Date(event.eventDate).toLocaleString("es-ES", { dateStyle: "full", timeStyle: "short" })}
      </p>

      <h2 className="mt-10 text-xl font-bold text-navy-900 dark:text-white">
        Boletos disponibles ({event.listings.length})
      </h2>

      <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {event.listings.map((listing) => {
          const pricing = computePriceBreakdown(listing.pricePerTicketCents, 1);
          return (
            <div key={listing.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{listing.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {listing.section ? `Sección ${listing.section}` : "Sección general"}
                  {listing.row ? ` · Fila ${listing.row}` : ""} · {listing.quantity} disponible(s)
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatCents(pricing.totalChargedCents, listing.currency)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Precio total, todo incluido</p>
                <Link
                  href={`/listings/${listing.id}/checkout`}
                  className="mt-2 inline-block rounded-full bg-navy-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-navy-800"
                >
                  Comprar
                </Link>
              </div>
            </div>
          );
        })}
        {event.listings.length === 0 && (
          <p className="p-6 text-slate-500 dark:text-slate-400">
            Todavía no hay boletos publicados para este evento.{" "}
            <Link href="/sell/new" className="font-medium text-gold-700 hover:underline dark:text-gold-400">
              Sé el primero en vender uno
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
