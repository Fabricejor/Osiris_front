"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { Activity, ShieldCheck, HeartPulse, RefreshCw, BarChart } from "lucide-react";

export default function Advantages() {
  const { t } = useTranslation();

  const advantagesList = [
    { text: t("adv_bullet1"), icon: BarChart },
    { text: t("adv_bullet2"), icon: Activity },
    { text: t("adv_bullet3"), icon: ShieldCheck },
    { text: t("adv_bullet4"), icon: HeartPulse },
    { text: t("adv_bullet5"), icon: RefreshCw },
  ];

  return (
    <section 
      id="advantages" 
      className="w-full bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 lg:py-12" 
    >
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col lg:flex-row transform-gpu h-auto lg:min-h-[60vh]"
        >
          {/* Left Column - Full Bleed Image */}
          <div className="lg:w-1/2 min-h-[380px] sm:min-h-[440px] lg:min-h-full relative overflow-hidden group">
            <img
              src="/images/protection maternel sante.png"
              alt="OSIRIS Protection Maternelle et Santé"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            {/* Subtle overlay gradient for rich contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Right Column - Text and bullets */}
          <div className="lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center bg-white">
            <motion.h2
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl sm:text-3xl lg:text-[2.2rem] font-bold text-gray-900 leading-tight mb-6 lg:mb-8"
            >
              {t("adv_title")}
            </motion.h2>

            <div className="flex flex-col gap-3 lg:gap-4">
              {advantagesList.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4 group transform-gpu"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#f0f7ec] flex items-center justify-center shrink-0 border border-[#7BC148]/20 group-hover:bg-[#7BC148]/10 transition-colors">
                    <item.icon className="w-5 h-5 text-[#4a7d28]" strokeWidth={2} />
                  </div>
                  <span className="text-gray-800 font-semibold text-sm sm:text-base">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
