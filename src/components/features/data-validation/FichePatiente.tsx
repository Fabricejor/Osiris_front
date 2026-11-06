"use client";

/**
 * Vue « fiche patiente » : une patiente à la fois.
 * - en-tête : son identité (n° d'ordre, nom, âge, parité… — cellules
 *   fusionnées sur le papier), éditable ;
 * - corps : ses VISITES EN COLONNES (CPN : jusqu'à 4/8, CPON : 3), un champ par
 *   ligne, groupés par section repliable. Comparer les visites côte à côte
 *   fait ressortir les erreurs (ex. 620 kg au lieu de 62).
 * Registres à une ligne par patiente : une seule colonne de valeurs.
 */
import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import {
  CHAMPS_SANS_COLONNE,
  casesAVerifier,
  etatCellule,
  libellesSections,
  messagesAlertes,
  patientesDeGrille,
  regrouperParSection,
  type ColonneGrille,
  type Grille,
  type RangeeGrille,
  type SaisiesValideur,
} from '@/services/validation-mapping';
import CelluleEditable, { ListesModalites } from './CelluleEditable';
import { LegendeConfiance } from './RegistreGrid';

interface FichePatienteProps {
  grille: Grille;
  saisies: SaisiesValideur;
  onChangeClinique: (idDonnee: string, nomChamp: string, valeur: string) => void;
  onChangePii: (idPii: string, valeur: string) => void;
  language: string;
}

/** Champs qui donnent le contexte d'une visite (affichés sous « Visite n »). */
const CHAMPS_PERIODE = ['periode_grossesse', 'periode_cpon'];
const CHAMPS_DATE_VISITE = ['date_consultation', 'date_cpon'];

function valeurDe(visite: RangeeGrille | undefined, nom: string, saisies: SaisiesValideur): string {
  return etatCellule(visite?.cellules[nom], saisies)?.valeur.trim() ?? '';
}

function libelleChampFiche(c: ColonneGrille): string {
  return c.unite ? `${c.libelle} (${c.unite})` : c.libelle;
}

