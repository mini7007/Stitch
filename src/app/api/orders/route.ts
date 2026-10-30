import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { vendorId, serviceId, quantity, notes } = body;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  const subtotal = service.basePrice * quantity;
  const platformFee = Math.round(subtotal * 0.05); // 5% platform fee
  const total = subtotal + platformFee;

  // Create the order
  const order = await prisma.order.create({
    data: {
      orderNumber: `STC-${Date.now()}`,
      customerId: session.user.id,
      vendorId,
      status: "PENDING",
      subtotal,
      platformFee,
      total,
      items: {
        create: {
          serviceId,
          quantity,
          unitPrice: service.basePrice,
          notes,
        }
      },
      statusHistory: {
        create: { status: "PENDING", note: "Order placed by customer" }
      }
    }
  });

  return NextResponse.json({ ok: true, orderId: order.id });
}
