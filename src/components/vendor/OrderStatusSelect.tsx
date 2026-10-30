"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { ORDER_FLOW, statusIndex } from "@/lib/roles";

const LABELS: Record<string, string> = {
  ACCEPTED: "Accept",
  PICKED_UP: "Mark Picked Up",
  IN_PROGRESS: "Start Work",
  READY: "Mark Ready",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Mark Delivered",
};

/**
 * Vendor control to move an order to the next step of the flow.
 * Only forward statuses (after the current one) are offered.
 */
export default function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentIdx = statusIndex(currentStatus);
  const options = ORDER_FLOW.slice(currentIdx + 1);

  if (options.length === 0) return <span className="text-xs text-zinc-500">Completed</span>;

  async function apply() {
    if (!value) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setValue("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-zinc-200 focus:border-amber-500/60 focus:outline-none"
        >
          <option value="" disabled className="bg-zinc-900">
            Move to…
          </option>
          {options.map((s) => (
            <option key={s} value={s} className="bg-zinc-900">
              {LABELS[s] ?? s}
            </option>
          ))}
        </select>
        <button
          onClick={apply}
          disabled={!value || loading}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500 text-zinc-950 transition-all hover:bg-amber-400 disabled:opacity-40"
          aria-label="Apply status"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && <p className="mt-1.5 text-[11px] font-medium text-red-400">{error}</p>}
    </div>
  );
}
