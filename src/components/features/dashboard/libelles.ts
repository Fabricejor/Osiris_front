import type { TranslationKey } from '@/utils/translations';

/** Tranches de confiance OCR renvoyées par le backend (`code`) → libellé traduit. */
export const TRANCHES_CONFIANCE: Record<string, TranslationKey> = {
  HIGH: 'ocr_band_high',
  MEDIUM: 'ocr_band_medium',
  LOW: 'ocr_band_low',
};

/** Statuts de traitement d'une page, dans l'ordre du circuit → libellé traduit. */
export const STATUTS_TRAITEMENT: [string, TranslationKey][] = [
  ['RECU', 'statut_recu'],
  ['EN_TRAITEMENT', 'statut_en_traitement'],
  ['A_VALIDER', 'statut_a_valider'],
  ['VALIDE', 'statut_valide'],
  ['REJETEE', 'statut_rejetee'],
  ['FUSION_INCOMPLETE', 'statut_anomalie'],
  ['ECHEC_RECALAGE', 'statut_echec_recalage'],
  ['ECHEC_OCR', 'statut_echec_ocr'],
];
