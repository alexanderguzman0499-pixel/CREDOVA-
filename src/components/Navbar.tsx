"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function Navbar() {
  const { status } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-gold-200/60 bg-white/90 backdrop-blur dark:border-navy-800 dark:bg-navy-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-navy-900 dark:text-white">
          <Image src="/logo-icon.png" alt="" width={36} height={36} className="rounded-lg" priority />
          Global Ticket Resale
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 sm:flex">
          <Link href="/events" className="hover:text-gold-600 dark:hover:text-gold-400">
            Buscar eventos
          </Link>
          <Link href="/sell/new" className="hover:text-gold-600 dark:hover:text-gold-400">
            Vender boletos
          </Link>
          <Link href="/how-it-works" className="hover:text-gold-600 dark:hover:text-gold-400">
            Cómo funciona
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {status === "authenticated" ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-700 hover:text-gold-600 dark:hover:text-gold-400 dark:text-slate-200"
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
                className="text-sm font-medium text-slate-700 hover:text-gold-600 dark:hover:text-gold-400 dark:text-slate-200"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-navy-900 px-4 py-1.5 text-sm font-semibold text-white hover:bg-navy-800"
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
