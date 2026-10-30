"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";

/** Admin control to reject a pending vendor profile (marks it SUSPENDED). */
export default function RejectVendorButton({ vendorId }: { vendorId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function reject() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SUSPEND" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Rejection failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={reject}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
        Reject
      </button>
      {error && <p className="mt-1.5 text-[11px] font-medium text-red-500">{error}</p>}
    </div>
  );
}
