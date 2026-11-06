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
  /**
   * true si la valeur n'est pas lue mais déduite de la structure du registre
   * (ex. période de la grossesse CPN, déterminée par la ligne du bloc).
   */
  deduit: boolean;
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

/** Noms des champs identifiants (`is_pii`) : affichés dans l'onglet PII, jamais en clinique. */
export function nomsChampsPii(catalogue: Catalogue | undefined): Set<string> {
  if (!catalogue) return new Set();
  return new Set(catalogue.sections.flatMap((s) => s.champs).filter((c) => c.is_pii).map((c) => c.nom));
}

/** Libellé lisible d'un champ (catalogue), à défaut son nom humanisé. */
export function libelleChamp(catalogue: Catalogue | undefined, nom: string): string {
  const def = catalogue?.sections.flatMap((s) => s.champs).find((c) => c.nom === nom);
  return def?.libelle ?? humaniser(nom);
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
  // Sans catalogue, impossible de savoir quels champs sont des PII : on
  // n'affiche rien plutôt que de risquer d'afficher un nom en clinique.
  if (!catalogue) return [];
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
      deduit: lu?.origine === 'filtre_math',
      manquant: !lu && manquants.has(nom),
    };
  };

  const defs = champsCatalogue(catalogue);
  // Les lignes extraites avant la séparation PII/clinique contiennent encore
  // nom, adresse… dans leurs champs : on ne les affiche jamais ici.
  const vus = new Set([...defs.map((d) => d.nom), ...nomsChampsPii(catalogue)]);
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

// ─── Vue registre : grille calquée sur le registre papier ─────────────────
//
// Registres multi-visites (CPN : 4 lignes / patiente, CPON : 3) : une rangée
// par visite ; les colonnes d'identité (`niveau_patiente`) sont fusionnées
// verticalement sur le bloc de la patiente, comme sur le papier, et portées
// par sa visite de rang 1.

type PiiCellule = components['schemas']['PiiCelluleRead'];

export interface ColonneGrille {
  nom: string;
  libelle: string;
  unite: string | null;
  type_champ: string;
  is_pii: boolean;
  /** Écrite une fois par patiente (cellule fusionnée sur ses visites). */
  niveau_patiente: boolean;
}

export interface GroupeColonnes {
  /** Libellé de section (en-tête regroupé, comme sur le registre). */
  libelle: string;
  colonnes: ColonneGrille[];
}

export type CelluleGrille =
  | { kind: 'clinique'; champ: ChampAffiche; idDonnee: string; verrouillee: boolean }
  | { kind: 'pii'; pii: PiiCellule; confiance: number | null }
  | { kind: 'vide' };

export interface RangeeGrille {
  /** Numéro d'ordre de la patiente sur le registre. */
  numeroOrdre: number;
  /** Rang de la visite dans le bloc de la patiente (1 hors CPN/CPON). */
  rang: number;
  donnee: DonneeExtraite | null;
  cellules: Record<string, CelluleGrille>;
  /** Première rangée du bloc de la patiente (porte les cellules fusionnées). */
  debutPatiente: boolean;
  /** Nombre de rangées (visites) du bloc — `rowSpan` des cellules fusionnées. */
  taillePatiente: number;
}

export interface Grille {
  groupes: GroupeColonnes[];
  colonnes: ColonneGrille[];
  rangees: RangeeGrille[];
  /** > 1 pour les registres multi-visites : affiche la colonne « Visite ». */
  rangsParPatient: number;
}

/**
 * Construit la grille « registre » : colonnes dans l'ordre physique du papier
 * (`colonne_registre`, puis ordre de section/champ), regroupées par section
 * consécutive ; une rangée par visite (`numero_ordre`, `rang`), PII et
 * identité replacées sur le bloc de la patiente.
 */
