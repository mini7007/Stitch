"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Scissors, X } from "lucide-react";
import Wordmark from "@/components/Wordmark";

const LINKS = [
  { label: "Services", href: "#services" },
  { label: "Professionals", href: "#professionals" },
  { label: "Find Vendors", href: "/customer/vendors" },
];

/** Full-width editorial header for the landing page. */
export default function LandingHeader({ onLogin }: { onLogin: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-zinc-950/85 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        {/* brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-amber-500 text-zinc-950">
            <Scissors className="h-3.5 w-3.5" />
          </span>
          <Wordmark className="text-xl text-white" />
        </Link>

        {/* desktop links */}
        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={onLogin}
            className="rounded-lg px-4 py-2 text-sm text-zinc-300 transition-colors hover:text-amber-400"
          >
            Login
          </button>
          <a
            href="#book"
            className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
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
            className="flex flex-col gap-1 border-b border-white/10 bg-zinc-950/95 p-3 backdrop-blur-xl md:hidden"
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
    </motion.header>
  );
}
