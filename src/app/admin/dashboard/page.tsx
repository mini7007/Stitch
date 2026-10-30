import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ApproveVendorButton from "@/components/admin/ApproveVendorButton";
import { BadgeCheck, IndianRupee, MapPin, ShieldCheck, Store, Users } from "lucide-react";

const STATUS_BADGES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  ACCEPTED: "bg-sky-500/15 text-sky-400 ring-sky-500/30",
  IN_PROGRESS: "bg-violet-500/15 text-violet-300 ring-violet-500/30",
  READY: "bg-teal-500/15 text-teal-300 ring-teal-500/30",
  OUT_FOR_DELIVERY: "bg-blue-500/15 text-blue-300 ring-blue-500/30",
  DELIVERED: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
};

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const [totalOrders, totalUsers, revenueAgg, pendingVendors, recentOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } }),
      prisma.vendor.findMany({
        where: { status: "PENDING" },
        orderBy: { businessName: "asc" },
        include: { owner: true, services: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { customer: true, vendor: true },
      }),
    ]);

  const stats = [
    { icon: ShieldCheck, label: "Total Orders", value: String(totalOrders) },
    { icon: IndianRupee, label: "Revenue (Paid)", value: formatINR(revenueAgg._sum.total ?? 0) },
    { icon: Users, label: "Total Users", value: String(totalUsers) },
    { icon: Store, label: "Pending Approvals", value: String(pendingVendors.length) },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <DashboardHeader subtitle="Command Center" email={session.user?.email} badge="Admin" />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div>
          <h1 className="font-display text-3xl text-white">Good day, Chief.</h1>
          <p className="mt-1 text-sm text-zinc-500">
            The marketplace at a glance — approvals keep the network trusted.
          </p>
        </div>

        {/* ---- stats ---- */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">
                <s.icon className="h-4 w-4" />
              </span>
              <p className="mt-3 font-display text-2xl text-white">{s.value}</p>
              <p className="text-xs text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* ---- pending vendor approvals ---- */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 shadow-xl">
            <div className="border-b border-white/10 px-6 py-5">
              <h2 className="font-display text-xl text-white">Vendor Approvals</h2>
              <p className="text-xs text-zinc-500">
                Approved vendors instantly appear in the customer marketplace.
              </p>
            </div>

            {pendingVendors.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <BadgeCheck className="mx-auto h-8 w-8 text-emerald-500" />
                <p className="mt-3 text-sm text-zinc-400">All caught up — no vendors awaiting review.</p>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {pendingVendors.map((vendor) => (
                  <li key={vendor.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{vendor.businessName}</p>
                      <p className="mt-0.5 truncate text-xs text-zinc-500">
                        {vendor.owner.name} · {vendor.owner.email}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                        <MapPin className="h-3 w-3" /> {vendor.city} · {vendor.services.length} service
                        {vendor.services.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <ApproveVendorButton vendorId={vendor.id} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ---- recent orders ---- */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60 shadow-xl">
            <div className="border-b border-white/10 px-6 py-5">
              <h2 className="font-display text-xl text-white">Recent Orders</h2>
              <p className="text-xs text-zinc-500">The latest activity across the marketplace.</p>
            </div>

            {recentOrders.length === 0 ? (
              <div className="px-6 py-14 text-center text-sm text-zinc-400">
                No orders placed yet.
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {recentOrders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-amber-400">{order.orderNumber}</p>
                      <p className="mt-0.5 truncate text-xs text-zinc-500">
                        {order.customer.name} → {order.vendor.businessName}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold text-white">{formatINR(order.total)}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${
                          STATUS_BADGES[order.status] ?? "bg-zinc-500/15 text-zinc-300 ring-zinc-500/30"
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
