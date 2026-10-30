"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Scissors } from "lucide-react";
import Wordmark from "@/components/Wordmark";

/** Slim light header shared by all dashboards. */
export default function DashboardHeader({
  subtitle,
  email,
  badge,
}: {
  subtitle: string;
  email?: string | null;
  badge: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-amber-500 text-zinc-950">
              <Scissors className="h-3.5 w-3.5" />
            </span>
            <Wordmark className="text-lg text-slate-900" />
          </Link>
          <span className="hidden h-5 w-px bg-slate-200 sm:block" />
          <span className="hidden text-sm text-slate-500 sm:block">{subtitle}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 md:block">
            {badge}
          </span>
          <span className="hidden text-sm text-slate-500 lg:block">{email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-sm text-slate-600 transition-colors hover:border-red-300 hover:text-red-600"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
