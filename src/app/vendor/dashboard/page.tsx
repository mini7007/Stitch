export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { formatINR } from "@/lib/utils";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/ui/StatCard";
import EmptyState from "@/components/ui/EmptyState";
import DataTable, { type DashboardOrderRow } from "@/components/ui/DataTable";
import OrderStatusSelect from "@/components/vendor/OrderStatusSelect";
import VendorLocationCard from "@/components/vendor/VendorLocationCard";
import VendorRevenueChart from "@/components/vendor/VendorRevenueChart";
import CopyProfileLink from "@/components/vendor/CopyProfileLink";
import { CheckCircle2, Hourglass, Package, Star } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function VendorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "VENDOR") redirect("/");
  if (!session.user.vendorId) redirect("/");

  const vendor = await prisma.vendor.findUnique({
    where: { id: session.user.vendorId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 60,
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

  /* ---- stats ---- */
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEarnings = orders
    .filter((o) => o.paymentStatus === PaymentStatus.PAID && o.createdAt >= todayStart)
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === OrderStatus.PENDING).length;
  const completedOrders = orders.filter((o) => o.status === OrderStatus.DELIVERED).length;

  /* ---- 7-day revenue buckets (oldest → today) ---- */
  const buckets: { label: string; earnings: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(day);
    end.setHours(23, 59, 59, 999);
    const earnings = orders
      .filter((o) => o.paymentStatus === PaymentStatus.PAID && o.createdAt >= start && o.createdAt <= end)
      .reduce((sum, o) => sum + o.total, 0);
    buckets.push({
      label: i === 0 ? "Today" : DAYS[day.getDay()],
      earnings,
    });
  }

  const yesterday = buckets[5].earnings;
  const earningsTrend =
    todayEarnings !== yesterday && yesterday + todayEarnings > 0
      ? {
          text: `${todayEarnings >= yesterday ? "+" : "−"}${
            yesterday > 0
              ? `${Math.round((Math.abs(todayEarnings - yesterday) / yesterday) * 100)}%`
              : "100%"
          }`,
          positive: todayEarnings >= yesterday,
        }
      : null;

  /* ---- table rows ---- */
  const rows: DashboardOrderRow[] = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt.toISOString(),
    customerName: order.customer.name,
    serviceName: order.items.map((i) => i.service.name).join(", ") || undefined,
    total: order.total,
    status: order.status,
    paymentStatus: order.paymentStatus,
    action:
      order.status === OrderStatus.PENDING && order.paymentStatus !== PaymentStatus.PAID ? (
        <span className="whitespace-nowrap text-xs font-medium text-amber-600">Awaiting payment</span>
      ) : (
        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
      ),
  }));

  const isEmpty = orders.length === 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader subtitle="Vendor Studio" email={session.user?.email} badge="Vendor" />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-slate-900">{vendor.businessName}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage incoming orders and keep customers updated.
            </p>
          </div>
          {vendor.status !== "APPROVED" && (
            <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-semibold text-sky-700">
              {vendor.status === "PENDING"
                ? "Profile awaiting admin approval — you won't appear in search yet"
                : "Profile suspended — contact support"}
            </span>
          )}
        </div>

        {/* ---- workshop location (nearby-search visibility) ---- */}
        <VendorLocationCard lat={vendor.lat} lng={vendor.lng} />

        {isEmpty ? (
          <div className="mt-8">
            <EmptyState
              icon={Package}
              title="Waiting for your first order"
              subtitle="Share your profile with customers — once an order arrives it will appear here with full tracking."
              action={<CopyProfileLink vendorId={vendor.id} />}
            />
          </div>
        ) : (
          <>
            {/* ---- stats ---- */}
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard title="Today's Earnings" value={formatINR(todayEarnings)} icon={<CheckCircle2 className="h-5 w-5" />} trend={earningsTrend} delay={0} />
              <StatCard title="Pending Orders" value={String(pendingOrders)} icon={<Hourglass className="h-5 w-5" />} delay={0.06} />
              <StatCard title="Completed Orders" value={String(completedOrders)} icon={<Package className="h-5 w-5" />} delay={0.12} />
              <StatCard title="Average Rating" value={vendor.rating.toFixed(1)} icon={<Star className="h-5 w-5" />} delay={0.18} />
            </div>

            {/* ---- revenue chart ---- */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl text-slate-900">Earnings</h2>
                  <p className="text-xs text-slate-500">Paid orders over the last 7 days.</p>
                </div>
              </div>
              <div className="mt-4">
                <VendorRevenueChart data={buckets} />
              </div>
            </div>

            {/* ---- incoming orders ---- */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="font-display text-xl text-slate-900">Incoming Orders</h2>
                <p className="text-xs text-slate-500">
                  Move an order forward — the customer sees every update live.
                </p>
              </div>
              <DataTable
                rows={rows}
                showService
                pageSize={6}
                empty={
                  <EmptyState
                    icon={Package}
                    title="Waiting for your first order"
                    subtitle="Share your profile — new orders land here."
                  />
                }
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
