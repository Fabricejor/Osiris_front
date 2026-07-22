"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { Activity, ShieldCheck, HeartPulse, RefreshCw, BarChart } from "lucide-react";

// Dynamically load the 3D model
const Advantages3DModel = dynamic(() => import("./Advantages3DModel"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-[#7BC148]/30 border-t-[#7BC148] animate-spin" />
    </div>
  ),
});

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
          {/* Left Column - 3D Model with slightly gray/green background */}
          <div className="lg:w-1/2 bg-[#f4f7f5] flex items-center justify-center min-h-[350px] lg:min-h-full relative overflow-hidden">
             {/* Optional decorative background circle */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#e9f2eb] rounded-full blur-3xl opacity-60"></div>
             
             <div className="absolute inset-0 w-full h-full z-10">
               <Advantages3DModel />
             </div>
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
