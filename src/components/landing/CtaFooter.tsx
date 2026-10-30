"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Scissors } from "lucide-react";
import Wordmark from "@/components/Wordmark";

const EASE = [0.22, 1, 0.36, 1] as const;

export function FinalCta({ onBook }: { onBook: () => void }) {
  return (
    <section id="book" className="relative overflow-hidden bg-stone-50 px-4 py-24 sm:px-6 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-xl bg-zinc-950 p-10 text-center shadow-2xl md:p-20"
      >
        {/* golden top edge + ambient glow */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[50rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />

        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-500">
          Limited pickup slots daily
        </p>
        <h2 className="mx-auto mt-6 max-w-2xl font-display text-4xl leading-tight text-white md:text-6xl">
          Your wardrobe deserves <span className="text-amber-400">the masters.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-zinc-400">
          Join thousands who never wait in shops again. Your first pickup is free.
        </p>
        <button
          onClick={onBook}
          className="group mx-auto mt-10 flex items-center gap-2.5 rounded-lg bg-amber-500 px-10 py-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-400 active:scale-95"
        >
          Book a Service
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-amber-500 text-zinc-950">
            <Scissors className="h-3.5 w-3.5" />
          </span>
          <Wordmark className="text-lg text-zinc-100" />
        </div>

        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} Stitch — Tailoring &amp; Cobbler Marketplace
        </p>

        <div className="flex gap-6 text-xs text-zinc-500">
          <a href="#services" className="transition-colors hover:text-amber-400">Services</a>
          <a href="#professionals" className="transition-colors hover:text-amber-400">Professionals</a>
          <Link href="/customer/vendors" className="transition-colors hover:text-amber-400">Vendors</Link>
        </div>
      </div>
    </footer>
  );
}
