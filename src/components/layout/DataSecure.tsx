"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CircleCheck } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function DataSecure() {
  const { t } = useTranslation();

  const bullets = [
    t("datasecure_bullet1"),
    t("datasecure_bullet2"),
    t("datasecure_bullet3"),
    t("datasecure_bullet4"),
  ];

  return (
    <section
      id="about"
      className="w-full bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{ minHeight: "80vh" }}
    >
      <div className="max-w-7xl mx-auto w-full py-12 lg:py-16">
        {/* Big Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden"
          style={{ backgroundColor: "var(--hero-background)" }}
        >
          {/* Aztec pattern overlay — centered */}
          <div
            className="hero-pattern absolute inset-0 opacity-[0.15] pointer-events-none"
            style={{
              maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 60%, transparent 85%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 60%, transparent 85%)",
            }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[39%_61%] gap-6 lg:gap-8 items-center p-6 sm:p-8 lg:p-10">
            {/* LEFT COLUMN — Text */}
            <div className="flex flex-col justify-center min-w-0">
              {/* Title — Max 2 lines */}
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-2xl sm:text-3xl lg:text-[2.2rem] font-bold text-white leading-tight tracking-tight mb-4 line-clamp-2"
              >
                {t("datasecure_title")}
              </motion.h2>

              {/* Paragraph — Max 3 lines */}
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-white/70 text-xs sm:text-sm lg:text-base leading-relaxed mb-6 line-clamp-3"
              >
                {t("datasecure_desc")}
              </motion.p>

              {/* Bullet Points — Strictly 1 line each */}
              <div className="flex flex-col gap-3 min-w-0">
                {bullets.map((text, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3 min-w-0"
                  >
                    <CircleCheck
                      className="w-5 h-5 text-[#7BC148] shrink-0"
                      strokeWidth={2}
                      fill="#7BC148"
                      stroke="var(--hero-background)"
                    />
                    <span className="text-white/90 text-xs sm:text-sm lg:text-[0.925rem] font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN — Dashboard Image (Larger & Fully Visible) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative w-full flex items-center justify-center transform-gpu"
            >
              <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/15">
                <Image
                  src="/images/Data-secure showcase dashboard .png"
                  alt="Osiris Dashboard - Secure Data Management"
                  width={1400}
                  height={900}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="w-full h-auto object-contain block"
                  priority
                />
              </div>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}