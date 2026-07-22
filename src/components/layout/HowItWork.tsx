"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { BookOpen, ScanText, UserCheck, FileText, BarChart3, Users, Target, Building2, Cloud, ArrowRight } from "lucide-react";

export default function HowItWork() {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="w-full bg-white py-12 lg:py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100 flex flex-col justify-center min-h-[60vh]">
      <div className="max-w-7xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center tracking-tight mb-10 sm:mb-12"
        >
          {t("how_it_works_title")}
        </motion.h2>

        {/* Central Long Card for Steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-[#F7F8F9] border border-gray-200/60 rounded-3xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 relative overflow-hidden transform-gpu"
        >
          {/* Step 1 */}
          <div className="flex flex-col items-center flex-1 z-10 text-center">
            <div className="w-14 h-14 rounded-full bg-white border border-[#7BC148]/20 flex items-center justify-center mb-3 shadow-sm">
              <BookOpen className="w-7 h-7 text-[#7BC148]" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-semibold text-gray-900">{t("step_paper")}</span>
          </div>
          
          <ArrowRight className="w-5 h-5 text-[#7BC148]/50 hidden md:block" />

          {/* Step 2 */}
          <div className="flex flex-col items-center flex-1 z-10 text-center">
            <div className="w-14 h-14 rounded-full bg-white border border-[#7BC148]/20 flex items-center justify-center mb-3 shadow-sm">
              <ScanText className="w-7 h-7 text-[#7BC148]" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-semibold text-gray-900">{t("step_ocr")}</span>
          </div>

          <ArrowRight className="w-5 h-5 text-[#7BC148]/50 hidden md:block" />

          {/* Step 3 */}
          <div className="flex flex-col items-center flex-1 z-10 text-center">
            <div className="w-14 h-14 rounded-full bg-white border border-[#7BC148]/20 flex items-center justify-center mb-3 shadow-sm">
              <UserCheck className="w-7 h-7 text-[#7BC148]" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-semibold text-gray-900">{t("step_validation")}</span>
          </div>

          <ArrowRight className="w-5 h-5 text-[#7BC148]/50 hidden md:block" />

          {/* Step 4 */}
          <div className="flex flex-col items-center flex-1 z-10 text-center">
            <div className="w-14 h-14 rounded-full bg-white border border-[#7BC148]/20 flex items-center justify-center mb-3 shadow-sm">
              <FileText className="w-7 h-7 text-[#7BC148]" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-semibold text-gray-900">{t("step_digital")}</span>
          </div>

          <ArrowRight className="w-5 h-5 text-[#7BC148]/50 hidden md:block" />

          {/* Step 5 */}
          <div className="flex flex-col items-center flex-1 z-10 text-center">
            <div className="w-14 h-14 rounded-full bg-white border border-[#7BC148]/20 flex items-center justify-center mb-3 shadow-sm">
              <BarChart3 className="w-7 h-7 text-[#7BC148]" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-semibold text-gray-900">{t("step_dashboard")}</span>
          </div>
        </motion.div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Stat 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#F7F8F9] border border-gray-200/60 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#7BC148]/10 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-[#7BC148]" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">10,000+</h4>
              <p className="text-xs text-gray-500 font-medium">{t("stat_registers")}</p>
            </div>
          </motion.div>

          {/* Stat 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#F7F8F9] border border-gray-200/60 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#7BC148]/10 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-[#7BC148]" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">99%</h4>
              <p className="text-xs text-gray-500 font-medium">{t("stat_accuracy")}</p>
            </div>
          </motion.div>

          {/* Stat 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#F7F8F9] border border-gray-200/60 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#7BC148]/10 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-[#7BC148]" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">25+</h4>
              <p className="text-xs text-gray-500 font-medium">{t("stat_facilities")}</p>
            </div>
          </motion.div>

          {/* Stat 4 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-[#F7F8F9] border border-gray-200/60 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#7BC148]/10 flex items-center justify-center shrink-0">
              <Cloud className="w-6 h-6 text-[#7BC148]" strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">100%</h4>
              <p className="text-xs text-gray-500 font-medium">{t("stat_offline")}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
