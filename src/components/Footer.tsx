import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>&copy; {new Date().getFullYear()} Global Ticket Resale. Comisión más baja del mercado: 7% + 7%.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/terms" className="hover:text-emerald-600">
            Términos de servicio
          </Link>
          <Link href="/privacy" className="hover:text-emerald-600">
            Privacidad
          </Link>
          <Link href="/refund-policy" className="hover:text-emerald-600">
            Garantía y reembolsos
          </Link>
        </div>
      </div>
    </footer>
  );
}
