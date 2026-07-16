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
  { value: "CONCERT", label: "Concert" },
  { value: "SPORTS", label: "Sports" },
  { value: "THEATER", label: "Theater" },
  { value: "OTHER", label: "Other" },
];

export default function NewListingPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventOption[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [mode, setMode] = useState<"existing" | "new">("new");
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
      .then((data) => {
        setEvents(data.events ?? []);
        setEventsLoaded(true);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Upload your ticket's PDF or screenshot (barcode visible).");
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
        setError(data.error ?? "Couldn't create the event.");
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
      setError(data.error ?? "Couldn't publish the ticket.");
      setSubmitting(false);
      return;
    }

    router.push(`/events/${finalEventId}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Sell a ticket</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Listing is free. You only pay the 7% fee when your ticket sells, and the money reaches you automatically
        after the event (or sooner, if the buyer confirms everything went fine).
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <legend className="px-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Event</legend>

          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" checked={mode === "new"} onChange={() => setMode("new")} />
              Create a new event
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={mode === "existing"} onChange={() => setMode("existing")} />
              Choose an existing event
            </label>
          </div>

          {mode === "existing" ? (
            eventsLoaded && events.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                No events on the platform yet.{" "}
                <button type="button" onClick={() => setMode("new")} className="font-medium text-gold-700 underline dark:text-gold-400">
                  Create the first one
                </button>
                .
              </p>
            ) : (
              <select
                required
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="">Select an event…</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} · {ev.city} · {new Date(ev.eventDate).toLocaleDateString("en-US")}
                  </option>
                ))}
              </select>
            )
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                placeholder="Event name"
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
                placeholder="Venue"
                value={newEvent.venue}
                onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
              />
              <input
                required
                placeholder="City"
                value={newEvent.city}
                onChange={(e) => setNewEvent({ ...newEvent, city: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
              />
              <input
                required
                placeholder="Country"
                value={newEvent.country}
                onChange={(e) => setNewEvent({ ...newEvent, country: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <legend className="px-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Ticket details</legend>
          <input
            required
            placeholder="Title (e.g. General, VIP, Section 102)"
            value={listingFields.title}
            onChange={(e) => setListingFields({ ...listingFields, title: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
          <div className="grid gap-3 sm:grid-cols-4">
            <input
              placeholder="Section"
              value={listingFields.section}
              onChange={(e) => setListingFields({ ...listingFields, section: e.target.value })}
              className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
            <input
              placeholder="Row"
              value={listingFields.row}
              onChange={(e) => setListingFields({ ...listingFields, row: e.target.value })}
              className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
            <input
              required
              type="number"
              min={1}
              max={20}
              placeholder="Quantity"
              value={listingFields.quantity}
              onChange={(e) => setListingFields({ ...listingFields, quantity: e.target.value })}
              className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
            <input
              required
              type="number"
              min={1}
              step="0.01"
              placeholder="Price per ticket (USD)"
              value={listingFields.price}
              onChange={(e) => setListingFields({ ...listingFields, price: e.target.value })}
              className="rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Upload your ticket (PDF or screenshot with the barcode)
            </label>
            <input
              required
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              We automatically check that this ticket hasn&apos;t already been listed on the platform.
            </p>
          </div>
        </fieldset>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-navy-900 px-5 py-3 font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
        >
          {submitting ? "Publishing…" : "Publish ticket"}
        </button>
      </form>
    </div>
  );
}
