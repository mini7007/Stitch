"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";

/** Copies the vendor's public marketplace profile link to the clipboard. */
export default function CopyProfileLink({ vendorId }: { vendorId: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/customer/vendors#vendor-${vendorId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard API blocked — fall back to a manual selection prompt */
      // eslint-disable-next-line no-alert
      window.prompt("Copy your profile link:", url);
      setCopied(true);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.03] hover:bg-slate-700 active:scale-95"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
      {copied ? "Link copied!" : "Copy profile link"}
      {!copied && <Link2 className="h-3.5 w-3.5 opacity-60" />}
    </button>
  );
}
