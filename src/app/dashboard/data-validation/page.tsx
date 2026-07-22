"use client";

import React, { useState, useMemo } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import FolderUI, { type FolderStatus } from '@/components/ui/folderUI';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import DetailsTable from '@/components/features/data-validation/DetailsTable';
import { useQuery } from '@tanstack/react-query';
import { SessionsService } from '@/services/sessions.service';
import { Loader2 } from 'lucide-react';
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
  name: string;
  filesCount: number;
  size: string;
  sizeBytes: number;
  status: FolderStatus;
  createdAt: string;
  lastModified: string;
  tags: string[];
  description: string;
};

// ── Mock Data Removed ──────────────────────────────────────────

// ── Filters ────────────────────────────────────────────────────
const STATUS_FILTERS: { value: FolderStatus | 'all'; labelKey: 'all' | 'pending' | 'validated' | 'rejected' | 'anomaly'; activeBg: string; activeText: string; activeDot: string }[] = [
  { value: 'all', labelKey: 'all', activeBg: 'bg-gray-800', activeText: 'text-white', activeDot: 'bg-white' },
  { value: 'pending', labelKey: 'pending', activeBg: 'bg-amber-500', activeText: 'text-white', activeDot: 'bg-amber-200' },
  { value: 'validated', labelKey: 'validated', activeBg: 'bg-emerald-600', activeText: 'text-white', activeDot: 'bg-emerald-200' },
  { value: 'rejected', labelKey: 'rejected', activeBg: 'bg-red-500', activeText: 'text-white', activeDot: 'bg-red-200' },
  { value: 'anomaly', labelKey: 'anomaly', activeBg: 'bg-blue-500', activeText: 'text-white', activeDot: 'bg-blue-200' },
];

// ── Status badge colors ────────────────────────────────────────
const STATUS_TAG: Record<FolderStatus, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  validated: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  anomaly: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
};

export default function DataValidationPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'folders' | 'details'>('folders');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FolderStatus | 'all'>('all');
  const [selectedFolder, setSelectedFolder] = useState<FolderData | null>(null);
  const { language, t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => SessionsService.getSessions(50, 0),
  });

  const folders: FolderData[] = useMemo(() => {
    if (!data?.items) return [];
    return data.items.map(session => ({
      id: session.id,
      name: session.libelle_session || `Session ${session.id}`,
      filesCount: session.nb_pages || 0,
      size: 'N/A', // Compute if available
      sizeBytes: 0,
      status: (session.statut?.toLowerCase() as FolderStatus) || 'pending',
      createdAt: session.date_creation || new Date().toISOString(),
      lastModified: session.date_creation || new Date().toISOString(),
      tags: [session.type_registre, `Year ${session.annee_version}`],
      description: `Type: ${session.type_registre}`,
    }));
  }, [data]);

  const filteredFolders = useMemo(() => {
    return folders.filter((f) => {
      const name = f.name;
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
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-gray-400 mr-1" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-150 ${statusFilter === f.value
                  ? `${f.activeBg} ${f.activeText} ring-1 ring-current/20 shadow-sm`
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="ml-auto flex items-center bg-white border border-gray-200 p-0.5 rounded-xl shadow-sm gap-0.5">
          <button
            onClick={() => setViewMode('folders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'folders' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <LayoutGrid className="w-4 h-4" /> {t("folders")}
          </button>
          <button
            onClick={() => setViewMode('details')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'details' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
            <div className="flex-1 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
              {isLoading ? (
                <div className="flex items-center justify-center h-60">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {filteredFolders.map((folder) => (
                      <FolderUI
                        key={folder.id}
                        name={folder.name}
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
                      <Folder className="w-12 h-12 mb-3 opacity-30" />
                      <p className="text-sm font-medium">No folders found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Info Panel (slides in from right) */}
            <AnimatePresence>
              {selectedFolder && statusTag && (
                <motion.aside
                  key="info-panel"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
                  className="shrink-0 h-full overflow-hidden"
                >
                  <div className="w-[320px] h-full bg-white border border-gray-100 rounded-xl flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    {/* Open button at the very top */}
                    <div className="p-4 border-b border-gray-100 bg-emerald-50/50">
                      <button
                        onClick={() => router.push(`/dashboard/data-validation/${selectedFolder.id}`)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
                      >
                        Open
                      </button>
                    </div>

                    {/* Panel header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-800">Info</h3>
                      <button
                        onClick={() => setSelectedFolder(null)}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Storage info */}
                    <div className="p-4 space-y-3">
                      {/* Documents card */}
                      <div className="bg-gray-50 rounded-xl p-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-gray-500 font-medium">Documents</span>
                          <FileText className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <p className="text-xl font-bold text-gray-800">{selectedFolder.filesCount} files</p>
                        <div className="mt-2 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${statusTag.bg.replace('100', '500')}`}
                            style={{ width: `${Math.min((selectedFolder.filesCount / 350) * 100, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Size card */}
                      <div className="bg-gray-50 rounded-xl p-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-gray-500 font-medium">Storage</span>
                          <HardDrive className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <p className="text-xl font-bold text-gray-800">{selectedFolder.size}</p>
                        <div className="mt-2 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.min((selectedFolder.sizeBytes / 2e9) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 h-px bg-gray-100" />

                    {/* Properties */}
                    <div className="p-4 space-y-3">
                      <h4 className="text-xs font-semibold text-gray-700">Properties</h4>
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Folder className="w-3 h-3" /> Name
                          </span>
                          <span className="text-xs font-medium text-gray-800 truncate max-w-[160px]">{selectedFolder.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 flex items-center gap-1.5">
                            <HardDrive className="w-3 h-3" /> Size
                          </span>
                          <span className="text-xs font-medium text-gray-800">{selectedFolder.size}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" /> Created
                          </span>
                          <span className="text-xs font-medium text-gray-800">
                            {format(new Date(selectedFolder.createdAt), 'dd/MM/yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Last modified
                          </span>
                          <span className="text-xs font-medium text-gray-800">
                            {format(new Date(selectedFolder.lastModified), 'dd/MM/yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Activity className="w-3 h-3" /> Status
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${statusTag.bg} ${statusTag.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusTag.dot}`} />
                            {selectedFolder.status.charAt(0).toUpperCase() + selectedFolder.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 h-px bg-gray-100" />

                    {/* Tags */}
                    <div className="p-4 space-y-2">
                      <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                        <Tag className="w-3 h-3" /> Tags
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedFolder.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-default"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 h-px bg-gray-100" />

                    {/* Description */}
                    <div className="p-4 space-y-2">
                      <h4 className="text-xs font-semibold text-gray-700">Description</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{selectedFolder.description}</p>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 h-px bg-gray-100" />

                    {/* Quick actions */}
                    <div className="p-4 space-y-2">
                      <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors w-full py-1.5">
                        <Pin className="w-3.5 h-3.5" /> Pinned items
                      </button>
                      <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors w-full py-1.5">
                        <Activity className="w-3.5 h-3.5" /> Activity
                      </button>
                    </div>

                    {/* Open button */}
                    <div className="p-4 mt-auto border-t border-gray-100">
                      <button
                        onClick={() => setViewMode('details')}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
                      >
                        Open Folder Details
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
