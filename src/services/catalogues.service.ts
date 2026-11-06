import { apiClient } from "./apiClient";

import type { CatalogueRegistre } from "../types";
import type { components } from "@/types/api.generated";

export type ChampCatalogueUpdate = components["schemas"]["ChampCatalogueUpdate"];

export const CataloguesService = {
  /**
   * Modifie le libellé, les alias ou les modalités d'un champ (admins).
   * Renvoie le catalogue complet à jour. Les workers OCR voient la
   * modification au plus tard 60 s après (cache).
   */
  modifierChamp: async (
    typeRegistre: string,
    anneeVersion: number,
    nomChamp: string,
    modification: ChampCatalogueUpdate,
  ) => {
    return apiClient<components["schemas"]["CatalogueRegistre"]>(
      `/v1/catalogue-registres/${encodeURIComponent(typeRegistre)}/${anneeVersion}/champs/${encodeURIComponent(nomChamp)}`,
      { method: "PATCH", body: JSON.stringify(modification) },
    );
  },

  /** Catalogue d'un (type, année) : sections → champs (nom, libellé, ordre, type, unité). */
  getByTypeAnnee: async (typeRegistre: string, anneeVersion: number) => {
    return apiClient<components["schemas"]["CatalogueRegistre"]>(
      `/v1/catalogue-registres/${encodeURIComponent(typeRegistre)}/${anneeVersion}`,
      { method: "GET" },
    );
  },

  getAll: async () => {
    const res = await apiClient<{items: CatalogueRegistre[], total: number}>("/v1/catalogue-registres", {
      method: "GET",
    });
    
    // Map backend properties to frontend expectations
    return (res.items || []).map(item => ({
      ...item,
      id: item.id_catalogue_registre,
      nom_registre: item.libelle || item.type_registre,
      version: item.annee_version,
      sectionsCount: item.nombre_sections || 0,
      fieldsCount: item.nombre_champs || 0,
      est_actif: true // Assuming active for now, as backend doesn't seem to have a status field here
    }));
  },

  // Création / modification / suppression d'un catalogue : non exposées par
  // l'API (la structure évolue par migration). Voir modifierChamp pour les champs.
};
