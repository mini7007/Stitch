export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import OrderTimeline from "@/components/customer/OrderTimeline";
import PaymentPanel from "@/components/customer/PaymentPanel";
import { ArrowLeft, MapPin, Phone, Star, Store } from "lucide-react";

const BADGE_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  ACCEPTED: "bg-sky-100 text-sky-800",
  PICKED_UP: "bg-indigo-100 text-indigo-800",
  IN_PROGRESS: "bg-violet-100 text-violet-800",
  READY: "bg-teal-100 text-teal-800",
  OUT_FOR_DELIVERY: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
  DISPUTED: "bg-red-100 text-red-800",
};

export default async function OrderTrackingPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      vendor: true,
      items: { include: { service: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
      payment: true,
    },
  });

  /* Only the customer who placed it may view it */
  if (!order || order.customerId !== session.user.id) notFound();

  const placedAt = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <a
              href="/customer/dashboard"
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" /> Back to dashboard
            </a>
            <h1 className="font-display text-3xl text-slate-900">
              Order <span className="text-gold-600">{order.orderNumber}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">Placed on {placedAt}</p>
          </div>

          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${
              BADGE_STYLES[order.status] ?? "bg-slate-100 text-slate-800"
            }`}
          >
            {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
              </span>
            )}
            {order.status.replace(/_/g, " ")}
          </span>
        </div>

        {/* ---- prominent payment section while unpaid ---- */}
        {order.status === "PENDING" && order.paymentStatus === "PENDING" && (
          <PaymentPanel
            orderId={order.id}
            orderNumber={order.orderNumber}
            amountPaise={order.total}
          />
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          {/* ---- timeline ---- */}
          <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200/60 sm:p-8 lg:col-span-3">
            <h2 className="mb-8 font-display text-xl text-slate-900">Tracking</h2>
            <OrderTimeline
              status={order.status}
              history={order.statusHistory.map((h) => ({
                status: h.status,
                note: h.note,
                createdAt: h.createdAt.toISOString(),
              }))}
            />
          </div>

          {/* ---- summary + vendor ---- */}
          <div className="space-y-6 lg:col-span-2">
            {/* vendor card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
              <h2 className="mb-4 font-display text-xl text-slate-900">Your artisan</h2>
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold-300 to-gold-600 text-ink-950">
                  <Store className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{order.vendor.businessName}</p>
                  <div className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    {order.vendor.rating.toFixed(1)}
                  </div>
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-500">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {order.vendor.addressLine}, {order.vendor.city} — {order.vendor.pincode}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <Phone className="h-3.5 w-3.5" /> {order.vendor.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* order summary */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card">
              <h2 className="mb-4 font-display text-xl text-slate-900">Summary</h2>

              <div className="space-y-3 border-b border-slate-100 pb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      {item.service.name}
                      <span className="text-slate-400"> × {item.quantity}</span>
                    </span>
                    <span className="font-medium text-slate-900">
                      {formatINR(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 py-4 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Payment</span>
                  <span
                    className={`font-semibold ${
                      order.paymentStatus === "PAID" ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {order.paymentStatus === "PAID"
                      ? `Paid via ${order.payment?.method ?? "UPI"}`
                      : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatINR(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Platform fee (5%)</span>
                  <span>{formatINR(order.platformFee)}</span>
                </div>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-4">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-display text-xl text-gold-600">{formatINR(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
