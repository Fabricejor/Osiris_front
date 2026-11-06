/**
 * Mise en forme des lignes OCR pour l'écran de validation.
 *
 * Structure backend d'une ligne (`donnee_extraite.donnees_brutes_ocr`, cf.
 * `LigneExtraite` dans src/schemas/donnee_extraite.py) :
 *
 *   { numero_ordre, champs: { <nom_champ>: ValeurChamp }, missings_reels, … }
 *
 * où `ValeurChamp` = { type_champ, score_confiance (0..1, donné par Gemini),
 * origine, valeur_brute, + la valeur typée : `valeur` | `valeurs` (multi) |
 * `systolique`/`diastolique` (tension) }.
 */
import type { components } from '@/types/api.generated';
import type { DonneeExtraite } from './donnees-extraites.service';

type Catalogue = components['schemas']['CatalogueRegistre'];
type ChampCatalogue = components['schemas']['ChampCatalogue'];

export interface ValeurChampOCR {
  type_champ?: string;
  /** 0..1 ; null = Gemini n'a fourni aucun score (≠ 0). */
  score_confiance?: number | null;
  origine?: string;
  valeur_brute?: string | null;
  valeur?: unknown;
  valeurs?: unknown[];
  systolique?: number;
  diastolique?: number;
  unite?: string | null;
  modalite_source?: string;
}

export interface ChampAffiche {
  nom: string;
  libelle: string;
  type_champ: string;
  unite: string | null;
  /** Valeur éditable affichée dans le champ de saisie. */
  valeur: string;
  /** true si l'OCR a produit une valeur pour ce champ. */
  lu: boolean;
  /**
   * Confiance Gemini en % (0-100). null si le champ n'a pas été lu OU si
   * Gemini n'a renvoyé aucun score (`score_confiance: null` côté backend).
   */
  confiance: number | null;
  /** true si la valeur a déjà été corrigée par un humain. */
  corrigeParHumain: boolean;
  /** true si la case est vide sur le registre (champ non extrait). */
  manquant: boolean;
}

/** Seuils d'affichage de la confiance Gemini. */
export const SEUIL_CONFIANCE_BASSE = 50;
export const SEUIL_CONFIANCE_MOYENNE = 80;

export function niveauConfiance(confiance: number | null): 'basse' | 'moyenne' | 'haute' | 'inconnue' {
  if (confiance === null) return 'inconnue';
  if (confiance < SEUIL_CONFIANCE_BASSE) return 'basse';
  if (confiance < SEUIL_CONFIANCE_MOYENNE) return 'moyenne';
  return 'haute';
}

/** Valeur typée → texte éditable. */
export function formaterValeur(champ: ValeurChampOCR | undefined): string {
  if (!champ) return '';
  switch (champ.type_champ) {
    case 'TENSION_ARTERIELLE':
      if (champ.systolique != null && champ.diastolique != null) {
        return `${champ.systolique}/${champ.diastolique}`;
      }
      return champ.valeur != null ? String(champ.valeur) : '';
    case 'CATEGORIELLE_MULTI':
      if (Array.isArray(champ.valeurs)) return champ.valeurs.join(', ');
      return champ.valeur != null ? String(champ.valeur) : '';
    case 'BINAIRE':
      if (typeof champ.valeur === 'boolean') return champ.valeur ? 'Oui' : 'Non';
      return champ.valeur != null ? String(champ.valeur) : '';
    default:
      return champ.valeur != null ? String(champ.valeur) : '';
  }
}

/**
 * Texte saisi → valeur de correction envoyée à `POST /donnees-extraites/{id}/valider`
 * (le backend remplace `champs[nom].valeur`). Nombres et booléens typés, le reste en texte.
 */
export function parserCorrection(typeChamp: string, texte: string): unknown {
  const t = texte.trim();
  if (t === '') return null;
  if (typeChamp === 'NOMBRE') {
    const n = Number(t.replace(',', '.'));
    return Number.isFinite(n) ? n : t;
  }
  if (typeChamp === 'BINAIRE') {
    const v = t.toLowerCase();
    if (['oui', 'o', 'true', '1', '+', 'positif', 'yes'].includes(v)) return true;
    if (['non', 'n', 'false', '0', '-', 'négatif', 'negatif', 'no'].includes(v)) return false;
  }
  return t;
}

function champsCatalogue(catalogue: Catalogue | undefined): ChampCatalogue[] {
  if (!catalogue) return [];
  return [...catalogue.sections]
    .sort((a, b) => a.ordre - b.ordre)
    .flatMap((s) => [...s.champs].sort((a, b) => a.ordre - b.ordre))
    .filter((c) => !c.is_pii); // les PII sont saisies à part (onglet PII)
}

function humaniser(nom: string): string {
  const s = nom.replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Lecture courante d'une ligne : validée si elle existe, sinon OCR brut. */
function champsDeLigne(donnee: DonneeExtraite): Record<string, ValeurChampOCR> {
  const source = (donnee.donnees_validees ?? donnee.donnees_brutes_ocr ?? {}) as {
    champs?: Record<string, ValeurChampOCR>;
  };
  return source.champs ?? {};
}

/**
 * Champs à afficher pour une ligne, dans l'ordre du catalogue (libellés
 * lisibles). Les champs lus par l'OCR mais absents du catalogue sont ajoutés
 * à la fin pour ne rien perdre.
 */
export function champsAffiches(donnee: DonneeExtraite, catalogue: Catalogue | undefined): ChampAffiche[] {
  const lus = champsDeLigne(donnee);
  const manquants = new Set((donnee.missings_reels ?? []).map(String));

  const depuis = (nom: string, def?: ChampCatalogue): ChampAffiche => {
    const lu = lus[nom];
    return {
      nom,
      libelle: def?.libelle ?? humaniser(nom),
      type_champ: lu?.type_champ ?? def?.type_champ ?? 'TEXTE',
      unite: def?.unite ?? lu?.unite ?? null,
      valeur: formaterValeur(lu),
      lu: !!lu,
      confiance:
        lu && typeof lu.score_confiance === 'number' ? Math.round(lu.score_confiance * 100) : null,
      corrigeParHumain: lu?.origine === 'HUMAIN' || lu?.origine === 'humain',
      manquant: !lu && manquants.has(nom),
    };
  };

  const defs = champsCatalogue(catalogue);
  const vus = new Set(defs.map((d) => d.nom));
  return [
    ...defs.map((d) => depuis(d.nom, d)),
    ...Object.keys(lus).filter((nom) => !vus.has(nom)).map((nom) => depuis(nom)),
  ];
}

/** Confiance moyenne (%) des champs lus d'une ligne, null si aucun. */
export function confianceLigne(champs: ChampAffiche[]): number | null {
  const scores = champs.map((c) => c.confiance).filter((c): c is number => c !== null);
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/** Corrections à envoyer : uniquement les champs dont le texte a changé. */
export function construireCorrections(
  champs: ChampAffiche[],
  saisies: Record<string, string> | undefined,
): Record<string, unknown> {
  const corrections: Record<string, unknown> = {};
  if (!saisies) return corrections;
  for (const champ of champs) {
    const saisi = saisies[champ.nom];
    if (saisi !== undefined && saisi.trim() !== champ.valeur.trim()) {
      corrections[champ.nom] = parserCorrection(champ.type_champ, saisi);
    }
  }
  return corrections;
}
