import { useEffect, useState } from "react";

/** Renvoie `value` seulement après `delayMs` sans changement (ex. saisie de recherche → 1 requête). */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
