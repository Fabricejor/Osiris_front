"use client";

/**
 * Case éditable d'une valeur extraite, commune à la vue registre et à la fiche
 * patiente. Lisibilité :
 * - seule une case À VÉRIFIER est colorée (score faible, moyen ou inconnu) ;
 *   une case sûre reste blanche, son score exact est dans l'infobulle ;
 * - oui/non affichés ✓ / ✗, dates jj/mm/aaaa, suggestions pour les choix ;
 * - largeur adaptée au type (nombre étroit, texte large).
 */
import React from 'react';
import {
  etatCellule,
  type CelluleGrille,
  type ColonneGrille,
  type SaisiesValideur,
} from '@/services/validation-mapping';

/** Largeur minimale d'une colonne selon le type de valeur. */
export const LARGEUR_TYPE: Record<string, string> = {
  NOMBRE: 'min-w-[4.5rem]',
  BINAIRE: 'min-w-[3.5rem]',
  HEURE: 'min-w-[4.5rem]',
  DATE: 'min-w-[6.5rem]',
  TENSION_ARTERIELLE: 'min-w-[5rem]',
  CATEGORIELLE: 'min-w-[7rem]',
  CATEGORIELLE_MULTI: 'min-w-[8rem]',
  TEXTE: 'min-w-[9rem]',
};

export function largeurColonne(colonne: ColonneGrille): string {
  return LARGEUR_TYPE[colonne.type_champ] ?? 'min-w-[7rem]';
}

const FOND = {
  basse: 'bg-red-50',
  moyenne: 'bg-amber-50',
  haute: '',
  inconnue: '',
} as const;

/** Affichage des modalités oui/non dans la liste déroulante. */
const LIBELLE_BINAIRE: Record<string, string> = { '': '—', Oui: '✓', Non: '✗' };

/** Pastille de score sous la valeur d'une case à vérifier. */
const PASTILLE_SCORE = {
  basse: 'bg-red-100 text-red-700',
  moyenne: 'bg-amber-100 text-amber-800',
  haute: 'bg-gray-100 text-gray-600',
  inconnue: 'bg-slate-200 text-slate-700',
} as const;

function fondCellule(etat: NonNullable<ReturnType<typeof etatCellule>>): string {
  if (etat.alertes.length > 0) return 'bg-red-50';
  if (etat.scoreInconnu) return 'bg-slate-100';
  // Case vide ou contrôle aléatoire signalés par le serveur : pas de score coloré.
  if (etat.aVerifier && !FOND[etat.niveau]) return 'bg-amber-50';
  return FOND[etat.niveau];
}

/** Texte de la pastille d'une case à vérifier (hors alerte de cohérence). */
function textePastille(etat: NonNullable<ReturnType<typeof etatCellule>>, fr: boolean): string {
  if (etat.raisons.includes('VALEUR_MANQUANTE')) return fr ? 'vide ?' : 'empty?';
  if (etat.scoreInconnu) return 'score ?';
  if (etat.raisons.includes('CONTROLE_ALEATOIRE')) return fr ? 'contrôle' : 'spot check';
  return `${etat.confiance} %`;
}

/** Explication d'une raison serveur (infobulle, mode « À vérifier »). */
export function libelleRaison(raison: string, fr: boolean): string | null {
  switch (raison) {
    case 'VALEUR_MANQUANTE':
      return fr
        ? "Case vide à la lecture, mais souvent remplie sur ce type de registre : vérifiez la photo"
        : 'Read as empty, but often filled on this register: check the photo';
    case 'CONTROLE_ALEATOIRE':
      return fr
        ? 'Contrôle aléatoire : case sûre tirée au hasard pour mesurer la fiabilité de la lecture'
        : 'Spot check: a confident cell picked at random to measure reading accuracy';
    case 'COLONNE_NON_RATTACHEE':
      return fr ? 'Colonne inconnue du catalogue' : 'Column unknown to the catalogue';
    default:
      return null; // confiance / score / alerte : expliqués par ailleurs
  }
}

/** Identifiant de la <datalist> des modalités d'une colonne (voir ListesModalites). */
export function idListeModalites(colonne: ColonneGrille): string {
  return `modalites-${colonne.nom}`;
}

/** Suggestions de saisie des champs à choix — à rendre UNE fois par vue. */
export function ListesModalites({ colonnes }: Readonly<{ colonnes: ColonneGrille[] }>) {
  return (
    <>
      {colonnes
        .filter((c) => c.modalites?.length && c.type_champ !== 'BINAIRE')
        .map((c) => (
          <datalist key={c.nom} id={idListeModalites(c)}>
            {c.modalites!.map((m) => <option key={m} value={m} />)}
          </datalist>
        ))}
    </>
  );
}

function infobulle(etat: NonNullable<ReturnType<typeof etatCellule>>, fr: boolean): string {
  const lignes = [
    ...etat.alertes.map((a) => `⚠ ${a}`),
    ...etat.raisons.map((r) => libelleRaison(r, fr)).filter((l): l is string => !!l),
    ...etat.infos.map((a) => `ℹ ${a}`),
  ];
  const base = infobulleBase(etat, fr);
  return lignes.length ? [...lignes, base].join('\n') : base;
}

