import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PaymentStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PAYMENT_MODE } from "@/lib/payments";

/**
 * POST /api/orders/[id]/pay
 * Mock UPI payment: marks the order's payment as PAID, moves the order to
 * ACCEPTED and appends to the status history.
 *
 * DEMO MODE ONLY — in live mode, confirmation arrives exclusively through
 * the Razorpay webhook (/api/webhooks/razorpay).
 */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  /* Mock confirmations: allowed for EVERYONE in demo mode, and for the
     super-admin in live mode (emergency bypass to keep testing the rest
     of the app when Razorpay is failing). */
  const SUPER_ADMIN_EMAIL = "mohan5050390@gmail.com";
  const isSuperAdmin = session?.user?.email === SUPER_ADMIN_EMAIL;

  if (PAYMENT_MODE !== "demo" && !isSuperAdmin) {
    return NextResponse.json(
      { error: "Mock payments are disabled in live mode — confirmations arrive via the Razorpay webhook." },
      { status: 403 }
    );
  }

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "CUSTOMER" && !isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { payment: true },
  });
  if (!order || order.customerId !== session.user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentStatus === PaymentStatus.PAID) {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  const reference = `MOCKUTR${Date.now()}`;

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
        note: "Payment received via UPI (mock)",
      },
    }),
  ]);

  return NextResponse.json({ ok: true, reference });
}
