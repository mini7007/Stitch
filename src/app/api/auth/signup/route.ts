import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { UserRole, VendorStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  role: z.enum(["CUSTOMER", "VENDOR"], { message: "Choose a role" }),
  businessName: z.string().trim().min(2).max(100).optional(),
  city: z.string().trim().min(2).max(60).optional(),
  phone: z.string().trim().min(6).max(15).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid details" },
      { status: 400 }
    );
  }

  const { name, email, password, role, businessName, city, phone } = parsed.data;

  if (role === UserRole.VENDOR && (!businessName || !city || !phone)) {
    return NextResponse.json(
      { error: "Business name, city and phone are required for vendor accounts" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      ...(role === UserRole.VENDOR
        ? {
            vendor: {
              create: {
                businessName: businessName!,
                phone: phone!,
                addressLine: "To be updated",
                city: city!,
                pincode: "000000",
                status: VendorStatus.PENDING, // awaits admin approval
              },
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
}
