"use client";

import { getCookie, setCookie } from "cookies-next/client";
import { useCallback, useState } from "react";

export function useCookieStorage<T>(key: string, initialValue?: undefined | T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const cookieValue = getCookie(key);

      if (cookieValue) {
        return JSON.parse(cookieValue);
      }
    } catch (error) {
      console.warn(`Error reading cookie ${key}:`, error);
    }

    return initialValue;
  });

  const setValue = useCallback(
    (value: Partial<T>, shouldMerge?: undefined | boolean) => {
      setStoredValue((prev) => {
        const newValue = shouldMerge && typeof value === "object" ? { ...prev, ...value } : (value as T);

        // Save to cookies
        void setCookie(key, JSON.stringify(newValue));

        return newValue;
      });
    },
    [key]
  );

  return [storedValue, setValue] as const;
}
