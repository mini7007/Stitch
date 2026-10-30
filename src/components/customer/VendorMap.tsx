"use client";

import dynamic from "next/dynamic";
import type { MapVendor } from "./VendorMapLeaflet";

/**
 * Client-side-only wrapper around the Leaflet map. Leaflet touches `window`
 * on init, so the real map is dynamically imported with `ssr: false`.
 */
const VendorMapLeaflet = dynamic(() => import("./VendorMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="h-[340px] w-full animate-pulse rounded-2xl bg-slate-200" />
  ),
});

export default function VendorMap({
  userLat,
  userLng,
  vendors,
}: {
  userLat: number;
  userLng: number;
  vendors: MapVendor[];
}) {
  return (
    /* z-0 + relative keep Leaflet's panes (z-index 400+) below modals/nav */
    <div className="relative z-0 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      {/* keyed remount so the map re-centers when the coordinates change */}
      <VendorMapLeaflet
        key={`${userLat},${userLng}`}
        userLat={userLat}
        userLng={userLng}
        vendors={vendors}
      />
    </div>
  );
}
