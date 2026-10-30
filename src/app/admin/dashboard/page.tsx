export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import { OrderStatus, PaymentStatus, VendorStatus } from "@prisma/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";
import DataTable, { type DashboardOrderRow } from "@/components/ui/DataTable";
import ApproveVendorButton from "@/components/admin/ApproveVendorButton";
import RejectVendorButton from "@/components/admin/RejectVendorButton";
import AdminActivityChart from "@/components/admin/AdminActivityChart";
import { BadgeCheck, IndianRupee, MapPin, Package, ShieldCheck, Store, Users } from "lucide-react";

const NOT_SETTLED = [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.DISPUTED];

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const now = new Date();
  const windowStart = new Date(now);
  windowStart.setDate(windowStart.getDate() - 29);
  windowStart.setHours(0, 0, 0, 0);

  const [gmvAgg, userCount, activeVendors, pendingVendors, recentOrders, activityOrders] =
    await Promise.all([
      prisma.order.aggregate({ where: { paymentStatus: PaymentStatus.PAID }, _sum: { total: true } }),
      prisma.user.count(),
      prisma.vendor.count({ where: { status: VendorStatus.APPROVED } }),
      prisma.vendor.findMany({
        where: { status: VendorStatus.PENDING },
        orderBy: { businessName: "asc" },
        include: { owner: true, services: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
        include: { customer: true, vendor: true, items: { include: { service: true } } },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: windowStart } },
        select: { createdAt: true, total: true, paymentStatus: true },
      }),
    ]);

  /* ---- 30-day activity buckets (oldest → today) ---- */
  const activity: { label: string; orders: number; revenue: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);

    const dayOrders = activityOrders.filter((o) => o.createdAt >= start && o.createdAt <= end);
    activity.push({
      label: day.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      orders: dayOrders.length,
      revenue: dayOrders
        .filter((o) => o.paymentStatus === PaymentStatus.PAID)
        .reduce((sum, o) => sum + o.total, 0),
    });
  }

  /* ---- recent orders table rows ---- */
  const rows: DashboardOrderRow[] = recentOrders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt.toISOString(),
    customerName: order.customer.name,
    vendorName: order.vendor.businessName,
    serviceName: order.items.map((i) => i.service.name).join(", ") || undefined,
    total: order.total,
    status: order.status,
    paymentStatus: order.paymentStatus,
  }));

  const activeOrdersCount = await prisma.order.count({ where: { status: { notIn: NOT_SETTLED } } });

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader subtitle="Command Center" email={session.user?.email} badge="Admin" />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Good day, Chief.</h1>
          <p className="mt-1 text-sm text-slate-500">
            The marketplace at a glance — approvals keep the network trusted.
          </p>
        </div>

        {/* ---- pending vendor approvals (prominent when non-empty) ---- */}
        {pendingVendors.length > 0 ? (
          <section className="mt-8 overflow-hidden rounded-2xl border border-amber-300 bg-amber-50/60 shadow-sm">
            <div className="flex items-center gap-3 border-b border-amber-200 px-6 py-4">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500 text-zinc-950">
                <BadgeCheck className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-display text-lg text-slate-900">
                  Vendor Approvals
                  <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 align-middle text-[11px] font-bold text-zinc-950">
                    {pendingVendors.length} waiting
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Approved vendors instantly appear in the customer marketplace.
                </p>
              </div>
            </div>
            <ul className="divide-y divide-amber-200/70 bg-white">
              {pendingVendors.map((vendor) => (
                <li
                  key={vendor.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-6 py-5"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{vendor.businessName}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {vendor.owner.name} · {vendor.owner.email}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3" /> {vendor.city} · {vendor.services.length} service
                      {vendor.services.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <ApproveVendorButton vendorId={vendor.id} />
                    <RejectVendorButton vendorId={vendor.id} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <section className="mt-8 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
              <BadgeCheck className="h-4 w-4" />
            </span>
            <p className="text-sm text-slate-600">
              All caught up — no vendors awaiting KYC review.
            </p>
          </section>
        )}

        {/* ---- stats ---- */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title="Platform GMV"
            value={formatINR(gmvAgg._sum.total ?? 0)}
            icon={<IndianRupee className="h-5 w-5" />}
            delay={0}
          />
          <StatCard title="Total Users" value={String(userCount)} icon={<Users className="h-5 w-5" />} delay={0.06} />
          <StatCard title="Active Vendors" value={String(activeVendors)} icon={<Store className="h-5 w-5" />} delay={0.12} />
          <StatCard title="Live Orders" value={String(activeOrdersCount)} icon={<Package className="h-5 w-5" />} delay={0.18} />
        </div>

        {/* ---- platform activity ---- */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-xl text-slate-900">Platform Activity</h2>
              <p className="text-xs text-slate-500">Daily orders and revenue over the last 30 days.</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-slate-300" />
          </div>
          <div className="mt-4">
            <AdminActivityChart data={activity} />
          </div>
        </section>

        {/* ---- recent orders ---- */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="font-display text-xl text-slate-900">Recent Orders</h2>
            <p className="text-xs text-slate-500">The latest activity across the marketplace.</p>
          </div>
          <DataTable
            rows={rows}
            showVendor
            showService
            pageSize={8}
            empty={
              <EmptyState
                icon={Package}
                title="No orders placed yet"
                subtitle="As soon as customers start booking, every order shows up here."
              />
            }
          />
        </section>
      </main>
    </div>
  );
}
