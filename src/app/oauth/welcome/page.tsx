"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";
import { Loader2, Scissors } from "lucide-react";
import { roleHome } from "@/lib/roles";

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

/**
 * Bridge page the Google OAuth flow lands on (callbackUrl of the Google
 * button). It applies the role chosen before the redirect (stored in a
 * short-lived cookie) via /api/auth/oauth-role, then routes to the
 * role's home. The jwt callback re-syncs the role from the database on
 * the session access below, so the very next page sees the final role.
 */
export default function OAuthWelcome() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const role = readCookie("stitch_oauth_role");
      const inviteCode = readCookie("stitch_oauth_invite");
      clearCookie("stitch_oauth_role");
      clearCookie("stitch_oauth_invite");

      if (role) {
        await fetch("/api/auth/oauth-role", {
          method: "POST",
          headers: { "content-type": "application/json" },
          // omit inviteCode entirely when there is none (never send null)
          body: JSON.stringify(inviteCode ? { role, inviteCode } : { role }),
        }).catch(() => null);
      }

      const session = await getSession();
      router.replace(roleHome(session?.user?.role));
      router.refresh();
    })();
  }, [router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950">
      {/* ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-amber-600/10 blur-[140px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-amber-500/10 blur-[140px]" />

      <div className="relative flex flex-col items-center gap-5 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-500 text-zinc-950 shadow-[0_0_36px_-6px_rgba(245,158,11,0.7)]">
          <Scissors className="h-6 w-6" />
        </span>
        <h1 className="font-display text-2xl text-white">Threading you in…</h1>
        <p className="flex items-center gap-2 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
          Completing your Google sign-in
        </p>
      </div>
    </main>
  );
}
