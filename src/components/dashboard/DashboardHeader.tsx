"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Scissors } from "lucide-react";

/** Slim dark header shared by the Vendor and Admin dashboards. */
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500 text-zinc-950">
              <Scissors className="h-4 w-4" />
            </span>
            <span className="font-display text-lg tracking-[0.3em] text-white">STITCH</span>
          </Link>
          <span className="hidden h-5 w-px bg-white/15 sm:block" />
          <span className="hidden text-sm text-zinc-400 sm:block">{subtitle}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-400 md:block">
            {badge}
          </span>
          <span className="hidden text-sm text-zinc-400 lg:block">{email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-zinc-300 transition-colors hover:border-red-500/50 hover:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
