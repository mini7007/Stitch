"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

export type MapVendor = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm?: number;
};

/* Webpack rewrites Leaflet's default marker image URLs and they 404 —
   point the default icon at Leaflet's published assets explicitly. */
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-shadow.png",
});

const NEARBY_RADIUS_M = 10_000;

export default function VendorMapLeaflet({
  userLat,
  userLng,
  vendors,
}: {
  userLat: number;
  userLng: number;
  vendors: MapVendor[];
}) {
  return (
    <MapContainer
      center={[userLat, userLng]}
      zoom={12}
      scrollWheelZoom
      className="h-[340px] w-full"
    >
      {/* dark basemap to match the Stitch zinc-950 / amber brand */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <Circle
        center={[userLat, userLng]}
        radius={NEARBY_RADIUS_M}
        pathOptions={{
          color: "#f59e0b",
          weight: 1,
          fillColor: "#f59e0b",
          fillOpacity: 0.08,
        }}
      />
      {vendors.map((vendor) => (
        <Marker key={vendor.id} position={[vendor.lat, vendor.lng]}>
          <Popup>
            <div className="min-w-[10rem]">
              <p className="font-semibold text-slate-900">{vendor.name}</p>
              {vendor.distanceKm !== undefined && (
                <p className="text-xs text-slate-500">{vendor.distanceKm.toFixed(1)} km away</p>
              )}
              <a
                href={`#vendor-${vendor.id}`}
                className="mt-1 inline-block text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline"
              >
                View Profile
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
