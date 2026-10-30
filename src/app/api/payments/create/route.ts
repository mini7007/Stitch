import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PAYMENT_MODE } from "@/lib/payments";

/**
 * POST /api/payments/create — LIVE MODE ONLY
 *
 * Creates a real Razorpay order / payment link for UPI collection.
 * Currently a placeholder: 501 until Razorpay keys are configured.
 *
 * When implementing:
 *   1. `npm install razorpay`
 *   2. Validate the session user owns the (unpaid) order in the DB.
 *   3. Create the Razorpay order:
 *
 *        const razorpay = new Razorpay({
 *          key_id: process.env.RAZORPAY_KEY_ID!,
 *          key_secret: process.env.RAZORPAY_KEY_SECRET!,
 *        });
 *        const rzpOrder = await razorpay.orders.create({
 *          amount: order.total,        // paise
 *          currency: "INR",
 *          receipt: order.id,
 *        });
 *
 *   4. Return what the client needs:
 *        - Checkout.js flow → { keyId: process.env.RAZORPAY_KEY_ID, razorpayOrderId: rzpOrder.id, amount: order.total }
 *        - Payment link / QR flow → { paymentUrl: link.short_url } or { qrDataUrl: <data url> }
 *
 *   Confirmation does NOT happen here — it arrives asynchronously via the
 *   Razorpay webhook (/api/webhooks/razorpay), which marks the payment PAID.
 */
export async function POST(_req: Request) {
  if (PAYMENT_MODE !== "live") {
    return NextResponse.json(
      { error: "Live payments are disabled in demo mode." },
      { status: 403 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO: implement Razorpay order creation (steps above) after keys are set.
  return NextResponse.json(
    { error: "Online payments aren't wired up yet — Razorpay setup pending." },
    { status: 501 }
  );
}
