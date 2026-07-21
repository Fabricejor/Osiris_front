"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { translations } from "@/utils/translations";

type TranslationKey = keyof typeof translations["en"];

interface FeatureItem {
  id: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  Icon: React.FC<{ className?: string }>;
}

/* Custom Green Icons matching the reference design */
function OfflineDataIcon({ className = "w-10 h-10 text-[#7BC148]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Smartphone */}
      <rect x="10" y="8" width="17" height="32" rx="3.5" fill="none" />
      <line x1="16" y1="12" x2="21" y2="12" strokeWidth="2" />
      <circle cx="18.5" cy="34.5" r="1.2" fill="currentColor" />
      {/* Wireless signal waves */}
      <path d="M32 17.5C34.2 19.7 34.2 23.3 32 25.5" strokeWidth="2.4" />
      <path d="M35.5 14C39.2 17.7 39.2 23.8 35.5 27.5" strokeWidth="2.4" />
      <path d="M39 10.5C44.2 15.7 44.2 25.8 39 31" strokeWidth="2.4" />
    </svg>
  );
}

function OcrDigitizationIcon({ className = "w-10 h-10 text-[#7BC148]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Corner scan brackets */}
      <path d="M9 16V11C9 9.89543 9.89543 9 11 9H16" strokeWidth="2.5" />
      <path d="M32 9H37C38.1046 9 39 9.89543 39 11V16" strokeWidth="2.5" />
      <path d="M9 32V37C9 38.1046 9.89543 39 11 39H16" strokeWidth="2.5" />
      <path d="M32 39H37C38.1046 39 39 38.1046 39 37V32" strokeWidth="2.5" />
      
      {/* Center OCR icon: document lines + scan target */}
      <path d="M19 20H29" strokeWidth="2" />
      <path d="M19 24H29" strokeWidth="2" />
      <path d="M19 28H25" strokeWidth="2" />
      <circle cx="27" cy="27" r="1.5" fill="currentColor" />
    </svg>
  );
}

function ClinicalValidationIcon({ className = "w-10 h-10 text-[#7BC148]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* User profile */}
      <circle cx="21" cy="17" r="6.5" />
      <path d="M9 36C9 30.5 14 27.5 21 27.5C23.2 27.5 25.3 28 27.1 29" />
      
      {/* Circle checkmark badge */}
      <circle cx="34" cy="31" r="7.5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2.2" />
      <path d="M30.5 31L33 33.5L37.5 28.5" strokeWidth="2.4" />
    </svg>
  );
}

function SecureDataIcon({ className = "w-10 h-10 text-[#7BC148]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Shield outline */}
      <path d="M24 7L38 12V22C38 31 32 38 24 41C16 38 10 31 10 22V12L24 7Z" />
      
      {/* Inner checkmark shield badge */}
      <path d="M18.5 23.5L22.5 27.5L29.5 19.5" strokeWidth="2.5" />
    </svg>
  );
}

const features: FeatureItem[] = [
  {
    id: "offline-data",
    titleKey: "feature_offline_title",
    descKey: "feature_offline_desc",
    Icon: OfflineDataIcon,
  },
  {
    id: "ocr-digitization",
    titleKey: "feature_ocr_title",
    descKey: "feature_ocr_desc",
    Icon: OcrDigitizationIcon,
  },
  {
    id: "clinical-validation",
    titleKey: "feature_clinical_title",
    descKey: "feature_clinical_desc",
    Icon: ClinicalValidationIcon,
  },
  {
    id: "secure-data",
    titleKey: "feature_secure_title",
    descKey: "feature_secure_desc",
    Icon: SecureDataIcon,
  },
];

export default function Features() {
  const { t } = useTranslation();

  return (
    <section
      id="features"
      className="w-full bg-white py-12 lg:py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-100 flex flex-col justify-center min-h-[50vh]"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Central Title in Black */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center tracking-tight mb-10 sm:mb-12"
        >
          {t("features_title")}
        </motion.h2>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              className="group relative bg-[#F7F8F9] hover:bg-[#F0F4F1] border border-gray-200/60 rounded-2xl p-5 sm:p-7 flex flex-col justify-start transition-all duration-300 hover:shadow-md hover:-translate-y-1 transform-gpu"
            >
              {/* Green Icon */}
              <div className="mb-5 text-[#7BC148] group-hover:scale-105 transition-transform duration-300">
                <feature.Icon className="w-10 h-10 text-[#7BC148]" />
              </div>

              {/* Card Title */}
              <h3 className="text-base font-bold text-gray-900 mb-2 tracking-tight group-hover:text-gray-900 transition-colors">
                {t(feature.titleKey)}
              </h3>

              {/* Small Description */}
              <p className="text-sm text-gray-500 leading-relaxed font-normal">
                {t(feature.descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
