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
  /** Valeur éditable affichée dans le champ de saisie (format lisible). */
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
  /**
   * Alertes des contrôles automatiques sur ce champ (bornes, écart entre
   * visites, parité > gestité…). `bloquante` = WARNING/ERROR (case à vérifier),
   * sinon INFO (affichée au survol seulement).
   */
  alertes: AlerteChamp[];
}

export interface AlerteChamp {
  code: string;
  message: string;
  bloquante: boolean;
}

/** Alertes de cohérence d'une ligne, par champ concerné. */
function alertesParChamp(donnee: DonneeExtraite): Map<string, AlerteChamp[]> {
  const parChamp = new Map<string, AlerteChamp[]>();
  for (const brute of (donnee.alertes_coherence ?? []) as unknown[]) {
    if (!brute || typeof brute !== 'object') continue;
    const a = brute as { code?: unknown; message?: unknown; severite?: unknown; champs_concernes?: unknown };
    const alerte: AlerteChamp = {
      code: String(a.code ?? ''),
      message: String(a.message ?? ''),
      bloquante: a.severite === 'WARNING' || a.severite === 'ERROR',
    };
    for (const nom of Array.isArray(a.champs_concernes) ? a.champs_concernes : []) {
      const liste = parChamp.get(String(nom)) ?? [];
      liste.push(alerte);
      parChamp.set(String(nom), liste);
    }
  }
  return parChamp;
}

/** Messages des alertes de cohérence d'une ligne (pour un récapitulatif). */
export function messagesAlertes(donnee: DonneeExtraite, bloquantesSeulement = true): string[] {
  const vus = new Set<string>();
  for (const alertes of alertesParChamp(donnee).values()) {
    for (const a of alertes) if (!bloquantesSeulement || a.bloquante) vus.add(a.message);
  }
  return [...vus];
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

/** « 2026-02-03 » → « 03/02/2026 » (autres formats laissés tels quels). */
export function dateLisible(valeur: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valeur.trim());
  return m ? `${m[3]}/${m[2]}/${m[1]}` : valeur;
}

/** « 08:30:00 » → « 08:30 ». */
export function heureLisible(valeur: string): string {
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(valeur.trim());
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : valeur;
}

/** Saisie « 3/2/26 », « 03/02/2026 » ou ISO → « 2026-02-03 » (null si non reconnue). */
function dateIso(texte: string): string | null {
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(texte);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
  const fr = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/.exec(texte);
  if (!fr) return null;
  const annee = fr[3].length === 2 ? `20${fr[3]}` : fr[3];
  return `${annee}-${fr[2].padStart(2, '0')}-${fr[1].padStart(2, '0')}`;
}

/** Valeur typée → texte éditable, au format lisible (dates jj/mm/aaaa, heures hh:mm). */
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
    case 'DATE':
      return champ.valeur != null ? dateLisible(String(champ.valeur)) : '';
    case 'HEURE':
      return champ.valeur != null ? heureLisible(String(champ.valeur)) : '';
    default:
      return champ.valeur != null ? String(champ.valeur) : '';
  }
}

/**
 * Texte saisi → valeur de correction envoyée à `POST /donnees-extraites/{id}/valider`
 * (le backend remplace `champs[nom].valeur`). Nombres, booléens, dates (ISO) et
 * heures typés ; le reste en texte.
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
    if (['oui', 'o', 'true', '1', '+', 'positif', 'yes', '✓'].includes(v)) return true;
    if (['non', 'n', 'false', '0', '-', 'négatif', 'negatif', 'no', '✗'].includes(v)) return false;
  }
  if (typeChamp === 'DATE') return dateIso(t) ?? t;
  if (typeChamp === 'HEURE') {
    const m = /^(\d{1,2})\s*[:hH]\s*(\d{2})?$/.exec(t);
    if (m) return `${m[1].padStart(2, '0')}:${m[2] ?? '00'}:00`;
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
  const alertes = alertesParChamp(donnee);

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
      alertes: alertes.get(nom) ?? [],
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

/**
 * Valeurs lues par l'OCR sous une colonne qu'on n'a pas pu rattacher à un champ
 * du catalogue (libellé ou colonne inconnus) — à vérifier par le valideur.
 */
