"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function HeroSection({ onBook }: { onBook: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden bg-zinc-950">
      {/* ---- dramatic background image with parallax ---- */}
      <motion.div style={{ y: bgY }} className="absolute -inset-y-[6%] inset-x-0">
        <Image
          src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=2400&auto=format&fit=crop"
          alt="A masterfully tailored three-piece suit"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* ---- cinematic gradients ---- */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-zinc-950/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/60" />

      {/* ---- copy ---- */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-28 pb-20 sm:px-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: EASE }}
          className="flex items-center gap-4"
        >
          <span className="h-px w-12 bg-amber-500" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-500">
            The doorstep atelier
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9, ease: EASE }}
          className="mt-7 max-w-3xl font-display text-5xl leading-[1.02] text-white sm:text-6xl lg:text-7xl"
        >
          Master tailors. Expert cobblers.{" "}
          <span className="block font-normal text-amber-400">At your doorstep.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.68, duration: 0.8, ease: EASE }}
          className="mt-7 max-w-xl text-lg leading-relaxed text-zinc-300"
        >
          Book a vetted artisan in seconds. We collect your garments, craft them
          with obsessive care, and return them ready to wear — you never leave home.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.8, ease: EASE }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
            <button
              onClick={onBook}
              className="group flex items-center gap-2.5 rounded-lg bg-amber-500 px-8 py-3.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-amber-400 active:scale-95"
            >
              Book a Service
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="#services"
              className="rounded-lg border border-white/25 px-8 py-3.5 text-sm text-zinc-100 backdrop-blur-sm transition-colors hover:border-amber-400/70 hover:text-amber-300"
            >
              View Services
            </a>
        </motion.div>

        {/* trust stats — quiet inline row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.7, ease: EASE }}
          className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-400"
        >
          <span className="flex items-center gap-2">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-white">4.9</span> · 12,000+ reviews
          </span>
          <span className="hidden h-4 w-px bg-white/15 sm:block" />
          <span>
            <span className="font-semibold text-white">500+</span> verified artisans
          </span>
          <span className="hidden h-4 w-px bg-white/15 sm:block" />
          <span>
            <span className="font-semibold text-white">30 min</span> free pickup
          </span>
        </motion.div>
      </motion.div>

      {/* scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-white/25 p-1.5"
        >
          <span className="h-2 w-1 rounded-full bg-amber-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}
