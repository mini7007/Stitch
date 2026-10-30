import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/webhooks/razorpay — LIVE MODE payment confirmation entry point.
 *
 * ── Razorpay Dashboard setup ─────────────────────────────────────────────
 *   Settings → Webhooks → Add New Webhook
 *     URL:     https://<your-domain>/api/webhooks/razorpay
 *     Secret:  a strong random string → also set RAZORPAY_WEBHOOK_SECRET
 *     Events:  payment_link.paid, payment.captured, payment.failed
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Every request is verified against the X-Razorpay-Signature HMAC before
 * touching the database, and confirmation is idempotent (safe for the
 * duplicate deliveries Razorpay sends on timeouts).
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "RAZORPAY_WEBHOOK_SECRET is not configured." },
      { status: 503 }
    );
  }

  // Raw body FIRST — the HMAC is computed over the exact bytes.
  const raw = await req.text();

  const signature = req.headers.get("x-razorpay-signature") ?? "";
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const valid =
    signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(raw) as {
      event: string;
      payload: {
        payment?: { entity?: { id?: string; notes?: { orderId?: string }; receipt?: string } };
        payment_link?: { entity?: { reference_id?: string } };
      };
    };

    const payment = event.payload?.payment?.entity;
    const link = event.payload?.payment_link?.entity;

    // Map the Razorpay event back to our order (payment links carry
    // reference_id; orders-API payments carry notes/receipt).
    const orderId =
      link?.reference_id ??
      payment?.notes?.orderId ??
      (payment?.receipt ? payment.receipt : undefined);

    if (!orderId) {
      // Acknowledge (2xx) so Razorpay doesn't retry endlessly — nothing to do.
      return NextResponse.json({ ok: true, ignored: "no order reference" });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ ok: true, ignored: "unknown order" });
    }

    if (event.event === "payment_link.paid" || event.event === "payment.captured") {
      if (order.paymentStatus === PaymentStatus.PAID) {
        return NextResponse.json({ ok: true, idempotent: true }); // already confirmed
      }

      const reference = payment?.id ?? `LINK-${Date.now()}`;
      await prisma.$transaction([
        prisma.payment.upsert({
          where: { orderId: order.id },
          create: {
            orderId: order.id,
            amount: order.total,
            status: PaymentStatus.PAID,
            method: "UPI",
            reference,
          },
          update: { status: PaymentStatus.PAID, method: "UPI", reference },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: PaymentStatus.PAID, status: "ACCEPTED" },
        }),
        prisma.statusHistory.create({
          data: {
            orderId: order.id,
            status: "ACCEPTED",
            note: `Payment received via UPI (Razorpay ${reference})`,
          },
        }),
      ]);
      return NextResponse.json({ ok: true, orderId: order.id, status: "PAID" });
    }

    if (event.event === "payment.failed") {
      await prisma.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          amount: order.total,
          status: PaymentStatus.FAILED,
          method: "UPI",
          reference: payment?.id,
        },
        update: { status: PaymentStatus.FAILED, method: "UPI", reference: payment?.id },
      });
      return NextResponse.json({ ok: true, orderId: order.id, status: "FAILED" });
    }

    return NextResponse.json({ ok: true, ignored: event.event });
  } catch (error) {
    /* Crash guard: log the complete stack in the Vercel runtime logs and
       answer 500 so Razorpay retries the delivery instead of a bare 502. */
    console.error("[/api/webhooks/razorpay] handler crashed:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
