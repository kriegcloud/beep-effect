import type { UnsafeTypes } from "@beep/types";
import * as Str from "effect/String";
import type { AuthLocalization } from "./auth-localization";

type GetLocalizedErrorParams = {
  readonly error: UnsafeTypes.UnsafeAny;
  readonly localization?: undefined | Partial<AuthLocalization>;
};
export const getLocalizedError = ({ error, localization }: GetLocalizedErrorParams) => {
  if (Str.isString(error)) {
    if (localization?.[error as keyof AuthLocalization]) return localization[error as keyof AuthLocalization];
  }

  if (error?.error) {
    if (error.error.code) {
      const errorCode = error.error.code as keyof AuthLocalization;
      if (localization?.[errorCode]) return localization[errorCode];
    }

    return error.error.message || error.error.code || error.error.statusText || localization?.REQUEST_FAILED;
  }

  return error?.message || localization?.REQUEST_FAILED || "Request failed";
};

export function getViewByPath<T extends object>(viewPaths: T, path?: string | undefined) {
  for (const key in viewPaths) {
    if (viewPaths[key] === path) {
      return key;
    }
  }
}

export function getSearchParam(paramName: string) {
  return typeof window !== "undefined" ? new URLSearchParams(window.location.search).get(paramName) : null;
}
