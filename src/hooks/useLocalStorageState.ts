import { Dispatch, SetStateAction, useEffect, useState } from 'react';

/** Browser-safe local preference state. Intended only for non-sensitive presentation preferences. */
export const useLocalStorageState = <T,>(key: string, fallback: T): [T, Dispatch<SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) as T : fallback;
    } catch { return fallback; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Preference persistence is optional. */ }
  }, [key, value]);
  return [value, setValue];
};
