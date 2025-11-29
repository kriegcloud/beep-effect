import type { UserRole } from "@beep/notes/generated/prisma/client";
import { CookieNames } from "@beep/notes/lib/storage/cookies";
import { type AuthUser, getAuthUser } from "@beep/notes/server/auth/getAuthUser";
import type { AuthSession } from "@beep/notes/server/auth/lucia";
import { validateSessionToken } from "@beep/notes/server/auth/lucia";
import { SESSION_COOKIE_NAME } from "@beep/notes/server/auth/session-cookie";
import type { RatelimitKey } from "@beep/notes/server/ratelimit";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

import { ratelimitMiddleware } from "./ratelimit-middleware";
import { roleMiddleware } from "./role-middleware";

export type BaseRequest = {
  readonly cookies: Record<string, string>;
  // headers: Headers;
};

export type ProtectedContext = {
  readonly Variables: {
    readonly session: AuthSession;
    readonly user: AuthUser;
    readonly userId: string;
  } & BaseRequest;
};

export type PublicContext = {
  readonly Variables: {
    readonly session: AuthSession | null;
    readonly user: AuthUser | null;
    readonly userId: string | null;
  } & BaseRequest;
};

const authMiddleware = createMiddleware<PublicContext>(async (c, next) => {
  const sessionToken = getCookie(c, SESSION_COOKIE_NAME);
  const devUser = getCookie(c, CookieNames.devUser);

  const baseRequest: BaseRequest = {
    cookies: getCookie(c),
    // headers: c.req.raw.headers,
  };

  c.set("cookies", baseRequest.cookies);
  // c.set('headers', baseRequest.headers);
  c.set("session", null);
  c.set("user", null);
  c.set("userId", null);

  if (sessionToken) {
    const { session, user } = await validateSessionToken(sessionToken);

    if (session && user) {
      c.set("session", session);
      c.set("user", getAuthUser(user, devUser));
      c.set("userId", user.id);
    }
  }

  await next();
});

export const publicMiddlewares = ({ ratelimitKey }: { ratelimitKey?: undefined | RatelimitKey } = {}) =>
  [authMiddleware, ratelimitMiddleware(ratelimitKey)] as const;

export const protectedMiddlewares = ({
  ratelimitKey,
  role,
}: {
  ratelimitKey?: undefined | RatelimitKey;
  role?: UserRole;
} = {}) =>
  [
    authMiddleware,
    createMiddleware<ProtectedContext>(async (c, next) => {
      // Check session and user
      const session = c.get("session");
      const user = c.get("user");

      if (!session || !user) {
        return c.redirect("/login");
      }
      // CSRF protection for non-GET requests
      if (c.req.method !== "GET") {
        const originHeader = c.req.header("Origin");
        const hostHeader = c.req.header("Host");

        if (!originHeader || !hostHeader) {
          return c.redirect("/login");
        }

        let origin: URL;

        try {
          origin = new URL(originHeader);
        } catch {
          return c.redirect("/login");
        }

        if (origin.host !== hostHeader) {
          return c.redirect("/login");
        }
      }

      return next();
    }),
    ratelimitMiddleware(ratelimitKey),
    roleMiddleware(role),
  ] as const;
