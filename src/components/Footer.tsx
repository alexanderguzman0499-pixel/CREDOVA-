import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gold-900/30 bg-navy-950 py-10 text-sm text-navy-200">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          &copy; {new Date().getFullYear()} Global Ticket Resale.{" "}
          <span className="text-gold-400">Comisión más baja del mercado: 7% + 7%.</span>
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/terms" className="hover:text-gold-400">
            Términos de servicio
          </Link>
          <Link href="/privacy" className="hover:text-gold-400">
            Privacidad
          </Link>
          <Link href="/refund-policy" className="hover:text-gold-400">
            Garantía y reembolsos
          </Link>
        </div>
      </div>
    </footer>
  );
}
