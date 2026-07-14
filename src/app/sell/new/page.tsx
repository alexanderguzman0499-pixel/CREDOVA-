"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface EventOption {
  id: string;
  name: string;
  city: string;
  eventDate: string;
}

const CATEGORIES = [
  { value: "CONCERT", label: "Concierto" },
  { value: "SPORTS", label: "Deportes" },
  { value: "THEATER", label: "Teatro" },
  { value: "OTHER", label: "Otro" },
];

export default function NewListingPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventOption[]>([]);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [eventId, setEventId] = useState("");
  const [newEvent, setNewEvent] = useState({
    name: "",
    category: "CONCERT",
    venue: "",
    city: "",
    country: "",
    eventDate: "",
  });
  const [listingFields, setListingFields] = useState({
    title: "",
    section: "",
    row: "",
    quantity: "1",
    price: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Sube el PDF o captura de tu boleto (código de barras visible).");
      return;
    }

    setSubmitting(true);

    let finalEventId = eventId;
    if (mode === "new") {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newEvent, eventDate: new Date(newEvent.eventDate).toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear el evento.");
        setSubmitting(false);
        return;
      }
      finalEventId = data.event.id;
    }

    const formData = new FormData();
    formData.set("eventId", finalEventId);
    formData.set("title", listingFields.title);
    formData.set("section", listingFields.section);
    formData.set("row", listingFields.row);
    formData.set("quantity", listingFields.quantity);
    formData.set("pricePerTicketCents", String(Math.round(Number(listingFields.price) * 100)));
    formData.set("currency", "usd");
    formData.set("file", file);

    const res = await fetch("/api/listings", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo publicar el boleto.");
      setSubmitting(false);
      return;
    }

    router.push(`/events/${finalEventId}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vender un boleto</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Publicar es gratis. Solo pagas el 7% cuando tu boleto se vende, y el dinero te llega automáticamente después
        del evento (o antes, si el comprador confirma que todo está bien).
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <legend className="px-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Evento</legend>

          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" checked={mode === "existing"} onChange={() => setMode("existing")} />
              Elegir evento existente
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={mode === "new"} onChange={() => setMode("new")} />
              Crear nuevo evento
            </label>
          </div>

          {mode === "existing" ? (
            <select
              required
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">Selecciona un evento…</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} · {ev.city} · {new Date(ev.eventDate).toLocaleDateString()}
                </option>
              ))}
            </select>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                placeholder="Nombre del evento"
                value={newEvent.name}
                onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 sm:col-span-2 dark:border-slate-700 dark:bg-slate-900"
              />
              <select
                value={newEvent.category}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                required
                type="datetime-local"
                value={newEvent.eventDate}
                onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
              />
              <input
                required
                placeholder="Recinto / estadio"
                value={newEvent.venue}
                onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
              />
              <input
                required
                placeholder="Ciudad"
                value={newEvent.city}
                onChange={(e) => setNewEvent({ ...newEvent, city: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
              />
              <input
                required
                placeholder="País"
                value={newEvent.country}
                onChange={(e) => setNewEvent({ ...newEvent, country: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <legend className="px-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Detalles del boleto</legend>
          <input
            required
            placeholder="Título (ej. General, VIP, Sección 102)"
            value={listingFields.title}
            onChange={(e) => setListingFields({ ...listingFields, title: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
          <div className="grid gap-3 sm:grid-cols-4">
            <input
              placeholder="Sección"
              value={listingFields.section}
              onChange={(e) => setListingFields({ ...listingFields, section: e.target.value })}
              className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
            <input
              placeholder="Fila"
              value={listingFields.row}
              onChange={(e) => setListingFields({ ...listingFields, row: e.target.value })}
              className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
            <input
              required
              type="number"
              min={1}
              max={20}
              placeholder="Cantidad"
              value={listingFields.quantity}
              onChange={(e) => setListingFields({ ...listingFields, quantity: e.target.value })}
              className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
            <input
              required
              type="number"
              min={1}
              step="0.01"
              placeholder="Precio por boleto (USD)"
              value={listingFields.price}
              onChange={(e) => setListingFields({ ...listingFields, price: e.target.value })}
              className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Sube tu boleto (PDF o captura con el código de barras)
            </label>
            <input
              required
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Verificamos automáticamente que este boleto no se haya publicado antes en la plataforma.
            </p>
          </div>
        </fieldset>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
        >
          {submitting ? "Publicando…" : "Publicar boleto"}
        </button>
      </form>
    </div>
  );
}
