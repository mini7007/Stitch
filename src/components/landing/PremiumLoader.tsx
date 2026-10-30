"use client";

import { motion } from "framer-motion";

/**
 * PremiumLoader — a cinematic, luxury-house opening sequence.
 *
 * Choreography (≈3s):
 *   1. Dark room fades in — slow drifting amber glow over film grain.
 *   2. A golden thread draws itself across the screen; the needle rides its tip.
 *   3. Scissors open in anticipation… then SNAP shut with spring physics —
 *      the loose thread tail falls away.
 *   4. The STITCH wordmark resolves from blur, like a film title.
 *   5. On exit the two dark panels part like a curtain, revealing the hero.
 */

/* Thread: main draw path (needle rides this) and the loose tail after the cut */
const THREAD_MAIN = "M 60 150 C 240 80, 420 220, 620 150";
const THREAD_TAIL = "M 620 150 C 660 147, 700 144, 748 149";

const CUT_AT = 1.75; // seconds — the moment the scissors snap

/* Film-grain texture (inline SVG noise, no asset needed) */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function WorkshopScene() {
  return (
    <svg viewBox="0 0 800 300" className="w-full" aria-hidden="true">
      <defs>
        <linearGradient id="pThreadGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="55%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* ------- golden thread ------- */}
      <motion.path
        d={THREAD_MAIN}
        fill="none"
        stroke="url(#pThreadGrad)"
        strokeWidth={1.6}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.3, ease: "easeInOut", delay: 0.35 }}
      />
      {/* loose tail — drawn ahead of the needle, severed at the snap and
          dropped with an accelerating (gravity-like) tween */}
      <motion.path
        d={THREAD_TAIL}
        fill="none"
        stroke="url(#pThreadGrad)"
        strokeWidth={1.6}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 1, y: 0, rotate: 0 }}
        animate={{
          pathLength: [0, 1],
          y: [0, 56, 96],
          rotate: [0, 9, 22],
          opacity: [1, 0.9, 0],
        }}
        transition={{
          pathLength: { duration: 0.35, ease: "easeOut", delay: 0.35 },
          y: { duration: 0.8, times: [0, 0.55, 1], ease: ["easeIn", "easeIn"], delay: CUT_AT },
          rotate: { duration: 0.8, times: [0, 0.55, 1], ease: ["easeIn", "easeIn"], delay: CUT_AT },
          opacity: { duration: 0.5, times: [0, 0.55, 1], ease: "linear", delay: CUT_AT + 0.2 },
        }}
      />

      {/* ------- the needle, riding the thread ------- */}
      <motion.g
        initial={{ x: 60, y: 150, opacity: 0 }}
        animate={{
          x: [60, 195, 333, 474, 620, 640],
          y: [150, 130, 150, 170, 150, 310],
          opacity: [0, 1, 1, 1, 1, 0],
        }}
        transition={{
          duration: 2.0,
          times: [0, 0.16, 0.32, 0.48, 0.62, 1],
          ease: ["easeInOut", "easeInOut", "easeInOut", "easeInOut", "easeIn"],
          delay: 0.42,
        }}
      >
        <line x1="0" y1="0" x2="42" y2="-12" stroke="#FCD34D" strokeWidth={3.4} strokeLinecap="round" />
        <circle cx="4" cy="-1.2" r="2.4" fill="none" stroke="#09090B" strokeWidth={1.6} />
        <line x1="24" y1="-7" x2="29" y2="-8.5" stroke="#FEF3C7" strokeWidth={1.2} strokeLinecap="round" />
      </motion.g>

      {/* ------- scissors, waiting on the thread ------- */}
      <g>
        {/* open… then snap shut */}
        <motion.g
          style={{ transformOrigin: "620px 120px" }}
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 17, -3, 0] }}
          transition={{
            duration: 0.62,
            times: [0, 0.38, 0.72, 1],
            ease: ["easeOut", "easeIn", "backOut"],
            delay: 1.15,
          }}
        >
          <path d="M 620 120 L 613 172 L 627 170 Z" fill="#D4D4D8" stroke="#71717A" strokeWidth={1} />
          <path d="M 620 120 L 650 94" stroke="#A1A1AA" strokeWidth={4.5} strokeLinecap="round" />
          <circle cx="658" cy="86" r="8" fill="none" stroke="#F59E0B" strokeWidth={3.2} />
        </motion.g>
        <motion.g
          style={{ transformOrigin: "620px 120px" }}
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, -17, 3, 0] }}
          transition={{
            duration: 0.62,
            times: [0, 0.38, 0.72, 1],
            ease: ["easeOut", "easeIn", "backOut"],
            delay: 1.15,
          }}
        >
          <g transform="translate(0 240) scale(1 -1)">
            <path d="M 620 120 L 613 172 L 627 170 Z" fill="#D4D4D8" stroke="#71717A" strokeWidth={1} />
            <path d="M 620 120 L 650 94" stroke="#A1A1AA" strokeWidth={4.5} strokeLinecap="round" />
            <circle cx="658" cy="86" r="8" fill="none" stroke="#F59E0B" strokeWidth={3.2} />
          </g>
        </motion.g>
        <circle cx="620" cy="120" r="3.4" fill="#FCD34D" />
      </g>

      {/* spark at the moment of the cut */}
      {[[-16, -10], [-4, -18], [12, -12]].map(([dx, dy], i) => (
        <motion.line
          key={i}
          x1={620}
          y1={150}
          x2={620 + dx}
          y2={150 + dy}
          stroke="#FCD34D"
          strokeWidth={1.8}
          strokeLinecap="round"
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 0.95, 0], x: [0, dx * 1.7], y: [0, dy * 1.7] }}
          transition={{ duration: 0.45, delay: CUT_AT, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

function Wordmark() {
  return (
    <div className="relative mt-4 text-center">
      <div className="flex items-baseline justify-center gap-[0.22em] font-display text-6xl md:text-7xl tracking-[0.3em] text-zinc-100 select-none">
        {"STITCH".split("").map((ch, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 34, filter: "blur(16px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 1.95 + i * 0.085, type: "spring", stiffness: 110, damping: 17 }}
          >
            {ch}
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 2.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-5 h-px w-40 origin-center bg-gradient-to-r from-transparent via-amber-500 to-transparent"
      />
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.65, duration: 0.5 }}
        className="mt-4 text-[11px] uppercase tracking-[0.55em] text-amber-500"
      >
        Craftsmanship, delivered
      </motion.p>
    </div>
  );
}

export default function PremiumLoader() {
  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* ------- two curtain panels ------- */}
      {(["left", "right"] as const).map((side) => (
        <motion.div
          key={side}
          className={`absolute inset-y-0 w-1/2 bg-zinc-950 ${side === "left" ? "left-0" : "right-0"}`}
          initial={{ x: 0 }}
          exit={{ x: side === "left" ? "-100%" : "100%" }}
          transition={{ duration: 0.9, delay: 0.18, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* grain over the panel */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
            style={{ backgroundImage: GRAIN }}
          />
        </motion.div>
      ))}

      {/* ------- slow-drifting amber glow ------- */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.25 } }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="absolute left-1/2 top-1/3 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 65%)" }}
          animate={{ x: [0, 50, -30, 0], y: [0, -26, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 h-[26rem] w-[26rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(120,113,108,0.14) 0%, transparent 70%)" }}
          animate={{ x: [0, -40, 24, 0], y: [0, 18, -14, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* ------- content ------- */}
      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-center px-6"
        exit={{ opacity: 0, scale: 1.03 }}
        transition={{ duration: 0.3, ease: "easeIn" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-2xl"
        >
          <WorkshopScene />
          <Wordmark />
        </motion.div>
      </motion.div>
    </div>
  );
}
