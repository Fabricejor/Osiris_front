"use client";

/**
 * Vue « registre » : les données extraites affichées dans un tableau calqué
 * sur le registre papier (mêmes colonnes, même ordre, une rangée par ligne
 * du registre). Chaque case est éditable ; sa couleur reflète le score de
 * confiance renvoyé par Gemini.
 */
import React from 'react';
import {
  niveauConfiance,
  type CelluleGrille,
  type ColonneGrille,
  type Grille,
} from '@/services/validation-mapping';

const FOND_CONFIANCE = {
  basse: 'bg-red-50',
  moyenne: 'bg-amber-50',
  haute: 'bg-emerald-50/60',
  inconnue: 'bg-white',
} as const;

const TEXTE_CONFIANCE = {
  basse: 'text-red-600',
  moyenne: 'text-amber-600',
  haute: 'text-emerald-600',
  inconnue: 'text-gray-400',
} as const;

interface RegistreGridProps {
  grille: Grille;
  saisiesCliniques: Record<string, Record<string, string>>;
  saisiesPii: Record<string, string>;
  onChangeClinique: (idDonnee: string, nomChamp: string, valeur: string) => void;
  onChangePii: (idPii: string, valeur: string) => void;
  language: string;
}

function enteteColonne(c: ColonneGrille): string {
  return c.unite ? `${c.libelle} (${c.unite})` : c.libelle;
}

function infobulle(confiance: number | null, lu: boolean, modifie: boolean, fr: boolean): string {
  if (modifie) return fr ? 'Modifié par vous' : 'Edited by you';
  if (confiance !== null) return `${fr ? 'Confiance' : 'Confidence'} : ${confiance} %`;
  if (lu) return fr ? 'Valeur lue sans score de confiance : à vérifier' : 'Value read without a confidence score: check it';
  return fr ? "Case vide (rien lu par l'OCR)" : 'Empty cell (nothing read by OCR)';
}

function Cellule({
  cellule,
  colonne,
  rowSpan,
  props,
}: Readonly<{
  cellule: CelluleGrille | undefined;
  colonne: ColonneGrille;
  rowSpan?: number;
  props: RegistreGridProps;
}>) {
  const fr = props.language === 'fr';

  if (!cellule || cellule.kind === 'vide') {
    // PII sans cellule en base (rien lu) : non saisissable ici (pas de ligne pii_cellule).
    return (
      <td
        rowSpan={rowSpan}
        className="border border-gray-200 bg-gray-50 min-w-[7rem]"
        title={fr ? 'Rien lu' : 'Nothing read'}
      />
    );
  }

  let valeurOrigine: string;
  let valeur: string;
  let confiance: number | null;
  let lu: boolean;
  let verrouillee: boolean;
  let corrigee: boolean;
  let deduit = false;
  let onChange: (v: string) => void;

  if (cellule.kind === 'clinique') {
    const { champ, idDonnee } = cellule;
    valeurOrigine = champ.valeur;
    valeur = props.saisiesCliniques[idDonnee]?.[champ.nom] ?? champ.valeur;
    confiance = champ.confiance;
    lu = champ.lu;
    verrouillee = cellule.verrouillee;
    corrigee = champ.corrigeParHumain;
    deduit = champ.deduit;
    onChange = (v) => props.onChangeClinique(idDonnee, champ.nom, v);
  } else {
    const { pii } = cellule;
    valeurOrigine = pii.valeur_saisie ?? pii.valeur_lue ?? '';
    valeur = props.saisiesPii[pii.id_pii_cellule] ?? valeurOrigine;
    confiance = pii.saisie ? null : cellule.confiance;
    lu = !!pii.valeur_lue;
    verrouillee = pii.saisie;
    corrigee = pii.saisie;
    onChange = (v) => props.onChangePii(pii.id_pii_cellule, v);
  }

  const modifie = valeur.trim() !== valeurOrigine.trim();
  const niveau = corrigee || modifie || deduit ? 'inconnue' : niveauConfiance(confiance);
  const scoreInconnu = !corrigee && !modifie && !deduit && lu && confiance === null;

  return (
    <td
      rowSpan={rowSpan}
      className={`relative border border-gray-200 p-0 min-w-[7rem] ${rowSpan && rowSpan > 1 ? 'align-middle' : ''} ${FOND_CONFIANCE[niveau]} ${colonne.is_pii ? 'border-l-purple-200' : ''}`}
      title={
        deduit && !modifie
          ? (fr ? "Déduit de la ligne du registre (non lu sur l'image)" : 'Deduced from the register row (not read from the image)')
          : infobulle(confiance, lu, modifie, fr)
      }
    >
      <input
        type="text"
        value={valeur}
        disabled={verrouillee}
        onChange={(e) => onChange(e.target.value)}
        aria-label={enteteColonne(colonne)}
        className={`w-full bg-transparent px-2 py-1.5 pr-8 text-[13px] text-gray-800 outline-none focus:ring-2 focus:ring-inset focus:ring-[#65b741] disabled:text-gray-500 ${modifie ? 'ring-2 ring-inset ring-blue-400' : ''}`}
      />
      {/* Score Gemini en coin de case (ou « ? » si inconnu). */}
      {deduit && !modifie && (
        <span className="pointer-events-none absolute right-1 top-1 text-[9px] font-bold text-slate-400">auto</span>
      )}
      {!modifie && !corrigee && !deduit && (confiance !== null || scoreInconnu) && (
        <span className={`pointer-events-none absolute right-1 top-1 text-[9px] font-bold ${TEXTE_CONFIANCE[niveau]}`}>
          {scoreInconnu ? '?' : `${confiance}%`}
        </span>
      )}
      {corrigee && (
        <span className="pointer-events-none absolute right-1 top-1 text-[9px] font-bold text-blue-600">✓</span>
      )}
    </td>
  );
}

