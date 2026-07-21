"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

// Dynamically load WebGL 3D Model client-side without blocking page hydration
const Hero3DModel = dynamic(() => import("./Hero3DModel"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-2 border-[#7BC148]/30 border-t-[#7BC148] animate-spin" />
    </div>
  ),
});

export default function HeroBanner() {
  const { t } = useTranslation();

  return (
    <section
      id="home"
      className="relative w-full h-[100dvh] max-h-[100dvh] flex items-center overflow-hidden pt-16 lg:pt-24"
      style={{ backgroundColor: "var(--hero-background)" }}
    >
      {/* Aztec pattern overlay — LEFT edge */}
      <div
        className="hero-pattern absolute top-0 left-0 h-full w-[280px] opacity-[0.2] pointer-events-none transform-gpu"
        style={{
          maskImage: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
        }}
      />

      {/* Aztec pattern overlay — RIGHT edge */}
      <div
        className="hero-pattern absolute top-0 right-0 h-full w-[280px] opacity-[0.2] pointer-events-none transform-gpu"
        style={{
          maskImage: "linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 lg:py-8 flex flex-col lg:flex-row items-stretch gap-4 lg:gap-8">
        {/* LEFT COLUMN: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 flex flex-col items-start justify-center gap-6 lg:gap-8 max-w-xl z-10 transform-gpu"
        >
          {/* Title */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-[54px] font-bold leading-[1.15] tracking-tight"
            >
              <span className="text-white block whitespace-nowrap">{t("hero_title_line1")}</span>
              <span className="text-[#7BC148] block mt-1 whitespace-nowrap">{t("hero_title_line2")}</span>
              <span className="text-white block mt-1 whitespace-nowrap">{t("hero_title_line3")}</span>
            </motion.h1>
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-gray-300/80 text-sm sm:text-base leading-relaxed max-w-md"
          >
            {t("hero_description")}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap items-center gap-4"
          >
            {/* Get Started */}
            <Link
              href="/login"
              className="group flex items-center gap-2 bg-gradient-to-r from-[#7BC148] to-[#08704F] hover:from-[#8ce34a] hover:to-[#0a8961] text-white font-semibold text-sm px-7 py-3 rounded-full shadow-lg shadow-emerald-950/50 hover:shadow-emerald-700/30 active:scale-95 transition-all duration-200 border border-white/15"
            >
              {t("get_started")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Learn More */}
            <a
              href="#features"
              className="group flex items-center gap-2 bg-transparent border border-white/25 hover:border-white/40 hover:bg-white/5 text-white font-medium text-sm px-7 py-3 rounded-full transition-all duration-200 backdrop-blur-sm"
            >
              {t("hero_learn_more")}
              <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            </a>
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN: 3D Model */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          className="flex-1 w-full h-full min-h-[250px] relative flex items-center justify-center transform-gpu"
        >
          <Hero3DModel />
        </motion.div>
      </div>

      {/* Bottom subtle gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f210e] to-transparent pointer-events-none" />
    </section>
  );
}