/** Colored status pill — shared by every dashboard table. */
const STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 ring-amber-600/20",
  ACCEPTED: "bg-sky-100 text-sky-800 ring-sky-600/20",
  PICKED_UP: "bg-indigo-100 text-indigo-800 ring-indigo-600/20",
  IN_PROGRESS: "bg-blue-100 text-blue-800 ring-blue-600/20",
  READY: "bg-teal-100 text-teal-800 ring-teal-600/20",
  OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-800 ring-cyan-600/20",
  DELIVERED: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  CANCELLED: "bg-red-100 text-red-800 ring-red-600/20",
  DISPUTED: "bg-rose-100 text-rose-800 ring-rose-600/20",
  PAID: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  FAILED: "bg-red-100 text-red-800 ring-red-600/20",
  REFUNDED: "bg-slate-100 text-slate-700 ring-slate-600/20",
  APPROVED: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  SUSPENDED: "bg-red-100 text-red-800 ring-red-600/20",
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? "bg-slate-100 text-slate-700 ring-slate-600/20";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${style}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
