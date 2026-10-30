"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getSession, signIn } from "next-auth/react";
import { Crown, Loader2, Lock, Mail, ShoppingBag, Sparkles, User, X } from "lucide-react";
import { roleHome } from "@/lib/roles";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

/** One-tap demo accounts (seeded by prisma/seed.ts) — sleek, distinct pills. */
const DEMO_ACCOUNTS = [
  { label: "Admin", icon: Crown, email: "admin@stitch.dev", password: "admin123", pill: "border-amber-500/40 text-amber-400 hover:bg-amber-500/10" },
  { label: "Customer", icon: User, email: "customer@stitch.dev", password: "customer123", pill: "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10" },
  { label: "Vendor", icon: ShoppingBag, email: "vendor@stitch.dev", password: "vendor123", pill: "border-sky-500/40 text-sky-400 hover:bg-sky-500/10" },
];

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<string | null>(null); // "form" | demo label

  async function finishSignIn() {
    const session = await getSession();
    router.push(roleHome(session?.user?.role));
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending("form");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Invalid email or password. Try a demo account below.");
      setPending(null);
      return;
    }
    await finishSignIn();
  }

  async function handleDemo(account: (typeof DEMO_ACCOUNTS)[number]) {
    setError("");
    setPending(account.label);
    const res = await signIn("credentials", {
      email: account.email,
      password: account.password,
      redirect: false,
    });
    if (res?.error) {
      setError("Demo sign-in failed — is the database seeded?");
      setPending(null);
      return;
    }
    await finishSignIn();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* backdrop */}
          <motion.div
            className="absolute inset-0 bg-zinc-950/85 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* panel with elegant golden border */}
          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="relative w-full max-w-md rounded-[26px] bg-gradient-to-b from-amber-400/80 via-amber-600/25 to-amber-400/60 p-[1.5px] shadow-[0_0_80px_-20px_rgba(245,158,11,0.45)]"
          >
            <div className="overflow-hidden rounded-[24px] bg-zinc-950">
              {/* golden top edge */}
              <div className="h-1 w-full bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700" />

              <button
                onClick={onClose}
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-100"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-8">
                <div className="mb-7 text-center">
                  <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-amber-500 text-zinc-950 shadow-[0_0_36px_-6px_rgba(245,158,11,0.7)]">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <h2 className="font-display text-3xl text-white">Welcome back</h2>
                  <p className="mt-1.5 text-sm text-zinc-400">
                    Sign in to book tailors &amp; cobblers near you
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

                  {error && (
                    <motion.p
                      initial={{ x: 0 }}
                      animate={{ x: [0, -8, 8, -5, 5, 0] }}
                      transition={{ duration: 0.4 }}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={pending !== null}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_0_30px_-8px_rgba(245,158,11,0.7)] transition-all hover:bg-amber-400 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                  >
                    {pending === "form" ? (
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

                {/* divider */}
                <div className="my-7 flex items-center gap-3">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-600">
                    Quick demo login
                  </span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                {/* sleek, distinct pills */}
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  {DEMO_ACCOUNTS.map((account) => (
                    <button
                      key={account.label}
                      onClick={() => handleDemo(account)}
                      disabled={pending !== null}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-full border bg-white/[0.03] px-3 py-2.5 text-xs font-semibold transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 ${account.pill}`}
                    >
                      {pending === account.label ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <account.icon className="h-3.5 w-3.5" />
                      )}
                      {account.label}
                    </button>
                  ))}
                </div>

                <p className="mt-6 text-center text-xs text-zinc-500">
                  New to Stitch?{" "}
                  <a href="/signup" className="font-semibold text-amber-400 hover:text-amber-300">
                    Create an account
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
