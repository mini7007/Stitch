"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, X } from "lucide-react";

/**
 * "Use My Location" — asks the browser for precise GPS coordinates and
 * round-trips them through the URL (?lat=…&lng=…) so the SERVER component
 * can do the Haversine filtering.
 *
 * Resilience chain: precise GPS → IP lookup (ipwho.is) → IP lookup
 * (geojs) → actionable error. Precise GPS often fails behind corporate
 * networks, VPNs, or a blocked site permission — the IP fallback keeps the
 * feature working at city-level accuracy instead of dead-ending.
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
    // If the URL is identical to the current one, force the server to re-render.
    router.refresh();
  }

  async function ipFallback(): Promise<{ lat: number; lng: number } | null> {
    const providers: {
      url: string;
      parse: (data: unknown) => { lat: number; lng: number } | null;
    }[] = [
      {
        url: "https://ipwho.is/",
        parse: (data) => {
          const d = data as { success?: boolean; latitude?: number; longitude?: number };
          return d.success && typeof d.latitude === "number" && typeof d.longitude === "number"
            ? { lat: d.latitude, lng: d.longitude }
            : null;
        },
      },
      {
        url: "https://get.geojs.io/v1/ip/geo.json",
        parse: (data) => {
          const d = data as { latitude?: string; longitude?: string };
          return d.latitude && d.longitude
            ? { lat: Number(d.latitude), lng: Number(d.longitude) }
            : null;
        },
      },
    ];
    for (const provider of providers) {
      try {
        const res = await fetch(provider.url);
        const coords = provider.parse(await res.json());
        if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) return coords;
      } catch {
        // try the next provider
      }
    }
    return null;
  }

  async function locate() {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setLoading(true);
    setError(null);

    const coords = await new Promise<GeolocationCoordinates | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 8_000, maximumAge: 5 * 60 * 1000 }
      );
    });
    if (coords) {
      pushCoords(coords.latitude, coords.longitude, "gps");
      return;
    }

    const ipCoords = await ipFallback();
    if (ipCoords) {
      pushCoords(ipCoords.lat, ipCoords.lng, "ip");
      return;
    }

    setLoading(false);
    setError(
      "Couldn't detect your location. Allow location for this site in your browser (lock icon → Location → Allow), then try again."
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {active && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
            <MapPin className="h-4 w-4" /> Nearby mode on
          </span>
        )}
        {active && (
          <button
            onClick={() => router.push("/customer/vendors")}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
        <button
          onClick={locate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          {loading ? "Locating…" : active ? "Refresh location" : "Use My Location"}
        </button>
      </div>
      {error && <p className="max-w-sm text-right text-xs text-red-600">{error}</p>}
    </div>
  );
}
