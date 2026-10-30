"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, Scissors, ShoppingBag } from "lucide-react";

/**
 * Global navbar.
 * On the landing page and the dark premium pages ("/signup", dashboards)
 * it steps aside — those views render their own headers.
 */
export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (
    pathname === "/" ||
    pathname === "/signup" ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/customer")
  ) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Scissors className="w-5 h-5" /> Stitch
        </Link>
        {session?.user?.role === "CUSTOMER" && (
          <div className="flex gap-4 text-sm font-medium text-slate-600">
            <Link href="/customer/dashboard" className="hover:text-slate-900 flex items-center gap-1"><Home className="w-4 h-4"/> Dashboard</Link>
            <Link href="/customer/vendors" className="hover:text-slate-900 flex items-center gap-1"><ShoppingBag className="w-4 h-4"/> Find Vendors</Link>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600">{session?.user?.email}</span>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </nav>
  );
}
