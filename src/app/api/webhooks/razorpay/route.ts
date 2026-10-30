import { NextResponse } from "next/server";

/**
 * POST /api/webhooks/razorpay — LIVE MODE payment confirmation entry point.
 * Placeholder (501) until Razorpay is configured; the full implementation
 * is sketched below so wiring it up is a single uncomment.
 *
 * ── Razorpay Dashboard setup ─────────────────────────────────────────────
 *   Settings → Webhooks → Add New Webhook
 *     URL:     https://<your-domain>/api/webhooks/razorpay
 *     Secret:  a strong random string → also put it in .env as
 *              RAZORPAY_WEBHOOK_SECRET
 *     Events:  payment.captured, payment.failed
 * ─────────────────────────────────────────────────────────────────────────
 *
 * import crypto from "node:crypto";
 * import { NextResponse } from "next/server";
 * import { PaymentStatus } from "@prisma/client";
 * import { prisma } from "@/lib/prisma";
 *
 * export async function POST(req: Request) {
 *   // 1. Raw body FIRST — the HMAC is computed over the exact bytes.
 *   const raw = await req.text();
 *
 *   // 2. Verify the X-Razorpay-Signature header (timing-safe compare).
 *   const signature = req.headers.get("x-razorpay-signature") ?? "";
 *   const expected = crypto
 *     .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
 *     .update(raw)
 *     .digest("hex");
 *   const valid =
 *     signature.length === expected.length &&
 *     crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
 *   if (!valid) {
 *     return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
 *   }
 *
 *   // 3. Handle the event — mirror of the demo pay route's transaction.
 *   const event = JSON.parse(raw);
 *   if (event.event === "payment.captured") {
 *     const payment = event.payload.payment.entity;
 *     const order = await prisma.order.findUnique({
 *       where: { id: payment.notes?.orderId ?? payment.receipt },
 *     });
 *     if (order && order.paymentStatus !== "PAID") {
 *       await prisma.$transaction([
 *         prisma.payment.upsert({
 *           where: { orderId: order.id },
 *           create: { orderId: order.id, amount: payment.amount, status: PaymentStatus.PAID, method: "UPI", reference: payment.id },
 *           update: { status: PaymentStatus.PAID, method: "UPI", reference: payment.id },
 *         }),
 *         prisma.order.update({ where: { id: order.id }, data: { paymentStatus: PaymentStatus.PAID, status: "ACCEPTED" } }),
 *         prisma.statusHistory.create({ data: { orderId: order.id, status: "ACCEPTED", note: `Payment received via UPI (Razorpay ${payment.id})` } }),
 *       ]);
 *     }
 *   }
 *
 *   return NextResponse.json({ ok: true });
 * }
 */
export async function POST(_req: Request) {
  return NextResponse.json(
    { error: "Razorpay webhook not configured yet." },
    { status: 501 }
  );
}
