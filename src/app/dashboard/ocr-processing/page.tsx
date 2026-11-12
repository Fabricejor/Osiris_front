"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Pencil,
  AlertTriangle,
  Clock,
  Lock,
  PlayCircle
} from 'lucide-react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SessionsService, formatDateHeure, heureCourte, toPageView, type PageView } from '@/services/sessions.service';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import ValidationPopup from '@/components/features/data-validation/ValidationPopup';
import PageHeader from '@/components/ui/PageHeader';
import { useTranslation } from '@/hooks/useTranslation';

export default function OCRProcessingPage() {
  const { t, language } = useTranslation();
  const [pageViewMode, setPageViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');

  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['pages-queue'],
    queryFn: () => SessionsService.getPagesQueue(),
  });
  const queuePages: PageView[] = useMemo(() => (data?.items ?? []).map(toPageView), [data]);

  const onActionError = (err: any) => {
    // 409 : la page a changé de statut entre-temps (ex. déjà validée par un collègue).
    toast.error(err?.message || t('action_failed'));
    queryClient.invalidateQueries({ queryKey: ['pages-queue'] });
  };

  const validateMutation = useMutation({
    mutationFn: (id: string) => SessionsService.validatePage(id),
    onSuccess: () => {
      toast.success(t('page_validated'));
      queryClient.invalidateQueries({ queryKey: ['pages-queue'] });
    },
    onError: onActionError,
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => SessionsService.rejectPage(id),
    onSuccess: () => {
      toast.success(t('page_rejected'));
      queryClient.invalidateQueries({ queryKey: ['pages-queue'] });
    },
    onError: onActionError,
  });

  // State for Dropdown and Popup
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number | null>(null);

  // Mode « file » : le serveur attribue la plus ancienne page libre (réservée
  // pour moi), puis la suivante après chaque validation — jamais deux
  // valideurs sur la même page.
  const estValideur = useAuthStore((s) => s.user?.role === 'VALIDEUR_MEDICAL');
  const [file, setFile] = useState<PageView[] | null>(null);
  const [chargementSuivante, setChargementSuivante] = useState(false);

  const prendrePageSuivante = async (): Promise<PageView | null> => {
    const page = await SessionsService.pageSuivante();
    return page ? toPageView(page) : null;
  };

  const demarrerFile = async () => {
    setChargementSuivante(true);
    try {
      const page = await prendrePageSuivante();
      if (!page) {
        toast.info(language === 'fr' ? 'Aucune page libre à valider.' : 'No free page to validate.');
        return;
      }
      setFile([page]);
      setSelectedPageIndex(0);
    } catch (err: unknown) {
      toast.error(err instanceof Error && err.message ? err.message : t('action_failed'));
    } finally {
      setChargementSuivante(false);
    }
  };

  const ajouterPageSuivante = async (): Promise<boolean> => {
    const page = await prendrePageSuivante();
    if (!page) return false;
    setFile((prev) => [...(prev ?? []), page]);
    return true;
  };

  const fermerPopup = () => {
    setSelectedPageIndex(null);
    setFile(null);
    queryClient.invalidateQueries({ queryKey: ['pages-queue'] });
  };

  // Close dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action: string, id: string, index: number) => {
    setActiveDropdown(null);
    if (action === 'Edit') {
      setSelectedPageIndex(index);
    } else if (action === 'Validate') {
      validateMutation.mutate(id);
    } else if (action === 'Reject') {
      rejectMutation.mutate(id);
    }
  };

  const filteredPages = queuePages.filter((page) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = page.name.toLowerCase().includes(q) ||
      page.id_session_scan.toLowerCase().includes(q);
    const matchFilter = filterType === 'All' ||
      (filterType === 'Anomalies' && page.isAnomaly) ||
      (filterType === 'Low Confidence' && page.confidence < 50);
    return matchSearch && matchFilter;
  });
  // Pages parcourues dans le popup : la file attribuée par le serveur, sinon la liste filtrée.
  const pagesPopup = file ?? filteredPages;

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50/50 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>

      {/* Header */}
      <PageHeader title={t("ocr_processing")} />
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">{t("ocr_hub_subtitle")}</p>
          {estValideur && (
            <button
              type="button"
              onClick={demarrerFile}
              disabled={chargementSuivante}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              <PlayCircle className="w-4 h-4" />
              {language === 'fr' ? 'Valider la page suivante' : 'Validate next page'}
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 mt-6">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-1 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">{t("pending_review")}</p>
              <p className="text-2xl font-black text-gray-900">{queuePages.filter((p) => p.status === 'A_VALIDER').length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-1 flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">{t("anomalies_detected")}</p>
              <p className="text-2xl font-black text-gray-900">{queuePages.filter((p) => p.isAnomaly).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t("search_name_batch")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#65b741] focus:border-transparent text-gray-700 font-medium"
            />
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <button onClick={() => setFilterType('All')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${filterType === 'All' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t("all_filter")}</button>
            <button onClick={() => setFilterType('Anomalies')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${filterType === 'Anomalies' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'}`}>{t("anomalies_filter")}</button>
            <button onClick={() => setFilterType('Low Confidence')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${filterType === 'Low Confidence' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>{t("conf_below_50")}</button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-gray-500 bg-gray-100 p-1 rounded-lg">
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
        </div>
      </div>

      {/* Main Content: Queue Pages */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#65b741]" />
            <span>{t("loading_pages")}</span>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <CheckCircle2 className="w-12 h-12 opacity-50 text-emerald-500" />
            <p className="text-lg font-medium text-gray-600">{t("queue_empty")}</p>
            <p className="text-sm">{t("queue_empty_desc")}</p>
          </div>
        ) : (
          <div className={`grid gap-6 ${pageViewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`} ref={dropdownRef}>
            {filteredPages.map((page, index) => {
              const pageName = page.name;
              const pageStatusText = t(page.statusKey);
              const pageConfidence = page.confidence;
              const pageBatch = page.id_session_scan.slice(0, 8);
              const pageUploadDate = page.date_creation ? formatDateHeure(page.date_creation) : t('na');
              const pageImage = page.image;

              return (
                <div
                  key={page.id}
                  className={`relative flex bg-white rounded-xl border-2 transition-all border-transparent shadow-sm hover:shadow-md ${pageViewMode === 'grid' ? 'flex-col' : 'flex-row items-center p-3'
                    }`}
                >
                  {/* Image Section */}
                  <div className={`relative bg-gray-100 overflow-hidden ${pageViewMode === 'grid' ? 'aspect-4/3 w-full rounded-t-xl' : 'w-32 h-24 rounded-lg shrink-0'
                    }`}>
                    {pageImage && <Image src={pageImage} alt={pageName} fill unoptimized className="object-cover" />}

                    {/* Status Badge Over Image */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm ${page.isAnomaly ? 'bg-rose-500/90 text-white' : 'bg-amber-400/90 text-amber-900'
                        }`}>
                        {pageStatusText}
                      </span>
                      {page.reserveeParAutre && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold backdrop-blur-md shadow-sm bg-slate-800/85 text-white"
                          title={language === 'fr'
                            ? `En cours de validation par ${page.reserveeParAutre.nom} (jusqu'à ${heureCourte(page.reserveeParAutre.jusqua)} au plus tard)`
                            : `Being validated by ${page.reserveeParAutre.nom} (until ${heureCourte(page.reserveeParAutre.jusqua)} at the latest)`}
                        >
                          <Lock className="w-3 h-3" />
                          {page.reserveeParAutre.nom}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className={`flex flex-col flex-1 ${pageViewMode === 'grid' ? 'p-4' : 'ml-6 py-2'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 leading-tight">{pageName}</h3>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">{t('batch_label', { id: pageBatch })}</p>
                      </div>

                      {/* Actions Dropdown Trigger */}
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === page.id ? null : page.id); }}
                          className="p-1 text-gray-400 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdown === page.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                            <button onClick={() => handleAction('Validate', page.id, index)} className="w-full text-left px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> {t("validate_action")}
                            </button>
                            <button onClick={() => handleAction('Edit', page.id, index)} className="w-full text-left px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Pencil className="w-4 h-4" /> {t("edit_action")}
                            </button>
                            <div className="h-px bg-gray-100 my-1" />
                            <button onClick={() => handleAction('Reject', page.id, index)} className="w-full text-left px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                              <XCircle className="w-4 h-4" /> {t("reject_action")}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`flex items-center justify-between mt-auto ${pageViewMode === 'grid' ? 'pt-4 border-t border-gray-50' : ''}`}>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("confidence_label")}</span>
                        <span className={`text-sm font-black ${pageConfidence < 50 ? 'text-rose-500' : 'text-amber-500'}`}>
                          {pageConfidence}%
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("uploaded")}</span>
                        <span className="text-xs font-bold text-gray-600">{pageUploadDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Full-Screen Validation Popup */}
      <ValidationPopup
        isOpen={selectedPageIndex !== null}
        onClose={fermerPopup}
        pages={pagesPopup}
        initialPageIndex={selectedPageIndex || 0}
        sessionId={selectedPageIndex !== null ? (pagesPopup[selectedPageIndex]?.id_session_scan ?? '') : ''}
        onFinDeListe={file ? ajouterPageSuivante : undefined}
      />
    </div>
  );
}
