"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin } from "lucide-react";

/**
 * "Workshop location" card for the vendor dashboard — one-click browser
 * geolocation → POST /api/vendor/location. Vendors with coordinates appear
 * in the customer "Nearby Vendors" search; without them they don't.
 */
export default function VendorLocationCard({
  lat,
  lng,
}: {
  lat: number | null;
  lng: number | null;
}) {
  const router = useRouter();
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSet = lat !== null && lng !== null;

  function updateLocation() {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocating(false);
        setSaving(true);
        try {
          const res = await fetch("/api/vendor/location", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              lat: Number(position.coords.latitude.toFixed(6)),
              lng: Number(position.coords.longitude.toFixed(6)),
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error ?? "Could not save your location.");
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not save your location.");
        } finally {
          setSaving(false);
        }
      },
      (err) => {
        setLocating(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied — enable it in your browser settings and retry."
            : err.code === err.TIMEOUT
              ? "Detecting your location timed out — please try again."
              : "Unable to detect your location — please try again."
        );
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200">
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-lg text-slate-900">Workshop location</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {isSet
                ? `Set to ${lat!.toFixed(4)}, ${lng!.toFixed(4)} — customers nearby can find you in search.`
                : "Not set yet — you will NOT appear in the customer “Nearby Vendors” search until it is."}
            </p>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        </div>
        <button
          onClick={updateLocation}
          disabled={locating || saving}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-60"
        >
          {locating || saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {locating ? "Locating…" : "Saving…"}
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4" />
              {isSet ? "Update from my current location" : "Use my current location"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
