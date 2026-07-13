"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useTopBar } from '@/components/ui/TopBarContext';
import { useTranslation } from '@/hooks/useTranslation';
import {
  ChevronRight,
  Download,
  Play,
  LayoutGrid,
  List as ListIcon,
  Filter,
  Pencil,
  CheckCircle2,
  ArrowRight,
  Home,
  FileText,
  Layers,
  Gauge,
  CalendarDays,
  User,
  Building2,
  GitBranch,
  AlertTriangle,
  Eye,
  Clock,
} from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ValidationPopup from '@/components/features/data-validation/ValidationPopup';

const scannedPages = [
  { id: 1, name: 'Page 01', status: 'pending', confidence: 94, image: '/registres/Image (1).png' },
  { id: 2, name: 'Page 02', status: 'pending', confidence: 98, image: '/registres/Image (2).png' },
  { id: 3, name: 'Page 03', status: 'review', confidence: 72, image: '/registres/Image (3).png' },
  { id: 4, name: 'Page 04', status: 'validated', confidence: 99, image: '/registres/Image (5).png' },
  { id: 5, name: 'Page 05', status: 'pending', confidence: 91, image: '/registres/Image (6).png' },
  { id: 6, name: 'Page 06', status: 'validated', confidence: 97, image: '/registres/Image (7).png' },
  { id: 7, name: 'Page 07', status: 'validated', confidence: 95, image: '/registres/Image (8).png' },
  { id: 8, name: 'Page 08', status: 'pending', confidence: 89, image: '/registres/Image (9).png' },
  { id: 9, name: 'Page 09', status: 'review', confidence: 45, image: '/registres/Image (1).png' },
  { id: 10, name: 'Page 10', status: 'validated', confidence: 98, image: '/registres/Image (2).png' },
  { id: 11, name: 'Page 11', status: 'validated', confidence: 96, image: '/registres/Image (5).png' },
  { id: 12, name: 'Page 12', status: 'pending', confidence: 88, image: '/registres/Image (6).png' },
  { id: 13, name: 'Page 13', status: 'validated', confidence: 99, image: '/registres/Image (7).png' },
  { id: 14, name: 'Page 14', status: 'validated', confidence: 94, image: '/registres/Image (8).png' },
];

