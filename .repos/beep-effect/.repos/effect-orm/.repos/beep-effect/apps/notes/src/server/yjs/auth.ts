import type { IncomingHttpHeaders } from "node:http";
import { CookieNames } from "@beep/notes/lib/storage/cookies";
import type { AuthUser } from "@beep/notes/server/auth/getAuthUser";
import { getAuthUser } from "@beep/notes/server/auth/getAuthUser";
import type { AuthSession } from "@beep/notes/server/auth/lucia";
import { validateSessionToken } from "@beep/notes/server/auth/lucia";
import { SESSION_COOKIE_NAME } from "@beep/notes/server/auth/session-cookie";

type ParsedCookies = Record<string, string>;

const decode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const parseCookies = (header?: undefined | string): ParsedCookies => {
  if (!header) return {};

  return header.split(";").reduce<ParsedCookies>((acc, cookie) => {
    const [nameRaw, ...valueParts] = cookie.split("=");

    if (!nameRaw) return acc;

    const name = nameRaw.trim();

    if (!name) return acc;

    const value = valueParts.join("=").trim();
    acc[name] = decode(value);

    return acc;
  }, {});
};

export const authenticateFromHeaders = async (
  headers: IncomingHttpHeaders
): Promise<{
  session: AuthSession | null;
  user: AuthUser | null;
}> => {
  const cookies = parseCookies(headers.cookie);
  const sessionToken = cookies[SESSION_COOKIE_NAME];
  const devUser = cookies[CookieNames.devUser];

  if (!sessionToken) {
    return { session: null, user: null };
  }

  const { session, user } = await validateSessionToken(sessionToken);

  if (!session || !user) {
    return { session: null, user: null };
  }

  return {
    session,
    user: getAuthUser(user, devUser),
  };
};
