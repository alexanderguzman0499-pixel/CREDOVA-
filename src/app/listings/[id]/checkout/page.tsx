import { notFound, redirect } from "next/navigation";

import { CheckoutForm } from "@/components/CheckoutForm";
import { auth } from "@/lib/auth";
import { computePriceBreakdown, formatCents } from "@/lib/fees";
import { prisma } from "@/lib/prisma";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/listings/${id}/checkout`);
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { event: true },
  });
  if (!listing || listing.status !== "ACTIVE") notFound();

  const pricing = computePriceBreakdown(listing.pricePerTicketCents, 1);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Confirmar compra</h1>

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <p className="font-semibold text-slate-900 dark:text-white">{listing.event.name}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {listing.event.venue} · {listing.event.city}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{listing.title}</p>

          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Precio del boleto</dt>
              <dd>{formatCents(pricing.subtotalCents, listing.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500 dark:text-slate-400">Comisión de servicio (7%)</dt>
              <dd>{formatCents(pricing.buyerFeeCents, listing.currency)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900 dark:border-slate-800 dark:text-white">
              <dt>Total a pagar</dt>
              <dd>{formatCents(pricing.totalChargedCents, listing.currency)}</dd>
            </div>
          </dl>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Ningún cargo adicional al finalizar: este es el precio final, todo incluido.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <CheckoutForm listingId={listing.id} />
        </div>
      </div>
    </div>
  );
}
