"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR } from "@/lib/utils";

export type ActivityPoint = { label: string; orders: number; revenue: number };

/** Platform activity — daily order count and revenue (₹) over 30 days. */
export default function AdminActivityChart({ data }: { data: ActivityPoint[] }) {
  const hasActivity = data.some((d) => d.orders > 0);

  return (
    <div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
              interval={4}
            />
            <YAxis
              yAxisId="orders"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={28}
            />
            <YAxis
              yAxisId="revenue"
              orientation="right"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `₹${Math.round(v / 100)}`}
              width={52}
            />
            <Tooltip
              formatter={(value, name) =>
                name === "revenue"
                  ? [formatINR(Number(value)), "Revenue"]
                  : [String(value), "Orders"]
              }
              labelStyle={{ fontWeight: 600, color: "#0f172a" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                fontSize: 12,
              }}
            />
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              stroke="#334155"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-center gap-5 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Revenue (₹)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-700" /> Orders
        </span>
      </div>
      {!hasActivity && (
        <p className="mt-1 text-center text-xs text-slate-400">
          No platform activity in the last 30 days yet.
        </p>
      )}
    </div>
  );
}
