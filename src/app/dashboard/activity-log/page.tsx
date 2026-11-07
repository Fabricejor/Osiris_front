"use client";

/**
 * Journal d'activité (audit des actions métier).
 *
 * Filtres et pagination faits par l'API (`GET /audit` : type_action,
 * date_debut, date_fin, limit/offset) — ils portent sur tout l'historique,
 * pas seulement sur la page affichée. La recherche texte filtre la page chargée.
 */
import React, { useMemo, useState } from 'react';
import { Search, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';

import { AuditService, type AuditLogRead } from '@/services/audit.service';
import { useQuery } from '@tanstack/react-query';
import { format, isToday, isYesterday } from 'date-fns';
import { enGB, fr as frLocale } from 'date-fns/locale';
import PageHeader from '@/components/ui/PageHeader';
import AvatarInitiales from '@/components/ui/AvatarInitiales';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/utils/translations';

const PAR_PAGE = 50;

/** Types d'action du backend (`TypeActionAudit`) → libellé traduit. */
const ACTIONS: Record<string, TranslationKey> = {
  VALIDATION_CLINIQUE: 'audit_validation_clinique',
  REJET_CLINIQUE: 'audit_rejet_clinique',
  SAISIE_PII: 'audit_saisie_pii',
  CORRECTION_CLINIQUE: 'audit_correction_clinique',
  CORRECTION_PII: 'audit_correction_pii',
  CHANGE_PASSWORD: 'audit_change_password',
  RESET_PASSWORD: 'audit_reset_password',
  CREATE_USER: 'audit_create_user',
  UPDATE_USER: 'audit_update_user',
  OUVRIR_SESSION: 'audit_ouvrir_session',
  ENREGISTRER_PAGE: 'audit_enregistrer_page',
  CLOTURER_SESSION: 'audit_cloturer_session',
  RETRAITER_PAGE: 'audit_retraiter_page',
  SUPPRIMER_PAGE: 'audit_supprimer_page',
  VALIDATION_PAGE: 'audit_validation_page',
  REJET_PAGE: 'audit_rejet_page',
  CREATE_STRUCTURE: 'audit_create_structure',
  UPDATE_STRUCTURE: 'audit_update_structure',
  CREATE_EXPORT: 'audit_create_export',
  DELETE_EXPORT: 'audit_delete_export',
  UPDATE_CATALOGUE: 'audit_update_catalogue',
};

/** Types de ressource (`TypeRessourceAudit`) → libellé traduit. */
const RESSOURCES: Record<string, TranslationKey> = {
  DONNEE_EXTRAITE: 'audit_res_donnee_extraite',
  PII_CELLULE: 'audit_res_pii_cellule',
  UTILISATEUR: 'audit_res_utilisateur',
  SESSION_SCAN: 'audit_res_session_scan',
  REGISTRE_SCANNE: 'audit_res_registre_scanne',
  STRUCTURE_SANITAIRE: 'audit_res_structure_sanitaire',
};

type LigneJournal = { id: string; time: string; user: string; action: string; ressource: string; idRessource: string };

export default function ActivityLogPage() {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [page, setPage] = useState(0);

  // Tout changement de filtre serveur repart de la première page.
  const changerFiltre = (maj: () => void) => {
    maj();
    setPage(0);
  };

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['audit-logs', page, actionFilter, dateDebut, dateFin],
    queryFn: () =>
      AuditService.getLogs(PAR_PAGE, page * PAR_PAGE, {
        type_action: actionFilter || undefined,
        date_debut: dateDebut || undefined,
        date_fin: dateFin || undefined,
      }),
    placeholderData: (precedent) => precedent,
  });

  const total = data?.total ?? 0;
  const nbPages = Math.max(1, Math.ceil(total / PAR_PAGE));
  const libelleAction = (code: string) => (ACTIONS[code] ? t(ACTIONS[code]) : code);

  const groupedLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const locale = language === 'fr' ? frLocale : enGB;
    const groups: Record<string, LigneJournal[]> = {};

    (data?.items ?? []).forEach((log: AuditLogRead) => {
      // Nom joint par l'API ; à défaut (compte supprimé) début de l'identifiant ; sans acteur = système.
      const user = log.nom_acteur
        || (log.id_utilisateur_acteur ? log.id_utilisateur_acteur.slice(0, 8) : t('system'));
      const action = ACTIONS[log.type_action] ? t(ACTIONS[log.type_action]) : log.type_action;
      if (q && ![user, action, log.type_action, log.id_ressource ?? ''].some((v) => v.toLowerCase().includes(q))) return;

      const date = new Date(log.date_action);
      let dateStr = format(date, 'PP', { locale });
      if (isToday(date)) dateStr = t('today_prefix', { date: dateStr });
      else if (isYesterday(date)) dateStr = t('yesterday_prefix', { date: dateStr });

      (groups[dateStr] ??= []).push({
        id: log.id_audit_log,
        time: format(date, 'p', { locale }),
        user,
        action,
        ressource: RESSOURCES[log.type_ressource] ? t(RESSOURCES[log.type_ressource]) : log.type_ressource,
        idRessource: log.id_ressource ? log.id_ressource.slice(0, 8) : '-',
      });
    });

    return Object.entries(groups).map(([dateStr, logs]) => ({ dateStr, logs }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, searchQuery, language]);

  const gridTemplate = "grid-cols-[90px_220px_minmax(220px,_1fr)_180px_110px]";
  const periodeInvalide = Boolean(dateDebut && dateFin && dateDebut > dateFin);

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50/50 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>

      {/* Header */}
      <PageHeader title={t("activity_log")} />
      <div className="mb-6">
        <p className="text-gray-500 text-sm">{t("activity_log_subtitle")}</p>
      </div>

      {/* Filters Bar */}
      <div className="flex items-end gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-8 flex-wrap">

        {/* Search (page chargée) */}
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="searchInput" className="block text-xs font-bold text-gray-700 mb-1.5">{t("search")}</label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="searchInput"
              type="text"
              placeholder={t("search_logs")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#65b741] focus:border-transparent text-gray-700 font-medium"
            />
          </div>
        </div>

        {/* Période */}
        <fieldset className="flex flex-col">
          <legend className="block text-xs font-bold text-gray-700 mb-1.5">{t("date_range")}</legend>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                aria-label={t("start_date_label")}
                value={dateDebut}
                onChange={(e) => changerFiltre(() => setDateDebut(e.target.value))}
                className="pl-9 pr-2 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 outline-none focus:ring-2 focus:ring-[#65b741]"
              />
            </div>
            <span className="text-gray-400">→</span>
            <input
              type="date"
              aria-label={t("end_date_label")}
              value={dateFin}
              onChange={(e) => changerFiltre(() => setDateFin(e.target.value))}
              className="px-2 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 outline-none focus:ring-2 focus:ring-[#65b741]"
            />
          </div>
        </fieldset>

        {/* Type d'action */}
        <div className="flex flex-col">
          <label htmlFor="actionFilter" className="block text-xs font-bold text-gray-700 mb-1.5">{t("action_type")}</label>
          <select
            id="actionFilter"
            value={actionFilter}
            onChange={(e) => changerFiltre(() => setActionFilter(e.target.value))}
            className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 outline-none focus:ring-2 focus:ring-[#65b741]"
          >
            <option value="">{t("all_filter")}</option>
            {Object.keys(ACTIONS).map((code) => (
              <option key={code} value={code}>{libelleAction(code)}</option>
            ))}
          </select>
        </div>

        {(actionFilter || dateDebut || dateFin) && (
          <button
            type="button"
            onClick={() => changerFiltre(() => { setActionFilter(''); setDateDebut(''); setDateFin(''); })}
            className="px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            {t("reset_filters")}
          </button>
        )}
      </div>

      {periodeInvalide && <p className="-mt-6 mb-6 text-sm text-red-600">{t("export_period_invalid")}</p>}

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">

        {/* Table Headers */}
        <div className={`grid ${gridTemplate} gap-4 mb-6 ml-10 text-sm font-bold text-gray-500`}>
          <div>{t("col_timestamp")}</div>
          <div>{t("user_column")}</div>
          <div>{t("action_column")}</div>
          <div>{t("col_resource")}</div>
          <div>{t("doc_id_column")}</div>
        </div>

        {/* Timeline List */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#65b741]" />
            </div>
          ) : isError ? (
            <div className="text-center text-red-500 py-8">{t("audit_load_error")}</div>
          ) : groupedLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <Search className="w-8 h-8 opacity-50" />
              <p>{t("no_logs_match")}</p>
            </div>
          ) : groupedLogs.map((group) => (
            <div key={group.dateStr} className="mb-10 last:mb-0">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{group.dateStr}</h2>

              <div className="relative pl-10 space-y-4">
                <div className="absolute left-[19px] top-4 bottom-[-16px] w-[2px] bg-gray-200" />

                {group.logs.map((log) => (
                  <div key={log.id} className="relative group">
                    <div className="absolute left-[-26px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-[3px] border-gray-300 bg-white z-10 group-hover:border-[#65b741] transition-colors" />

                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow hover:border-[#65b741]/30">
                      <div className={`grid ${gridTemplate} gap-4 items-center`}>
                        <div className="text-sm font-bold text-gray-600">{log.time}</div>
                        <div className="flex items-center gap-3 min-w-0">
                          <AvatarInitiales nom={log.user} />
                          <span className="text-sm font-bold text-gray-800 truncate" title={log.user}>{log.user}</span>
                        </div>
                        <div className="text-sm font-semibold text-gray-700 truncate pr-4">{log.action}</div>
                        <div className="text-sm text-gray-600 truncate">{log.ressource}</div>
                        <div className="text-sm font-mono text-gray-500">{log.idRessource}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination (serveur) */}
        <div className="flex items-center justify-center gap-2 mt-8 border-t border-gray-100 pt-6">
          <button
            onClick={() => setPage(0)}
            disabled={page === 0}
            aria-label={t("first_page")}
            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label={t("previous_page")}
            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 text-sm font-semibold text-gray-700 flex items-center gap-2">
            {t('page_of_total', { page: page + 1, total: nbPages })}
            <span className="text-xs font-normal text-gray-400">({t('entries_count', { count: total })})</span>
            {isFetching && !isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(nbPages - 1, p + 1))}
            disabled={page >= nbPages - 1}
            aria-label={t("next_page")}
            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage(nbPages - 1)}
            disabled={page >= nbPages - 1}
            aria-label={t("last_page")}
            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