// ── Status helpers ──────────────────────────────────────────────
const PAGE_STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; border: string; glow: string }> = {
  pending:   { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500',   border: 'border-amber-200',   glow: '' },
  validated: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200', glow: '' },
  review:    { bg: 'bg-red-100',     text: 'text-red-600',     dot: 'bg-red-500',     border: 'border-red-400',     glow: 'shadow-red-100' },
};

export default function BatchDetailsPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const unwrappedParams = React.use(params);
  const [pageViewMode, setPageViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);
  const batchId = unwrappedParams.id || '2026-0035';
  const { setBreadcrumb } = useTopBar();
  const { t } = useTranslation();

  // Push breadcrumb to TopBar
  useEffect(() => {
    setBreadcrumb(
      <div className="flex items-center gap-1.5 text-xs min-w-0">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md text-gray-500 font-medium">
          <Home className="w-3 h-3" /> {t("batches")}
        </span>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-md text-emerald-700 font-semibold">
          {t("batch_details")} #{batchId}
        </span>
      </div>
    );
    return () => setBreadcrumb(null);
  }, [batchId, setBreadcrumb, t]);

  // Compute page stats
  const pageStats = useMemo(() => {
    const counts = { validated: 0, pending: 0, review: 0 };
    scannedPages.forEach(p => {
      if (p.status in counts) counts[p.status as keyof typeof counts]++;
    });
    return counts;
  }, []);

  const timelineSteps = useMemo(() => [
    { id: 1, title: t("batch_received"), time: 'Oct 25, 2023 • 09:41 AM', status: 'completed' },
    { id: 2, title: t("ocr_processing_title"), subtitle: t("completed_in", { time: '2m 14s' }), details: t("extracted_points", { points: '1,240', pages: '42' }), status: 'completed' },
    { id: 3, title: t("ready_for_validation"), subtitle: t("awaiting_review"), action: t("assign_reviewer"), status: 'current' },
    { id: 4, title: t("validated"), subtitle: t("pending_completion"), status: 'upcoming' },
    { id: 5, title: t("exported_to_dhis2"), subtitle: t("pending_completion"), status: 'upcoming' },
  ], [t]);

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="shrink-0 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Batch #{batchId}</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t("ready_for_validation")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
              <Download className="w-4 h-4" /> {t("export")}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-emerald-200">
              <Play className="w-4 h-4" /> {t("start_validation")}
            </button>
          </div>
        </div>

        {/* Mini stats under title */}
        <div className="flex items-center gap-3 mt-3">
          {[
            { label: t("validated"), count: pageStats.validated, dot: 'bg-emerald-500', text: 'text-emerald-700' },
            { label: t("pending"), count: pageStats.pending, dot: 'bg-amber-500', text: 'text-amber-700' },
            { label: t("review"), count: pageStats.review, dot: 'bg-red-500', text: 'text-red-600' },
          ].map(s => (
            <span key={s.label} className={`inline-flex items-center gap-1.5 text-xs font-semibold ${s.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.count} {s.label}
            </span>
          ))}
          <span className="text-xs text-gray-400">· {scannedPages.length} {t("total_pages").toLowerCase()}</span>
        </div>
      </div>

      {/* ── Main Layout ─────────────────────────────────────── */}
      <div className="flex-1 flex gap-6">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-6" style={{ scrollbarWidth: 'none' }}>

          {/* ── Bento Grid ──────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {/* Document Type */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("document_type")}</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <span className="text-lg font-bold text-gray-800 leading-tight">ANC Register</span>
            </div>

            {/* Total Pages */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("total_pages")}</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Layers className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <span className="text-3xl font-bold text-gray-800">42</span>
            </div>

            {/* Overall Confidence */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("overall_confidence")}</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Gauge className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-800">92%</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
              </div>
            </div>

            {/* Upload Date */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("upload_date")}</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                  <CalendarDays className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <span className="text-base font-bold text-gray-800">Oct 25, 2023</span>
            </div>

            {/* Operator */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("operator")}</span>
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                  <User className="w-4 h-4 text-violet-600" />
                </div>
              </div>
              <span className="text-base font-bold text-gray-800">Dr. Amina Diallo</span>
            </div>

            {/* Clinic */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("clinic")}</span>
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                  <Building2 className="w-4 h-4 text-sky-600" />
                </div>
              </div>
              <span className="text-base font-bold text-gray-800">St. Jude&#39;s Medical</span>
            </div>
          </div>

          {/* ── Scanned Pages ───────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col min-h-0">
            {/* Section header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">{t("scanned_pages")}</h3>
                <div className="flex items-center gap-2 ml-2">
                  {[
                    { label: pageStats.validated, color: 'bg-emerald-500' },
                    { label: pageStats.pending, color: 'bg-amber-500' },
                    { label: pageStats.review, color: 'bg-red-500' },
                  ].map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="flex bg-gray-100 p-0.5 rounded-lg">
                  <button
                    onClick={() => setPageViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${pageViewMode === 'grid' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPageViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${pageViewMode === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600 ml-1">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pages grid/list */}
            <div
              className={`p-4 overflow-y-auto flex-1 grid gap-3 max-h-[640px] ${
                pageViewMode === 'grid' ? 'grid-cols-4' : 'grid-cols-1'
              }`}
              style={{ scrollbarWidth: 'thin', gridAutoRows: 'max-content' }}
            >
              {scannedPages.map((page, index) => {
                const cfg = PAGE_STATUS_CONFIG[page.status] || PAGE_STATUS_CONFIG.pending;

                return pageViewMode === 'grid' ? (
                  /* ── Grid Card ──────────────────────── */
                  <div
                    key={page.id}
                    className={`group relative flex flex-col bg-white rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg ${
                      page.status === 'review'
                        ? `${cfg.border} shadow-sm ${cfg.glow}`
                        : 'border-gray-100 shadow-sm'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative aspect-3/4 w-full bg-gray-100 overflow-hidden">
                      <Image src={page.image} alt={page.name} fill className="object-cover" />

                      {/* Confidence badge */}
                      <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-lg shadow-sm text-xs font-bold">
                        <span className={page.confidence < 80 ? 'text-red-500' : 'text-emerald-600'}>
                          {page.confidence}%
                        </span>
                      </div>

                      {/* Review warning */}
                      {page.status === 'review' && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-lg shadow-sm">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      )}

                      {/* Hover overlay */}
                      <button
                        type="button"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center cursor-pointer border-none"
                        onClick={() => setSelectedPageIndex(index)}
                      >
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-200">
                          <Eye className="w-4 h-4" />
                        </div>
                      </button>
                    </div>

                    {/* Card footer */}
                    <div className="p-3 flex items-center justify-between border-t border-gray-50">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{page.name}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-0.5 ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {t(page.status as any)}
                        </span>
                      </div>
                      {page.status === 'validated' && (
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                  </div>
                ) : (
                  /* ── List Row ───────────────────────── */
                  <div
                    key={page.id}
                    className={`group flex items-center gap-4 p-2.5 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
                      page.status === 'review'
                        ? `${cfg.border} ${cfg.glow}`
                        : 'border-gray-100'
                    }`}
                    onClick={() => setSelectedPageIndex(index)}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-28 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <Image src={page.image} alt={page.name} fill className="object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{page.name}</p>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold mt-1 px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {t(page.status as any)}
                      </span>
                    </div>

                    {/* Confidence */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("confidence")}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${page.confidence < 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${page.confidence}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${page.confidence < 80 ? 'text-red-500' : 'text-emerald-600'}`}>
                          {page.confidence}%
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center justify-center transition-colors">
                        <Pencil className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right Column: Processing Timeline ─────────────── */}
        <div className="w-[320px] shrink-0 bg-white border border-gray-100 rounded-2xl shadow-sm self-start sticky top-6 overflow-hidden">
          {/* Timeline header */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900">{t("processing_timeline")}</h2>
            </div>
          </div>

          {/* Timeline steps */}
          <div className="p-5">
            <div className="relative pl-4">
              {/* Vertical line */}
              <div className="absolute top-3 bottom-6 left-[9px] w-[2px] bg-gray-100" />

              <div className="space-y-6 relative">
                {timelineSteps.map((step) => {
                  const isCompleted = step.status === 'completed';
                  const isCurrent = step.status === 'current';
                  const isUpcoming = step.status === 'upcoming';

                  return (
                    <div key={step.id} className="relative flex gap-4 items-start">
                      {/* Node */}
                      <div className="relative z-10 shrink-0 mt-0.5">
                        {isCompleted ? (
                          <div className="w-[18px] h-[18px] rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        ) : isCurrent ? (
                          <div className="relative">
                            <div className="w-[18px] h-[18px] rounded-full border-[2.5px] border-emerald-500 bg-white" />
                            <div className="absolute inset-0 w-[18px] h-[18px] rounded-full border-2 border-emerald-400 animate-ping opacity-30" />
                          </div>
                        ) : (
                          <div className="w-[18px] h-[18px] rounded-full bg-gray-100 border-2 border-dashed border-gray-300" />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`flex-1 pb-1 ${isCurrent ? 'bg-emerald-50/60 -mx-2 px-3 py-2 rounded-xl border border-emerald-100' : ''}`}>
                        <h4 className={`text-sm font-bold mb-0.5 ${
                          isCompleted ? 'text-gray-700' : isCurrent ? 'text-emerald-700' : 'text-gray-400'
                        }`}>
                          {step.title}
                        </h4>

                        {step.time && (
                          <p className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {step.time}
                          </p>
                        )}

                        {step.subtitle && (
                          <p className={`text-xs mt-0.5 ${isUpcoming ? 'text-gray-400' : 'text-gray-500'}`}>
                            {step.subtitle}
                          </p>
                        )}

                        {step.details && (
                          <div className="mt-2 p-2.5 bg-gray-50 border border-gray-100 rounded-lg">
                            <p className="text-[11px] text-gray-500 leading-relaxed">
                              {step.details}
                            </p>
                          </div>
                        )}

                        {step.action && (
                          <button className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors group/action">
                            {step.action}
                            <ArrowRight className="w-3 h-3 group-hover/action:translate-x-0.5 transition-transform" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ValidationPopup
        isOpen={selectedPageIndex !== null}
        onClose={() => setSelectedPageIndex(null)}
        pages={scannedPages.map(p => ({
          ...p,
          statusText: t(p.status as any)
        }))}
        initialPageIndex={selectedPageIndex || 0}
      />
    </div>
  );
}
