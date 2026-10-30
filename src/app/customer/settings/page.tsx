export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/customer/SignOutButton";
import { Mail, Phone, ShieldCheck } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div>
      <div>
        <h1 className="font-display text-3xl text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Your Stitch account details.</p>
      </div>

      <div className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 font-display text-xl text-zinc-950">
            {session.user.name?.[0]?.toUpperCase() ?? "S"}
          </span>
          <div>
            <p className="font-display text-xl text-slate-900">{session.user.name}</p>
            <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              <ShieldCheck className="h-3 w-3" /> {session.user.role}
            </span>
          </div>
        </div>

        <dl className="mt-6 space-y-4 border-t border-slate-100 pt-6 text-sm">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-slate-400" />
            <dt className="w-20 text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{session.user.email}</dd>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-slate-400" />
            <dt className="w-20 text-slate-500">Phone</dt>
            <dd className="font-medium text-slate-900">—</dd>
          </div>
        </dl>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
