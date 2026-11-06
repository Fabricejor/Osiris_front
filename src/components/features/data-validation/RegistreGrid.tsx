"use client";

/**
 * Vue « registre » : les données extraites dans un tableau calqué sur le
 * registre papier (mêmes colonnes, même ordre, une rangée par ligne).
 *
 * Lisibilité :
 * - colonnes vides de la page et métadonnées absentes du papier masquées
 *   (bouton pour les afficher) ;
 * - sections repliables (en-tête de groupe cliquable) ;
 * - seules les cases à vérifier sont colorées (cf. CelluleEditable).
 */
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import {
  colonnesVisibles,
  etatCellule,
  libellesSections,
  regrouperParSection,
  zoneRangee,
  type ColonneGrille,
  type DemandeZone,
  type Grille,
  type RangeeGrille,
  type SaisiesValideur,
} from '@/services/validation-mapping';
import CelluleEditable, { largeurColonne, ListesModalites } from './CelluleEditable';

interface RegistreGridProps {
  grille: Grille;
  saisies: SaisiesValideur;
  onChangeClinique: (idDonnee: string, nomChamp: string, valeur: string) => void;
  onChangePii: (idPii: string, valeur: string) => void;
  language: string;
  /** Lien photo ↔ données : survol (surligne) / focus (cadre l'image) d'une rangée. */
  onZone?: (demande: DemandeZone | null) => void;
}

export function enteteColonne(c: ColonneGrille): string {
  return c.unite ? `${c.libelleCourt} (${c.unite})` : c.libelleCourt;
}

/** true si une case de ces colonnes, sur cette rangée, est à vérifier. */
function rangeeAVerifier(r: RangeeGrille, colonnes: ColonneGrille[], saisies: SaisiesValideur): boolean {
  return colonnes.some(
    (c) => (!c.niveau_patiente || r.debutPatiente) && etatCellule(r.cellules[c.nom], saisies)?.aVerifier,
  );
}

export function LegendeConfiance({ fr }: Readonly<{ fr: boolean }>) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
      <span className="font-bold text-gray-600">{fr ? 'À vérifier :' : 'To check:'}</span>
      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-100 border border-red-200" /> {fr ? 'confiance' : 'confidence'} &lt; 50 %</span>
      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-200" /> 50–79 %</span>
      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200 text-[9px] leading-3 text-center font-bold">?</span> {fr ? 'score inconnu' : 'unknown score'}</span>
      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm border border-gray-200 bg-white" /> {fr ? 'sûr (≥ 80 %, score au survol)' : 'reliable (≥ 80 %, hover for score)'}</span>
      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm ring-2 ring-blue-400" /> {fr ? 'modifié' : 'edited'}</span>
      <span className="flex items-center gap-1"><span className="text-[11px] font-bold text-emerald-600">✓</span> {fr ? 'confirmé' : 'confirmed'}</span>
    </div>
  );
}

