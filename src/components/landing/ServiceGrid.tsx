"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

type Service = {
  title: string;
  desc: string;
  price: string;
  img: string;
  alt: string;
  highlighted?: boolean;
};

const SERVICES: Service[] = [
  {
    title: "Custom Tailoring",
    desc: "Suits, shirts and precision alterations — cut and stitched to your exact measurements.",
    price: "From ₹150",
    img: "https://images.unsplash.com/photo-1571513722275-4b41940f54b8?q=80&w=1600&auto=format&fit=crop",
    alt: "A bespoke tailored blazer",
  },
  {
    title: "Cobbler & Shoe Repair",
    desc: "Sole repair, restitching and polishing that brings your best pairs back to life.",
    price: "From ₹200",
    img: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=1600&auto=format&fit=crop",
    alt: "Hand-finished leather shoes",
  },
  {
    title: "Laundry & Ironing",
    desc: "Wash, dry, fold and premium pressing — crisply finished, carefully delivered.",
    price: "From ₹99",
    img: "https://images.unsplash.com/photo-1604176354204-9268737828e4?q=80&w=1600&auto=format&fit=crop",
    alt: "A neatly folded stack of fresh laundry",
  },
  {
    title: "Home Pickup & Delivery",
    desc: "We collect at your door and return in as little as 24 hours. Free within your city.",
    price: "Free",
    img: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=1600&auto=format&fit=crop",
    alt: "Premium delivery packaging",
    highlighted: true,
  },
];

function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: EASE }}
      whileHover="hover"
      variants={{ hover: { scale: 0.99 } }}
      className={`group relative cursor-pointer overflow-hidden rounded-[2rem] shadow-xl ring-1 transition-shadow ${
        service.highlighted
          ? "ring-amber-500/60 hover:shadow-[0_0_60px_-12px_rgba(245,158,11,0.55)]"
          : "ring-zinc-950/10 hover:shadow-[0_0_60px_-14px_rgba(245,158,11,0.45)] hover:ring-amber-500/70"
      }`}
    >
      {/* image, zooms on hover */}
      <motion.div
        variants={{ hover: { scale: 1.06 } }}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-[440px]"
      >
        <Image
          src={service.img}
          alt={service.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </motion.div>

      {/* readability gradient */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          service.highlighted
            ? "bg-gradient-to-t from-amber-950/95 via-amber-950/35 to-transparent"
            : "bg-gradient-to-t from-zinc-950/95 via-zinc-950/30 to-transparent"
        }`}
      />

      {/* highlighted badge */}
      {service.highlighted && (
        <span className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-amber-500 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-950 shadow-lg">
          <BadgeCheck className="h-3.5 w-3.5" /> Most Convenient
        </span>
      )}

      {/* copy */}
      <div className="absolute inset-x-0 bottom-0 p-7 sm:p-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="font-display text-3xl text-white">{service.title}</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-300">
              {service.desc}
            </p>
          </div>
          <motion.span
            variants={{ hover: { rotate: 45, backgroundColor: "#F59E0B", color: "#18181B" } }}
            transition={{ duration: 0.35, ease: EASE }}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/30 text-white"
          >
            <ArrowUpRight className="h-5 w-5" />
          </motion.span>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <span
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              service.highlighted ? "bg-amber-500 text-zinc-950" : "bg-white/10 text-amber-300 backdrop-blur"
            }`}
          >
            {service.price}
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-amber-500/60 to-transparent" />
        </div>
      </div>
    </motion.article>
  );
}

export default function ServiceGrid() {
  return (
    <section id="services" className="relative bg-stone-50 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-amber-600">
            Our Services
          </p>
          <h2 className="mt-5 font-display text-4xl text-zinc-950 md:text-5xl">
            Everything your wardrobe needs, <span className="italic text-amber-600">handled.</span>
          </h2>
          <p className="mt-5 text-lg text-zinc-500">
            Four crafts, one tap. Pick a service and we handle the rest — door to door.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-7 md:grid-cols-2">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
