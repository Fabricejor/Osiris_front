"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  User,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Flag,
  EyeOff,
  Check,
  AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';

interface ScannedPage {
  id: number;
  name: string;
  status: string;
  statusText: string;
  confidence: number;
  image: string;
}

interface ValidationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  pages: readonly ScannedPage[];
  initialPageIndex: number;
}

export default function ValidationPopup({ isOpen, onClose, pages, initialPageIndex }: Readonly<ValidationPopupProps>) {
  const [currentIndex, setCurrentIndex] = useState(initialPageIndex);
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialPageIndex);
    }
  }, [isOpen, initialPageIndex]);

  if (!isOpen) return null;

  const currentPage = pages[currentIndex];
  const confidenceColor = currentPage.confidence < 80 ? 'text-red-500' : 'text-emerald-600';
  const confidenceBg = currentPage.confidence < 80 ? 'bg-red-500' : 'bg-emerald-500';
  const confidenceRing = currentPage.confidence < 80 ? 'border-red-200' : 'border-emerald-200';

  const handleNext = () => {
    if (currentIndex < pages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white w-full h-full rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <PanelGroup orientation="horizontal" className="flex-1 w-full h-full">

              {/* ── LEFT PANEL — IMAGE VIEWER ──────────────── */}
              <Panel defaultSize={40} minSize={30} className="bg-[#1a1a2e] flex flex-col relative">

                <div className="flex-1 overflow-hidden relative flex items-center justify-center">
                  <TransformWrapper
                    initialScale={1}
                    minScale={0.5}
                    maxScale={4}
                    centerOnInit={true}
                  >
                    {({ zoomIn, zoomOut, resetTransform, centerView }) => (
                      <>
                        {/* Zoom controls */}
                        <div className="absolute top-4 left-4 z-10 flex items-center bg-black/40 backdrop-blur-md rounded-xl p-1 text-gray-300 gap-0.5">
                          {[
                            { action: () => zoomIn(), icon: ZoomIn, label: 'Zoom In' },
                            { action: () => zoomOut(), icon: ZoomOut, label: 'Zoom Out' },
                            { action: () => centerView(), icon: Maximize, label: 'Fit' },
                            { action: () => resetTransform(), icon: RotateCcw, label: 'Reset' },
                          ].map(({ action, icon: Icon, label }) => (
                            <button
                              key={label}
                              onClick={action}
                              className="p-2 hover:bg-white/15 rounded-lg transition-colors group/btn"
                              title={label}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          ))}
                        </div>

                        {/* Confidence badge */}
                        <div className={`absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-xl px-3 py-1.5 border ${confidenceRing}`}>
                          <div className={`w-2 h-2 rounded-full ${confidenceBg}`} />
                          <span className={`text-xs font-bold ${confidenceColor}`}>
                            {currentPage.confidence}%
                          </span>
                        </div>

                        <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div className="relative w-full h-full pointer-events-none p-4">
                            <Image
                              src={currentPage.image}
                              alt={currentPage.name}
                              fill
                              className="object-contain p-4"
                              priority
                            />
                            {/* Mock highlight bounding box */}
                            {currentPage.status === 'review' && (
                              <div className="absolute top-[40%] left-[30%] w-[20%] h-[5%] border-2 border-yellow-400 bg-yellow-400/20 rounded z-10" />
                            )}
                          </div>
                        </TransformComponent>
                      </>
                    )}
                  </TransformWrapper>
                </div>

                {/* Bottom Navigation */}
                <div className="h-14 bg-[#141425] border-t border-white/10 flex items-center justify-center gap-3 text-white px-4">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {pages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          i === currentIndex ? 'bg-emerald-400 w-4' : 'bg-white/30 hover:bg-white/50'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={currentIndex === pages.length - 1}
                    className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="ml-auto text-[11px] font-semibold text-gray-400">
                    {currentPage.name} · {currentIndex + 1}/{pages.length}
                  </div>
                </div>
              </Panel>

              {/* ── RESIZE HANDLE ──────────────────────────── */}
              <PanelResizeHandle className="w-2 bg-gray-100 hover:bg-emerald-100 transition-colors flex flex-col justify-center items-center cursor-col-resize z-10">
                <div className="w-1 h-8 bg-gray-300 rounded-full" />
              </PanelResizeHandle>

              {/* ── RIGHT PANEL — FORM ─────────────────────── */}
              <Panel defaultSize={60} minSize={30} className="bg-white flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-start justify-between shrink-0">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{t("record_validation")}</h2>
                    <p className="text-sm text-gray-500">{t("anc_register_entry")}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Confidence indicator */}
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t("confidence")}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${confidenceColor}`}>
                          {currentPage.confidence}%
                        </span>
                        <div className={`w-7 h-7 rounded-full border-2 ${confidenceRing} flex items-center justify-center`}>
                          <div className={`w-3.5 h-3.5 rounded-full ${confidenceBg}`} />
                        </div>
                      </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8" style={{ scrollbarWidth: 'thin' }}>

                  {/* Section 1: Patient Information */}
                  <section>
                    <h3 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">
                      <div className="w-6 h-6 rounded-md bg-violet-50 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-violet-500" />
                      </div>
                      {t("patient_info")}
                    </h3>

                    <div className="grid grid-cols-3 gap-4">
                      {/* ANC Number */}
                      <div className="col-span-2 bg-emerald-50/10 border border-emerald-100/80 rounded-2xl p-3 flex flex-col justify-between hover:shadow-xs transition-shadow focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-emerald-700/80 uppercase tracking-wider">{t("anc_number")}</span>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100/40 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">{t("validated")}</span>
                        </div>
                        <div className="relative flex items-center mt-1">
                          <input 
                            id="anc-number" 
                            type="text" 
                            defaultValue="ANC-2023-8492" 
                            className="w-full bg-transparent border-b border-transparent focus:border-b-emerald-500 py-0.5 text-sm font-bold text-gray-800 outline-none transition-all" 
                          />
                        </div>
                      </div>

                      {/* Age */}
                      <div className="col-span-1 bg-emerald-50/10 border border-emerald-100/80 rounded-2xl p-3 flex flex-col justify-between hover:shadow-xs transition-shadow focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-emerald-700/80 uppercase tracking-wider">{t("age")}</span>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100/40 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">28 y/o</span>
                        </div>
                        <div className="relative flex items-center mt-1">
                          <input 
                            id="age" 
                            type="text" 
                            defaultValue="28" 
                            className="w-full bg-transparent border-b border-transparent focus:border-b-emerald-500 py-0.5 text-sm font-bold text-gray-800 outline-none transition-all text-center" 
                          />
                        </div>
                      </div>

                      {/* Patient Name */}
                      <div className="col-span-3 bg-emerald-50/10 border border-emerald-100/80 rounded-2xl p-3 flex flex-col justify-between hover:shadow-xs transition-shadow focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-emerald-700/80 uppercase tracking-wider">{t("patient_name")}</span>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100/40 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">{t("validated")}</span>
                        </div>
                        <div className="relative flex items-center mt-1">
                          <input 
                            id="patient-name" 
                            type="text" 
                            defaultValue="Fatoumata Diallo" 
                            className="w-full bg-transparent border-b border-transparent focus:border-b-emerald-500 py-0.5 text-sm font-bold text-gray-800 outline-none transition-all" 
                          />
                        </div>
                      </div>

                      {/* Parity (Warning card) */}
                      <div className="col-span-3 bg-amber-50/10 border border-amber-200/70 rounded-2xl p-3.5 flex flex-col justify-between hover:shadow-xs transition-shadow focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/5">
                        <div className="flex justify-between items-center mb-1.5">
                          <label htmlFor="parity" className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> {t("parity")}
                          </label>
                          <span className="text-[10px] font-bold text-amber-600 uppercase bg-amber-100/50 px-2 py-0.5 rounded-md">
                            {t("review")}
                          </span>
                        </div>
                        <div className="relative flex items-center">
                          <input 
                            id="parity" 
                            type="text" 
                            defaultValue="G3P2" 
                            className="w-full pl-3 pr-14 py-1.5 bg-amber-50/20 border border-amber-200/50 focus:border-amber-500 focus:bg-white rounded-xl text-sm font-bold text-gray-800 outline-none transition-all" 
                          />
                          <span className="text-[10px] font-bold text-amber-600 absolute right-3 pointer-events-none">G/P</span>
                        </div>
                        <p className="text-[10px] text-amber-600/90 mt-2 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> {t("low_confidence_warning")}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Section 2: Clinical Data */}
                  <section className="mt-6">
                    <h3 className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">
                      <div className="w-6 h-6 rounded-md bg-sky-50 flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5 text-sky-500" />
                      </div>
                      {t("clinical_data")}
                    </h3>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Date of Visit */}
                      <div className="col-span-2 bg-emerald-50/10 border border-emerald-100/80 rounded-2xl p-3 flex flex-col justify-between hover:shadow-xs transition-shadow focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-emerald-700/80 uppercase tracking-wider">{t("date_of_visit")}</span>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100/40 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">{t("validated")}</span>
                        </div>
                        <div className="relative flex items-center mt-1">
                          <input 
                            id="date-of-visit" 
                            type="text" 
                            defaultValue="10/24/2023" 
                            className="w-full bg-transparent border-b border-transparent focus:border-b-emerald-500 py-0.5 text-sm font-bold text-gray-800 outline-none transition-all" 
                          />
                        </div>
                      </div>

                      {/* Gest. Age */}
                      <div className="col-span-1 bg-emerald-50/10 border border-emerald-100/80 rounded-2xl p-3 flex flex-col justify-between hover:shadow-xs transition-shadow focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-bold text-emerald-700/80 uppercase tracking-wider">{t("gest_age")}</span>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100/40 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">24 wks</span>
                        </div>
                        <div className="relative flex items-center mt-1">
                          <input 
                            id="gest-age" 
                            type="text" 
                            defaultValue="24" 
                            className="w-full bg-transparent border-b border-transparent focus:border-b-emerald-500 py-0.5 text-sm font-bold text-gray-800 outline-none transition-all text-center" 
                          />
                        </div>
                      </div>

                      {/* Error field — Weight */}
                      <div className="col-span-3 bg-rose-50/20 border border-rose-200/80 rounded-2xl p-3.5 flex flex-col justify-between hover:shadow-xs transition-shadow relative focus-within:border-rose-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-500/5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">{t("weight")}</span>
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-100/60 px-1.5 py-0.5 rounded-sm uppercase flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {t("review_needed")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="relative flex items-center flex-1">
                            <input 
                              id="weight" 
                              type="text" 
                              defaultValue="6?" 
                              className="w-full bg-transparent border-b-2 border-rose-300 focus:border-rose-500 py-1 text-sm font-black text-rose-700 focus:text-gray-900 outline-none transition-all" 
                            />
                            <span className="text-[10px] font-bold text-rose-500 absolute right-1 pointer-events-none">kg</span>
                          </div>
                          <button className="p-2.5 border border-rose-200 bg-white hover:bg-rose-50 rounded-xl transition-colors text-rose-500 hover:border-rose-300 shrink-0 shadow-xs" title="Hide annotation">
                            <EyeOff className="w-4 h-4" />
                          </button>
                          <button className="flex items-center gap-1 px-3.5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-all text-xs font-bold whitespace-nowrap shrink-0 shadow-sm shadow-rose-200">
                            <Maximize className="w-3.5 h-3.5" /> {t("locate")}
                          </button>
                        </div>
                        <p className="text-[10px] text-rose-600 mt-2 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> {t("system_read_warning")}
                        </p>
                      </div>

                      {/* Warning field — Blood Pressure */}
                      <div className="col-span-3 bg-amber-50/10 border border-amber-200/70 rounded-2xl p-3.5 flex flex-col justify-between hover:shadow-xs transition-shadow focus-within:border-amber-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/5">
                        <div className="flex justify-between items-center mb-1.5">
                          <label htmlFor="bp-systolic" className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> {t("blood_pressure")}
                          </label>
                          <span className="text-[10px] font-bold text-amber-600 uppercase bg-amber-100/50 px-2 py-0.5 rounded-md">
                            {t("review")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative flex items-center w-1/2">
                            <input 
                              id="bp-systolic" 
                              type="text" 
                              defaultValue="120" 
                              className="w-full bg-transparent border-b border-transparent focus:border-amber-500 py-0.5 text-sm font-bold text-gray-800 outline-none transition-all text-center" 
                            />
                            <span className="text-[9px] font-bold text-amber-600 absolute right-3 pointer-events-none">sys</span>
                          </div>
                          <span className="text-gray-400 font-bold text-lg px-1">/</span>
                          <div className="relative flex items-center w-1/2">
                            <input 
                              type="text" 
                              aria-label="bp-diastolic" 
                              defaultValue="80" 
                              className="w-full bg-transparent border-b border-transparent focus:border-amber-500 py-0.5 text-sm font-bold text-gray-800 outline-none transition-all text-center" 
                            />
                            <span className="text-[9px] font-bold text-amber-600 absolute right-3 pointer-events-none">dia</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/30 px-2.5 py-1.5 rounded-lg border border-amber-200/50 ml-1">
                            mmHg
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Spacer for footer */}
                  <div className="h-10" />
                </div>

                {/* ── Sticky Footer ────────────────────────── */}
                <div className="p-5 bg-white border-t border-gray-100 flex items-center justify-between shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.06)] z-20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                      <Flag className="w-3.5 h-3.5 text-red-500" />
                    </div>
                    <span className="text-sm font-bold text-gray-700">
                      {t("fields_require_review", { count: 1 })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                      {t("save_draft")}
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-200 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> {t("validate_record")}
                    </button>
                  </div>
                </div>

              </Panel>
            </PanelGroup>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
