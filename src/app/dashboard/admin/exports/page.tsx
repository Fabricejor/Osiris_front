"use client";

/**
 * Exports CSV des données validées.
 *
 * Le backend (`POST /exports`, `extra="forbid"`) ne prend que : type de registre,
 * année de version, période. L'export couvre implicitement la structure de
 * l'admin et est toujours en CSV — d'où l'absence de choix de structure / format.
 * La génération est asynchrone : la liste se rafraîchit tant qu'un export est en cours.
 */
import React, { useState } from 'react';
import PageHeader from "@/components/ui/PageHeader";
import { Download, FileText, Calendar, Loader2, Info } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExportsService, type ExportCreate, type StatutExport } from '@/services/exports.service';
import { formatDateHeure } from '@/services/sessions.service';
import { CataloguesService } from '@/services/catalogues.service';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/utils/translations';

const STATUT: Record<StatutExport, { key: TranslationKey; classes: string }> = {
  EN_ATTENTE: { key: 'export_statut_en_attente', classes: 'bg-gray-100 text-gray-600' },
  EN_COURS: { key: 'export_statut_en_cours', classes: 'bg-amber-100 text-amber-700' },
  PRET: { key: 'export_statut_pret', classes: 'bg-emerald-100 text-emerald-700' },
  ECHEC: { key: 'export_statut_echec', classes: 'bg-red-100 text-red-700' },
};

const EN_COURS: StatutExport[] = ['EN_ATTENTE', 'EN_COURS'];

export default function ExportsPage() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    catalogue_id: '',
    date_debut: '',
    date_fin: '',
  });

  const { data: catalogues = [] } = useQuery({
    queryKey: ['catalogues'],
    queryFn: CataloguesService.getAll,
  });

  const { data: recentExports = [], isLoading: isLoadingExports } = useQuery({
    queryKey: ['recentExports'],
    queryFn: ExportsService.getRecentExports,
    // Génération asynchrone : on suit les exports tant qu'il y en a un en cours.
    refetchInterval: (query) =>
      (query.state.data ?? []).some((e) => EN_COURS.includes(e.statut)) ? 5000 : false,
  });

  const exportMutation = useMutation({
    mutationFn: (data: ExportCreate) => ExportsService.generateExport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentExports'] });
      toast.success(t('export_started'));
    },
    onError: (error: Error) => toast.error(error.message || t('export_error')),
  });

  const downloadMutation = useMutation({
    // URL présignée à durée courte : on la redemande au moment du clic.
    mutationFn: (id: string) => ExportsService.getExport(id),
    onSuccess: (data) => {
      if (data.download_url) {
        window.open(data.download_url, '_blank', 'noopener');
      } else {
        toast.error(t('download_url_unavailable'));
      }
    },
    onError: (error: Error) => toast.error(error.message || t('download_error')),
  });

  const handleGenerate = () => {
    const payload: ExportCreate = {};
    const catalogue = catalogues.find((c) => c.id === formData.catalogue_id);
    if (catalogue) {
      payload.type_registre = catalogue.type_registre as ExportCreate['type_registre'];
      payload.annee_version = catalogue.version;
    }
    if (formData.date_debut) payload.date_debut = formData.date_debut;
    if (formData.date_fin) payload.date_fin = formData.date_fin;
    exportMutation.mutate(payload);
  };

  const periodeInvalide = Boolean(formData.date_debut && formData.date_fin && formData.date_debut > formData.date_fin);

  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-y-auto bg-gray-50/50" style={{ scrollbarWidth: 'thin' }}>
      <PageHeader title={t("data_export")}>
      </PageHeader>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6 max-w-3xl">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">{t("export_generation")}</h2>
          <p className="text-sm text-gray-500">{t("export_generation_desc")}</p>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{t("export_scope_info")}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="export-catalogue" className="text-sm font-semibold text-gray-700">{t("catalogue_register")}</label>
            <select
              id="export-catalogue"
              value={formData.catalogue_id}
              onChange={e => setFormData({ ...formData, catalogue_id: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
            >
              <option value="">{t("all_registers")}</option>
              {catalogues.map(catalogue => (
                <option key={catalogue.id} value={catalogue.id}>{catalogue.nom_registre}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="export-debut" className="text-sm font-semibold text-gray-700">{t("start_date_label")}</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="export-debut"
                type="date"
                value={formData.date_debut}
                onChange={e => setFormData({ ...formData, date_debut: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="export-fin" className="text-sm font-semibold text-gray-700">{t("end_date_label")}</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="export-fin"
                type="date"
                value={formData.date_fin}
                onChange={e => setFormData({ ...formData, date_fin: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
              />
            </div>
          </div>
        </div>

        {periodeInvalide && <p className="text-sm text-red-600">{t("export_period_invalid")}</p>}

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={exportMutation.isPending || periodeInvalide}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#65b741] text-white rounded-lg text-sm font-bold hover:bg-[#5aa43a] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {t("generate_export")}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase mb-4">{t("recent_exports")}</h3>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-3xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4 border-b border-gray-100">{t("export_filters")}</th>
                <th className="p-4 border-b border-gray-100">{t("date")}</th>
                <th className="p-4 border-b border-gray-100">{t("status")}</th>
                <th className="p-4 border-b border-gray-100 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingExports ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#65b741]" />
                      <span>{t("loading_exports")}</span>
                    </div>
                  </td>
                </tr>
              ) : recentExports.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    {t("no_recent_exports")}
                  </td>
                </tr>
              ) : (
                recentExports.map((exp) => {
                  const statut = STATUT[exp.statut];
                  const registre = exp.type_registre_filtre
                    ? `${exp.type_registre_filtre}${exp.annee_version_filtre ? ` ${exp.annee_version_filtre}` : ''}`
                    : t('all_registers');
                  const periode = exp.date_debut_filtre || exp.date_fin_filtre
                    ? `${exp.date_debut_filtre ?? '…'} → ${exp.date_fin_filtre ?? '…'}`
                    : t('export_all_period');
                  const enTelechargement = downloadMutation.isPending && downloadMutation.variables === exp.id_export;
                  return (
                    <tr key={exp.id_export} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{registre}</div>
                            <div className="text-xs text-gray-500">{periode}</div>
                            {exp.nb_lignes_exportees != null && (
                              <div className="text-xs text-gray-500">{t('export_rows', { count: exp.nb_lignes_exportees })}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{formatDateHeure(exp.date_creation)}</td>
                      <td className="p-4">
                        <span
                          title={exp.message_erreur ?? undefined}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statut?.classes ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {EN_COURS.includes(exp.statut) && <Loader2 className="w-3 h-3 animate-spin" />}
                          {statut ? t(statut.key) : exp.statut}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {exp.statut === 'PRET' && (
                          <button
                            onClick={() => downloadMutation.mutate(exp.id_export)}
                            disabled={enTelechargement}
                            className="text-sm font-semibold text-[#65b741] hover:text-[#5aa43a] disabled:opacity-50"
                          >
                            {enTelechargement ? t('downloading') : t('download')}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
