"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Ruler, Search, Settings } from "lucide-react";

const LINKS = [
  { href: "/customer/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/customer/vendors", label: "Find Vendors", icon: Search },
  { href: "/customer/measurements", label: "My Measurements", icon: Ruler },
  { href: "/customer/settings", label: "Settings", icon: Settings },
];

/** Persistent customer navigation — sticky sidebar on desktop, scrollable
    chip bar on mobile. */
export default function DashboardSidebar() {
  const pathname = usePathname();

  const links = LINKS.map((link) => {
    const isActive = pathname === link.href;
    return { ...link, isActive };
  });

  return (
    <>
      {/* mobile — horizontal chip bar */}
      <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              link.isActive
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <link.icon className="h-4 w-4" /> {link.label}
          </Link>
        ))}
      </nav>

      {/* desktop — persistent sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <nav className="sticky top-20 space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                link.isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <link.icon className={`h-4 w-4 ${link.isActive ? "text-amber-400" : ""}`} />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
