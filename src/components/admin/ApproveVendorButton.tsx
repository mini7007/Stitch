"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2 } from "lucide-react";

/** Admin control to approve a pending vendor profile. */
export default function ApproveVendorButton({ vendorId }: { vendorId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function approve() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/vendors/${vendorId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Approval failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={approve}
        disabled={loading}
        className="flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-950 transition-all hover:scale-[1.04] hover:bg-amber-400 active:scale-95 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <BadgeCheck className="h-3.5 w-3.5" />
        )}
        Approve
      </button>
      {error && <p className="mt-1.5 text-[11px] font-medium text-red-400">{error}</p>}
    </div>
  );
}
