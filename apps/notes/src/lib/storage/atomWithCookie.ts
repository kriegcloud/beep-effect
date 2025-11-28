import { atomWithStorage } from "@beep/notes/lib/storage/atomWithStorage";
import { deleteCookie, getCookie, setCookie } from "cookies-next/client";
import { createJSONStorage } from "jotai/vanilla/utils";

/**
 * NOTE: don't store secrets here.
 * https://github.com/andreizanik/cookies-next/issues/44#issuecomment-1696663466
 */
export const atomWithCookie = <T>(key: string, initialValue: T) => {
  return atomWithStorage(
    key,
    initialValue,
    createJSONStorage(() => {
      return {
        getItem: () => {
          return getCookie(key) ?? null;
        },
        removeItem: (key) => {
          void deleteCookie(key);
        },
        setItem: (key, value) => {
          void setCookie(key, value);
        },
      };
    })
  );
};
