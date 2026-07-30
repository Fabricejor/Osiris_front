"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

export default function HeroBanner() {
  const { t } = useTranslation();

  return (
    <section
      id="home"
      className="relative w-full min-h-[100dvh] lg:h-[100dvh] lg:max-h-[100dvh] flex items-center overflow-hidden pt-20 pb-12 lg:py-0"
      style={{ backgroundColor: "var(--hero-background)" }}
    >
      {/* Aztec pattern overlay — LEFT edge */}
      <div
        className="hero-pattern absolute top-0 left-0 h-full w-[200px] sm:w-[280px] opacity-[0.2] pointer-events-none transform-gpu"
        style={{
          maskImage: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
        }}
      />

      {/* Aztec pattern overlay — RIGHT edge */}
      <div
        className="hero-pattern absolute top-0 right-0 h-full w-[200px] sm:w-[280px] opacity-[0.2] pointer-events-none transform-gpu"
        style={{
          maskImage: "linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)",
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-4 sm:py-6 lg:py-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
        {/* LEFT COLUMN: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 flex flex-col items-start justify-center gap-5 sm:gap-6 lg:gap-8 max-w-xl z-10 transform-gpu"
        >
          {/* Title */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-[54px] font-bold leading-[1.15] tracking-tight"
            >
              <span className="text-white block sm:whitespace-nowrap">{t("hero_title_line1")}</span>
              <span className="text-[#7BC148] block mt-1 sm:whitespace-nowrap">{t("hero_title_line2")}</span>
              <span className="text-white block mt-1 sm:whitespace-nowrap">{t("hero_title_line3")}</span>
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
            className="flex flex-wrap items-center gap-3 sm:gap-4"
          >
            {/* Get Started */}
            <Link
              href="/login"
              className="group flex items-center gap-2 bg-gradient-to-r from-[#7BC148] to-[#08704F] hover:from-[#8ce34a] hover:to-[#0a8961] text-white font-semibold text-sm px-6 sm:px-7 py-3 rounded-full shadow-lg shadow-emerald-950/50 hover:shadow-emerald-700/30 active:scale-95 transition-all duration-200 border border-white/15"
            >
              {t("get_started")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Learn More */}
            <a
              href="#features"
              className="group flex items-center gap-2 bg-transparent border border-white/25 hover:border-white/40 hover:bg-white/5 text-white font-medium text-sm px-6 sm:px-7 py-3 rounded-full transition-all duration-200 backdrop-blur-sm"
            >
              {t("hero_learn_more")}
              <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
            </a>
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN: Responsive Bento-style Overlapping Banner Images */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          className="flex-1 w-full relative flex items-center justify-center transform-gpu py-2 sm:py-4"
        >
          {/* Ambient Green Radial Glow */}
          <div className="absolute w-[80%] h-[80%] bg-[#7BC148]/20 blur-[70px] sm:blur-[100px] rounded-full pointer-events-none -z-10" />

          {/* Overlapping Images Showcase Container */}
          <div className="relative w-full max-w-sm sm:max-w-lg lg:max-w-xl aspect-[16/11] sm:aspect-[16/10] flex items-center justify-start pr-4 sm:pr-8">

            {/* 1. Main Horizontal Image (Central Bento Card) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="relative w-[76%] sm:w-[78%] h-[82%] sm:h-[85%] rounded-xl sm:rounded-3xl overflow-hidden border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md shadow-xl sm:shadow-2xl shadow-black/60 group"
            >
              <img
                src="/images/photo baniere hero horizontal.png"
                alt="OSIRIS Hero Horizontal"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle glass reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10 pointer-events-none" />
            </motion.div>

            {/* 2. Vertical Image (Overlapping Top-Right Corner - Responsive) */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.7, ease: "easeOut" }}
              whileHover={{ scale: 1.04, rotate: -1 }}
              className="absolute -top-3 sm:-top-8 -right-1 sm:-right-4 w-[42%] sm:w-[40%] max-w-[170px] sm:max-w-[240px] aspect-[3/4] rounded-xl sm:rounded-3xl overflow-hidden border-2 border-white/30 bg-black/40 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] sm:shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-20 group transform-gpu"
            >
              <img
                src="/images/Photo banniere hero vertical.png"
                alt="OSIRIS Hero Vertical"
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              {/* Inner ring highlight */}
              <div className="absolute inset-0 ring-1 ring-inset ring-white/25 rounded-xl sm:rounded-3xl pointer-events-none" />
            </motion.div>

          </div>
        </motion.div>
      </div>

      {/* Bottom subtle gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f210e] to-transparent pointer-events-none" />
    </section>
  );
}