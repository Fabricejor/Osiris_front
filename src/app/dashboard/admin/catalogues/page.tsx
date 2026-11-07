"use client";

/**
 * Liste des catalogues de registres. Un catalogue s'ouvre pour modifier les
 * libellés, alias et modalités de ses champs.
 *
 * Pas de création / suppression ici : l'API n'expose pas ces opérations (la
 * structure d'un catalogue évolue par migration, cf. backend).
 */
import React, { useState } from 'react';
import Link from 'next/link';
import PageHeader from "@/components/ui/PageHeader";
import { Search, Library, FileText, Loader2, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { CataloguesService } from '@/services/catalogues.service';
import { useTranslation } from '@/hooks/useTranslation';

export default function CataloguesPage() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: catalogues = [], isLoading, isError } = useQuery({
    queryKey: ['catalogues'],
    queryFn: CataloguesService.getAll,
  });

  const filtres = catalogues.filter((c) =>
    `${c.nom_registre} ${c.type_registre} ${c.version}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="h-full flex flex-col gap-4 p-5 overflow-y-auto bg-gray-50/50" style={{ scrollbarWidth: 'thin' }}>
      <PageHeader title={t("catalogues_title")} />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("search_catalogue")}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="text-xs text-gray-500 hidden md:block">
            {t("catalogues_hint")}
          </p>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="p-4 border-b border-gray-100">{t("col_register_version")}</th>
                <th className="p-4 border-b border-gray-100">{t("col_structure")}</th>
                <th className="p-4 border-b border-gray-100 text-right">{t("col_fields")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#65b741]" />
                      <span>{t("loading_catalogues")}</span>
                    </div>
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-red-500">
                    {t("catalogues_load_error")}
                  </td>
                </tr>
              )}
              {!isLoading && !isError && filtres.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">{t("no_catalogue")}</td>
                </tr>
              )}
              {filtres.map((catalogue) => (
                <tr key={catalogue.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <Link
                      href={`/dashboard/admin/catalogues/${encodeURIComponent(catalogue.type_registre)}/${catalogue.annee_version}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-500">
                        <Library className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm group-hover:text-[#08704F]">{catalogue.nom_registre}</div>
                        <div className="text-xs text-gray-500">{catalogue.type_registre} · {t('version_value', { version: catalogue.version })}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-gray-400" /> {t('sections_count', { count: catalogue.sectionsCount || 0 })}</div>
                      <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-gray-400" /> {t('fields_count', { count: catalogue.fieldsCount || 0 })}</div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/dashboard/admin/catalogues/${encodeURIComponent(catalogue.type_registre)}/${catalogue.annee_version}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#08704F] hover:underline"
                    >
                      {t("edit_fields")} <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
