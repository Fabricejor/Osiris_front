import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations } from '@/utils/translations';

export type Language = 'en' | 'fr';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en'], variables?: Record<string, string | number>) => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en', // English by default
      setLanguage: (language) => set({ language }),
      t: (key, variables) => {
        const lang = get().language;
        const translation = translations[lang]?.[key] || translations['en']?.[key] || String(key);
        
        if (!variables) return translation;
        
        let result = translation;
        Object.entries(variables).forEach(([k, v]) => {
          result = result.replace(`{${k}}`, String(v));
        });
        
        return result;
      },
    }),
    {
      name: 'osiris-language-storage',
    }
  )
);

