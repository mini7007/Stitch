export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import { statusIndex } from "@/lib/roles";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OrderStatusSelect from "@/components/vendor/OrderStatusSelect";
import { Clock, Hammer, PackageCheck, Wallet } from "lucide-react";

const BADGE_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  ACCEPTED: "bg-sky-500/15 text-sky-400 ring-sky-500/30",
  PICKED_UP: "bg-indigo-500/15 text-indigo-300 ring-indigo-500/30",
  IN_PROGRESS: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  READY: "bg-teal-500/15 text-teal-300 ring-teal-500/30",
  OUT_FOR_DELIVERY: "bg-blue-500/15 text-blue-300 ring-blue-500/30",
  DELIVERED: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  CANCELLED: "bg-red-500/15 text-red-400 ring-red-500/30",
  DISPUTED: "bg-red-500/15 text-red-400 ring-red-500/30",
};

export default async function VendorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "VENDOR") redirect("/");
  if (!session.user.vendorId) redirect("/");

  const vendor = await prisma.vendor.findUnique({
    where: { id: session.user.vendorId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          items: { include: { service: true } },
          payment: true,
        },
      },
    },
  });
  if (!vendor) redirect("/");

  const orders = vendor.orders;
  const awaitingPayment = orders.filter((o) => o.paymentStatus === "PENDING" && o.status === "PENDING");
  const active = orders.filter(
    (o) => o.paymentStatus === "PAID" && statusIndex(o.status) > 0 && statusIndex(o.status) < 6
  );
  const delivered = orders.filter((o) => o.status === "DELIVERED");
  const revenue = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { icon: Wallet, label: "Awaiting Payment", value: String(awaitingPayment.length) },
    { icon: Hammer, label: "Active Jobs", value: String(active.length) },
    { icon: PackageCheck, label: "Delivered", value: String(delivered.length) },
    { icon: Clock, label: "Lifetime Earnings*", value: formatINR(revenue) },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <DashboardHeader subtitle="Vendor Studio" email={session.user?.email} badge="Vendor" />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-white">{vendor.businessName}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage incoming orders and keep customers updated.
            </p>
          </div>
          {vendor.status !== "APPROVED" && (
            <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold text-sky-300">
              {vendor.status === "PENDING"
                ? "Profile awaiting admin approval — you won't appear in search yet"
                : "Profile suspended — contact support"}
            </span>
          )}
        </div>

        {/* ---- stats ---- */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
                <s.icon className="h-4 w-4" />
              </span>
              <p className="mt-3 font-display text-2xl text-white">{s.value}</p>
              <p className="text-xs text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ---- orders ---- */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 shadow-xl">
          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="font-display text-xl text-white">Orders</h2>
            <p className="text-xs text-zinc-500">
              *Lifetime earnings are before the 5% platform fee.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Hammer className="mx-auto h-8 w-8 text-zinc-700" />
              <p className="mt-4 font-display text-lg text-zinc-400">No orders yet</p>
              <p className="mt-1 text-sm text-zinc-600">
                Once customers book your services, they&apos;ll appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                    <th className="px-6 py-3.5 font-semibold">Order</th>
                    <th className="px-4 py-3.5 font-semibold">Customer</th>
                    <th className="px-4 py-3.5 font-semibold">Service</th>
                    <th className="px-4 py-3.5 font-semibold">Total</th>
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                    <th className="px-6 py-3.5 font-semibold">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {orders.map((order) => {
                    const item = order.items[0];
                    const paid = order.paymentStatus === "PAID";
                    return (
                      <tr key={order.id} className="transition-colors hover:bg-white/[0.03]">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-amber-400">{order.orderNumber}</span>
                          <p className="mt-0.5 text-[11px] text-zinc-500">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-zinc-300">{order.customer.name}</td>
                        <td className="px-4 py-4">
                          <span className="text-zinc-300">{item?.service.name ?? "—"}</span>
                          {item && item.quantity > 1 && (
                            <span className="text-zinc-500"> × {item.quantity}</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-white">{formatINR(order.total)}</span>
                          <p className={`text-[11px] ${paid ? "text-emerald-400" : "text-amber-500"}`}>
                            {paid ? "Paid" : "Unpaid"}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${
                              BADGE_STYLES[order.status] ?? "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30"
                            }`}
                          >
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="w-52 px-6 py-4">
                          {order.status === "PENDING" && !paid ? (
                            <span className="flex items-center gap-1.5 text-xs text-amber-500">
                              <Wallet className="h-3.5 w-3.5" /> Awaiting customer payment
                            </span>
                          ) : (
                            <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
