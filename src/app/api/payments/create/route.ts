import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PaymentStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PAYMENT_MODE } from "@/lib/payments";

/**
 * POST /api/payments/create — LIVE MODE ONLY
 *
 * Creates a Razorpay Payment Link (hosted UPI checkout) for an unpaid order
 * and returns { paymentUrl } — the client redirects to it. Confirmation is
 * asynchronous: the signed Razorpay webhook (/api/webhooks/razorpay) marks
 * the payment PAID and advances the order.
 *
 * STRICT environment isolation: in demo mode this route refuses to run
 * before touching auth, the database, or Razorpay.
 */

/* A hung gateway call must never take the whole serverless function down —
   Vercel kills long-running functions and the client sees a bare
   502 NO_RESPONSE_FROM_FUNCTION. Hard-cap the Razorpay call instead. */
const RAZORPAY_TIMEOUT_MS = 10_000;

export async function POST(req: Request) {
  try {
    /* ── 1. Mode gate: demo mode NEVER reaches Razorpay ───────────────── */
    if (PAYMENT_MODE !== "live") {
      return NextResponse.json(
        { error: "Live payments are disabled in demo mode." },
        { status: 403 }
      );
    }

    /* ── 2. Auth ──────────────────────────────────────────────────────── */
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* ── 3. Input ─────────────────────────────────────────────────────── */
    const { orderId } = await req.json().catch(() => ({ orderId: null }));
    if (typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    /* ── 4. Order ownership + eligibility ─────────────────────────────── */
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.customerId !== session.user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    /* ── 5. Keys configured? ──────────────────────────────────────────── */
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured in environment variables." },
        { status: 503 }
      );
    }

    /* ── 6. Razorpay call — isolated try/catch + hard 10s timeout ─────── */
    let rzpRes: Response;
    try {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

      rzpRes = await fetch("https://api.razorpay.com/v1/payment_links", {
        method: "POST",
        headers: { authorization: `Basic ${auth}`, "content-type": "application/json" },
        body: JSON.stringify({
          amount: order.total, // paise
          currency: "INR",
          accept_partial: false,
          reference_id: order.id, // comes back in webhooks → maps to our order
          description: `Stitch order ${order.orderNumber}`,
          customer: { name: session.user.name ?? undefined, email: session.user.email ?? undefined },
          redirect_url: `${appUrl}/customer/orders/${order.id}`, // return to tracking page
          // UPI-first checkout page
          config: { checkout: { method: { netbanking: "1", card: "1", upi: "1", wallet: "1" } } },
        }),
        signal: AbortSignal.timeout(RAZORPAY_TIMEOUT_MS),
      });
    } catch (rzpError) {
      /* Network failure, DNS failure, or the 10s timeout firing — none of
         these may escape the handler (that's what produced the bare 502s). */
      console.error("[/api/payments/create] Razorpay call failed:", rzpError);
      const isTimeout =
        rzpError instanceof Error &&
        (rzpError.name === "TimeoutError" || rzpError.name === "AbortError");
      return NextResponse.json(
        {
          error: isTimeout
            ? "Razorpay: payment gateway timed out after 10 seconds — please try again."
            : "Razorpay: could not reach the payment gateway — please try again.",
        },
        { status: 502 }
      );
    }

    /* ── 7. Non-200 → surface Razorpay's EXACT error string to the UI ── */
    const parsed = (await rzpRes.json().catch(() => null)) as
      | { short_url?: string; id?: string; error?: { description?: string; code?: string } }
      | null;

    if (!rzpRes.ok) {
      const detail =
        parsed?.error?.description ??
        parsed?.error?.code ??
        `HTTP ${rzpRes.status}`;
      console.error("[/api/payments/create] Razorpay error:", rzpRes.status, JSON.stringify(parsed));
      // 4xx (bad keys, KYC pending, …) → 400 · 5xx → 502 — both JSON, no crash.
      return NextResponse.json(
        { error: `Razorpay: ${detail}` },
        { status: rzpRes.status >= 500 ? 502 : 400 }
      );
    }

    if (!parsed?.short_url) {
      console.error("[/api/payments/create] unexpected Razorpay payload:", JSON.stringify(parsed));
      return NextResponse.json(
        { error: "Razorpay: unexpected response — please try again." },
        { status: 502 }
      );
    }

    /* ── 8. Record the pending payment (webhook has a row to confirm) ── */
    try {
      await prisma.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          amount: order.total,
          status: PaymentStatus.PENDING,
          method: "UPI",
          reference: parsed.id,
        },
        update: { status: PaymentStatus.PENDING, method: "UPI", reference: parsed.id },
      });
    } catch (dbError) {
      // Non-fatal: the link exists; the webhook upserts the row either way.
      console.error("[/api/payments/create] failed to record pending payment:", dbError);
    }

    return NextResponse.json({ ok: true, paymentUrl: parsed.short_url });
  } catch (error) {
    /* Absolute outer guard — nothing escapes this handler unlogged. */
    console.error("[/api/payments/create] crashed:", error);
    return NextResponse.json(
      { error: "Something went wrong starting your payment — please try again." },
      { status: 500 }
    );
  }
}
