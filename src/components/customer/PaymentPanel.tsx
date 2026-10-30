"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { BadgeCheck, Banknote, Loader2, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { PAYMENT_MODE } from "@/lib/payments";

const UPI_ID = "stitch@upi"; // demo-mode collection ID only — never shown in live mode

/**
 * Prominent "Complete Payment" card — shown while an order is
 * PENDING and unpaid.
 *
 * DEMO mode: renders a real UPI deep-link QR (stitch@upi) that works with
 * any UPI app, plus a button that simulates a successful payment.
 * LIVE mode: the mock QR/button are gone; "Pay with UPI" starts a real
 * Razorpay payment via /api/payments/create, and confirmation arrives
 * asynchronously through the Razorpay webhook.
 */
export default function PaymentPanel({
  orderId,
  orderNumber,
  amountPaise,
}: {
  orderId: string;
  orderNumber: string;
  amountPaise: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [liveQr, setLiveQr] = useState<string | null>(null);

  const isDemo = PAYMENT_MODE === "demo";

  const upiUrl =
    `upi://pay?pa=${UPI_ID}` +
    `&pn=${encodeURIComponent("Stitch Services")}` +
    `&am=${(amountPaise / 100).toFixed(2)}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(`Order_${orderNumber}`)}`;

  async function simulatePayment() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment failed");
      router.refresh(); // server component refetches → panel disappears, timeline advances
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  async function startLivePayment() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not start payment");

      // Forward-compatible with both Razorpay integration styles:
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl; // hosted payment link / checkout
        return;
      }
      if (data.qrDataUrl) {
        setLiveQr(data.qrDataUrl); // server-rendered QR image
        setLoading(false);
        return;
      }
      throw new Error("Unexpected payment response");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative mt-8 overflow-hidden rounded-3xl bg-zinc-950 p-6 shadow-2xl ring-1 ring-amber-500/40 sm:p-8"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-stretch">
        {/* copy */}
        <div className="flex-1 text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">
            <Wallet className="h-3.5 w-3.5" /> Complete Payment
          </span>
          <h2 className="mt-4 font-display text-3xl text-white">
            Pay {formatINR(amountPaise)} to confirm your order
          </h2>

          {isDemo ? (
            <>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Your order is reserved but hasn&apos;t started yet. Scan the QR with any
                UPI app to pay the vendor directly — Stitch confirms it instantly.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-zinc-300 ring-1 ring-white/10">
                  <Smartphone className="h-3.5 w-3.5 text-amber-400" /> GPay
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-zinc-300 ring-1 ring-white/10">PhonePe</span>
                <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-zinc-300 ring-1 ring-white/10">Paytm</span>
                <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-zinc-300 ring-1 ring-white/10">Any UPI app</span>
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Your order is reserved but hasn&apos;t started yet. Pay securely with any
                UPI app — your vendor starts the moment payment is confirmed.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs text-zinc-300 ring-1 ring-white/10">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> Secured by Razorpay
                </span>
                <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-zinc-300 ring-1 ring-white/10">GPay</span>
                <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-zinc-300 ring-1 ring-white/10">PhonePe</span>
                <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-zinc-300 ring-1 ring-white/10">Paytm</span>
              </div>
            </>
          )}

          {error && (
            <p className="mt-4 inline-block rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}
        </div>

        {/* QR / action */}
        <div className="flex flex-col items-center gap-4">
          {isDemo ? (
            <>
              <div className="relative rounded-3xl bg-white p-5 shadow-xl ring-2 ring-amber-500/60">
                {/* corner marks */}
                <span className="absolute -left-1.5 -top-1.5 h-6 w-6 rounded-tl-2xl border-l-4 border-t-4 border-amber-500" />
                <span className="absolute -right-1.5 -top-1.5 h-6 w-6 rounded-tr-2xl border-r-4 border-t-4 border-amber-500" />
                <span className="absolute -bottom-1.5 -left-1.5 h-6 w-6 rounded-bl-2xl border-b-4 border-l-4 border-amber-500" />
                <span className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-br-2xl border-b-4 border-r-4 border-amber-500" />
                <QRCodeSVG
                  value={upiUrl}
                  size={188}
                  bgColor="#FFFFFF"
                  fgColor="#09090B"
                  level="M"
                />
              </div>

              <p className="text-xs text-zinc-500">
                UPI ID: <span className="font-mono text-amber-400">{UPI_ID}</span>
              </p>

              <button
                onClick={simulatePayment}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_30px_-8px_rgba(245,158,11,0.7)] transition-all hover:scale-[1.03] hover:bg-amber-400 active:scale-95 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Confirming…
                  </>
                ) : (
                  <>
                    <BadgeCheck className="h-4 w-4" /> Simulate Payment Success (For Demo)
                  </>
                )}
              </button>
            </>
          ) : liveQr ? (
            <>
              <div className="relative rounded-3xl bg-white p-5 shadow-xl ring-2 ring-amber-500/60">
                <img src={liveQr} alt="Payment QR" width={188} height={188} />
              </div>
              <p className="text-xs text-zinc-500">Scan with any UPI app to pay</p>
            </>
          ) : (
            <>
              <div className="relative grid h-[13.5rem] w-[13.5rem] place-items-center rounded-3xl bg-zinc-900/80 ring-2 ring-amber-500/40">
                <Banknote className="h-16 w-16 text-amber-500/70" strokeWidth={1.4} />
              </div>
              <p className="text-xs text-zinc-500">
                Order <span className="font-mono text-amber-400">{orderNumber}</span>
              </p>

              <button
                onClick={startLivePayment}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_30px_-8px_rgba(245,158,11,0.7)] transition-all hover:scale-[1.03] hover:bg-amber-400 active:scale-95 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Starting…
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4" /> Pay with UPI
                  </>
                )}
              </button>

              {/* Emergency bypass — super-admin only (enforced server-side) */}
              <button
                onClick={simulatePayment}
                disabled={loading}
                className="text-[11px] text-zinc-600 underline decoration-zinc-800 underline-offset-4 transition-colors hover:text-zinc-400 disabled:opacity-50"
              >
                Having payment issues? Force Mock Payment (Dev)
              </button>
            </>
          )}
        </div>
      </div>
    </motion.section>
  );
}
