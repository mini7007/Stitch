import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { VendorStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/vendors/[id]
 * Admin-only: approve (or suspend) a vendor profile.
 * Body: { action?: "APPROVE" | "SUSPEND" } — defaults to APPROVE.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const action = body?.action === "SUSPEND" ? VendorStatus.SUSPENDED : VendorStatus.APPROVED;

  const vendor = await prisma.vendor.findUnique({ where: { id: params.id } });
  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  await prisma.vendor.update({
    where: { id: vendor.id },
    data: { status: action },
  });

  return NextResponse.json({ ok: true, status: action });
}
