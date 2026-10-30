import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatINR(paise: number) { return `₹${(paise / 100).toLocaleString("en-IN")}`; }

/**
 * Great-circle distance between two coordinates, in kilometres (Haversine).
 * Used for the hyper-local "Nearby Vendors" radius search.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const EARTH_RADIUS_KM = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/**
 * Visual-only pricing tier per service category — sets customer
 * expectations ("Standard Repair" vs "Premium Stitching"); no pricing effect.
 */
export type PricingTier = { label: string; premium: boolean };

export function pricingTier(categorySlug: string | null | undefined): PricingTier {
  switch (categorySlug) {
    case "tailoring":
      return { label: "Premium Stitching", premium: true };
    case "cobbler":
      return { label: "Standard Repair", premium: false };
    default:
      return { label: "Standard Service", premium: false };
  }
}