export default function FichePatiente(props: Readonly<FichePatienteProps>) {
  const { grille, saisies, language } = props;
  const fr = language === 'fr';
  const multiVisites = grille.rangsParPatient > 1;
  const [index, setIndex] = useState(0);
  const [champsVides, setChampsVides] = useState(false);
  const [replies, setReplies] = useState<Set<string>>(new Set());

  const patientes = patientesDeGrille(grille);
  if (grille.colonnes.length === 0) return null;
  if (patientes.length === 0) {
    return <div className="text-gray-500 text-center py-8">{fr ? 'Aucune donnée extraite pour cette page.' : 'No extracted data for this page.'}</div>;
  }

  const i = Math.min(index, patientes.length - 1);
  const patiente = patientes[i];
  const visites = [...patiente.visites].sort((a, b) => a.rang - b.rang);
  const premiere = visites[0];

  // En-tête = identité : champs « une fois par patiente » (CPN/CPON) ou, sur
  // les registres à une ligne, n° d'ordre + données personnelles.
  const dansEntete = (c: ColonneGrille) =>
    multiVisites ? c.niveau_patiente : c.is_pii || c.nom === 'numero_ordre';
  const colonnesEntete = grille.colonnes.filter((c) => dansEntete(c) && !CHAMPS_SANS_COLONNE.has(c.nom));

  const remplie = (c: ColonneGrille) =>
    visites.some((v) => {
      const e = etatCellule(v.cellules[c.nom], saisies);
      return !!e && (e.valeur.trim() !== '' || e.valeurOrigine.trim() !== '');
    });
  const colonnesCorps = grille.colonnes.filter((c) => !dansEntete(c) && !CHAMPS_SANS_COLONNE.has(c.nom));
  const colonnesAffichees = champsVides ? colonnesCorps : colonnesCorps.filter(remplie);
  const nbMasques = colonnesCorps.length - colonnesCorps.filter(remplie).length;
  const groupes = regrouperParSection(colonnesAffichees, libellesSections(grille));

  const nom = (p: (typeof patientes)[number]) =>
    valeurDe([...p.visites].sort((a, b) => a.rang - b.rang)[0], 'nom', saisies);
  const aVerifier = casesAVerifier(patiente, grille.colonnes, saisies);
  const basculer = (section: string) =>
    setReplies((prev) => {
      const suivant = new Set(prev);
      if (suivant.has(section)) suivant.delete(section);
      else suivant.add(section);
      return suivant;
    });
  const colSpan = visites.length + 1;
  const alertesPatiente = visites
    .filter((v) => v.donnee && !v.donnee.valide)
    .flatMap((v) => messagesAlertes(v.donnee!));

  return (
    <div className="flex flex-col gap-3">
      <ListesModalites colonnes={grille.colonnes} />

      {/* Navigation entre patientes */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIndex(Math.max(0, i - 1))}
            disabled={i === 0}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> {fr ? 'Précédente' : 'Previous'}
          </button>
          <select
            value={i}
            onChange={(e) => setIndex(Number(e.target.value))}
            aria-label={fr ? 'Choisir la patiente' : 'Choose patient'}
            className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700"
          >
            {patientes.map((p, k) => {
              const n = casesAVerifier(p, grille.colonnes, saisies);
              const libelle = nom(p);
              return (
                <option key={p.numeroOrdre} value={k}>
                  {`N° ${p.numeroOrdre}${libelle ? ` · ${libelle}` : ''}${n ? ` · ${n} ${fr ? 'à vérifier' : 'to check'}` : ''}`}
                </option>
              );
            })}
          </select>
          <button
            type="button"
            onClick={() => setIndex(Math.min(patientes.length - 1, i + 1))}
            disabled={i === patientes.length - 1}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            {fr ? 'Suivante' : 'Next'} <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500">{i + 1} / {patientes.length}</span>
        </div>
        <LegendeConfiance fr={fr} />
      </div>

      {/* Identité */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-gray-800">
            {fr ? 'Patiente' : 'Patient'} N° {patiente.numeroOrdre}
          </h4>
          <div className="flex items-center gap-2 text-[11px]">
            {aVerifier > 0 ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800">
                {aVerifier} {fr ? 'case(s) à vérifier' : 'cell(s) to check'}
              </span>
            ) : (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                {fr ? 'Rien à signaler' : 'Nothing to flag'}
              </span>
            )}
            {multiVisites && (
              <span className="text-gray-500">
                {visites.filter((v) => v.donnee?.valide).length}/{visites.length} {fr ? 'visite(s) validée(s)' : 'visit(s) validated'}
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-3 xl:grid-cols-4">
          {colonnesEntete.map((c) => (
            <div key={c.nom} className="min-w-0">
              <div className={`mb-0.5 truncate text-[11px] font-semibold ${c.is_pii ? 'text-purple-700' : 'text-gray-500'}`} title={c.nom}>
                {libelleChampFiche(c)}
              </div>
              <div className="rounded bg-white">
                <CelluleEditable
                  as="div"
                  cellule={premiere.cellules[c.nom]}
                  colonne={c}
                  saisies={saisies}
                  onChangeClinique={props.onChangeClinique}
                  onChangePii={props.onChangePii}
                  language={language}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {alertesPatiente.length > 0 && (
        <ul className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-[12px] text-red-800 space-y-0.5">
          {[...new Set(alertesPatiente)].map((m) => (
            <li key={m}>⚠ {m}</li>
          ))}
        </ul>
      )}

      {/* Visites en colonnes */}
      <div className="overflow-auto rounded-xl border border-gray-200" style={{ scrollbarWidth: 'thin' }}>
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-gray-100">
            <tr>
              <th className="sticky left-0 z-20 w-48 min-w-[11rem] border border-gray-200 bg-gray-100 px-2 py-1.5 text-[11px] font-bold text-gray-600">
                {fr ? 'Champ' : 'Field'}
              </th>
              {visites.map((v) => {
                const periode = CHAMPS_PERIODE.map((n) => valeurDe(v, n, saisies)).find(Boolean);
                const date = CHAMPS_DATE_VISITE.map((n) => valeurDe(v, n, saisies)).find(Boolean);
                const etat = v.donnee?.valide ? (v.donnee.categorie_rejet ? 'rejetée' : 'validée') : null;
                return (
                  <th key={v.rang} className="border border-gray-200 px-2 py-1.5 align-bottom text-[11px] text-gray-700">
                    <div className="font-bold">
                      {multiVisites ? `${fr ? 'Visite' : 'Visit'} ${v.rang}` : (fr ? 'Valeur' : 'Value')}
                      {etat && <span className="ml-1 text-blue-600" title={`Ligne ${etat}`}>✓</span>}
                    </div>
                    {(periode || date) && (
                      <div className="font-normal text-gray-500">{[periode, date].filter(Boolean).join(' · ')}</div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {groupes.map((g) => {
              const replie = replies.has(g.section);
              const nAlertes = visites.reduce(
                (n, v) => n + g.colonnes.filter((c) => etatCellule(v.cellules[c.nom], saisies)?.aVerifier).length,
                0,
              );
              return (
                <React.Fragment key={g.section}>
                  <tr>
                    <td colSpan={colSpan} className="border border-gray-200 bg-gray-50 p-0">
                      <button
                        type="button"
                        onClick={() => basculer(g.section)}
                        className="flex w-full items-center gap-1 px-2 py-1 text-left text-[11px] font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-100"
                      >
                        {replie ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {g.libelle}
                        <span className="ml-1 font-normal normal-case tracking-normal text-gray-400">
                          ({g.colonnes.length} {fr ? 'champ(s)' : 'field(s)'})
                        </span>
                        {nAlertes > 0 && (
                          <span className="ml-auto rounded-full bg-amber-100 px-1.5 text-[10px] normal-case tracking-normal text-amber-800">
                            {nAlertes} {fr ? 'à vérifier' : 'to check'}
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                  {!replie &&
                    g.colonnes.map((c) => (
                      <tr key={c.nom}>
                        <th
                          scope="row"
                          title={c.nom}
                          className="sticky left-0 z-[5] border border-gray-200 bg-white px-2 py-1 text-[12px] font-medium text-gray-700"
                        >
                          {libelleChampFiche(c)}
                        </th>
                        {visites.map((v) => (
                          <CelluleEditable
                            key={v.rang}
                            cellule={v.cellules[c.nom]}
                            colonne={c}
                            saisies={saisies}
                            onChangeClinique={props.onChangeClinique}
                            onChangePii={props.onChangePii}
                            language={language}
                          />
                        ))}
                      </tr>
                    ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {nbMasques > 0 && (
        <button
          type="button"
          onClick={() => setChampsVides((v) => !v)}
          className="inline-flex items-center gap-1 self-start text-[11px] font-semibold text-gray-500 hover:text-gray-700"
        >
          {champsVides ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {champsVides
            ? (fr ? 'Masquer les champs vides' : 'Hide empty fields')
            : (fr ? `${nbMasques} champ(s) vide(s) masqué(s) — afficher` : `${nbMasques} empty field(s) hidden — show`)}
        </button>
      )}
    </div>
  );
}