export function construireGrille(
  catalogue: Catalogue | undefined,
  donnees: DonneeExtraite[],
  pii: PiiCellule[],
): Grille {
  if (!catalogue) return { groupes: [], colonnes: [], rangees: [], rangsParPatient: 1 };
  const rangsParPatient = Math.max(1, catalogue.rangs_par_patient ?? 1);
  const multiVisites = rangsParPatient > 1;

  const champsOrdonnes = [...catalogue.sections]
    .sort((a, b) => a.ordre - b.ordre)
    .flatMap((section, iSection) =>
      [...section.champs]
        .sort((a, b) => a.ordre - b.ordre)
        .map((champ, iChamp) => ({ section, champ, rangLogique: iSection * 1000 + iChamp })),
    )
    .sort((a, b) => {
      const ca = a.champ.colonne_registre ?? Number.MAX_SAFE_INTEGER;
      const cb = b.champ.colonne_registre ?? Number.MAX_SAFE_INTEGER;
      return ca - cb || a.rangLogique - b.rangLogique;
    });

  const colonnes: ColonneGrille[] = [];
  const groupes: GroupeColonnes[] = [];
  for (const { section, champ } of champsOrdonnes) {
    const colonne: ColonneGrille = {
      nom: champ.nom,
      libelle: champ.libelle,
      unite: champ.unite ?? null,
      type_champ: champ.type_champ,
      is_pii: champ.is_pii,
      niveau_patiente: multiVisites && (champ.niveau_patiente || champ.is_pii),
    };
    colonnes.push(colonne);
    const dernier = groupes.at(-1);
    if (dernier && dernier.libelle === section.libelle) dernier.colonnes.push(colonne);
    else groupes.push({ libelle: section.libelle, colonnes: [colonne] });
  }

  const rangees = new Map<string, RangeeGrille>();
  const rangee = (numeroOrdre: number, rang: number): RangeeGrille => {
    const cle = `${numeroOrdre}:${rang}`;
    let r = rangees.get(cle);
    if (!r) {
      r = { numeroOrdre, rang, donnee: null, cellules: {}, debutPatiente: false, taillePatiente: 1 };
      rangees.set(cle, r);
    }
    return r;
  };

  for (const donnee of donnees) {
    const r = rangee(donnee.numero_ordre_ligne, donnee.rang ?? 1);
    r.donnee = donnee;
    for (const champ of champsAffiches(donnee, catalogue)) {
      r.cellules[champ.nom] = {
        kind: 'clinique',
        champ,
        idDonnee: donnee.id_donnee_extraite,
        verrouillee: donnee.valide,
      };
    }
  }
  for (const cellule of pii) {
    if (!cellule.nom_champ) continue;
    const r = rangee(cellule.patient_index + 1, 1); // identité : visite de rang 1
    r.cellules[cellule.nom_champ] = {
      kind: 'pii',
      pii: cellule,
      confiance:
        typeof cellule.score_confiance === 'number' ? Math.round(cellule.score_confiance * 100) : null,
    };
  }

  const triees = [...rangees.values()].sort((a, b) => a.numeroOrdre - b.numeroOrdre || a.rang - b.rang);

  // Blocs par patiente : la 1re rangée porte les cellules fusionnées (rowSpan).
  for (let i = 0; i < triees.length; ) {
    let j = i;
    while (j < triees.length && triees[j].numeroOrdre === triees[i].numeroOrdre) j++;
    const bloc = triees.slice(i, j);
    bloc[0].debutPatiente = true;
    bloc[0].taillePatiente = multiVisites ? bloc.length : 1;
    if (multiVisites) {
      // L'identité vit sur la visite de rang 1 ; si celle-ci n'a pas été
      // extraite, on la cherche sur la première visite qui la porte.
      for (const colonne of colonnes) {
        if (!colonne.niveau_patiente || bloc[0].cellules[colonne.nom]) continue;
        const source = bloc.find((r) => r.cellules[colonne.nom]);
        if (source) bloc[0].cellules[colonne.nom] = source.cellules[colonne.nom];
      }
    } else {
      bloc.forEach((r) => {
        r.debutPatiente = true;
        r.taillePatiente = 1;
      });
    }
    i = j;
  }

  return { groupes, colonnes, rangees: triees, rangsParPatient };
}
