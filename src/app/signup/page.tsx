"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { getSession, signIn } from "next-auth/react";
import { ArrowLeft, Building2, Loader2, Scissors, UserRound } from "lucide-react";
import { roleHome } from "@/lib/roles";

type Role = "CUSTOMER" | "VENDOR";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    city: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Signup failed");

      // Auto sign-in right after signup
      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signInRes?.error) {
        // Account exists — send them to login rather than an error
        router.push("/login");
        return;
      }
      const session = await getSession();
      router.push(roleHome(session?.user?.role ?? role));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors focus:border-amber-500/60 focus:outline-none";
  const labelCls =
    "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500";

  return (
    <div className="relative min-h-screen bg-zinc-950 text-zinc-200">
      {/* ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-96 w-[50rem] -translate-x-1/2 rounded-full bg-amber-500/[0.08] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-96 rounded-full bg-zinc-700/20 blur-3xl" />
      </div>

      {/* slim header */}
      <header className="relative flex items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500 text-zinc-950">
            <Scissors className="h-4 w-4" />
          </span>
          <span className="font-display text-xl tracking-[0.3em] text-white">STITCH</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-amber-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </header>

      <main className="relative mx-auto flex max-w-md flex-col justify-center px-4 pb-20 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[26px] bg-gradient-to-b from-amber-400/80 via-amber-600/25 to-amber-400/60 p-[1.5px] shadow-[0_0_80px_-20px_rgba(245,158,11,0.4)]"
        >
          <div className="rounded-[24px] bg-zinc-950 p-8">
            <div className="mb-6 text-center">
              <h1 className="font-display text-3xl text-white">Create your account</h1>
              <p className="mt-1.5 text-sm text-zinc-400">
                Join the premium doorstep atelier
              </p>
            </div>

            {/* ---- role tabs ---- */}
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5">
              {(
                [
                  { key: "CUSTOMER" as Role, label: "Customer", icon: UserRound },
                  { key: "VENDOR" as Role, label: "Vendor", icon: Building2 },
                ]
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setRole(tab.key)}
                  className={`relative flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                    role === tab.key ? "text-zinc-950" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {role === tab.key && (
                    <motion.span
                      layoutId="role-tab"
                      className="absolute inset-0 rounded-xl bg-amber-500"
                      transition={{ type: "spring", damping: 26, stiffness: 320 }}
                    />
                  )}
                  <tab.icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <label className="block">
                    <span className={labelCls}>
                      {role === "VENDOR" ? "Owner name" : "Full name"}
                    </span>
                    <input required className={inputCls} value={form.name} onChange={set("name")} placeholder="Rahul Sharma" />
                  </label>

                  {role === "VENDOR" && (
                    <>
                      <label className="block">
                        <span className={labelCls}>Business name</span>
                        <input required className={inputCls} value={form.businessName} onChange={set("businessName")} placeholder="Meena Tailors & Alterations" />
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                          <span className={labelCls}>City</span>
                          <input required className={inputCls} value={form.city} onChange={set("city")} placeholder="Bangalore" />
                        </label>
                        <label className="block">
                          <span className={labelCls}>Phone</span>
                          <input required className={inputCls} value={form.phone} onChange={set("phone")} placeholder="9876543210" />
                        </label>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              <label className="block">
                <span className={labelCls}>Email</span>
                <input required type="email" className={inputCls} value={form.email} onChange={set("email")} placeholder="you@example.com" />
              </label>
              <label className="block">
                <span className={labelCls}>Password</span>
                <input required type="password" minLength={8} className={inputCls} value={form.password} onChange={set("password")} placeholder="Minimum 8 characters" />
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
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-semibold text-zinc-950 shadow-[0_0_30px_-8px_rgba(245,158,11,0.7)] transition-all hover:bg-amber-400 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating account…
                  </>
                ) : role === "VENDOR" ? (
                  "Create Vendor Account"
                ) : (
                  "Create Customer Account"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-zinc-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-amber-400 hover:text-amber-300">
                Sign in
              </Link>
            </p>

            {role === "VENDOR" && (
              <p className="mt-4 rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-center text-[11px] leading-relaxed text-sky-300">
                Vendor profiles are reviewed by our team before appearing in the
                marketplace. You can log in right away.
              </p>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