export function valeursNonRattachees(donnee: DonneeExtraite): Record<string, string> {
  const brut = (donnee.donnees_brutes_ocr ?? {}) as { champs_non_mappes?: Record<string, unknown> };
  const out: Record<string, string> = {};
  for (const [cle, valeur] of Object.entries(brut.champs_non_mappes ?? {})) {
    if (valeur !== null && valeur !== undefined && String(valeur).trim()) out[cle] = String(valeur);
  }
  return out;
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

// ─── Vue registre / fiche patiente ──────────────────────────────────────────
//
// Registres multi-visites (CPN : 4 lignes / patiente, CPON : 3) : une rangée
// par visite ; les colonnes d'identité (`niveau_patiente`) sont fusionnées
// verticalement sur le bloc de la patiente, comme sur le papier, et portées
// par sa visite de rang 1.

type PiiCellule = components['schemas']['PiiCelluleRead'];

/**
 * Métadonnées d'identification sans colonne sur le papier (en-tête de page /
 * contexte de session) : toujours vides dans le tableau, masquées par défaut.
 */
export const CHAMPS_SANS_COLONNE = new Set([
  'region', 'departement', 'district', 'structure_sanitaire', 'annee_registre',
]);

/** Libellés d'en-tête au-delà de cette longueur : on préfère l'abréviation du papier. */
const LONGUEUR_LIBELLE_COURT = 14;

export interface ColonneGrille {
  nom: string;
  libelle: string;
  /** Intitulé court (abréviation du papier si le libellé est long). */
  libelleCourt: string;
  unite: string | null;
  type_champ: string;
  modalites: string[] | null;
  /** Nom de la section du catalogue (regroupement / repli). */
  section: string;
  is_pii: boolean;
  /** Écrite une fois par patiente (cellule fusionnée sur ses visites). */
  niveau_patiente: boolean;
}

export interface GroupeColonnes {
  /** Nom technique de la section (clé de repli). */
  section: string;
  /** Libellé de section (en-tête regroupé, comme sur le registre). */
  libelle: string;
  colonnes: ColonneGrille[];
}

export type CelluleGrille =
  | { kind: 'clinique'; champ: ChampAffiche; idDonnee: string; verrouillee: boolean; rejetee: boolean }
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

function libelleCourt(champ: ChampCatalogue): string {
  if (champ.libelle.length <= LONGUEUR_LIBELLE_COURT) return champ.libelle;
  const alias = (champ.contraintes as { alias?: unknown } | undefined)?.alias;
  const court = Array.isArray(alias)
    ? alias.find((a): a is string => typeof a === 'string' && a.trim().length > 0 && a.length <= LONGUEUR_LIBELLE_COURT)
    : undefined;
  return court ?? champ.libelle;
}

/** Regroupe des colonnes (déjà ordonnées) par section consécutive. */
export function regrouperParSection(colonnes: ColonneGrille[], libelles: Map<string, string>): GroupeColonnes[] {
  const groupes: GroupeColonnes[] = [];
  for (const colonne of colonnes) {
    const dernier = groupes.at(-1);
    if (dernier && dernier.section === colonne.section) dernier.colonnes.push(colonne);
    else {
      groupes.push({
        section: colonne.section,
        libelle: libelles.get(colonne.section) ?? colonne.section,
        colonnes: [colonne],
      });
    }
  }
  return groupes;
}

/** Libellés des sections d'une grille (section → libellé). */
export function libellesSections(grille: Grille): Map<string, string> {
  return new Map(grille.groupes.map((g) => [g.section, g.libelle]));
}

/**
 * Construit la grille « registre » : colonnes dans l'ordre physique du papier
 * (sections puis champs du catalogue), regroupées par section consécutive ;
 * une rangée par visite (`numero_ordre`, `rang`), PII et identité replacées
 * sur le bloc de la patiente.
 */
export function construireGrille(
  catalogue: Catalogue | undefined,
  donnees: DonneeExtraite[],
  pii: PiiCellule[],
): Grille {
  if (!catalogue) return { groupes: [], colonnes: [], rangees: [], rangsParPatient: 1 };
  const rangsParPatient = Math.max(1, catalogue.rangs_par_patient ?? 1);
  const multiVisites = rangsParPatient > 1;

  // Ordre = sections puis champs du catalogue, alignés sur le papier.
  // (`colonne_registre` n'est renseigné que pour une partie des champs : trier
  // dessus repousserait tous les autres en fin de tableau.)
  const champsOrdonnes = [...catalogue.sections]
    .sort((a, b) => a.ordre - b.ordre)
    .flatMap((section) =>
      [...section.champs].sort((a, b) => a.ordre - b.ordre).map((champ) => ({ section, champ })),
    );

  const colonnes: ColonneGrille[] = champsOrdonnes.map(({ section, champ }) => ({
    nom: champ.nom,
    libelle: champ.libelle,
    libelleCourt: libelleCourt(champ),
    unite: champ.unite ?? null,
    type_champ: champ.type_champ,
    modalites: champ.modalites ?? null,
    section: section.nom,
    is_pii: champ.is_pii,
    niveau_patiente: multiVisites && (champ.niveau_patiente || champ.is_pii),
  }));
  const libelles = new Map(catalogue.sections.map((s) => [s.nom, s.libelle]));
  const groupes = regrouperParSection(colonnes, libelles);

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
        rejetee: !!donnee.categorie_rejet,
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

// ─── État d'affichage d'une case (commun grille / fiche) ────────────────────

export interface SaisiesValideur {
  /** {id_donnee_extraite: {nom_champ: texte}} */
  cliniques: Record<string, Record<string, string>>;
  /** {id_pii_cellule: texte} */
  pii: Record<string, string>;
  /** Cases confirmées telles quelles par le valideur (mode « À vérifier »), voir `cleCellule`. */
  revues?: ReadonlySet<string>;
  /** Mode « Corriger » : les valeurs déjà validées / saisies redeviennent modifiables (sauf lignes rejetées). */
  correction?: boolean;
}

/** Identifiant stable d'une case (clé de `SaisiesValideur.revues`). */
export function cleCellule(cellule: CelluleGrille | undefined): string | null {
  if (!cellule || cellule.kind === 'vide') return null;
  return cellule.kind === 'clinique' ? `${cellule.idDonnee}:${cellule.champ.nom}` : `pii:${cellule.pii.id_pii_cellule}`;
}

export interface EtatCellule {
  /** Valeur affichée (saisie en cours, sinon valeur serveur). */
  valeur: string;
  /** Valeur serveur (référence pour savoir si la case est modifiée). */
  valeurOrigine: string;
  modifie: boolean;
  confiance: number | null;
  lu: boolean;
  verrouillee: boolean;
  corrigee: boolean;
  deduit: boolean;
  scoreInconnu: boolean;
  /** Confirmée telle quelle par le valideur (mode « À vérifier »). */
  revue: boolean;
  /** Case qui mérite l'œil du valideur (score faible / moyen / inconnu, ou alerte). */
  aVerifier: boolean;
  /** Alertes de cohérence (bloquantes) sur cette case, ex. écart entre visites. */
  alertes: string[];
  /** Alertes informatives (ex. modalité corrigée automatiquement). */
  infos: string[];
  niveau: 'basse' | 'moyenne' | 'haute' | 'inconnue';
}

export function etatCellule(cellule: CelluleGrille | undefined, saisies: SaisiesValideur): EtatCellule | null {
  if (!cellule || cellule.kind === 'vide') return null;
  let valeurOrigine: string;
  let valeur: string;
  let confiance: number | null;
  let lu: boolean;
  let verrouillee: boolean;
  let corrigee: boolean;
  let deduit = false;
  // Déjà validée / saisie (reste neutre même déverrouillée en mode « Corriger »).
  let traitee: boolean;
  let alertes: string[] = [];
  let infos: string[] = [];

  if (cellule.kind === 'clinique') {
    const { champ, idDonnee } = cellule;
    valeurOrigine = champ.valeur;
    valeur = saisies.cliniques[idDonnee]?.[champ.nom] ?? champ.valeur;
    confiance = champ.confiance;
    lu = champ.lu;
    traitee = cellule.verrouillee;
    verrouillee = cellule.verrouillee && (!saisies.correction || cellule.rejetee);
    corrigee = champ.corrigeParHumain;
    deduit = champ.deduit;
    alertes = champ.alertes.filter((a) => a.bloquante).map((a) => a.message);
    infos = champ.alertes.filter((a) => !a.bloquante).map((a) => a.message);
  } else {
    const { pii } = cellule;
    valeurOrigine = pii.valeur_saisie ?? pii.valeur_lue ?? '';
    valeur = saisies.pii[pii.id_pii_cellule] ?? valeurOrigine;
    confiance = pii.saisie ? null : cellule.confiance;
    lu = !!pii.valeur_lue;
    traitee = pii.saisie;
    verrouillee = pii.saisie && !saisies.correction;
    corrigee = pii.saisie;
  }

  const modifie = valeur.trim() !== valeurOrigine.trim();
  const revue = !modifie && !!saisies.revues?.has(cleCellule(cellule) ?? '');
  const neutre = corrigee || modifie || deduit || traitee || revue;
  const niveau = neutre ? 'inconnue' : niveauConfiance(confiance);
  const scoreInconnu = !neutre && lu && confiance === null;
  // Une alerte de cohérence reste visible même si la lecture est sûre (620 kg lu à 95 %),
  // jusqu'à ce que le valideur corrige ou confirme la valeur.
  const alertesTraitees = modifie || traitee || corrigee || revue;
  const alertesActives = alertesTraitees ? [] : alertes;
  if (revue) infos = [...alertes, ...infos];
  const aVerifier =
    alertesActives.length > 0 || (!neutre && lu && (niveau === 'basse' || niveau === 'moyenne' || scoreInconnu));
  return {
    valeur, valeurOrigine, modifie, confiance, lu, verrouillee, corrigee, deduit, scoreInconnu, revue, aVerifier, niveau,
    alertes: alertesActives, infos,
  };
}

/** true si la case contient quelque chose (valeur serveur ou saisie en cours). */
function celluleRemplie(cellule: CelluleGrille | undefined, saisies: SaisiesValideur): boolean {
  const etat = etatCellule(cellule, saisies);
  return !!etat && (etat.valeur.trim() !== '' || etat.valeurOrigine.trim() !== '');
}

/**
 * Colonnes à afficher : sans les métadonnées absentes du papier ni les colonnes
 * vides sur toute la page, sauf si `toutes` (bouton « Afficher les colonnes vides »).
 */
export function colonnesVisibles(grille: Grille, saisies: SaisiesValideur, toutes: boolean): ColonneGrille[] {
  if (toutes) return grille.colonnes;
  return grille.colonnes.filter(
    (c) => !CHAMPS_SANS_COLONNE.has(c.nom) && grille.rangees.some((r) => celluleRemplie(r.cellules[c.nom], saisies)),
  );
}

export interface PatienteGrille {
  numeroOrdre: number;
  /** Visites de la patiente, par rang (une seule hors CPN/CPON). */
  visites: RangeeGrille[];
}

/** Rangées regroupées par patiente (ordre du registre). */
export function patientesDeGrille(grille: Grille): PatienteGrille[] {
  const parNumero = new Map<number, PatienteGrille>();
  for (const r of grille.rangees) {
    const p = parNumero.get(r.numeroOrdre) ?? { numeroOrdre: r.numeroOrdre, visites: [] };
    p.visites.push(r);
    parNumero.set(r.numeroOrdre, p);
  }
  return [...parNumero.values()];
}

/** Nombre de cases à vérifier d'une patiente (identité + visites). */
export function casesAVerifier(patiente: PatienteGrille, colonnes: ColonneGrille[], saisies: SaisiesValideur): number {
  let n = 0;
  for (const visite of patiente.visites) {
    for (const c of colonnes) {
      if (c.niveau_patiente && !visite.debutPatiente) continue;
      if (etatCellule(visite.cellules[c.nom], saisies)?.aVerifier) n++;
    }
  }
  return n;
}

// ─── Mode « À vérifier » : les cases douteuses, une par une ──────────────────

export interface ElementAVerifier {
  /** `cleCellule` de la case. */
  cle: string;
  patiente: PatienteGrille;
  /** Rangée (visite) qui porte la case. */
  rangee: RangeeGrille;
  colonne: ColonneGrille;
}

/**
 * Cases à vérifier, dans l'ordre du registre (patiente, visite, colonne).
 * Calculé SANS les saisies du valideur pour que la liste reste stable pendant
 * la revue (une case corrigée reste à sa place, marquée « traitée »).
 */
export function elementsAVerifier(grille: Grille, saisies: SaisiesValideur = { cliniques: {}, pii: {} }): ElementAVerifier[] {
  const elements: ElementAVerifier[] = [];
  for (const patiente of patientesDeGrille(grille)) {
    for (const rangee of [...patiente.visites].sort((a, b) => a.rang - b.rang)) {
      for (const colonne of grille.colonnes) {
        if (colonne.niveau_patiente && !rangee.debutPatiente) continue;
        const cellule = rangee.cellules[colonne.nom];
        const cle = cleCellule(cellule);
        if (cle && etatCellule(cellule, saisies)?.aVerifier) elements.push({ cle, patiente, rangee, colonne });
      }
    }
  }
  return elements;
}

// ─── Lien photo ↔ données : zone de chaque ligne sur l'image ─────────────────

/** [ymin, xmin, ymax, xmax], normalisés 0..1000 (convention Gemini). */
export type ZoneImage = [number, number, number, number];

/** Zone de la ligne sur l'image, renvoyée par l'OCR (`position_ligne`), ou null. */
export function positionLigne(donnee: DonneeExtraite | null | undefined): ZoneImage | null {
  const brut = (donnee?.donnees_brutes_ocr as { position_ligne?: unknown } | null | undefined)?.position_ligne;
  if (!Array.isArray(brut) || brut.length !== 4 || !brut.every((v) => typeof v === 'number' && Number.isFinite(v))) {
    return null;
  }
  const [ymin, xmin, ymax, xmax] = brut as number[];
  return ymin < ymax && xmin < xmax ? [ymin, xmin, ymax, xmax] : null;
}

/** Plus petite zone contenant toutes les zones connues (bloc d'une patiente). */
export function unionZones(zones: (ZoneImage | null)[]): ZoneImage | null {
  const connues = zones.filter((z): z is ZoneImage => z !== null);
  if (connues.length === 0) return null;
  return [
    Math.min(...connues.map((z) => z[0])),
    Math.min(...connues.map((z) => z[1])),
    Math.max(...connues.map((z) => z[2])),
    Math.max(...connues.map((z) => z[3])),
  ];
}

export function zonePatiente(patiente: PatienteGrille): ZoneImage | null {
  return unionZones(patiente.visites.map((v) => positionLigne(v.donnee)));
}

/** Zone d'une visite, ou à défaut celle de tout le bloc de la patiente. */
export function zoneRangee(rangee: RangeeGrille, grille: Grille): ZoneImage | null {
  return (
    positionLigne(rangee.donnee) ??
    unionZones(grille.rangees.filter((r) => r.numeroOrdre === rangee.numeroOrdre).map((r) => positionLigne(r.donnee)))
  );
}

/** Demande d'affichage d'une zone : `zoom` pour cadrer l'image dessus (sinon simple surlignage). */
export interface DemandeZone {
  zone: ZoneImage | null;
  zoom: boolean;
}
