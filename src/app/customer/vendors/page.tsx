export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { calculateDistance, formatINR, pricingTier } from "@/lib/utils";
import { Info, MapPin, Star } from "lucide-react";
import BookServiceForm from "@/components/customer/BookServiceForm";
import LocationButton from "@/components/customer/LocationButton";
import VendorMap from "@/components/customer/VendorMap";

/** Hyper-local search radius, in kilometres. */
const NEARBY_RADIUS_KM = 10;
/** Graceful degradation: when nobody is inside the radius, show at most this many nearest vendors. */
const FALLBACK_LIMIT = 12;

/** First string of a searchParams value (Next may pass string | string[]). */
function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Small per-service visual tier badge — sets expectations, no pricing effect. */
function TierBadge({ categorySlug }: { categorySlug?: string | null }) {
  const tier = pricingTier(categorySlug);
  return (
    <span
      className={`whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        tier.premium
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-slate-200 bg-slate-100 text-slate-500"
      }`}
    >
      {tier.label}
    </span>
  );
}

export default async function VendorList({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const latParam = firstParam(searchParams?.lat);
  const lngParam = firstParam(searchParams?.lng);
  const userLat = Number(latParam);
  const userLng = Number(lngParam);
  const hasLocation =
    latParam !== undefined && lngParam !== undefined && Number.isFinite(userLat) && Number.isFinite(userLng);

  // Fetch approved vendors from the database
  const approved = await prisma.vendor.findMany({
    where: { status: "APPROVED" },
    include: { services: { include: { category: true } } },
  });

  type VendorRow = (typeof approved)[number] & { distanceKm: number | null };

  /* Every vendor we can locate, Haversine-sorted nearest first. */
  const located: VendorRow[] = approved
    .filter((v) => v.lat !== null && v.lng !== null)
    .map((v) => ({ ...v, distanceKm: calculateDistance(userLat, userLng, v.lat!, v.lng!) }))
    .sort((a, b) => a.distanceKm! - b.distanceKm!);

  const inRadius = located.filter((v) => v.distanceKm! <= NEARBY_RADIUS_KM);
  /* Never dead-end: if nobody is inside the radius, degrade to the nearest vendors. */
  const usingFallback = hasLocation && inRadius.length === 0;

  const vendors: VendorRow[] = !hasLocation
    ? approved.map((v) => ({ ...v, distanceKm: null }))
    : usingFallback
      ? located.slice(0, FALLBACK_LIMIT)
      : inRadius;

  const subtitle = !hasLocation
    ? "Book tailoring and cobbler services near you."
    : inRadius.length > 0
      ? `Showing ${vendors.length} vendor${vendors.length === 1 ? "" : "s"} within ${NEARBY_RADIUS_KM} km of you — nearest first.`
      : `No vendors within ${NEARBY_RADIUS_KM} km yet — showing the ${vendors.length} nearest to you.`;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Find a Vendor</h1>
          <p className="text-slate-500 mt-1">{subtitle}</p>
        </div>
        <LocationButton active={hasLocation} />
      </div>

      {/* Map always shows in nearby mode — even with zero pins it centers on the user */}
      {hasLocation && (
        <section className="mb-8">
          <VendorMap
            userLat={userLat}
            userLng={userLng}
            vendors={vendors.map((v) => ({
              id: v.id,
              name: v.businessName,
              lat: v.lat!,
              lng: v.lng!,
              distanceKm: v.distanceKm!,
            }))}
          />
        </section>
      )}

      {usingFallback && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            No vendors within {NEARBY_RADIUS_KM} km of you yet — showing the nearest vendors to
            your location instead. New workshops onboard every week.
          </p>
        </div>
      )}

      {vendors.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="font-medium text-slate-900">
            {hasLocation ? "No vendors found near your location yet" : "No vendors yet"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {hasLocation
              ? "Clear the location filter to browse all vendors."
              : "Check back soon — vendors are onboarding."}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            id={`vendor-${vendor.id}`}
            className="scroll-mt-6 bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{vendor.businessName}</h2>
                <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                  <MapPin className="w-4 h-4" /> {vendor.city}
                  {vendor.distanceKm !== null && (
                    <span className="ml-1 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                      {vendor.distanceKm.toFixed(1)} km away
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md text-sm font-medium">
                <Star className="w-4 h-4 fill-yellow-700" /> {vendor.rating}
              </div>
            </div>

            <div className="space-y-2 mb-6 border-t border-slate-100 pt-4">
              <p className="text-sm font-medium text-slate-700">Services offered:</p>
              {vendor.services.slice(0, 3).map((service) => (
                <div key={service.id} className="flex justify-between items-center gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-1.5 text-slate-600">
                    <span className="truncate">{service.name}</span>
                    <TierBadge categorySlug={service.category?.slug} />
                  </span>
                  <span className="font-medium text-slate-900 whitespace-nowrap">
                    {formatINR(service.basePrice)}
                  </span>
                </div>
              ))}
            </div>

            <BookServiceForm
              vendorId={vendor.id}
              services={vendor.services.map((s) => ({ id: s.id, name: s.name, basePrice: s.basePrice }))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
