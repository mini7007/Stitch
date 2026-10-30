"use client";

import { useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

export type MapVendor = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm?: number;
};

/* Brand-coloured SVG pin — no external images (default image markers render
   with box artifacts inside bundlers). */
const VENDOR_PIN = L.divIcon({
  className: "",
  html: `<svg width="26" height="38" viewBox="0 0 26 38" xmlns="http://www.w3.org/2000/svg"><path d="M13 0C5.8 0 0 5.8 0 13c0 9.8 13 25 13 25s13-15.2 13-25C26 5.8 20.2 0 13 0z" fill="#f59e0b" stroke="#92400e" stroke-width="1"/><circle cx="13" cy="13" r="5" fill="#451a03"/></svg>`,
  iconSize: [26, 38],
  iconAnchor: [13, 38],
  popupAnchor: [0, -34],
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
  const [view, setView] = useState<"map" | "satellite">("map");

  return (
    <div className="relative h-[340px] w-full">
      <MapContainer center={[userLat, userLng]} zoom={12} maxZoom={18} scrollWheelZoom className="h-full w-full">
        {view === "map" ? (
          /* OpenStreetMap — real streets, free, no API key required */
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <>
            {/* Esri World Imagery — real satellite views, free, no API key */}
            <TileLayer
              attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />
            {/* place/boundary labels on top of the imagery */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />
          </>
        )}
        <Circle
          center={[userLat, userLng]}
          radius={NEARBY_RADIUS_M}
          pathOptions={{
            color: view === "satellite" ? "#fbbf24" : "#d97706",
            weight: 1.5,
            fillColor: "#f59e0b",
            fillOpacity: 0.12,
          }}
        />
        {/* the user — always visible, even when no vendors are nearby */}
        <CircleMarker
          center={[userLat, userLng]}
          radius={8}
          pathOptions={{ color: "#ffffff", weight: 2.5, fillColor: "#f59e0b", fillOpacity: 1 }}
        >
          <Popup>
            <p className="font-semibold text-slate-900">You are here</p>
          </Popup>
        </CircleMarker>
        {vendors.map((vendor) => (
          <Marker key={vendor.id} position={[vendor.lat, vendor.lng]} icon={VENDOR_PIN}>
            <Popup>
              <div className="min-w-[10rem]">
                <p className="font-semibold text-slate-900">{vendor.name}</p>
                {vendor.distanceKm !== undefined && (
                  <p className="text-xs text-slate-500">{vendor.distanceKm.toFixed(1)} km away</p>
                )}
                <a
                  href={`#vendor-${vendor.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById(`vendor-${vendor.id}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  className="mt-1 inline-block text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline"
                >
                  View Profile
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Google-style view switch — above Leaflet's control panes (z 800) */}
      <div className="absolute right-3 top-3 z-[1000] flex overflow-hidden rounded-lg border border-slate-300 bg-white text-xs font-semibold shadow-md">
        <button
          onClick={() => setView("map")}
          className={`px-3 py-1.5 transition-colors ${
            view === "map" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setView("satellite")}
          className={`px-3 py-1.5 transition-colors ${
            view === "satellite" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Satellite
        </button>
      </div>
    </div>
  );
}
