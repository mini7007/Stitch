"use client";

import { motion } from "framer-motion";

/**
 * Premium stat tile — icon, label, large value and an optional
 * +X% trend indicator (green when positive, red when negative).
 * `icon` is a rendered element (Lucide icons are functions and cannot
 * cross the server→client boundary; rendered elements can).
 */
export default function StatCard({
  title,
  value,
  icon,
  trend,
  delay = 0,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: { text: string; positive: boolean } | null;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200">
          {icon}
        </span>
        {trend && (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset ${
              trend.positive
                ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                : "bg-red-50 text-red-700 ring-red-600/20"
            }`}
          >
            {trend.text}
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-3xl leading-none text-slate-900">{value}</p>
      <p className="mt-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">{title}</p>
    </motion.div>
  );
}
