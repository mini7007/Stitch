import Link from "next/link";

/**
 * The Stitch wordmark — Fraunces with an amber full stop.
 * Server-compatible; used across the landing page, navbar and dashboards.
 */
export default function Wordmark({
  href = "/",
  className = "text-xl text-white",
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={`font-display font-semibold tracking-tight ${className}`}>
      Stitch<span className="text-amber-500">.</span>
    </Link>
  );
}
