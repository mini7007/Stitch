import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";
import { MapPin, Star } from "lucide-react";
import BookServiceForm from "@/components/customer/BookServiceForm";

export default async function VendorList() {
  // Fetch approved vendors from the database
  const vendors = await prisma.vendor.findMany({
    where: { status: "APPROVED" },
    include: { services: true },
  });

  return (
    <div className="max-w-6xl mx-auto p-6 mt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Find a Vendor</h1>
        <p className="text-slate-500 mt-1">Book tailoring and cobbler services near you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{vendor.businessName}</h2>
                <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                  <MapPin className="w-4 h-4" /> {vendor.city}
                </div>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md text-sm font-medium">
                <Star className="w-4 h-4 fill-yellow-700" /> {vendor.rating}
              </div>
            </div>
            
            <div className="space-y-2 mb-6 border-t border-slate-100 pt-4">
              <p className="text-sm font-medium text-slate-700">Services offered:</p>
              {vendor.services.slice(0, 3).map((service) => (
                <div key={service.id} className="flex justify-between text-sm">
                  <span className="text-slate-600">{service.name}</span>
                  <span className="font-medium text-slate-900">{formatINR(service.basePrice)}</span>
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
