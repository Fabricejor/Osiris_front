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
    nameEn: 'Prescriptions Batch A',
    nameFr: 'Prescriptions Lot A',
    filesCount: 233,
    size: '116.9 MB',
    sizeBytes: 116900000,
    status: 'pending',
    createdAt: '2024-12-03',
    lastModified: '2024-06-12',
    tagsEn: ['Pharmacy', 'Urgent'],
    tagsFr: ['Pharmacie', 'Urgent'],
    descriptionEn: 'Batch of scanned medical prescriptions awaiting OCR validation.',
    descriptionFr: 'Lot de prescriptions médicales scannées en attente de validation OCR.',
  },
  {
    id: '2',
    nameEn: 'Lab Reports Q4',
    nameFr: 'Rapports de Labo Q4',
    filesCount: 39,
    size: '180.2 MB',
    sizeBytes: 180200000,
    status: 'validated',
    createdAt: '2024-11-15',
    lastModified: '2024-06-10',
    tagsEn: ['Laboratory', 'Q4'],
    tagsFr: ['Laboratoire', 'Q4'],
    descriptionEn: 'Q4 2024 laboratory reports, validated and ready for archiving.',
    descriptionFr: 'Rapports de laboratoire du Q4 2024, validés et prêts pour archivage.',
  },
  {
    id: '3',
    nameEn: 'Invoice Batch 12',
    nameFr: 'Lot de Factures 12',
    filesCount: 21,
    size: '23.4 MB',
    sizeBytes: 23400000,
    status: 'rejected',
    createdAt: '2024-10-20',
    lastModified: '2024-06-08',
    tagsEn: ['Finance', 'Batch 12'],
    tagsFr: ['Finance', 'Lot 12'],
    descriptionEn: 'Batch of invoices rejected due to insufficient scan quality.',
    descriptionFr: 'Lot de factures rejeté pour qualité de scan insuffisante.',
  },
  {
    id: '4',
    nameEn: 'Patient Records',
    nameFr: 'Dossiers Patients',
    filesCount: 156,
    size: '490 MB',
    sizeBytes: 490000000,
    status: 'validated',
    createdAt: '2024-09-01',
    lastModified: '2024-06-11',
    tagsEn: ['Medical', 'Confidential'],
    tagsFr: ['Médical', 'Confidentiel'],
    descriptionEn: 'Validated patient records compliant with HIPAA regulations.',
    descriptionFr: 'Dossiers patients validés et conformes aux normes HIPAA.',
  },
  {
    id: '5',
    nameEn: 'Consent Forms',
    nameFr: 'Formulaires de Consentement',
    filesCount: 87,
    size: '45.8 MB',
    sizeBytes: 45800000,
    status: 'anomaly',
    createdAt: '2024-08-10',
    lastModified: '2024-06-09',
    tagsEn: ['Legal', 'Compliance'],
    tagsFr: ['Juridique', 'Conformité'],
    descriptionEn: 'Consent forms with anomalies detected during OCR.',
    descriptionFr: 'Formulaires de consentement avec anomalies détectées lors de l\'OCR.',
  },
  {
    id: '6',
    nameEn: 'Insurance Claims',
    nameFr: 'Réclamations d\'Assurance',
    filesCount: 312,
    size: '1.3 GB',
    sizeBytes: 1300000000,
    status: 'pending',
    createdAt: '2024-07-22',
    lastModified: '2024-06-12',
    tagsEn: ['Insurance', 'Priority'],
    tagsFr: ['Assurance', 'Priorité'],
    descriptionEn: 'Insurance claims awaiting processing.',
    descriptionFr: 'Demandes de remboursement en attente de traitement.',
  },
  {
    id: '7',
    nameEn: 'Discharge Summaries',
    nameFr: 'Résumés de Sortie',
    filesCount: 64,
    size: '78.5 MB',
    sizeBytes: 78500000,
    status: 'validated',
    createdAt: '2024-06-15',
    lastModified: '2024-06-07',
    tagsEn: ['Medical', 'Summaries'],
    tagsFr: ['Médical', 'Résumés'],
    descriptionEn: 'Validated discharge summaries integrated into the system.',
    descriptionFr: 'Résumés de sortie validés et intégrés au système.',
  },
  {
    id: '8',
    nameEn: 'Radiology Reports',
    nameFr: 'Rapports de Radiologie',
    filesCount: 45,
    size: '2.1 GB',
    sizeBytes: 2100000000,
    status: 'anomaly',
    createdAt: '2024-05-30',
    lastModified: '2024-06-06',
    tagsEn: ['Radiology', 'Imaging'],
    tagsFr: ['Radiologie', 'Imagerie'],
    descriptionEn: 'Radiology reports with inconsistencies in DICOM metadata.',
    descriptionFr: 'Rapports de radiologie avec des incohérences dans les métadonnées DICOM.',
  },
  {
    id: '9',
    nameEn: 'Referral Letters',
    nameFr: 'Lettres de Référence',
    filesCount: 28,
    size: '12.7 MB',
    sizeBytes: 12700000,
    status: 'pending',
    createdAt: '2024-05-10',
    lastModified: '2024-06-05',
    tagsEn: ['Referral', 'External'],
    tagsFr: ['Référence', 'Externe'],
    descriptionEn: 'Referral letters from external clinics.',
    descriptionFr: 'Lettres de référence provenant de cliniques externes.',
  },
  {
    id: '10',
    nameEn: 'Expired Documents',
    nameFr: 'Documents Expirés',
    filesCount: 15,
    size: '8.2 MB',
    sizeBytes: 8200000,
    status: 'rejected',
    createdAt: '2024-04-01',
    lastModified: '2024-06-01',
    tagsEn: ['Archive', 'Expired'],
    tagsFr: ['Archive', 'Expiré'],
    descriptionEn: 'Expired documents automatically rejected by the system.',
    descriptionFr: 'Documents expirés rejetés automatiquement par le système.',
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
