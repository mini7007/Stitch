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
  if (PAYMENT_MODE !== "demo") {
    return NextResponse.json(
      { error: "Mock payments are disabled in live mode — confirmations arrive via the Razorpay webhook." },
      { status: 403 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CUSTOMER") {
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
