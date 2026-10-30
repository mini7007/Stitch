import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Stitch | Premium Tailoring & Cobbler Services",
  description:
    "Book master tailors and expert cobblers near you. Free doorstep pickup and delivery — bespoke tailoring, alterations, shoe repair, laundry and ironing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
