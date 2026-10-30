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
 * Uses the plain REST API (Basic auth) — no SDK dependency required.
 * Docs: https://razorpay.com/docs/api/payment-links/
 */

/* A hung gateway call must never take the whole serverless function down —
   Vercel kills long-running functions and the client sees a bare
   502 NO_RESPONSE_FROM_FUNCTION. Hard-cap the Razorpay call instead. */
const RAZORPAY_TIMEOUT_MS = 10_000;

export async function POST(req: Request) {
  // Config gate — no side effects, safe to short-circuit outside the try.
  if (PAYMENT_MODE !== "live") {
    return NextResponse.json(
      { error: "Live payments are disabled in demo mode." },
      { status: 403 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json().catch(() => ({ orderId: null }));
    if (typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    // Ownership + eligibility check
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.customerId !== session.user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.paymentStatus === PaymentStatus.PAID) {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay keys not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your deployment environment." },
        { status: 503 }
      );
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;

    const rzpRes = await fetch("https://api.razorpay.com/v1/payment_links", {
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
      signal: AbortSignal.timeout(RAZORPAY_TIMEOUT_MS), // hard 10s cap
    });

    const rzpData = (await rzpRes.json().catch(() => null)) as
      | { short_url?: string; id?: string }
      | null;

    if (!rzpRes.ok || !rzpData?.short_url) {
      console.error(
        "[/api/payments/create] Razorpay rejected the request:",
        rzpRes.status,
        JSON.stringify(rzpRes)
      );
      return NextResponse.json(
        { error: "Could not create the payment link — please try again." },
        { status: 502 }
      );
    }

    // Record the pending payment so the webhook has a row to confirm
    await prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        amount: order.total,
        status: PaymentStatus.PENDING,
        method: "UPI",
        reference: rzpData.id,
      },
      update: { status: PaymentStatus.PENDING, method: "UPI", reference: rzpData.id },
    });

    return NextResponse.json({ ok: true, paymentUrl: rzpData.short_url });
  } catch (error) {
    /* This is the catch that was missing: any throw (Prisma connection
       error, aborted Razorpay fetch, JSON parse) previously escaped the
       handler and Vercel surfaced it as 502 NO_RESPONSE_FROM_FUNCTION.
       Log the complete stack for the Vercel runtime logs, then always
       answer with a JSON body. */
    console.error("[/api/payments/create] crashed:", error);

    const isTimeout = error instanceof Error && error.name === "TimeoutError";
    return NextResponse.json(
      {
        error: isTimeout
          ? "The payment gateway took too long to respond — please try again."
          : "Something went wrong starting your payment — please try again.",
      },
      { status: 500 }
    );
  }
}
