"use client";

import React, { useState, useMemo } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import FolderUI, { type FolderStatus } from '@/components/ui/folderUI';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import DetailsTable from '@/components/features/data-validation/DetailsTable';
import {
  Search,
  Filter,
  X,
  Folder,
  FileText,
  HardDrive,
  Calendar,
  Clock,
  Tag,
  Pin,
  Activity,
  List,
  LayoutGrid,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from '@/hooks/useTranslation';

// ── Types ──────────────────────────────────────────────────────
type FolderData = {
  id: string;
  nameEn: string;
  nameFr: string;
  filesCount: number;
  size: string;
  sizeBytes: number;
  status: FolderStatus;
  createdAt: string;
  lastModified: string;
  tagsEn: string[];
  tagsFr: string[];
  descriptionEn: string;
  descriptionFr: string;
};

// ── Mock Data ──────────────────────────────────────────────────
const folders: FolderData[] = [
  {
    id: '1',
    nameEn: 'Poste de Santé de Potou (Maternité)',
    nameFr: 'Poste de Santé de Potou (Maternité)',
    filesCount: 42,
    size: '116.9 MB',
    sizeBytes: 116900000,
    status: 'pending',
    createdAt: '2026-08-14',
    lastModified: '2026-08-14',
    tagsEn: ['Accouchements', 'Potou', 'Prioritaire'],
    tagsFr: ['Accouchements', 'Potou', 'Prioritaire'],
    descriptionEn: 'Lot de registres des accouchements numérisés au PS Potou, en attente de validation clinique.',
    descriptionFr: 'Lot de registres des accouchements numérisés au PS Potou, en attente de validation clinique.',
  },
  {
    id: '2',
    nameEn: 'Centre de Santé de Médina (Dakar)',
    nameFr: 'Centre de Santé de Médina (Dakar)',
    filesCount: 88,
    size: '245.2 MB',
    sizeBytes: 245200000,
    status: 'validated',
    createdAt: '2026-08-12',
    lastModified: '2026-08-13',
    tagsEn: ['CPN', 'Médina', 'Validé'],
    tagsFr: ['CPN', 'Médina', 'Validé'],
    descriptionEn: 'Registres de Consultations Prénatales (CPN) validés et certifiés.',
    descriptionFr: 'Registres de Consultations Prénatales (CPN) validés et certifiés.',
  },
  {
    id: '3',
    nameEn: 'Hôpital Régional de Fatick',
    nameFr: 'Hôpital Régional de Fatick',
    filesCount: 35,
    size: '98.4 MB',
    sizeBytes: 98400000,
    status: 'anomaly',
    createdAt: '2026-08-10',
    lastModified: '2026-08-11',
    tagsEn: ['Accouchements', 'Fatick', 'Alerte MAD'],
    tagsFr: ['Accouchements', 'Fatick', 'Alerte MAD'],
    descriptionEn: 'Lot d\'accouchements présentant des anomalies de contrastes et ratures détectées par l\'aligneur.',
    descriptionFr: 'Lot d\'accouchements présentant des anomalies de contrastes et ratures détectées par l\'aligneur.',
  },
  {
    id: '4',
    nameEn: 'Centre de Santé Nabil Choucair',
    nameFr: 'Centre de Santé Nabil Choucair',
    filesCount: 64,
    size: '180.0 MB',
    sizeBytes: 180000000,
    status: 'validated',
    createdAt: '2026-08-08',
    lastModified: '2026-08-09',
    tagsEn: ['CPON', 'Patte d\'Oie', 'Validé'],
    tagsFr: ['CPON', 'Patte d\'Oie', 'Validé'],
    descriptionEn: 'Consultations Postnatales (CPON) vérifiées et exportables vers DHIS2.',
    descriptionFr: 'Consultations Postnatales (CPON) vérifiées et exportables vers DHIS2.',
  },
  {
    id: '5',
    nameEn: 'Hôpital Dalal Jamm (Guédiawaye)',
    nameFr: 'Hôpital Dalal Jamm (Guédiawaye)',
    filesCount: 52,
    size: '142.8 MB',
    sizeBytes: 142800000,
    status: 'pending',
    createdAt: '2026-08-06',
    lastModified: '2026-08-07',
    tagsEn: ['Accouchements', 'Guédiawaye', 'En cours'],
    tagsFr: ['Accouchements', 'Guédiawaye', 'En cours'],
    descriptionEn: 'Registre de salle d\'accouchement en cours de contrôle médical.',
    descriptionFr: 'Registre de salle d\'accouchement en cours de contrôle médical.',
  },
  {
    id: '6',
    nameEn: 'Poste de Santé de Gandiol (Saint-Louis)',
    nameFr: 'Poste de Santé de Gandiol (Saint-Louis)',
    filesCount: 28,
    size: '76.3 MB',
    sizeBytes: 76300000,
    status: 'validated',
    createdAt: '2026-08-04',
    lastModified: '2026-08-05',
    tagsEn: ['CPN', 'Gandiol', 'Rural'],
    tagsFr: ['CPN', 'Gandiol', 'Rural'],
    descriptionEn: 'Registres CPN en zone rurale, recalage géométrique réussi à 100%.',
    descriptionFr: 'Registres CPN en zone rurale, recalage géométrique réussi à 100%.',
  },
  {
    id: '7',
    nameEn: 'Centre de Santé Roi Baudouin',
    nameFr: 'Centre de Santé Roi Baudouin',
    filesCount: 46,
    size: '124.5 MB',
    sizeBytes: 124500000,
    status: 'rejected',
    createdAt: '2026-08-02',
    lastModified: '2026-08-03',
    tagsEn: ['SAA', 'Guédiawaye', 'Rejet Scan'],
    tagsFr: ['SAA', 'Guédiawaye', 'Rejet Scan'],
    descriptionEn: 'Pages rejetées pour flou de bougé mobile supérieur au seuil de tolérance (ECC < 0.30).',
    descriptionFr: 'Pages rejetées pour flou de bougé mobile supérieur au seuil de tolérance (ECC < 0.30).',
  },
  {
    id: '8',
    nameEn: 'Maternité Centre de Santé de Rufisque',
    nameFr: 'Maternité Centre de Santé de Rufisque',
    filesCount: 70,
    size: '195.0 MB',
    sizeBytes: 195000000,
    status: 'validated',
    createdAt: '2026-08-01',
    lastModified: '2026-08-02',
    tagsEn: ['Accouchements', 'Rufisque', 'Validé'],
    tagsFr: ['Accouchements', 'Rufisque', 'Validé'],
    descriptionEn: 'Registre des accouchements archivé et certifié.',
    descriptionFr: 'Registre des accouchements archivé et certifié.',
  },
  {
    id: '9',
    nameEn: 'Centre de Santé Élisabeth Diouf (Dahra)',
    nameFr: 'Centre de Santé Élisabeth Diouf (Dahra)',
    filesCount: 38,
    size: '112.7 MB',
    sizeBytes: 112700000,
    status: 'pending',
    createdAt: '2026-07-28',
    lastModified: '2026-07-29',
    tagsEn: ['CPN', 'Dahra', 'En cours'],
    tagsFr: ['CPN', 'Dahra', 'En cours'],
    descriptionEn: 'Dossiers de consultations prénatales en attente de signature.',
    descriptionFr: 'Dossiers de consultations prénatales en attente de signature.',
  },
  {
    id: '10',
    nameEn: 'Poste de Santé de Touba Toul (Thiès)',
    nameFr: 'Poste de Santé de Touba Toul (Thiès)',
    filesCount: 22,
    size: '64.2 MB',
    sizeBytes: 64200000,
    status: 'rejected',
    createdAt: '2026-07-25',
    lastModified: '2026-07-26',
    tagsEn: ['SAA', 'Touba Toul', 'Rejet Scan'],
    tagsFr: ['SAA', 'Touba Toul', 'Rejet Scan'],
    descriptionEn: 'Pages rejetées pour sous-exposition lumineuse lors de la capture mobile.',
    descriptionFr: 'Pages rejetées pour sous-exposition lumineuse lors de la capture mobile.',
  },
];

// ── Filters ────────────────────────────────────────────────────
const STATUS_FILTERS: { value: FolderStatus | 'all'; labelKey: 'all' | 'pending' | 'validated' | 'rejected' | 'anomaly'; activeBg: string; activeText: string; activeDot: string }[] = [
  { value: 'all', labelKey: 'all', activeBg: 'bg-gray-800', activeText: 'text-white', activeDot: 'bg-white' },
  { value: 'pending', labelKey: 'pending', activeBg: 'bg-amber-500', activeText: 'text-white', activeDot: 'bg-amber-200' },
  { value: 'validated', labelKey: 'validated', activeBg: 'bg-emerald-600', activeText: 'text-white', activeDot: 'bg-emerald-200' },
  { value: 'rejected', labelKey: 'rejected', activeBg: 'bg-red-500', activeText: 'text-white', activeDot: 'bg-red-200' },
  { value: 'anomaly', labelKey: 'anomaly', activeBg: 'bg-blue-500', activeText: 'text-white', activeDot: 'bg-blue-200' },
];

// ── Status badge colors ────────────────────────────────────────
const STATUS_TAG: Record<FolderStatus, { bg: string; text: string; dot: string; bar: string; panelBg: string; panelBorder: string }> = {
  pending:   { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500',   bar: 'bg-amber-500',   panelBg: 'bg-amber-50',   panelBorder: 'border-amber-100' },
  validated: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', bar: 'bg-emerald-500', panelBg: 'bg-emerald-50', panelBorder: 'border-emerald-100' },
  rejected:  { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500',     bar: 'bg-red-500',     panelBg: 'bg-red-50',     panelBorder: 'border-red-100' },
  anomaly:   { bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500',    bar: 'bg-blue-500',    panelBg: 'bg-blue-50',    panelBorder: 'border-blue-100' },
};

// Tag colors by status
const STATUS_TAG_COLOR: Record<FolderStatus, string> = {
  pending:   'bg-amber-100 text-amber-700 hover:bg-amber-200',
  validated: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  rejected:  'bg-red-100 text-red-700 hover:bg-red-200',
  anomaly:   'bg-blue-100 text-blue-700 hover:bg-blue-200',
};

export default function DataValidationPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'folders' | 'details'>('folders');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FolderStatus | 'all'>('all');
  const [selectedFolder, setSelectedFolder] = useState<FolderData | null>(null);
  const { language, t } = useTranslation();

  const filteredFolders = useMemo(() => {
    return folders.filter((f) => {
      const name = language === 'en' ? f.nameEn : f.nameFr;
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, language]);

  const statusTag = selectedFolder ? STATUS_TAG[selectedFolder.status] : null;

  // Stats bar
  const stats = useMemo(() => {
    const counts = { all: folders.length, pending: 0, validated: 0, rejected: 0, anomaly: 0 };
    folders.forEach(f => counts[f.status]++);
    return counts;
  }, []);

  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-hidden">
      {/* Header */}
      <PageHeader title="Data Validation" />

      {/* Toolbar: Search + Filters + View Toggle */}
      <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder={t("search_folders")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-400 shadow-sm transition-all"
          />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-xl px-2 py-1.5 shadow-sm">
          <Filter className="w-3.5 h-3.5 text-gray-300 mr-0.5 shrink-0" />
          {STATUS_FILTERS.map((f) => {
            const count = stats[f.value];
            const isActive = statusFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`relative inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                  isActive
                    ? `${f.activeBg} ${f.activeText} shadow-sm`
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {isActive && f.value !== 'all' && (
                  <span className={`w-1.5 h-1.5 rounded-full ${f.activeDot}`} />
                )}
                {t(f.labelKey)}
                <span className={`text-[10px] font-bold ${isActive ? 'opacity-75' : 'text-gray-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Toggle */}
        <div className="ml-auto flex items-center bg-white border border-gray-200 p-0.5 rounded-xl shadow-sm gap-0.5">
          <button
            onClick={() => setViewMode('folders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'folders'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> {t("folders")}
          </button>
          <button
            onClick={() => setViewMode('details')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'details'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <List className="w-4 h-4" /> {t("details")}
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {viewMode === 'details' ? (
          <DetailsTable search={search} statusFilter={statusFilter} />
        ) : (
          <>
            {/* Folders Grid */}
            <div
              className="flex-1 overflow-y-auto pr-1 rounded-2xl"
              style={{ scrollbarWidth: 'thin' }}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-1">
                {filteredFolders.map((folder) => (
                  <FolderUI
                    key={folder.id}
                    name={language === 'en' ? folder.nameEn : folder.nameFr}
                    filesCount={folder.filesCount}
                    size={folder.size}
                    status={folder.status}
                    isSelected={selectedFolder?.id === folder.id}
                    onClick={() =>
                      setSelectedFolder(
                        selectedFolder?.id === folder.id ? null : folder
                      )
                    }
                  />
                ))}
              </div>

              {filteredFolders.length === 0 && (
                <div className="flex flex-col items-center justify-center h-60 text-gray-400">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Folder className="w-8 h-8 opacity-40" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600">{t("no_folders")}</p>
                  <p className="text-xs mt-1 text-gray-400">{t("try_adjusting")}</p>
                </div>
              )}
            </div>

            {/* Info Panel (slides in from right) */}
            <AnimatePresence>
              {selectedFolder && statusTag && (
                <motion.aside
                  key="info-panel"
                  initial={{ width: 0, opacity: 0, x: 20 }}
                  animate={{ width: 300, opacity: 1, x: 0 }}
                  exit={{ width: 0, opacity: 0, x: 20 }}
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }}
                  className="shrink-0 h-full overflow-hidden"
                >
                  <div className="w-[300px] h-full bg-white border border-gray-100 rounded-2xl flex flex-col overflow-y-auto shadow-lg" style={{ scrollbarWidth: 'thin' }}>

                    {/* Panel header with status */}
                    <div className={`p-4 border-b ${statusTag.panelBorder} ${statusTag.panelBg} rounded-t-2xl`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusTag.bg} ${statusTag.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusTag.dot}`} />
                          {t(selectedFolder.status as any)}
                        </span>
                        <button
                          onClick={() => setSelectedFolder(null)}
                          className="p-1 rounded-lg hover:bg-white/60 transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      <h3 className="text-sm font-bold text-gray-800 leading-tight">
                        {language === 'en' ? selectedFolder.nameEn : selectedFolder.nameFr}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">{selectedFolder.filesCount} {t("documents").toLowerCase()} · {selectedFolder.size}</p>
                    </div>

                    {/* Open button */}
                    <div className="p-3 border-b border-gray-100">
                      <button
                        onClick={() => router.push(`/dashboard/data-validation/${selectedFolder.id}`)}
                        className="w-full py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-emerald-200 transition-all flex items-center justify-center gap-2 group"
                      >
                        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        {t("open_folder")}
                      </button>
                    </div>

                    {/* Storage info */}
                    <div className="p-4 space-y-3">
                      {/* Documents card */}
                      <div className="rounded-xl border border-gray-100 p-3.5 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">{t("documents")}</span>
                          <FileText className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <p className="text-xl font-bold text-gray-800">{selectedFolder.filesCount} <span className="text-sm font-medium text-gray-400">{t("documents").toLowerCase()}</span></p>
                        <div className="mt-2.5 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${statusTag.bar}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((selectedFolder.filesCount / 350) * 100, 100)}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                          />
                        </div>
                      </div>

                      {/* Size card */}
                      <div className="rounded-xl border border-gray-100 p-3.5 bg-gray-50/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">{t("storage")}</span>
                          <HardDrive className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <p className="text-xl font-bold text-gray-800">{selectedFolder.size}</p>
                        <div className="mt-2.5 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((selectedFolder.sizeBytes / 2e9) * 100, 100)}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mx-4 h-px bg-gray-100" />

                    {/* Properties */}
                    <div className="p-4 space-y-3">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t("properties")}</h4>
                      <div className="space-y-2">
                        {[
                          { icon: Calendar, label: t("created"), value: format(new Date(selectedFolder.createdAt), 'dd MMM yyyy') },
                          { icon: Clock, label: t("modified"), value: format(new Date(selectedFolder.lastModified), 'dd MMM yyyy') },
                          { icon: Folder, label: t("name"), value: language === 'en' ? selectedFolder.nameEn : selectedFolder.nameFr },
                          { icon: HardDrive, label: t("size"), value: selectedFolder.size },
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="flex items-center justify-between py-1">
                            <span className="text-xs text-gray-400 flex items-center gap-1.5">
                              <Icon className="w-3.5 h-3.5" />
                              {label}
                            </span>
                            <span className="text-xs font-semibold text-gray-700 truncate max-w-[140px]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mx-4 h-px bg-gray-100" />

                    {/* Tags */}
                    <div className="p-4 space-y-2">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Tag className="w-3 h-3" /> {t("tags")}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(language === 'en' ? selectedFolder.tagsEn : selectedFolder.tagsFr).map((tag) => (
                          <span
                            key={tag}
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full cursor-default transition-colors ${STATUS_TAG_COLOR[selectedFolder.status]}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mx-4 h-px bg-gray-100" />

                    {/* Description */}
                    <div className="p-4 space-y-2">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t("description")}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {language === 'en' ? selectedFolder.descriptionEn : selectedFolder.descriptionFr}
                      </p>
                    </div>

                    <div className="mx-4 h-px bg-gray-100" />

                    {/* Quick actions */}
                    <div className="p-4 space-y-1">
                      <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all w-full py-1.5 px-2 rounded-lg group">
                        <Pin className="w-3.5 h-3.5 group-hover:text-emerald-500 transition-colors" />
                        {t("pinned_items")}
                        <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all w-full py-1.5 px-2 rounded-lg group">
                        <Activity className="w-3.5 h-3.5 group-hover:text-emerald-500 transition-colors" />
                        {t("activity_log")}
                        <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>

                    {/* Bottom open folder details button */}
                    <div className="p-4 mt-auto border-t border-gray-100">
                      <button
                        onClick={() => setViewMode('details')}
                        className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                      >
                        {t("open_folder_details")}
                      </button>
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
