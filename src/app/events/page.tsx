import Link from "next/link";

import { prisma } from "@/lib/prisma";

const CATEGORIES = [
  { value: "", label: "Todas" },
  { value: "CONCERT", label: "Conciertos" },
  { value: "SPORTS", label: "Deportes" },
  { value: "THEATER", label: "Teatro" },
  { value: "OTHER", label: "Otros" },
] as const;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; category?: string }>;
}) {
  const { q, city, category } = await searchParams;

  const events = await prisma.event.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(category ? { category: category as never } : {}),
      eventDate: { gte: new Date() },
    },
    orderBy: { eventDate: "asc" },
    include: { _count: { select: { listings: true } } },
    take: 60,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Buscar eventos</h1>

      <form className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Artista, equipo o evento"
          className="min-w-[220px] flex-1 rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
        />
        <input
          type="text"
          name="city"
          defaultValue={city}
          placeholder="Ciudad"
          className="w-48 rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
        />
        <select
          name="category"
          defaultValue={category ?? ""}
          className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-500"
        >
          Buscar
        </button>
      </form>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{event.category}</p>
            <h2 className="mt-1 font-bold text-slate-900 dark:text-white">{event.name}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {event.venue} · {event.city}, {event.country}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {new Date(event.eventDate).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {event._count.listings} boleto(s) disponible(s)
            </p>
          </Link>
        ))}
        {events.length === 0 && (
          <p className="col-span-full text-slate-500 dark:text-slate-400">
            No encontramos eventos con esos filtros todavía.
          </p>
        )}
      </div>
    </div>
  );
}
