import { useState, useEffect } from 'react';
import { useLanguageStore, Language } from '@/store/useLanguageStore';
import { translations } from '@/utils/translations';

export function useTranslation() {
  const storeLanguage = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const language = mounted ? storeLanguage : 'en';

  const t = (key: keyof typeof translations['en'], variables?: Record<string, string | number>) => {
    const langToUse = mounted ? storeLanguage : 'en';
    const translation = translations[langToUse]?.[key] || translations['en']?.[key] || String(key);
    
    if (!variables) return translation;
    
    let result = translation;
    Object.entries(variables).forEach(([k, v]) => {
      result = result.replace(`{${k}}`, String(v));
    });
    
    return result;
  };

  return { language, setLanguage, t };
}
