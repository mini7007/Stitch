import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/vendor/location — vendors save their workshop coordinates so
 * customers find them in the hyper-local "Nearby Vendors" search.
 */

const bodySchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "VENDOR" || !session.user.vendorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Valid lat and lng are required." }, { status: 400 });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: session.user.vendorId },
      select: { id: true },
    });
    if (!vendor) {
      return NextResponse.json({ error: "Vendor profile not found." }, { status: 404 });
    }

    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { lat: parsed.data.lat, lng: parsed.data.lng },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[/api/vendor/location] failed:", error);
    return NextResponse.json(
      { error: "Something went wrong saving your location — please try again." },
      { status: 500 }
    );
  }
}
