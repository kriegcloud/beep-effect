"use client";

import { CookieNames } from "@beep/notes/lib/storage/cookies";
import { atomWithStorage } from "jotai/utils";
import { createAtomStore } from "jotai-x";

export const { DevProvider, useDevState } = createAtomStore(
  {
    summary: atomWithStorage("devSummary", ""),
    user: atomWithStorage(CookieNames.devUser, {
      // user: atomWithCookie(CookieNames.devUser, {
      plan: "default",
      role: "default",
    }),
    wait: atomWithStorage(CookieNames.devWait, 0),
    // wait: atomWithCookie(CookieNames.devWait, 0),
    waitAppLayout: atomWithStorage(CookieNames.devWaitAppLayout, 0),
    // waitAppLayout: atomWithCookie(CookieNames.devWaitAppLayout, 0),
  },
  { name: "dev" }
);
