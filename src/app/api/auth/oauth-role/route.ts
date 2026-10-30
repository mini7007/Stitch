import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { UserRole, VendorStatus } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* Applies the role a user chose BEFORE hitting the Google button.
   Called by /oauth/welcome right after the OAuth redirect.

   Guards:
   - Requires an authenticated session.
   - Never silently downgrades an established role (ADMIN→anything,
     VENDOR→CUSTOMER) — the effective role is returned instead.
   - Self-serve ADMIN requires ADMIN_INVITE_CODE (keeps the signup
     rule that nobody can self-assign admin without the code). */
const roleSchema = z.object({
  role: z.enum(["CUSTOMER", "VENDOR", "ADMIN"]),
  // nullish: the welcome page omits/never sets the invite cookie for
  // non-admin picks, and JSON.stringify keeps explicit nulls.
  inviteCode: z.string().trim().max(100).nullish(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = roleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  const { role, inviteCode } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { vendor: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isDowngrade =
    (user.role === UserRole.ADMIN && role !== UserRole.ADMIN) ||
    (user.role === UserRole.VENDOR && role === UserRole.CUSTOMER);
  if (isDowngrade) {
    return NextResponse.json({ ok: true, role: user.role, kept: true });
  }

  if (role === UserRole.ADMIN) {
    const expected = process.env.ADMIN_INVITE_CODE;
    if (!expected || inviteCode !== expected) {
      return NextResponse.json({ error: "Invalid admin invite code" }, { status: 403 });
    }
  }

  await prisma.user.update({ where: { id: user.id }, data: { role } });

  // Vendor selection also provisions a business profile (mirrors email signup)
  if (role === UserRole.VENDOR && !user.vendor) {
    await prisma.vendor.create({
      data: {
        ownerId: user.id,
        businessName: `${user.name ?? user.email.split("@")[0]}'s Studio`,
        phone: "To be updated",
        addressLine: "To be updated",
        city: "To be updated",
        pincode: "000000",
        status: VendorStatus.PENDING, // awaits admin approval
      },
    });
  }

  return NextResponse.json({ ok: true, role });
}
