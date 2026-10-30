"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Scissors, X } from "lucide-react";

const LINKS = [
  { label: "Services", href: "#services" },
  { label: "Professionals", href: "#professionals" },
  { label: "Find Vendors", href: "/customer/vendors" },
];

/** Fixed, glassy header for the landing page. */
export default function LandingHeader({ onLogin }: { onLogin: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-950/70 px-5 py-3 shadow-xl backdrop-blur-xl">
          {/* brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500 text-zinc-950">
              <Scissors className="h-4 w-4" />
            </span>
            <span className="font-display text-xl tracking-[0.3em] text-white">
              STITCH
            </span>
          </Link>

          {/* desktop links */}
          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-zinc-300 transition-colors hover:text-amber-400"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={onLogin}
              className="rounded-full px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:text-amber-400"
            >
              Login
            </button>
            <a
              href="#book"
              className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-zinc-950 transition-all hover:scale-[1.04] hover:bg-amber-400 active:scale-95"
            >
              Book a Service
            </a>
          </div>

          {/* mobile toggle */}
          <button
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-200 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mt-2 flex flex-col gap-1 rounded-2xl border border-white/10 bg-zinc-950/90 p-3 backdrop-blur-xl md:hidden"
            >
              {LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-zinc-200 hover:bg-white/5"
                >
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setOpen(false);
                  onLogin();
                }}
                className="rounded-lg px-3 py-2 text-left text-sm text-amber-400 hover:bg-white/5"
              >
                Login
              </button>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
