"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag } from "lucide-react";
import { formatINR } from "@/lib/utils";

type BookableService = { id: string; name: string; basePrice: number };

/**
 * Service picker + "Book Now" button.
 * Calls POST /api/orders and redirects to the live tracking page.
 */
export default function BookServiceForm({
  vendorId,
  services,
}: {
  vendorId: string;
  services: BookableService[];
}) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleBook() {
    if (!serviceId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, serviceId, quantity, notes: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not place order");
      router.push(`/customer/orders/${data.orderId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 focus:border-slate-900 focus:outline-none"
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {formatINR(s.basePrice)}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          max={20}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="w-14 rounded-md border border-slate-300 px-2 py-2 text-center text-sm text-slate-800 focus:border-slate-900 focus:outline-none"
        />
      </div>

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

      <button
        onClick={handleBook}
        disabled={loading || !serviceId}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Booking…
          </>
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" /> Book Now
          </>
        )}
      </button>
    </div>
  );
}
