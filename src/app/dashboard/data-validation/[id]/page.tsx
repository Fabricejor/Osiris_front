"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useTopBar } from '@/components/ui/TopBarContext';
import { useTranslation } from '@/hooks/useTranslation';
import {
  ChevronRight,
  Play,
  LayoutGrid,
  List as ListIcon,
  Pencil,
  CheckCircle2,
  ShieldAlert,
  Gauge,
  AlertTriangle
} from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ValidationPopup from '@/components/features/data-validation/ValidationPopup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import {
  SessionsService,
  formatDateHeure,
  pageCategory,
  toPageView,
  type PageCategory,
  type PageView,
  type SessionScan,
} from '@/services/sessions.service';



// Mock data removed
export default function BatchDetailsPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const unwrappedParams = React.use(params);
  const [pageViewMode, setPageViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);
  const batchId = unwrappedParams.id || '2026-0035';
  const { t, language } = useTranslation();

  const { data: pagesData, isLoading: pagesLoading, isError: pagesError } = useQuery({
    queryKey: ['session-pages', batchId],
    queryFn: () => SessionsService.getPages(batchId),
  });

  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ['session', batchId],
    queryFn: () => SessionsService.getSessionById(batchId),
  });

  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ['session-timeline', batchId],
    queryFn: () => SessionsService.getSessionTimeline(batchId),
  });

  const pages: PageView[] = useMemo(() => (pagesData?.items ?? []).map(toPageView), [pagesData]);
  const [filtreCategorie, setFiltreCategorie] = useState<'all' | PageCategory>('all');
  // Le popup de validation parcourt les pages affichées (même filtre, mêmes index).
  const pagesAffichees = useMemo(
    () => (filtreCategorie === 'all' ? pages : pages.filter((p) => pageCategory(p) === filtreCategorie)),
    [pages, filtreCategorie],
  );

  /** Ouvre la validation sur la première page qui demande une action (à revoir, puis en attente). */
  const demarrerValidation = () => {
    setFiltreCategorie('all');
    const cible = ['review', 'pending']
      .map((c) => pages.findIndex((p) => pageCategory(p) === c))
      .find((i) => i >= 0);
    setSelectedPageIndex(cible ?? 0);
  };

  // Relance de l'OCR d'une page en échec (admin de la structure / superadmin).
  const role = useAuthStore((state) => state.user?.role);
  const peutRelancer = role === 'ADMIN' || role === 'SUPERADMIN';
  const queryClient = useQueryClient();
  const relancerMutation = useMutation({
    mutationFn: (pageId: string) => SessionsService.retraiterPage(batchId, pageId),
    onSuccess: () => {
      toast.success(t('ocr_restarted'));
      queryClient.invalidateQueries({ queryKey: ['session-pages', batchId] });
      queryClient.invalidateQueries({ queryKey: ['session-timeline', batchId] });
    },
    onError: (err: Error) => toast.error(err.message || t('ocr_restart_failed')),
  });
  const session: Partial<SessionScan> = sessionData ?? {};
  const timelineSteps = timelineData ?? [];

  const pageStats = useMemo(() => {
    const acc = { validated: 0, pending: 0, review: 0 };
    pages.forEach((p) => { acc[pageCategory(p)] += 1; });
    return acc;
  }, [pages]);

  // État réel de la session : scan en cours côté mobile, puis d'après ses pages.
  const badgeSession = (() => {
    if (pagesLoading || sessionLoading) return null;
    if (session.statut_session === 'EN_COURS') {
      return { texte: t('session_badge_scanning'), classes: 'bg-blue-50 text-blue-700 border-blue-200', point: 'bg-blue-500 animate-pulse' };
    }
    if (pages.length === 0) {
      return { texte: t('session_badge_no_pages'), classes: 'bg-gray-100 text-gray-600 border-gray-200', point: 'bg-gray-400' };
    }
    if (pageStats.review > 0) {
      return { texte: t('session_badge_review', { count: pageStats.review }), classes: 'bg-red-50 text-red-700 border-red-200', point: 'bg-red-500' };
    }
    if (pageStats.pending > 0) {
      return { texte: t('ready_for_validation'), classes: 'bg-amber-50 text-amber-700 border-amber-200', point: 'bg-amber-500 animate-pulse' };
    }
    return { texte: t('session_badge_validated'), classes: 'bg-emerald-100 text-emerald-700 border-emerald-200', point: 'bg-emerald-500' };
  })();

  const getStatusColorClass = (status: string) => {
    if (status === 'review') return 'text-red-500';
    if (status === 'validated') return 'text-[#65b741]';
    return 'text-gray-500';
  };

  const renderStatusDot = (status: string, isGrid: boolean) => {
    if (status === 'validated') {
      return <CheckCircle2 className={`${isGrid ? 'w-4 h-4' : 'w-6 h-6'} text-[#65b741]`} />;
    }
    if (status === 'review') {
      return <ShieldAlert className={`${isGrid ? 'w-4 h-4' : 'w-6 h-6'} text-red-500`} />;
    }
    return <span className={`rounded-full bg-gray-300 ${isGrid ? 'w-2 h-2' : 'w-3 h-3'}`} />;
  };

  const getStepTextColorClass = (isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) return 'text-gray-700';
    if (isCurrent) return 'text-[#65b741]';
    return 'text-gray-400';
  };

  const getStepNode = (isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) {
      return (
        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-[#65b741] bg-white rounded-full" />
        </div>
      );
    }
    if (isCurrent) {
      return <div className="w-5 h-5 rounded-full border-2 border-[#65b741] bg-white" />;
    }
    return <div className="w-5 h-5 rounded-full bg-gray-100 border-2 border-white" />;
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="shrink-0 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('batch_title', { id: batchId })}</h1>
            {badgeSession && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeSession.classes}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badgeSession.point}`} />
                {badgeSession.texte}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={demarrerValidation}
              disabled={pages.length === 0}
              className="flex items-center gap-2 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-emerald-200">
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
          <span className="text-xs text-gray-400">· {pages.length} {t("total_pages").toLowerCase()}</span>
        </div>
      </div>

      {/* ── Main Layout ─────────────────────────────────────── */}
      <div className="flex-1 flex gap-6">
        {/* Left Column */}
        <div className="flex-1 flex flex-col gap-6" style={{ scrollbarWidth: 'none' }}>

          {/* ── Bento Grid ──────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            {/* Document Type */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t("document_type")}</span>
              <span className="text-xl font-bold text-gray-800 leading-tight">
                {sessionLoading ? '...' : (session.type_registre || t('unknown'))}
              </span>
            </div>

            {/* Total Pages */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t("total_pages")}</span>
              <span className="text-3xl font-bold text-gray-800">
                {sessionLoading ? '...' : (session.nombre_pages ?? 0)}
              </span>
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
                <span className="text-3xl font-bold text-gray-800">
                  {sessionLoading ? '...' : `${session.score_confiance_moyen || 0}%`}
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#65b741] rounded-full" style={{ width: `${session.score_confiance_moyen || 0}%` }} />
                </div>
              </div>
            </div>

            {/* Upload Date */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t("upload_date")}</span>
              <span className="text-base font-bold text-gray-800">
                {sessionLoading || !session.date_creation ? '...' : formatDateHeure(session.date_creation)}
              </span>
            </div>

            {/* Operator */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t("operator")}</span>
              <span className="text-base font-bold text-gray-800">
                {sessionLoading ? '...' : (session.operateur || t('na'))}
              </span>
            </div>

            {/* Clinic */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t("clinic")}</span>
              <span className="text-base font-bold text-gray-800">
                {sessionLoading ? '...' : (session.clinique || t('na'))}
              </span>
            </div>
          </div>

          {/* ── Scanned Pages ───────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col min-h-0">
            {/* Section header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">{t("scanned_pages")}</h3>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 bg-gray-100 p-0.5 rounded-lg">
                <button
                  onClick={() => setPageViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${pageViewMode === 'grid' ? 'bg-white text-gray-800 shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPageViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${pageViewMode === 'list' ? 'bg-white text-gray-800 shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <ListIcon className="w-4 h-4" />
                </button>
                <select
                  value={filtreCategorie}
                  onChange={(e) => setFiltreCategorie(e.target.value as 'all' | PageCategory)}
                  aria-label={t("show_pages")}
                  className="ml-2 rounded-md border-none bg-transparent py-1 pl-2 pr-7 text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-[#65b741]"
                >
                  <option value="all">{t("filter_all_pages")} ({pages.length})</option>
                  <option value="review">{t("filter_review_pages")} ({pageStats.review})</option>
                  <option value="pending">{t("filter_pending_pages")} ({pageStats.pending})</option>
                  <option value="validated">{t("filter_validated_pages")} ({pageStats.validated})</option>
                </select>
              </div>
            </div>

            <div className={`p-5 overflow-y-auto flex-1 max-h-[640px] ${pagesLoading || pagesError || pagesAffichees.length === 0
                ? 'flex items-center justify-center'
                : `grid gap-4 ${pageViewMode === 'grid' ? 'grid-cols-4' : 'grid-cols-1'}`
              }`} style={{ scrollbarWidth: 'thin', gridAutoRows: 'max-content' }}>
              {pagesLoading ? (
                <div className="flex flex-col items-center gap-3 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#65b741]" />
                  <span>{t("loading_pages")}</span>
                </div>
              ) : pagesError ? (
                <div className="text-red-500 text-center">{t("failed_load_pages")}</div>
              ) : pagesAffichees.length === 0 ? (
                <div className="text-gray-500 text-center">
                  {pages.length === 0 ? t("no_pages_found") : t("no_pages_in_filter")}
                </div>
              ) : (
                pagesAffichees.map((page, index) => (
                  <div
                    key={page.id}
                    className={`group relative flex bg-white rounded-lg border-2 transition-all ${pageViewMode === 'grid' ? 'flex-col' : 'flex-row items-center p-2'
                      } ${pageCategory(page) === 'review' ? 'border-red-500 shadow-sm shadow-red-100' : 'border-transparent shadow-sm hover:shadow-md'
                      }`}
                  >
                    {/* Image Container */}
                    <div className={`relative bg-gray-100 overflow-hidden ${pageViewMode === 'grid' ? 'aspect-3/4 w-full rounded-t-md' : 'w-24 h-32 rounded-md shrink-0'
                      }`}>
                      {/* URL pré-signée MinIO : `unoptimized` (signature éphémère, pas de cache optimiseur). */}
                      {page.image && (
                        <Image
                          src={page.image}
                          alt={page.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      )}

                      {/* Confidence Badge (only in grid mode on image) */}
                      {pageViewMode === 'grid' && (
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm text-xs font-bold">
                          <span className={page.confidence < 80 ? 'text-red-500' : 'text-[#65b741]'}>
                            {page.confidence}%
                          </span>
                        </div>
                      )}

                      {/* Review warning */}
                      {pageCategory(page) === 'review' && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-lg shadow-sm">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <button
                        type="button"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer border-none"
                        onClick={() => setSelectedPageIndex(index)}
                      >
                        <div className="w-10 h-10 bg-[#65b741] rounded-full flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                          <Pencil className="w-4 h-4" />
                        </div>
                      </button>
                    </div>

                    {/* Card Footer / Details */}
                    <div className={`flex items-start justify-between bg-white ${pageViewMode === 'grid' ? 'p-3 flex-row rounded-b-md border border-t-0 border-gray-100 w-full' : 'p-4 flex-row flex-1 ml-4 items-center border-none'
                      }`}>
                      <div className="flex flex-col">
                        <span className={`font-bold text-gray-900 mb-1 ${pageViewMode === 'grid' ? 'text-sm' : 'text-base'}`}>{page.name}</span>
                        <span className={`font-medium ${pageViewMode === 'grid' ? 'text-xs' : 'text-sm'} ${getStatusColorClass(pageCategory(page))}`}>
                          {t(page.statusKey)}
                        </span>
                        {(page.status === 'ECHEC_OCR' || page.ocrBloque) && (
                          <>
                            {page.erreurOcr && (
                              <span className="mt-1 text-[11px] leading-snug text-red-600">{page.erreurOcr}</span>
                            )}
                            {page.ocrBloque && (
                              <span className="mt-1 text-[11px] leading-snug text-amber-700">
                                {t('ocr_stuck')}
                              </span>
                            )}
                            {peutRelancer && (
                              <button
                                type="button"
                                onClick={() => relancerMutation.mutate(page.id)}
                                disabled={relancerMutation.isPending}
                                className="mt-2 self-start rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                              >
                                {t('restart_ocr')}
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {/* Right side info for list mode, or status dot for grid */}
                      <div className={`flex items-center ${pageViewMode === 'list' ? 'gap-6' : 'mt-1'}`}>
                        {/* Confidence (List mode) */}
                        {pageViewMode === 'list' && (
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{t("confidence_label")}</span>
                            <span className={`text-sm font-bold ${page.confidence < 80 ? 'text-red-500' : 'text-[#65b741]'}`}>
                              {page.confidence}%
                            </span>
                          </div>
                        )}

                        {/* Status Dot/Icon */}
                        {renderStatusDot(pageCategory(page), pageViewMode === 'grid')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Processing Timeline */}
        <div className="w-[340px] shrink-0 bg-white border border-gray-100 rounded-xl shadow-sm p-6 self-start sticky top-6">
          <h2 className="text-xl font-bold text-gray-900 mb-8">{t("processing_timeline")}</h2>

          <div className="relative pl-3">
            {/* Vertical Line */}
            <div className="absolute top-2 bottom-6 left-[1.1rem] w-0.5 bg-gray-100" />

            <div className="space-y-8 relative">
              {timelineLoading ? (
                <div className="text-sm text-gray-500">{t("loading_timeline")}</div>
              ) : timelineSteps.length === 0 ? (
                <div className="text-sm text-gray-500">{t("no_timeline")}</div>
              ) : timelineSteps.map((step) => {
                const isCompleted = step.status === 'completed';
                const isCurrent = step.status === 'current';
                const isUpcoming = step.status === 'upcoming';

                return (
                  <div key={step.id} className="relative flex gap-4 items-start">
                    {/* Timeline Node */}
                    <div className="relative z-10 shrink-0 mt-1">
                      {getStepNode(isCompleted, isCurrent)}
                    </div>

                    {/* Content */}
                    <div className="flex-col pb-2">
                      <h4 className={`text-sm font-bold mb-1 ${getStepTextColorClass(isCompleted, isCurrent)}`}>
                        {step.title}
                      </h4>

                      {step.time && (
                        <p className="text-xs text-gray-500">
                          {new Date(step.time).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      )}

                      {step.subtitle && (
                        <p className={`text-xs ${isUpcoming ? 'text-gray-400' : 'text-gray-500'}`}>
                          {step.subtitle}
                        </p>
                      )}

                      {step.details && (
                        <div className="mt-2 p-3 bg-gray-50 border border-gray-100 rounded-md">
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {step.details}
                          </p>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ValidationPopup
        isOpen={selectedPageIndex !== null}
        onClose={() => setSelectedPageIndex(null)}
        pages={pagesAffichees}
        initialPageIndex={selectedPageIndex || 0}
        sessionId={batchId}
      />
    </div>
  );
}
