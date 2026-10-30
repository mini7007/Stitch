import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Scissors } from "lucide-react";

/**
 * Beautiful empty state — decorative stitch-themed SVG illustration,
 * title, subtitle and an optional CTA (link or custom action node).
 * Server-compatible: pass `href` for a link or `action` for a client node.
 */
export default function EmptyState({
  icon: Icon = Scissors,
  title,
  subtitle,
  href,
  ctaLabel,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  href?: string;
  ctaLabel?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      {/* illustration */}
      <div className="relative">
        <svg
          width="140"
          height="72"
          viewBox="0 0 140 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4 56 C 24 40, 44 72, 64 56 S 104 40, 136 56"
            stroke="#e2e8f0"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M4 56 C 24 40, 44 72, 64 56 S 104 40, 136 56"
            stroke="#94a3b8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="10 12"
          />
          <line x1="98" y1="20" x2="126" y2="48" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="130" cy="52" rx="7" ry="7" transform="rotate(45 130 52)" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="98" cy="20" r="3" fill="#fbbf24" />
        </svg>
        <span className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-amber-100 text-amber-600 ring-1 ring-amber-200">
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <h3 className="mt-6 font-display text-xl text-slate-900">{title}</h3>
      {subtitle && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{subtitle}</p>}

      {href && ctaLabel && (
        <Link
          href={href}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.03] hover:bg-slate-700 active:scale-95"
        >
          {ctaLabel}
        </Link>
      )}
      {!href && action}
    </div>
  );
}
