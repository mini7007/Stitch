"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { roleHome } from "@/lib/roles";
import PremiumLoader from "./PremiumLoader";
import LandingHeader from "./LandingHeader";
import HeroSection from "./HeroSection";
import ServiceGrid from "./ServiceGrid";
import VendorShowcase from "./VendorShowcase";
import { FinalCta, Footer } from "./CtaFooter";
import LoginModal from "./LoginModal";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The single-page application shell:
 * PremiumLoader (once per session, ~3s) → cinematic sections + auth modal.
 */
export default function LandingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  /* Show the cinematic loader on the first load of the session (~3s) */
  useEffect(() => {
    const alreadySeen = sessionStorage.getItem("stitch-loaded") === "1";
    if (alreadySeen) {
      setLoading(false);
      return;
    }
    const t = setTimeout(() => {
      sessionStorage.setItem("stitch-loaded", "1");
      setLoading(false);
    }, 3000);
    return () => clearTimeout(t);
  }, []);

  /* Lock scrolling while the loader is on screen */
  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading]);

  /** "Book a Service" — smart CTA: modal for guests, dashboard for signed-in users. */
  function handleBook() {
    const role = session?.user?.role;
    if (!role) {
      setAuthOpen(true);
      return;
    }
    router.push(roleHome(role));
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <AnimatePresence>{loading && <PremiumLoader key="premium-loader" />}</AnimatePresence>

      {!loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}>
          <LandingHeader onLogin={() => setAuthOpen(true)} />
          <main>
            <HeroSection onBook={handleBook} />
            <ServiceGrid />
            <VendorShowcase />
            <FinalCta onBook={handleBook} />
          </main>
          <Footer />
        </motion.div>
      )}

      <LoginModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
