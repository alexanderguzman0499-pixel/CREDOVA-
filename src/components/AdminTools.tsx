"use client";

import { useState } from "react";

const CATEGORIES = ["CONCERT", "SPORTS", "THEATER", "OTHER"];

interface ParsedEvent {
  name: string;
  category: string;
  venue: string;
  city: string;
  country: string;
  eventDate: string;
}

function parseCsv(text: string): { events: ParsedEvent[]; errors: string[] } {
  const events: ParsedEvent[] = [];
  const errors: string[] = [];

  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line, i) => {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length !== 6) {
        errors.push(`Line ${i + 1}: expected 6 fields (name,category,venue,city,country,date), got ${parts.length}.`);
        return;
      }
      const [name, category, venue, city, country, dateStr] = parts;
      if (!CATEGORIES.includes(category.toUpperCase())) {
        errors.push(`Line ${i + 1}: category "${category}" must be one of ${CATEGORIES.join(", ")}.`);
        return;
      }
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) {
        errors.push(`Line ${i + 1}: "${dateStr}" isn't a valid date. Use e.g. 2026-12-31T20:00:00Z.`);
        return;
      }
      events.push({ name, category: category.toUpperCase(), venue, city, country, eventDate: date.toISOString() });
    });

  return { events, errors };
}

export function AdminBulkEventImport() {
  const [csv, setCsv] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleImport() {
    setMessage(null);
    const { events, errors: parseErrors } = parseCsv(csv);
    if (parseErrors.length > 0) {
      setErrors(parseErrors);
      return;
    }
    if (events.length === 0) {
      setErrors(["Paste at least one row first."]);
      return;
    }
    setErrors([]);
    setSubmitting(true);
    const res = await fetch("/api/admin/events/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setErrors([data.error ?? "Import failed."]);
      return;
    }
    setMessage(`Created ${data.created} event(s).`);
    setCsv("");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-semibold text-navy-900 dark:text-white">Bulk import events</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        One event per line: <code>name,category,venue,city,country,date</code>. Category must be CONCERT, SPORTS,
        THEATER, or OTHER. Date in ISO format (e.g. 2026-12-31T20:00:00Z).
      </p>
      <textarea
        value={csv}
        onChange={(e) => setCsv(e.target.value)}
        rows={8}
        placeholder={"Taylor Swift — Eras Tour,CONCERT,SoFi Stadium,Los Angeles,USA,2026-09-12T19:30:00Z\nLakers vs Celtics,SPORTS,Crypto.com Arena,Los Angeles,USA,2026-10-03T19:00:00Z"}
        className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
      />
      {errors.length > 0 && (
        <ul className="mt-2 list-disc pl-5 text-sm text-red-600">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}
      {message && <p className="mt-2 text-sm text-gold-700 dark:text-gold-400">{message}</p>}
      <button
        onClick={handleImport}
        disabled={submitting}
        className="mt-4 rounded-full bg-navy-900 px-5 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
      >
        {submitting ? "Importing…" : "Import events"}
      </button>
    </div>
  );
}

export function AdminCleanupTestData() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleCleanup() {
    if (!confirm("Delete every event whose name contains \"test\" (and its listings/orders)? This can't be undone.")) {
      return;
    }
    setBusy(true);
    setResult(null);
    const res = await fetch("/api/admin/cleanup-test-data", { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setResult(data.error ?? "Cleanup failed.");
      return;
    }
    setResult(
      data.deletedEvents === 0
        ? "No test events found — nothing to delete."
        : `Deleted ${data.deletedEvents} event(s): ${data.eventNames.join(", ")}`,
    );
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
      <h2 className="font-semibold text-red-800 dark:text-red-300">Clean up test data</h2>
      <p className="mt-1 text-sm text-red-700 dark:text-red-300">
        Permanently deletes every event whose name contains &quot;test&quot;, along with its listings, orders, and
        refund requests. Use this to clear out smoke-test data from production.
      </p>
      {result && <p className="mt-2 text-sm font-medium text-red-800 dark:text-red-200">{result}</p>}
      <button
        onClick={handleCleanup}
        disabled={busy}
        className="mt-4 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
      >
        {busy ? "Deleting…" : "Delete test data"}
      </button>
    </div>
  );
}
