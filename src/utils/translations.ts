import { en } from './locales/en';
import { fr } from './locales/fr';

export type TranslationKey = keyof typeof en;

export const translations = {
  en,
  fr
};
