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
  if (confiance !== null) return `${fr ? 'Confiance Gemini' : 'Gemini confidence'} : ${confiance} %`;
  if (lu) return fr ? "Gemini n'a renvoyé aucun score : à vérifier" : 'Gemini returned no score: check it';
  return fr ? "Case vide (rien lu par l'OCR)" : 'Empty cell (nothing read by OCR)';
}

function Cellule({
  cellule,
  colonne,
  props,
}: Readonly<{ cellule: CelluleGrille | undefined; colonne: ColonneGrille; props: RegistreGridProps }>) {
  const fr = props.language === 'fr';

  if (!cellule || cellule.kind === 'vide') {
    // PII sans cellule en base (rien lu) : non saisissable ici (pas de ligne pii_cellule).
    return <td className="border border-gray-200 bg-gray-50 min-w-[7rem]" title={fr ? 'Rien lu' : 'Nothing read'} />;
  }

  let valeurOrigine: string;
  let valeur: string;
  let confiance: number | null;
  let lu: boolean;
  let verrouillee: boolean;
  let corrigee: boolean;
  let onChange: (v: string) => void;

  if (cellule.kind === 'clinique') {
    const { champ, idDonnee } = cellule;
    valeurOrigine = champ.valeur;
    valeur = props.saisiesCliniques[idDonnee]?.[champ.nom] ?? champ.valeur;
    confiance = champ.confiance;
    lu = champ.lu;
    verrouillee = cellule.verrouillee;
    corrigee = champ.corrigeParHumain;
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
  const niveau = corrigee || modifie ? 'inconnue' : niveauConfiance(confiance);
  const scoreInconnu = !corrigee && !modifie && lu && confiance === null;

  return (
    <td
      className={`relative border border-gray-200 p-0 min-w-[7rem] ${FOND_CONFIANCE[niveau]} ${colonne.is_pii ? 'border-l-purple-200' : ''}`}
      title={infobulle(confiance, lu, modifie, fr)}
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
      {!modifie && !corrigee && (confiance !== null || scoreInconnu) && (
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

  if (grille.colonnes.length === 0) return null;
  if (grille.rangees.length === 0) {
    return <div className="text-gray-500 text-center py-8">{fr ? 'Aucune donnée extraite pour cette page.' : 'No extracted data for this page.'}</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Légende */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
        <span className="font-bold text-gray-600">{fr ? 'Confiance Gemini :' : 'Gemini confidence:'}</span>
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
              return (
                <tr key={r.numeroOrdre} className={verrouillee ? 'opacity-70' : ''}>
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-gray-50 border border-gray-200 px-2 text-[12px] font-bold text-gray-700 text-center"
                    title={verrouillee ? (r.donnee?.categorie_rejet ? 'Ligne rejetée' : 'Ligne validée') : undefined}
                  >
                    {r.numeroOrdre}
                    {verrouillee && <span className="ml-0.5 text-blue-600">✓</span>}
                  </th>
                  {grille.colonnes.map((c) => (
                    <Cellule key={c.nom} cellule={r.cellules[c.nom]} colonne={c} props={props} />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
