import { Ruler } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function MeasurementsPage() {
  return (
    <div>
      <div>
        <h1 className="font-display text-3xl text-slate-900">My Measurements</h1>
        <p className="mt-1 text-sm text-slate-500">
          Save your measurements once — reuse them with every vendor.
        </p>
      </div>

      <div className="mt-6">
        <EmptyState
          icon={Ruler}
          title="Measurement profiles coming soon"
          subtitle="Soon you'll save collar, sleeve, inseam and more — vendors will tailor straight from your saved profile."
          href="/customer/vendors"
          ctaLabel="Browse Vendors"
        />
      </div>
    </div>
  );
}
