import type { Config } from "tailwindcss";
import aspectRatio from "@tailwindcss/aspect-ratio";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Premium gold — used for accents, CTAs and highlights */
        gold: {
          50: "#FBF8EB",
          100: "#F7EFCB",
          200: "#EFD98F",
          300: "#E7C45C",
          400: "#DFAF35",
          500: "#C9962E",
          600: "#A8731F",
          700: "#86541C",
          800: "#6E431D",
          900: "#5D381C",
          950: "#351D0C",
        },
        /* Deep "workshop at midnight" backgrounds */
        ink: {
          700: "#1B2233",
          800: "#121828",
          900: "#0B0F1A",
          950: "#06080F",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        "gold-glow": "0 0 40px -8px rgba(223, 175, 53, 0.45)",
        card: "0 8px 30px -12px rgba(0, 0, 0, 0.25)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        marquee: "marquee 28s linear infinite",
        "pulse-ring": "pulse-ring 1.6s cubic-bezier(0.2, 0.6, 0.4, 1) infinite",
        "spin-slow": "spin-slow 14s linear infinite",
      },
    },
  },
  plugins: [aspectRatio],
};
export default config;
