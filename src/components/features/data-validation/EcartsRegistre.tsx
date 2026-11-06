"use client";

/**
 * Signale au valideur une page qui ne ressemble pas au registre de référence
 * (registres terrain : colonnes dans un autre ordre, libellés différents,
 * colonnes en plus) et liste les valeurs lues qu'on n'a pas pu rattacher à un
 * champ — à recopier dans la bonne case si besoin.
 */
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { ControleEntetes } from '@/services/sessions.service';

export interface LigneNonRattachee {
  numeroOrdre: number;
  rang: number;
  valeurs: Record<string, string>;
}

interface EcartsRegistreProps {
  controle: ControleEntetes | null;
  lignesNonRattachees: LigneNonRattachee[];
  libelleChamp: (nom: string) => string;
  multiVisites: boolean;
  language: string;
}

export default function EcartsRegistre({
  controle,
  lignesNonRattachees,
  libelleChamp,
  multiVisites,
  language,
}: Readonly<EcartsRegistreProps>) {
  const fr = language === 'fr';
  const inconnues = controle?.colonnes_inconnues ?? [];
  const ordreDifferent = controle?.ordre_different ?? false;
  const absents = controle?.champs_absents ?? [];

  if (!ordreDifferent && inconnues.length === 0 && lignesNonRattachees.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 space-y-2">
      <div className="flex items-center gap-2 font-bold">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        {fr
          ? 'Cette page diffère du registre de référence : vérifiez les colonnes concernées.'
          : 'This page differs from the reference register: check the affected columns.'}
      </div>
      <ul className="list-disc ml-6 space-y-1">
        {ordreDifferent && (
          <li>
            {fr
              ? "Colonnes dans un ordre différent : vérifiez que chaque valeur est dans la bonne case."
              : 'Columns in a different order: check each value is in the right cell.'}
          </li>
        )}
        {inconnues.length > 0 && (
          <li>
            {fr ? 'Colonnes non reconnues : ' : 'Unrecognised columns: '}
            <span className="font-semibold">{inconnues.join(', ')}</span>
          </li>
        )}
        {(ordreDifferent || inconnues.length > 0) && absents.length > 0 && (
          <li className="text-amber-800/80">
            {fr ? 'Colonnes attendues non trouvées : ' : 'Expected columns not found: '}
            {absents.map(libelleChamp).join(', ')}
          </li>
        )}
      </ul>
      {lignesNonRattachees.length > 0 && (
        <div>
          <p className="font-semibold mb-1">
            {fr
              ? 'Valeurs lues sans colonne correspondante (à recopier dans la bonne case si besoin) :'
              : 'Values read without a matching column (copy into the right cell if needed):'}
          </p>
          <ul className="ml-6 space-y-0.5">
            {lignesNonRattachees.map((l) => (
              <li key={`${l.numeroOrdre}:${l.rang}`}>
                <span className="font-semibold">
                  {fr ? 'Ligne' : 'Row'} {l.numeroOrdre}
                  {multiVisites ? ` · ${fr ? 'visite' : 'visit'} ${l.rang}` : ''}
                </span>{' '}
                — {Object.entries(l.valeurs).map(([cle, valeur]) => `${cle} : ${valeur}`).join(' · ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
