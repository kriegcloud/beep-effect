import { CookieNames } from "@beep/notes/lib/storage/cookies";
import { type AuthUser, getAuthUser } from "@beep/notes/server/auth/getAuthUser";
import { type AuthSession, validateSessionToken } from "@beep/notes/server/auth/lucia";
import { SESSION_COOKIE_NAME } from "@beep/notes/server/auth/session-cookie";
import type { UnsafeTypes } from "@beep/types";
import { cookies } from "next/headers";
import { cache } from "react";

export const auth = cache(
  async (): Promise<{
    readonly session: AuthSession | null;
    readonly user: AuthUser | null;
  }> => {
    const c = await cookies();

    const sessionToken = c.get(SESSION_COOKIE_NAME)?.value ?? null;
    const devUser = c.get(CookieNames.devUser)?.value;

    if (!sessionToken) {
      return { session: null, user: null };
    }

    const { session, user } = await validateSessionToken(sessionToken);

    return {
      session,
      user: getAuthUser(user, devUser),
    };
  }
);

export const isAuth = async () => {
  const { session } = await auth();

  return !!session;
};

export const isNotAuth = async () => {
  const { session } = await auth();

  return !session;
};

export const authOnly = async <T extends (...args: UnsafeTypes.UnsafeAny) => UnsafeTypes.UnsafeAny>(callback: T) => {
  if (await isAuth()) {
    return callback();
  }
};
