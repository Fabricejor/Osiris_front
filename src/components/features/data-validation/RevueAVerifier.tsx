"use client";

/**
 * Mode « À vérifier » : les cases douteuses de la page, une par une.
 * - case : score faible / moyen / inconnu, ou alerte de cohérence ;
 * - Entrée = confirmer la valeur (corrigée ou non) et passer à la suivante ;
 * - les autres visites de la patiente sont rappelées pour comparer ;
 * - la photo est cadrée sur la ligne concernée (si l'OCR a fourni sa position).
 * Une case confirmée n'est plus « à vérifier » dans les autres vues.
 */
import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, SkipForward } from 'lucide-react';
import {
  elementsAVerifier,
  etatCellule,
  libellesSections,
  zoneRangee,
  type DemandeZone,
  type ElementAVerifier,
  type Grille,
  type SaisiesValideur,
} from '@/services/validation-mapping';
import CelluleEditable, { libelleRaison, ListesModalites } from './CelluleEditable';

interface RevueAVerifierProps {
  grille: Grille;
  saisies: SaisiesValideur;
  onChangeClinique: (idDonnee: string, nomChamp: string, valeur: string) => void;
  onChangePii: (idPii: string, valeur: string) => void;
  /** Marque la case comme vue et confirmée par le valideur. */
  onConfirmer: (cle: string) => void;
  language: string;
  onZone?: (demande: DemandeZone | null) => void;
}

function raisons(element: ElementAVerifier, fr: boolean): string[] {
  // État d'origine (sans saisies) : la raison ne disparaît pas pendant la frappe.
  const etat = etatCellule(element.rangee.cellules[element.colonne.nom], { cliniques: {}, pii: {} });
  if (!etat) return [];
  const liste = etat.alertes.map((a) => `⚠ ${a}`);
  if (etat.scoreInconnu) liste.push(fr ? "Valeur lue sans score de confiance" : 'Value read without a confidence score');
  else if (etat.confiance !== null && etat.niveau !== 'haute') {
    liste.push(`${fr ? 'Confiance de lecture' : 'Reading confidence'} : ${etat.confiance} %`);
  }
  for (const r of etat.raisons) {
    const libelle = libelleRaison(r, fr);
    if (libelle) liste.push(libelle);
  }
  return liste;
}