export default function RegistreGrid(props: Readonly<RegistreGridProps>) {
  const { grille, language } = props;
  const fr = language === 'fr';
  const multiVisites = grille.rangsParPatient > 1;

  if (grille.colonnes.length === 0) return null;
  if (grille.rangees.length === 0) {
    return <div className="text-gray-500 text-center py-8">{fr ? 'Aucune donnée extraite pour cette page.' : 'No extracted data for this page.'}</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Légende */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
        <span className="font-bold text-gray-600">{fr ? 'Confiance :' : 'Confidence:'}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-200" /> ≥ 80 %</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-200" /> 50–79 %</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-100 border border-red-200" /> &lt; 50 %</span>
        <span className="flex items-center gap-1"><span className="font-bold">?</span> {fr ? 'score inconnu' : 'unknown score'}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm ring-2 ring-blue-400" /> {fr ? 'modifié' : 'edited'}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-purple-100 border border-purple-200" /> PII</span>
      </div>

      <div className="overflow-auto border border-gray-200 rounded-lg max-h-full" style={{ scrollbarWidth: 'thin' }}>
        <table className="border-collapse text-left">
          <thead className="sticky top-0 z-20">
            {/* En-têtes regroupés par section, comme sur le registre papier. */}
            <tr>
              <th rowSpan={2} className="sticky left-0 z-30 bg-gray-100 border border-gray-200 px-2 py-1 text-[11px] font-bold text-gray-600 min-w-[3.5rem]">
                N°
              </th>
              {multiVisites && (
                <th rowSpan={2} className="bg-gray-100 border border-gray-200 px-2 py-1 text-[11px] font-bold text-gray-600 whitespace-nowrap">
                  {fr ? 'Visite' : 'Visit'}
                </th>
              )}
              {grille.groupes.map((g, i) => (
                <th
                  key={`${g.libelle}-${i}`}
                  colSpan={g.colonnes.length}
                  className="bg-gray-100 border border-gray-200 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-600 text-center whitespace-nowrap"
                >
                  {g.libelle}
                </th>
              ))}
            </tr>
            <tr>
              {grille.colonnes.map((c) => (
                <th
                  key={c.nom}
                  title={c.nom}
                  className={`border border-gray-200 px-2 py-1 text-[11px] font-semibold whitespace-nowrap ${c.is_pii ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-600'}`}
                >
                  {enteteColonne(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grille.rangees.map((r) => {
              const verrouillee = r.donnee?.valide ?? false;
              const etat = r.donnee?.categorie_rejet ? 'rejetée' : 'validée';
              return (
                <tr
                  key={`${r.numeroOrdre}:${r.rang}`}
                  className={`${verrouillee ? 'opacity-70' : ''} ${multiVisites && r.debutPatiente ? 'border-t-2 border-t-gray-400' : ''}`}
                >
                  {/* N° de la patiente : fusionné sur le bloc de ses visites. */}
                  {r.debutPatiente && (
                    <th
                      scope="rowgroup"
                      rowSpan={r.taillePatiente}
                      className="sticky left-0 z-10 bg-gray-50 border border-gray-200 px-2 text-[12px] font-bold text-gray-700 text-center align-middle"
                    >
                      {r.numeroOrdre}
                      {!multiVisites && verrouillee && <span className="ml-0.5 text-blue-600" title={`Ligne ${etat}`}>✓</span>}
                    </th>
                  )}
                  {multiVisites && (
                    <th
                      scope="row"
                      className="bg-white border border-gray-200 px-2 text-[11px] font-semibold text-gray-500 text-center whitespace-nowrap"
                      title={verrouillee ? `Visite ${etat}` : undefined}
                    >
                      {r.rang}
                      {verrouillee && <span className="ml-0.5 text-blue-600">✓</span>}
                    </th>
                  )}
                  {grille.colonnes.map((c) => {
                    // Identité (CPN/CPON) : une cellule fusionnée par patiente.
                    if (c.niveau_patiente) {
                      if (!r.debutPatiente) return null;
                      return (
                        <Cellule key={c.nom} cellule={r.cellules[c.nom]} colonne={c} rowSpan={r.taillePatiente} props={props} />
                      );
                    }
                    return <Cellule key={c.nom} cellule={r.cellules[c.nom]} colonne={c} props={props} />;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
