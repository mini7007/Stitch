"use client";

import { motion } from "framer-motion";
import { Check, MapPin } from "lucide-react";

export type HistoryEntry = {
  status: string;
  note: string | null;
  createdAt: string; // ISO
};

const FLOW = [
  { key: "PENDING", label: "Order Placed", desc: "We've sent your order to the vendor." },
  { key: "ACCEPTED", label: "Accepted", desc: "The vendor confirmed your booking." },
  { key: "PICKED_UP", label: "Picked Up", desc: "Your items are collected and on their way." },
  { key: "IN_PROGRESS", label: "In Progress", desc: "The artisan is working on your order." },
  { key: "READY", label: "Ready", desc: "Quality-checked and ready for delivery." },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "On the way back to your doorstep." },
  { key: "DELIVERED", label: "Delivered", desc: "Enjoy — until the next stitch!" },
] as const;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

/**
 * Animated vertical timeline for an order's lifecycle.
 * A gold stitching line fills up to the current status.
 */
export default function OrderTimeline({
  status,
  history,
}: {
  status: string;
  history: HistoryEntry[];
}) {
  const currentIndex = FLOW.findIndex((s) => s.key === status);
  const timeByStatus = new Map(history.map((h) => [h.status, h]));
  const cancelled = status === "CANCELLED" || status === "DISPUTED";

  /* percentage of the line that should be gold */
  const progress = currentIndex <= 0 ? 6 : (currentIndex / (FLOW.length - 1)) * 100;

  return (
    <div className="relative pl-2">
      {/* the track */}
      <div className="absolute bottom-4 left-[27px] top-4 w-0.5 bg-[repeating-linear-gradient(to_bottom,#E2E8F0_0_8px,transparent_8px_16px)]" />
      {/* the gold thread, animated on mount */}
      <motion.div
        className="absolute left-[27px] top-4 w-0.5 origin-top bg-gradient-to-b from-gold-500 to-gold-300"
        initial={{ height: 0 }}
        animate={{ height: cancelled ? 0 : `calc(${progress}% - 8px)` }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      />

      <ol className="space-y-7">
        {FLOW.map((step, i) => {
          const done = !cancelled && i < currentIndex;
          const active = !cancelled && i === currentIndex;
          const entry = timeByStatus.get(step.key);

          return (
            <motion.li
              key={step.key}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.14, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex gap-5"
            >
              {/* node */}
              <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 bg-white sm:h-12 sm:w-12 sm:ml-1"
                style={{
                  borderColor: done || active ? "#C9962E" : "#E2E8F0",
                  background: active ? "linear-gradient(135deg,#DFAF35,#A8731F)" : done ? "#C9962E" : "#fff",
                }}
              >
                {done && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                {active && (
                  <>
                    {/* ticking ring — slow rotation signals work in progress */}
                    <span className="absolute -inset-1.5 animate-spin-slow rounded-full border-2 border-dashed border-gold-500/70" />
                    <span className="absolute inset-0 animate-pulse-ring rounded-full bg-gold-400/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white" />
                  </>
                )}
                {!done && !active && <span className="h-2 w-2 rounded-full bg-slate-300" />}
              </span>

              {/* label */}
              <div className="pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={`text-sm font-semibold ${done || active ? "text-slate-900" : "text-slate-400"}`}>
                    {step.label}
                  </p>
                  {active && (
                    <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-700">
                      Current
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{step.desc}</p>
                {entry && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin className="h-3 w-3" />
                    {fmtDate(entry.createdAt)}
                    {entry.note ? ` · ${entry.note}` : ""}
                  </p>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>

      {cancelled && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          This order was {status.toLowerCase()}. Contact support if this looks wrong.
        </motion.div>
      )}
    </div>
  );
}
