"use client";

import type { Nullable } from "@beep/notes/lib/Nullable";
import type { AuthUser } from "@beep/notes/server/auth/getAuthUser";
import type { AuthSession } from "@beep/notes/server/auth/lucia";
import { createAtomStore } from "jotai-x";
import { useEffect } from "react";

export type AuthStore = {
  session: AuthSession | null;
  user: AuthUser | null;
};

const initialState: Nullable<AuthStore> = {
  session: null,
  user: null,
};

function SentryUserManager() {
  const user = useAuthValue("user");

  useEffect(() => {
    // setSentryUser(user);
  }, [user]);

  return null;
}

export const { AuthProvider, useAuthStore, useAuthValue } = createAtomStore(initialState as AuthStore, {
  effect: SentryUserManager,
  name: "auth",
});

export const AuthProviderClient = AuthProvider;
