/**
 * Payment mode isolation.
 *
 * "demo" (default): mock UPI QR (stitch@upi) + "Simulate Payment Success".
 * "live":           Razorpay — the mock route 403s and real confirmations
 *                   arrive via the /api/webhooks/razorpay webhook.
 *
 * NEXT_PUBLIC_* is inlined into the client bundle, so this constant works
 * in both server routes and client components. Anything other than "live"
 * falls back to demo — a safe default.
 */
export const PAYMENT_MODE =
  process.env.NEXT_PUBLIC_PAYMENT_MODE === "live" ? "live" : "demo";

export const IS_DEMO_PAYMENTS = PAYMENT_MODE !== "live";
