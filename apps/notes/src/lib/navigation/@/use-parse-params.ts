"use client";

import type { RouteSchemas } from "@beep/notes/lib/navigation/routes";

import { useParams, useSearchParams } from "next/navigation";

export const useParseParams = <
  O extends Record<string, { params?: {} }> & RouteSchemas,
  K extends keyof O,
  P extends O[K]["params"],
>(
  _route: K
) => {
  return useParams() as P extends {} ? P : NonNullable<P>;
};

export const useParseSearchParams = <
  O extends Record<string, { search?: {} }> & RouteSchemas,
  K extends keyof O,
  S extends O[K]["search"],
>(
  _route: K
) => {
  return Object.fromEntries(useSearchParams().entries()) as any as S extends {} ? S : NonNullable<S>;
};
