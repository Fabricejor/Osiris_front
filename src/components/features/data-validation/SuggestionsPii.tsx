"use client";

/**
 * Aide à la saisie d'une donnée personnelle, sous la case en cours de saisie :
 * adresses déjà saisies dans la structure (les plus fréquentes d'abord) et
 * corrections d'orthographe des noms. Les propositions viennent du serveur,
 * qui ne liste jamais les noms des patientes par simple préfixe.
 *
 * Liste maison plutôt qu'une <datalist> : le navigateur filtre une datalist
 * sur le texte tapé, ce qui masquerait les corrections (« Aminatta » →
 * « Aminata » ne contient pas « Aminatta »).
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { PiiCellulesService } from '@/services/pii-cellules.service';

interface SuggestionsPiiProps {
  idPii: string;
  /** Texte de la case (saisie en cours, sinon valeur lue). */
  texte: string;
  /** Afficher (case active et modifiable). */
  visible: boolean;
  onChoisir: (valeur: string) => void;
  language: string;
}

const LIBELLE_SOURCE: Record<string, { fr: string; en: string }> = {
  ORTHOGRAPHE: { fr: 'orthographe', en: 'spelling' },
  DEJA_SAISI: { fr: 'déjà saisi', en: 'already entered' },
};

export default function SuggestionsPii({ idPii, texte, visible, onChoisir, language }: Readonly<SuggestionsPiiProps>) {
  const fr = language === 'fr';
  const q = useDebounce(texte.trim(), 250);
  const { data: suggestions = [] } = useQuery({
    queryKey: ['pii-suggestions', idPii, q],
    queryFn: () => PiiCellulesService.getSuggestions(idPii, q),
    enabled: visible,
    staleTime: 60_000,
  });
  const utiles = suggestions.filter((s) => s.valeur.trim() !== texte.trim());
  if (!visible || utiles.length === 0) return null;

  return (
    <ul
      role="listbox"
      aria-label={fr ? 'Suggestions' : 'Suggestions'}
      className="absolute left-0 top-full z-30 mt-0.5 min-w-full max-w-[22rem] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 text-left shadow-lg"
    >
      {utiles.map((s) => {
        const source = LIBELLE_SOURCE[s.source];
        return (
          <li key={`${s.source}:${s.valeur}`} role="option" aria-selected={false}>
            <button
              type="button"
              // mousedown (et non click) : choisir avant que la case ne perde le focus.
              onMouseDown={(e) => {
                e.preventDefault();
                onChoisir(s.valeur);
              }}
              className="flex w-full items-center justify-between gap-3 px-2.5 py-1.5 text-[13px] text-gray-800 hover:bg-emerald-50"
            >
              <span className="truncate">{s.valeur}</span>
              <span className="shrink-0 text-[10px] font-semibold text-gray-400">
                {source ? (fr ? source.fr : source.en) : s.occurrences > 1 ? `×${s.occurrences}` : ''}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
