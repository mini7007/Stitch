export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";
import DataTable, { type DashboardOrderRow } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { ArrowRight, BadgeIndianRupee, CheckCircle2, Loader2, Ruler, ShoppingBag } from "lucide-react";

const NOT_SETTLED = [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.DISPUTED];

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default async function CustomerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const customerId = session.user.id;

  const now = new Date();
  const d30 = new Date(now);
  d30.setDate(d30.getDate() - 30);
  const d60 = new Date(now);
  d60.setDate(d60.getDate() - 60);

  const [activeCount, activeOrders, spentAgg, spent30Agg, spentPrev30Agg, completedCount, completed] =
    await Promise.all([
      prisma.order.count({ where: { customerId, status: { notIn: NOT_SETTLED } } }),
      prisma.order.findMany({
        where: { customerId, status: { notIn: NOT_SETTLED } },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { vendor: true, items: { include: { service: true } } },
      }),
      prisma.order.aggregate({
        where: { customerId, paymentStatus: PaymentStatus.PAID },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { customerId, paymentStatus: PaymentStatus.PAID, createdAt: { gte: d30 } },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: { customerId, paymentStatus: PaymentStatus.PAID, createdAt: { gte: d60, lt: d30 } },
        _sum: { total: true },
      }),
      prisma.order.count({ where: { customerId, status: OrderStatus.DELIVERED } }),
      prisma.order.findMany({
        where: { customerId, status: OrderStatus.DELIVERED },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { vendor: true, items: { include: { service: true } } },
      }),
    ]);

  const spent30 = spent30Agg._sum.total ?? 0;
  const spentPrev30 = spentPrev30Agg._sum.total ?? 0;
  const spentTrend =
    spentPrev30 > 0
      ? {
          text: `${spent30 >= spentPrev30 ? "+" : "−"}${Math.round(
            (Math.abs(spent30 - spentPrev30) / spentPrev30) * 100
          )}%`,
          positive: spent30 >= spentPrev30,
        }
      : spent30 > 0
        ? { text: "New", positive: true }
        : null;

  const historyRows: DashboardOrderRow[] = completed.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt.toISOString(),
    customerName: session.user.name ?? "You",
    vendorName: order.vendor.businessName,
    serviceName: order.items.map((i) => i.service.name).join(", ") || undefined,
    total: order.total,
    status: order.status,
    paymentStatus: order.paymentStatus,
  }));

  return (
    <div>
      <div>
        <h1 className="font-display text-3xl text-slate-900">
          Hello, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track your orders and discover the best artisans near you.
        </p>
      </div>

      {/* ---- stats ---- */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Active Orders" value={String(activeCount)} icon={<Loader2 className="h-5 w-5" />} delay={0} />
        <StatCard title="Total Spent" value={formatINR(spentAgg._sum.total ?? 0)} icon={<BadgeIndianRupee className="h-5 w-5" />} trend={spentTrend} delay={0.06} />
        <StatCard title="Orders Completed" value={String(completedCount)} icon={<CheckCircle2 className="h-5 w-5" />} delay={0.12} />
        <StatCard title="Measurement Profiles" value="0" icon={<Ruler className="h-5 w-5" />} delay={0.18} />
      </div>

      {/* ---- active orders ---- */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-slate-900">Active Orders</h2>
          <a href="/customer/vendors" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
            Book something new →
          </a>
        </div>

        {activeOrders.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={ShoppingBag}
              title="No active orders"
              subtitle="Place an order with a nearby vendor and follow it here, stitch by stitch."
              href="/customer/vendors"
              ctaLabel="Find a Vendor"
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{order.vendor.businessName}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {order.items.map((i) => i.service.name).join(", ") || "Custom order"}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-3 font-mono text-[11px] text-amber-600">{order.orderNumber}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{formatINR(order.total)}</p>
                  {order.paymentStatus !== PaymentStatus.PAID && (
                    <p className="mt-0.5 text-xs font-medium text-amber-600">Payment pending</p>
                  )}
                </div>
                <a
                  href={`/customer/orders/${order.id}`}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-700 active:scale-95"
                >
                  Track Order <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ---- recent history ---- */}
      <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-display text-xl text-slate-900">Recent History</h2>
          <p className="text-xs text-slate-500">Your completed orders, kept on record.</p>
        </div>
        <DataTable
          rows={historyRows}
          showVendor
          showService
          pageSize={5}
          empty={
            <EmptyState
              icon={CheckCircle2}
              title="No completed orders yet"
              subtitle="Once an order is delivered, it lands here for your records."
            />
          }
        />
      </section>
    </div>
  );
}
