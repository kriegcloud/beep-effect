"use client";

import type { RouteSchemas } from "@beep/notes/lib/navigation/routes";

import { useParams } from "next/navigation";

export const useParseParams = <
  O extends Record<string, { params?: undefined | {} }> & RouteSchemas,
  K extends keyof O,
  P extends O[K]["params"],
>(
  _route: K
) => {
  return useParams() as P extends {} ? P : NonNullable<P>;
};