export default function RevueAVerifier(props: Readonly<RevueAVerifierProps>) {
  const { grille, saisies, language, onZone } = props;
  const fr = language === 'fr';
  const elements = elementsAVerifier(grille);
  const [index, setIndex] = useState(0);
  const zoneSaisie = useRef<HTMLDivElement>(null);

  const traite = (e: ElementAVerifier) => !etatCellule(e.rangee.cellules[e.colonne.nom], saisies)?.aVerifier;
  const nbTraites = elements.filter(traite).length;
  const i = Math.min(index, Math.max(0, elements.length - 1));
  const element = elements[i];

  const zone = element ? zoneRangee(element.rangee, grille) : null;
  const cleZone = zone?.join(',') ?? '';
  // Nouvelle case : la photo est cadrée sur sa ligne, la saisie prend le focus.
  useEffect(() => {
    if (cleZone) onZone?.({ zone: cleZone.split(',').map(Number) as DemandeZone['zone'], zoom: true });
  }, [cleZone, onZone]);
  useEffect(() => {
    zoneSaisie.current?.querySelector<HTMLInputElement | HTMLSelectElement>('input, select')?.focus();
  }, [element?.cle]);

  if (elements.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center text-emerald-800">
        <CheckCircle2 className="h-8 w-8" />
        <p className="font-bold">{fr ? 'Aucune case douteuse sur cette page.' : 'No doubtful cell on this page.'}</p>
        <p className="text-sm">{fr ? 'Vérifiez rapidement la vue Registre, puis validez.' : 'Have a quick look at the Register view, then validate.'}</p>
      </div>
    );
  }

  /** Prochaine case non traitée après `depuis` (en bouclant), sinon -1. */
  const suivanteNonTraitee = (depuis: number, saufCle?: string): number => {
    for (let k = 1; k <= elements.length; k++) {
      const j = (depuis + k) % elements.length;
      if (elements[j].cle !== saufCle && !traite(elements[j])) return j;
    }
    return -1;
  };

  const confirmer = () => {
    props.onConfirmer(element.cle);
    const j = suivanteNonTraitee(i, element.cle);
    setIndex(j === -1 ? i : j);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || e.target instanceof HTMLButtonElement) return;
    e.preventDefault();
    confirmer();
  };

  const toutTraite = nbTraites === elements.length;
  const { patiente, rangee, colonne } = element;
  const multiVisites = grille.rangsParPatient > 1;
  const section = libellesSections(grille).get(colonne.section) ?? colonne.section;
  const autresVisites =
    multiVisites && !colonne.niveau_patiente
      ? [...patiente.visites].sort((a, b) => a.rang - b.rang)
      : [];
  const etatCourant = etatCellule(rangee.cellules[colonne.nom], saisies);

  return (
    <div className="flex flex-col gap-4" onKeyDown={onKeyDown}>
      <ListesModalites colonnes={[colonne]} />

      {/* Progression */}
      <div>
        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-600">
          <span>
            {fr ? 'Case' : 'Cell'} {i + 1} / {elements.length}
          </span>
          <span>
            {nbTraites} / {elements.length} {fr ? 'traitée(s)' : 'done'}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full bg-[#65b741] transition-all" style={{ width: `${(nbTraites / elements.length) * 100}%` }} />
        </div>
      </div>

      {toutTraite && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {fr
            ? 'Toutes les cases douteuses ont été traitées. Vous pouvez valider la page.'
            : 'All doubtful cells have been handled. You can validate the page.'}
        </div>
      )}

      {/* Case courante */}
      <div className="rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="text-xs font-semibold text-gray-500">
          {fr ? 'Patiente' : 'Patient'} N° {patiente.numeroOrdre}
          {multiVisites && !colonne.niveau_patiente && ` · ${fr ? 'Visite' : 'Visit'} ${rangee.rang}`}
          {` · ${section}`}
        </div>
        <h3 className={`mt-0.5 text-lg font-bold ${colonne.is_pii ? 'text-purple-700' : 'text-gray-900'}`}>
          {colonne.libelle}
          {colonne.unite && <span className="ml-1 text-sm font-normal text-gray-500">({colonne.unite})</span>}
        </h3>

        <ul className="mt-2 space-y-0.5 text-[13px]">
          {raisons(element, fr).map((r) => (
            <li key={r} className={r.startsWith('⚠') ? 'text-red-700' : 'text-amber-700'}>
              {r}
            </li>
          ))}
        </ul>

        <div ref={zoneSaisie} className="mt-4">
          <CelluleEditable
            as="div"
            grande
            cellule={rangee.cellules[colonne.nom]}
            colonne={colonne}
            saisies={saisies}
            onChangeClinique={props.onChangeClinique}
            onChangePii={props.onChangePii}
            language={language}
          />
          <p className="mt-1 text-[11px] text-gray-400">
            {etatCourant?.modifie
              ? (fr ? `Valeur lue : « ${etatCourant.valeurOrigine || '—'} »` : `Value read: "${etatCourant.valeurOrigine || '—'}"`)
              : (fr ? 'Corrigez si besoin d’après la photo, puis Entrée.' : 'Correct it from the photo if needed, then press Enter.')}
          </p>
        </div>

        {/* Comparaison avec les autres visites (ex. poids 58 / 60 / 620). */}
        {autresVisites.length > 1 && (
          <div className="mt-4">
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              {fr ? 'Autres visites' : 'Other visits'}
            </div>
            <div className="flex flex-wrap gap-2">
              {autresVisites.map((v) => {
                const valeur = etatCellule(v.cellules[colonne.nom], saisies)?.valeur.trim() || '—';
                const courante = v.rang === rangee.rang;
                return (
                  <span
                    key={v.rang}
                    className={`rounded-lg border px-2.5 py-1 text-[13px] ${courante ? 'border-amber-300 bg-amber-50 font-bold text-amber-900' : 'border-gray-200 bg-gray-50 text-gray-700'}`}
                  >
                    <span className="mr-1 text-[11px] font-semibold text-gray-400">V{v.rang}</span>
                    {valeur}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIndex(Math.max(0, i - 1))}
            disabled={i === 0}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> {fr ? 'Précédente' : 'Previous'}
          </button>
          <button
            type="button"
            onClick={() => setIndex(Math.min(elements.length - 1, i + 1))}
            disabled={i === elements.length - 1}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <SkipForward className="h-4 w-4" /> {fr ? 'Passer' : 'Skip'}
          </button>
          <button
            type="button"
            onClick={confirmer}
            disabled={etatCourant?.verrouillee}
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-[#65b741] px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#58a337] disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {etatCourant?.modifie ? (fr ? 'Garder ma correction' : 'Keep my correction') : (fr ? 'Confirmer' : 'Confirm')}
            <kbd className="ml-1 rounded border border-white/40 px-1 text-[10px] font-semibold">⏎</kbd>
          </button>
        </div>
      </div>

      {/* Liste compacte : accès direct à une case. */}
      <div className="flex flex-wrap gap-1">
        {elements.map((e, k) => (
          <button
            key={e.cle}
            type="button"
            onClick={() => setIndex(k)}
            title={`N° ${e.patiente.numeroOrdre}${multiVisites && !e.colonne.niveau_patiente ? ` · V${e.rangee.rang}` : ''} · ${e.colonne.libelle}`}
            className={`h-6 min-w-6 rounded px-1 text-[10px] font-bold ${k === i ? 'ring-2 ring-gray-800' : ''} ${traite(e) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}
          >
            {k + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