function infobulleBase(etat: NonNullable<ReturnType<typeof etatCellule>>, fr: boolean): string {
  if (etat.modifie) return fr ? 'Modifié par vous' : 'Edited by you';
  if (etat.revue) return fr ? 'Vérifié par vous (valeur confirmée)' : 'Checked by you (value confirmed)';
  if (etat.corrigee) return fr ? 'Déjà corrigé / saisi par un valideur' : 'Already corrected by a validator';
  if (etat.deduit) return fr ? "Déduit de la ligne du registre (non lu sur l'image)" : 'Deduced from the register row';
  if (etat.confiance !== null) return `${fr ? 'Confiance' : 'Confidence'} : ${etat.confiance} %`;
  if (etat.lu) return fr ? 'Valeur lue sans score de confiance : à vérifier' : 'Value read without a confidence score: check it';
  return fr ? "Case vide (rien lu par l'OCR)" : 'Empty cell (nothing read by OCR)';
}

interface CelluleEditableProps {
  cellule: CelluleGrille | undefined;
  colonne: ColonneGrille;
  saisies: SaisiesValideur;
  onChangeClinique: (idDonnee: string, nomChamp: string, valeur: string) => void;
  onChangePii: (idPii: string, valeur: string) => void;
  language: string;
  /** td (tableau) ou div (en-tête de fiche). */
  as?: 'td' | 'div';
  rowSpan?: number;
  className?: string;
  /** Saisie agrandie (mode « À vérifier »). */
  grande?: boolean;
  /** Lien photo ↔ données : survol / focus de la case. */
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
}

export default function CelluleEditable({
  cellule,
  colonne,
  saisies,
  onChangeClinique,
  onChangePii,
  language,
  as = 'td',
  rowSpan,
  className = '',
  grande = false,
  onMouseEnter,
  onMouseLeave,
  onFocus,
}: Readonly<CelluleEditableProps>) {
  const fr = language === 'fr';
  const Tag = as;
  const etat = etatCellule(cellule, saisies);
  const largeur = as === 'td' ? largeurColonne(colonne) : '';

  if (!etat || !cellule || cellule.kind === 'vide') {
    // PII sans cellule en base (rien lu) : non saisissable (pas de ligne pii_cellule).
    return (
      <Tag
        rowSpan={as === 'td' ? rowSpan : undefined}
        className={`${as === 'td' ? 'border border-gray-200' : 'rounded border border-gray-200'} bg-gray-50 ${largeur} ${className}`}
        title={fr ? 'Rien lu' : 'Nothing read'}
      >
        <span className="block px-2 py-1.5 text-[13px] text-gray-300">—</span>
      </Tag>
    );
  }

  const onChange = (v: string) => {
    if (cellule.kind === 'clinique') onChangeClinique(cellule.idDonnee, cellule.champ.nom, v);
    else onChangePii(cellule.pii.id_pii_cellule, v);
  };

  const taille = grande ? 'px-3 py-3 text-xl font-semibold' : 'px-2 py-1.5 text-[13px]';
  const classesSaisie = `w-full bg-transparent ${taille} text-gray-800 outline-none focus:ring-2 focus:ring-inset focus:ring-[#65b741] disabled:text-gray-500 ${etat.modifie ? 'ring-2 ring-inset ring-blue-400' : ''}`;

  let saisie: React.ReactNode;
  if (colonne.type_champ === 'BINAIRE') {
    const options = ['', 'Oui', 'Non'];
    if (etat.valeur && !options.includes(etat.valeur)) options.push(etat.valeur);
    saisie = (
      <select
        value={etat.valeur}
        disabled={etat.verrouillee}
        onChange={(e) => onChange(e.target.value)}
        aria-label={colonne.libelle}
        className={`${classesSaisie} appearance-none text-center font-semibold ${etat.valeur === 'Oui' ? 'text-emerald-700' : ''} ${etat.valeur === 'Non' ? 'text-gray-500' : ''}`}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {LIBELLE_BINAIRE[o] ?? o}
          </option>
        ))}
      </select>
    );
  } else {
    saisie = (
      <input
        type="text"
        value={etat.valeur}
        disabled={etat.verrouillee}
        onChange={(e) => onChange(e.target.value)}
        aria-label={colonne.libelle}
        list={colonne.modalites?.length ? idListeModalites(colonne) : undefined}
        placeholder={colonne.type_champ === 'DATE' ? 'jj/mm/aaaa' : undefined}
        className={classesSaisie}
      />
    );
  }

  return (
    <Tag
      rowSpan={as === 'td' ? rowSpan : undefined}
      className={`relative ${as === 'td' ? 'border border-gray-200 p-0' : 'rounded border border-gray-200'} ${largeur} ${rowSpan && rowSpan > 1 ? 'align-middle' : ''} ${fondCellule(etat)} ${colonne.is_pii ? 'border-l-2 border-l-purple-200' : ''} ${className}`}
      title={infobulle(etat, fr)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onFocus}
    >
      {saisie}
      {/* Case à vérifier : pastille lisible SOUS la valeur (le score d'une case
          sûre reste au survol). Une alerte de cohérence prime sur le score.
          Inutile en mode « À vérifier » (raisons détaillées au-dessus). */}
      {etat.aVerifier && !grande && (
        <div className="pointer-events-none px-2 pb-1 leading-none">
          {etat.alertes.length > 0 ? (
            <span className="inline-block rounded bg-red-100 px-1.5 py-0.5 text-[11px] font-bold text-red-700">
              ⚠ {fr ? 'incohérent' : 'inconsistent'}
            </span>
          ) : (
            <span className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-bold ${PASTILLE_SCORE[etat.niveau]}`}>
              {textePastille(etat, fr)}
            </span>
          )}
        </div>
      )}
      {etat.revue && (
        <span className="pointer-events-none absolute right-1 top-1 text-[10px] font-bold text-emerald-600">✓</span>
      )}
      {etat.corrigee && !etat.modifie && (
        <span className="pointer-events-none absolute right-1 top-1 text-[10px] font-bold text-blue-600">✓</span>
      )}
    </Tag>
  );
}
