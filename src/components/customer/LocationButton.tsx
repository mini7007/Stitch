"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, X } from "lucide-react";

/**
 * "Use My Location" — asks the browser for precise GPS coordinates and
 * round-trips them through the URL (?lat=…&lng=…) so the SERVER component
 * can do the Haversine filtering.
 *
 * Precise GPS often fails on Windows when OS location services are off or
 * the browser permission is blocked — we degrade to an IP-based approximate
 * location (no permissions needed) instead of dead-ending.
 */
export default function LocationButton({ active }: { active: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pushCoords(lat: number, lng: number, source: "gps" | "ip") {
    setLoading(false);
    const query = new URLSearchParams({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
    if (source === "ip") query.set("src", "ip"); // page marks the location as approximate
    router.push(`/customer/vendors?${query.toString()}`);
  }

  /* Approximate city-level location from the visitor's IP — no permissions. */
  function ipFallback() {
    fetch("https://ipwho.is/")
      .then((res) => res.json())
      .then(
        (data: { success?: boolean; latitude?: number; longitude?: number }) => {
          if (data.success && typeof data.latitude === "number" && typeof data.longitude === "number") {
            pushCoords(data.latitude, data.longitude, "ip");
          } else {
            throw new Error("IP lookup failed");
          }
        }
      )
      .catch(() => {
        setLoading(false);
        setError(
          "Couldn't detect your location. Allow location in your browser (and Windows Settings → Privacy → Location), then try again."
        );
      });
  }

  function locate() {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        pushCoords(position.coords.latitude, position.coords.longitude, "gps");
      },
      () => ipFallback(), // any GPS failure → approximate IP fallback
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: 5 * 60 * 1000 }
    );
  }

  if (active) {
    return (
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
      {error && <p className="max-w-sm text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}
