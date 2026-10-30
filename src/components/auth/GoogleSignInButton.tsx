"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Crown, Loader2, ShoppingBag, User } from "lucide-react";

/** Official multicolor Google "G" mark. */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.17 3.57-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.63H1.29a12 12 0 0 0 0 10.74l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.29 6.63l3.98 3.09C6.22 6.88 8.87 4.77 12 4.77z"
      />
    </svg>
  );
}

const OAUTH_ROLES = [
  { value: "CUSTOMER", label: "Customer", icon: User },
  { value: "VENDOR", label: "Vendor", icon: ShoppingBag },
  { value: "ADMIN", label: "Admin", icon: Crown },
] as const;

/**
 * Role-aware "Continue with Google".
 *
 * The user explicitly picks what they're signing up as BEFORE the OAuth
 * redirect. The choice rides along in short-lived cookies; after Google
 * returns, /oauth/welcome applies it server-side via /api/auth/oauth-role
 * (new Google users without a selection simply stay CUSTOMER).
 *
 * Renders ONLY when the Google provider is configured server-side
 * (detected via NextAuth's /api/auth/providers), so a blank
 * GOOGLE_CLIENT_ID in .env simply hides the whole block.
 */
export default function GoogleSignInButton({ className = "" }: { className?: string }) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string>("CUSTOMER");
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => (r.ok ? r.json() : null))
      .then((providers) => setEnabled(Boolean(providers?.google)))
      .catch(() => setEnabled(false));
  }, []);

  if (!enabled) return null;

  function startGoogleSignIn() {
    // Short-lived cookies, read (and cleared) by /oauth/welcome after the
    // redirect. The server still validates everything — these are intent only.
    document.cookie = `stitch_oauth_role=${role}; path=/; max-age=600; samesite=lax`;
    if (role === "ADMIN" && inviteCode) {
      document.cookie = `stitch_oauth_invite=${encodeURIComponent(inviteCode)}; path=/; max-age=600; samesite=lax`;
    }
    setLoading(true);
    signIn("google", { callbackUrl: "/oauth/welcome" });
  }

  return (
    <div className={className}>
      <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
        Continue with Google as
      </p>
      <div className="mb-3 grid grid-cols-3 gap-2">
        {OAUTH_ROLES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={`flex items-center justify-center gap-1.5 rounded-full border px-2 py-2 text-xs font-semibold transition-all active:scale-95 ${
              role === value
                ? "border-amber-500/60 bg-amber-500/10 text-amber-300 shadow-[0_0_20px_-6px_rgba(245,158,11,0.6)]"
                : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/25 hover:text-zinc-200"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {role === "ADMIN" && (
        <input
          type="password"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Admin invite code"
          autoComplete="off"
          className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-700 transition-colors focus:border-amber-500/60 focus:outline-none"
        />
      )}

      <button
        type="button"
        onClick={startGoogleSignIn}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3.5 text-sm font-semibold text-zinc-900 shadow-[0_0_30px_-12px_rgba(255,255,255,0.5)] transition-all hover:scale-[1.02] hover:bg-zinc-100 active:scale-95 disabled:opacity-70"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </button>
    </div>
  );
}
