import { useLanguageStore } from '@/store/useLanguageStore';

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = useLanguageStore((state) => state.t);

  return { language, setLanguage, t };
}
