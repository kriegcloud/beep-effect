"use client";

import { routes } from "@beep/notes/lib/navigation/routes";
import { atomWithStorage } from "@beep/notes/lib/storage/atomWithStorage";
import type { AuthUser } from "@beep/notes/server/auth/getAuthUser";
import { createAtomStore } from "jotai-x";

export const { AppProvider, useAppSet, useAppState, useAppStore, useAppValue } = createAtomStore(
  {
    app: atomWithStorage("app", {
      // app: atomWithCookie('app', {
      lastPage: routes.home(),
    }),
    // Only for development
    devCookie: atomWithStorage("devCookie", {}),
    // devCookie: atomWithCookie('devCookie', {}),
    isDynamic: false,
    isStatic: true,
    layout: atomWithStorage("layout", {}),
    // layout: atomWithCookie('layout', {}),
    rightPanel: atomWithStorage(
      // rightPanel: atomWithCookie(
      "rightPanel",
      "comments" as "comments" | "versions"
    ),
    user: null as AuthUser | null,
  },
  {
    effect: AppProviderEffect,
    name: "app",
  }
);

export function AppProviderEffect() {
  return null;
}
