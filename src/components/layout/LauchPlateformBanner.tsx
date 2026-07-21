"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function LauchPlateformBanner() {
  const { t } = useTranslation();

  return (
    <section className="w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-10 bg-white" style={{ minHeight: "30vh" }}>
      <div className="max-w-7xl mx-auto w-full relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row items-center bg-[var(--hero-background)] transform-gpu"
          style={{ minHeight: "25vh" }}
        >
          {/* Pattern overlay on the right (up to 70%) */}
          <div 
            className="lauch-banner-pattern absolute top-0 right-0 h-full w-[70%] opacity-[0.25] pointer-events-none transform-gpu"
            style={{
              maskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
            }}
          />

          <div className="relative z-10 w-full flex flex-col md:flex-row items-center justify-between h-full">
            
            {/* Left: Image */}
            <div className="shrink-0 relative w-full md:w-[35%] h-[25vh] md:h-[28vh] lg:h-[32vh]">
              <Image
                src="/images/Image 1 (1).png"
                alt="Transform Healthcare"
                fill
                className="object-contain p-2 md:p-3"
                sizes="(max-width: 768px) 100vw, 35vw"
              />
            </div>

            {/* Middle: Text */}
            <div className="flex-1 text-center md:text-left flex flex-col justify-center p-6 md:py-8 md:pl-2 md:pr-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight tracking-tight">
                {t("launch_banner_title")}
              </h2>
              <p className="text-white/90 text-sm sm:text-base lg:text-[1.05rem] font-medium max-w-lg mx-auto md:mx-0">
                {t("launch_banner_subtitle")}
              </p>
            </div>

            {/* Right: Button */}
            <div className="shrink-0 w-full md:w-auto flex justify-center md:justify-end p-6 pt-0 md:pt-6 md:pl-0 md:pr-10">
              <Link
                href="/login"
                className="group flex items-center justify-center gap-2 bg-white text-[#4a7d28] font-bold text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 whitespace-nowrap"
              >
                {t("launch_banner_button")}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
