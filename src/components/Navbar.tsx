"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function Navbar() {
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            GT
          </span>
          GlobalTix
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 sm:flex">
          <Link href="/events" className="hover:text-emerald-600">
            Buscar eventos
          </Link>
          <Link href="/sell/new" className="hover:text-emerald-600">
            Vender boletos
          </Link>
          <Link href="/how-it-works" className="hover:text-emerald-600">
            Cómo funciona
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {status === "authenticated" ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-700 hover:text-emerald-600 dark:text-slate-200"
              >
                Mi panel
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-emerald-600 dark:text-slate-200"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
