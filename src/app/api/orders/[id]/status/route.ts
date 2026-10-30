import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { OrderStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { statusIndex } from "@/lib/roles";

const VALID = new Set<string>(Object.values(OrderStatus));

/**
 * POST /api/orders/[id]/status
 * Vendor-only: move an order forward through the fulfillment flow
 * and append to the order's status history.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "VENDOR" || !session.user.vendorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const status = body?.status as OrderStatus;
  if (!status || !VALID.has(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order || order.vendorId !== session.user.vendorId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const current = statusIndex(order.status);
  const next = statusIndex(status);
  if (next === -1 || next <= current) {
    return NextResponse.json(
      { error: "Orders can only move forward in the flow" },
      { status: 400 }
    );
  }

  /* An order that hasn't been paid can't leave PENDING */
  if (order.status === "PENDING" && order.paymentStatus !== "PAID") {
    return NextResponse.json(
      { error: "Awaiting customer payment — cannot accept yet" },
      { status: 402 }
    );
  }

  await prisma.order.update({ where: { id: order.id }, data: { status } });
  await prisma.statusHistory.create({
    data: {
      orderId: order.id,
      status,
      note: `Marked ${status.replace(/_/g, " ").toLowerCase()} by vendor`,
    },
  });

  return NextResponse.json({ ok: true, status });
}
