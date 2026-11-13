"use client";

/**
 * Problèmes de la photo mesurés à l'envoi (flou, bougé, sombre, reflet…).
 * Une photo refusée n'arrive jamais ici : ce sont les avertissements, ou une
 * photo envoyée malgré le refus (« envoyer quand même »). Utile au valideur
 * pour comprendre une lecture OCR faible, et à l'admin pour former les agents.
 */
import React from 'react';
import { Camera } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/utils/translations';

const LIBELLES: Record<string, TranslationKey> = {
  ILLISIBLE: 'photo_illisible',
  TROP_PETITE: 'photo_trop_petite',
  FLOUE: 'photo_floue',
  BOUGEE: 'photo_bougee',
  TROP_SOMBRE: 'photo_trop_sombre',
  SUREXPOSEE: 'photo_surexposee',
  PEU_CONTRASTEE: 'photo_peu_contrastee',
};

export default function AlertePhoto({ problemes, className = '' }: Readonly<{ problemes: string[]; className?: string }>) {
  const { t } = useTranslation();
  if (problemes.length === 0) return null;
  const textes = problemes.map((p) => (LIBELLES[p] ? t(LIBELLES[p]) : p));
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium leading-snug text-amber-700 ${className}`}
      title={t('photo_alerte_titre')}
    >
      <Camera className="h-3 w-3 shrink-0" />
      {textes.join(', ')}
    </span>
  );
}
