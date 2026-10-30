"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, X } from "lucide-react";

/**
 * "Use My Location" — asks the browser for coordinates, then round-trips
 * them through the URL (?lat=…&lng=…) so the SERVER component can do the
 * Haversine filtering. `active` reflects whether nearby mode is on.
 */
export default function LocationButton({ active }: { active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function locate() {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setLoading(false);
        router.push(`/customer/vendors?lat=${lat}&lng=${lng}`);
      },
      (err) => {
        setLoading(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied — enable it in your browser settings and retry."
            : err.code === err.TIMEOUT
              ? "Detecting your location timed out — please try again."
              : "Unable to detect your location — please try again."
        );
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60 * 1000 }
    );
  }

  if (active) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
            <MapPin className="h-4 w-4" /> Nearby mode on
          </span>
          <button
            onClick={() => router.push("/customer/vendors")}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
        {error && <p className="max-w-xs text-right text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={locate}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
        {loading ? "Locating…" : "Use My Location"}
      </button>
      {error && <p className="max-w-xs text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}
