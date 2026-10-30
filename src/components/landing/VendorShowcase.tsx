"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Star, Tag } from "lucide-react";
import { pricingTier } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const PROS = [
  {
    name: "Arjun Mehta",
    role: "Master Tailor",
    category: "tailoring",
    exp: "15 years experience",
    rating: "4.9",
    reviews: "1.2k",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop",
    alt: "Portrait of Arjun Mehta, master tailor",
  },
  {
    name: "Meena Iyer",
    role: "Bridal & Bespoke Specialist",
    category: "tailoring",
    exp: "12 years experience",
    rating: "5.0",
    reviews: "860",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop",
    alt: "Portrait of Meena Iyer, bespoke specialist",
  },
  {
    name: "Suresh Kumar",
    role: "Master Cobbler",
    category: "cobbler",
    exp: "20 years experience",
    rating: "4.8",
    reviews: "2.0k",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1200&auto=format&fit=crop",
    alt: "Portrait of Suresh Kumar, master cobbler",
  },
];

export default function VendorShowcase() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 py-24 md:py-32">
      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-amber-500/[0.07] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-amber-500">
            The Network
          </p>
          <h2 className="mt-5 font-display text-4xl text-white md:text-5xl">
            Top Rated <span className="italic text-amber-400">Professionals</span>
          </h2>
          <p className="mt-5 text-lg text-zinc-400">
            Every artisan is background-verified, reviewed after each order, and
            rated by customers like you.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {PROS.map((pro, i) => (
            <motion.article
              key={pro.name}
              initial={{ opacity: 0, y: 56 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.14, ease: EASE }}
              whileHover="hover"
              className="group relative overflow-hidden rounded-[2rem] bg-zinc-900 shadow-xl ring-1 ring-white/10 transition-colors hover:ring-amber-500/60"
            >
              {/* portrait */}
              <motion.div
                variants={{ hover: { scale: 1.06 } }}
                transition={{ duration: 0.9, ease: EASE }}
                className="relative aspect-[3/4]"
              >
                <Image
                  src={pro.img}
                  alt={pro.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                {/* verified chip */}
                <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-zinc-950/70 px-3 py-1.5 text-[11px] font-semibold text-amber-400 backdrop-blur-md">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              </motion.div>

              {/* details */}
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-white">{pro.rating}</span>
                  <span className="text-xs text-zinc-400">({pro.reviews} reviews)</span>
                </div>
                <h3 className="mt-2 font-display text-2xl text-white">{pro.name}</h3>
                <p className="mt-1 text-sm text-amber-300/90">
                  {pro.role} <span className="text-zinc-500">· {pro.exp}</span>
                </p>
                {/* pricing-tier badge — visual only, sets expectations */}
                {(() => {
                  const tier = pricingTier(pro.category);
                  return (
                    <span
                      className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md ${
                        tier.premium
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                          : "border-white/15 bg-white/5 text-zinc-300"
                      }`}
                    >
                      <Tag className="h-3 w-3" /> {tier.label}
                    </span>
                  );
                })()}
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          className="mt-14 text-center"
        >
          <Link
            href="/customer/vendors"
            className="group inline-flex items-center gap-2 rounded-full border border-amber-500/40 px-8 py-3.5 text-sm font-medium text-amber-400 transition-all hover:bg-amber-500 hover:text-zinc-950"
          >
            Browse all professionals
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
