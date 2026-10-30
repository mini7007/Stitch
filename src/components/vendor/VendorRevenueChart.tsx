"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatINR } from "@/lib/utils";

/** Vendor earnings over the last 7 days (amounts in paise → shown in ₹). */
export default function VendorRevenueChart({
  data,
}: {
  data: { label: string; earnings: number }[];
}) {
  const hasEarnings = data.some((d) => d.earnings > 0);

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `₹${Math.round(v / 100)}`}
            width={44}
          />
          <Tooltip
            cursor={{ fill: "rgba(245, 158, 11, 0.08)" }}
            formatter={(value) => [formatINR(Number(value)), "Earnings"]}
            labelStyle={{ fontWeight: 600, color: "#0f172a" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              fontSize: 12,
            }}
          />
          <Bar dataKey="earnings" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
      {!hasEarnings && (
        <p className="mt-2 text-center text-xs text-slate-400">
          No paid orders in the last 7 days — your first payment will light this up.
        </p>
      )}
    </div>
  );
}
