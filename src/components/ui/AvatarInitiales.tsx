/**
 * Avatar à initiales, rendu localement.
 *
 * Remplace ui-avatars.com : l'URL de ce service contenait le nom de
 * l'utilisateur, envoyé à un tiers à chaque affichage (fuite de données
 * personnelles, dépendance externe).
 */
import React from 'react';

const COULEURS = [
  'bg-emerald-100 text-emerald-800',
  'bg-sky-100 text-sky-800',
  'bg-amber-100 text-amber-800',
  'bg-violet-100 text-violet-800',
  'bg-rose-100 text-rose-800',
  'bg-teal-100 text-teal-800',
];

/** Deux initiales max : « Awa Diop » → « AD », « admin@x.sn » → « A ». */
export function initiales(nom: string): string {
  const mots = nom.split(/[\s@._-]+/).filter(Boolean);
  if (mots.length === 0) return '?';
  const lettres = mots.length > 1 ? [mots[0][0], mots[1][0]] : [mots[0][0]];
  return lettres.join('').toUpperCase();
}

/** Couleur stable dérivée du nom (même personne → même couleur). */
function couleur(nom: string): string {
  let h = 0;
  for (const c of nom) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return COULEURS[h % COULEURS.length];
}

interface AvatarInitialesProps {
  nom: string;
  /** Image fournie par le compte (ex. Keycloak) : affichée si présente. */
  src?: string | null;
  className?: string;
}

export default function AvatarInitiales({ nom, src, className = 'w-8 h-8 text-xs' }: Readonly<AvatarInitialesProps>) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URL d'avatar du compte, domaine variable
      <img src={src} alt={nom} className={`${className} rounded-full object-cover`} />
    );
  }
  return (
    <span
      aria-label={nom}
      title={nom}
      className={`${className} ${couleur(nom)} inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold`}
    >
      {initiales(nom)}
    </span>
  );
}
