"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { formatINR } from "@/lib/utils";
import StatusBadge from "./StatusBadge";

/** One row of the dashboard order table — plain serializable fields. */
export type DashboardOrderRow = {
  id: string;
  orderNumber: string;
  createdAt: string; // ISO
  customerName: string;
  vendorName?: string;
  serviceName?: string;
  total: number; // paise
  status: string;
  paymentStatus: string;
  /** Optional client control (e.g. OrderStatusSelect) — rendered as-is. */
  action?: React.ReactNode;
};

type SortKey = "orderNumber" | "createdAt" | "customerName" | "vendorName" | "serviceName" | "total" | "status";

type Column = {
  key: SortKey | "payment" | "action";
  label: string;
  sortable?: boolean;
  className?: string;
};

/* Build the column list explicitly to keep sort keys type-safe. */
const tableColumns = (
  showVendor: boolean,
  showService: boolean
): Column[] => [
  { key: "orderNumber", label: "Order", sortable: true },
  { key: "customerName", label: "Customer", sortable: true },
  ...(showVendor ? [{ key: "vendorName" as SortKey, label: "Vendor", sortable: false }] : []),
  ...(showService ? [{ key: "serviceName" as SortKey, label: "Service", sortable: false }] : []),
  { key: "total", label: "Total", sortable: true, className: "text-right" },
  { key: "payment", label: "Payment" },
  { key: "status", label: "Status", sortable: true },
  { key: "action", label: "Update" },
];

/**
 * Reusable dashboard table with client-side sorting and pagination over the
 * server-fetched rows. Columns adapt: vendor/service columns are opt-in.
 */
export default function DataTable({
  rows,
  showVendor = false,
  showService = false,
  pageSize = 6,
  empty,
}: {
  rows: DashboardOrderRow[];
  showVendor?: boolean;
  showService?: boolean;
  pageSize?: number;
  empty?: React.ReactNode;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const cols = tableColumns(showVendor, showService);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "total":
          cmp = a.total - b.total;
          break;
        case "createdAt":
          cmp = a.createdAt.localeCompare(b.createdAt);
          break;
        case "customerName":
          cmp = a.customerName.localeCompare(b.customerName);
          break;
        case "orderNumber":
          cmp = a.orderNumber.localeCompare(b.orderNumber);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        default:
          cmp = 0;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  }

  if (rows.length === 0) {
    return (
      empty ?? (
        <div className="px-6 py-14 text-center text-sm text-slate-500">Nothing here yet.</div>
      )
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-[11px] uppercase tracking-wider text-slate-500">
              {cols.map((col) => (
                <th key={col.label} className={`px-4 py-3.5 font-semibold first:pl-6 last:pr-6 ${col.className ?? ""}`}>
                  {col.sortable ? (
                    <button
                      onClick={() => toggleSort(col.key as SortKey)}
                      className="inline-flex items-center gap-1 transition-colors hover:text-slate-900"
                    >
                      {col.label}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageRows.map((row) => (
              <tr key={row.id} className="transition-colors hover:bg-slate-50">
                <td className="px-4 py-3.5 pl-6">
                  <span className="font-mono text-xs font-medium text-amber-600">{row.orderNumber}</span>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {new Date(row.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </td>
                <td className="px-4 py-3.5 text-slate-700">{row.customerName}</td>
                {showVendor && <td className="px-4 py-3.5 text-slate-700">{row.vendorName ?? "—"}</td>}
                {showService && <td className="px-4 py-3.5 text-slate-700">{row.serviceName ?? "—"}</td>}
                <td className="px-4 py-3.5 text-right font-semibold text-slate-900">{formatINR(row.total)}</td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={row.paymentStatus} />
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3.5 pr-6">
                  {row.action ?? <span className="text-xs text-slate-400">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length > pageSize && (
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
          <p className="text-xs text-slate-500">
            Showing {safePage * pageSize + 1}–{Math.min(sorted.length, safePage * pageSize + pageSize)} of{" "}
            {sorted.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium text-slate-600">
              Page {safePage + 1} of {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