export default function RegistreGrid(props: Readonly<RegistreGridProps>) {
  const { grille, saisies, language } = props;
  const fr = language === 'fr';
  const multiVisites = grille.rangsParPatient > 1;
  const [toutesColonnes, setToutesColonnes] = useState(false);
  const [replies, setReplies] = useState<Set<string>>(new Set());

  if (grille.colonnes.length === 0) return null;
  if (grille.rangees.length === 0) {
    return <div className="text-gray-500 text-center py-8">{fr ? 'Aucune donnée extraite pour cette page.' : 'No extracted data for this page.'}</div>;
  }

  const colonnes = colonnesVisibles(grille, saisies, toutesColonnes);
  const masquees = grille.colonnes.length - colonnesVisibles(grille, saisies, false).length;
  const groupes = regrouperParSection(colonnes, libellesSections(grille));
  const basculer = (section: string) =>
    setReplies((prev) => {
      const suivant = new Set(prev);
      if (suivant.has(section)) suivant.delete(section);
      else suivant.add(section);
      return suivant;
    });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <LegendeConfiance fr={fr} />
        {masquees > 0 && (
          <button
            type="button"
            onClick={() => setToutesColonnes((v) => !v)}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-50"
          >
            {toutesColonnes ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {toutesColonnes
              ? (fr ? 'Masquer les colonnes vides' : 'Hide empty columns')
              : (fr ? `Afficher les colonnes vides (${masquees})` : `Show empty columns (${masquees})`)}
          </button>
        )}
      </div>

      <ListesModalites colonnes={colonnes} />

      <div className="overflow-auto border border-gray-200 rounded-lg max-h-full" style={{ scrollbarWidth: 'thin' }}>
        <table className="border-collapse text-left">
          <thead className="sticky top-0 z-20">
            {/* En-têtes regroupés par section, repliables. */}
            <tr>
              <th rowSpan={2} className="sticky left-0 z-30 bg-gray-100 border border-gray-200 px-2 py-1 text-[11px] font-bold text-gray-600 min-w-[3rem]">
                N°
              </th>
              {multiVisites && (
                <th rowSpan={2} className="bg-gray-100 border border-gray-200 px-2 py-1 text-[11px] font-bold text-gray-600 whitespace-nowrap">
                  {fr ? 'Visite' : 'Visit'}
                </th>
              )}
              {groupes.map((g) =>
                replies.has(g.section) ? (
                  <th key={g.section} rowSpan={2} className="bg-gray-100 border border-gray-200 p-0 align-bottom">
                    <button
                      type="button"
                      onClick={() => basculer(g.section)}
                      title={fr ? `Déplier « ${g.libelle} »` : `Expand "${g.libelle}"`}
                      className="flex h-full w-full items-center gap-0.5 px-1.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-200"
                    >
                      <ChevronRight className="w-3 h-3 shrink-0" />
                      <span className="max-w-[5rem] truncate">{g.libelle}</span>
                    </button>
                  </th>
                ) : (
                  <th key={g.section} colSpan={g.colonnes.length} className="bg-gray-100 border border-gray-200 p-0">
                    <button
                      type="button"
                      onClick={() => basculer(g.section)}
                      title={fr ? 'Replier la section' : 'Collapse section'}
                      className="flex w-full items-center justify-center gap-1 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-200"
                    >
                      <ChevronDown className="w-3 h-3" />
                      {g.libelle}
                    </button>
                  </th>
                ),
              )}
            </tr>
            <tr>
              {groupes
                .filter((g) => !replies.has(g.section))
                .flatMap((g) => g.colonnes)
                .map((c) => (
                  <th
                    key={c.nom}
                    title={`${c.libelle}${c.unite ? ` (${c.unite})` : ''} — ${c.nom}`}
                    className={`border border-gray-200 px-2 py-1 text-[11px] font-semibold leading-tight align-bottom ${largeurColonne(c)} ${c.is_pii ? 'bg-purple-50 text-purple-700' : 'bg-gray-50 text-gray-600'}`}
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
                  onMouseEnter={() => props.onZone?.({ zone: zoneRangee(r, grille), zoom: false })}
                  onMouseLeave={() => props.onZone?.(null)}
                  onFocus={() => props.onZone?.({ zone: zoneRangee(r, grille), zoom: true })}
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
                  {groupes.map((g) => {
                    if (replies.has(g.section)) {
                      // Section repliée : un point signale une case à vérifier dedans.
                      const alerte = rangeeAVerifier(r, g.colonnes, saisies);
                      return (
                        <td key={g.section} className="border border-gray-200 bg-gray-50 text-center" title={alerte ? (fr ? 'Case à vérifier dans cette section' : 'Cell to check in this section') : undefined}>
                          {alerte && <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />}
                        </td>
                      );
                    }
                    return g.colonnes.map((c) => {
                      // Identité (CPN/CPON) : une cellule fusionnée par patiente.
                      if (c.niveau_patiente && !r.debutPatiente) return null;
                      return (
                        <CelluleEditable
                          key={c.nom}
                          cellule={r.cellules[c.nom]}
                          colonne={c}
                          rowSpan={c.niveau_patiente ? r.taillePatiente : undefined}
                          saisies={saisies}
                          onChangeClinique={props.onChangeClinique}
                          onChangePii={props.onChangePii}
                          language={language}
                        />
                      );
                    });
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
