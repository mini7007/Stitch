"use client";
import { signIn, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { roleHome } from "@/lib/roles";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [oauthError, setOauthError] = useState(false);

  // NextAuth redirects back here with ?error=Callback when the OAuth round
  // trip fails (e.g. consent denied / app in Testing mode without the
  // account added as a test user) — surface it instead of failing silently.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("error")) {
      setOauthError(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPending(true);
    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setError("Invalid email or password");
      setPending(false);
      return;
    }
    // Route each role to its own workspace
    const session = await getSession();
    router.push(roleHome(session?.user?.role));
    router.refresh();
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 p-6">
      {/* ambient glows */}
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-amber-600/10 blur-[140px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-amber-500/10 blur-[140px]" />

      {/* golden-border card */}
      <div className="relative w-full max-w-md rounded-[26px] bg-gradient-to-b from-amber-400/80 via-amber-600/25 to-amber-400/60 p-[1.5px] shadow-[0_0_80px_-20px_rgba(245,158,11,0.45)]">
        <div className="overflow-hidden rounded-[24px] bg-zinc-950">
          {/* golden top edge */}
          <div className="h-1 w-full bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700" />

          <div className="p-8 sm:p-10">
            <div className="mb-8 text-center">
              <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-amber-500 text-zinc-950 shadow-[0_0_36px_-6px_rgba(245,158,11,0.7)]">
                <Sparkles className="h-5 w-5" />
              </span>
              <h1 className="font-display text-3xl text-white">Sign in to Stitch</h1>
              <p className="mt-1.5 text-sm text-zinc-400">
                Welcome back — your tailor awaits
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Email
                </span>
                <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 transition-colors focus-within:border-amber-500/60">
                  <Mail className="h-4 w-4 text-zinc-600" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent py-3 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Password
                </span>
                <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 transition-colors focus-within:border-amber-500/60">
                  <Lock className="h-4 w-4 text-zinc-600" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent py-3 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none"
                  />
                </div>
              </label>

              {oauthError && (
                <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                  Google sign-in was cancelled or blocked. If Google showed
                  &ldquo;Access blocked&rdquo;, add your account as a Test user on the
                  OAuth consent screen (see README) and try again.
                </p>
              )}

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_0_30px_-8px_rgba(245,158,11,0.7)] transition-all hover:bg-amber-400 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
              >
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* OAuth divider */}
            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-600">
                or
              </span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <GoogleSignInButton />

            <p className="mt-8 text-center text-xs text-zinc-500">
              New to Stitch?{" "}
              <Link href="/signup" className="font-semibold text-amber-400 hover:text-amber-300">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
