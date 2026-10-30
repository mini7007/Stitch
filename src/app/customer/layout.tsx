import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/customer/DashboardSidebar";

/** Customer app shell — light top bar plus persistent sidebar navigation. */
export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader subtitle="Customer Space" email={session?.user?.email} badge="Customer" />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <DashboardSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
