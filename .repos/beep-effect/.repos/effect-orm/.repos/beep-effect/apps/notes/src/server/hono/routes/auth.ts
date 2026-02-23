import { env } from "@beep/notes/env";
import { generateRandomToken } from "@beep/notes/server/auth/crypto";
import { authProviders, createSession, invalidateSession } from "@beep/notes/server/auth/lucia";
import { createBlankSessionCookie, createSessionCookie } from "@beep/notes/server/auth/session-cookie";
import { zValidator } from "@hono/zod-validator";
import { generateCodeVerifier, generateState, OAuth2RequestError } from "arctic";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { z } from "zod";

import { protectedMiddlewares, publicMiddlewares } from "../middlewares/auth-middleware";

export const authRoutes = new Hono()
  .get(
    "/:provider/login",
    ...publicMiddlewares(),
    zValidator(
      "param",
      z.object({
        provider: z.enum([
          "github",
          // , 'google'
        ]),
      })
    ),
    zValidator("query", z.object({ callbackUrl: z.string().optional() }).optional()),
    async (c) => {
      const { provider } = c.req.param();
      const { callbackUrl } = c.req.query();

      const state = generateState();
      const currentProvider = authProviders[provider as keyof typeof authProviders];

      let codeVerifier: string | undefined;

      if (currentProvider.config.pkce) {
        codeVerifier = generateCodeVerifier();
      }

      const url = await currentProvider.getProviderAuthorizationUrl(state, codeVerifier);

      setCookie(c, "oauth_state", state, {
        httpOnly: true,
        maxAge: 60 * 60,
        path: "/",
        sameSite: "lax",
        secure: env.NODE_ENV === "production",
      });

      if (codeVerifier) {
        setCookie(c, "code_verifier", codeVerifier, {
          httpOnly: true,
          maxAge: 60 * 60,
          path: "/",
          secure: env.NODE_ENV === "production",
        });
      }
      if (callbackUrl) {
        setCookie(c, "callback_url", callbackUrl, {
          maxAge: 60 * 60,
        });
      } else {
        deleteCookie(c, "callback_url");
      }

      return c.redirect(url.toString());
    }
  )
  .get(
    "/:provider/callback",
    ...publicMiddlewares(),
    zValidator("param", z.object({ provider: z.enum(["github", "google"]) })),
    async (c) => {
      const { provider } = c.req.param();

      const currentProvider = authProviders[provider as keyof typeof authProviders];

      const code = c.req.query("code");
      const state = c.req.query("state");
      const storedState = getCookie(c, "oauth_state");
      let callbackUrl = getCookie(c, "callback_url");

      if (callbackUrl) {
        callbackUrl = decodeURIComponent(callbackUrl);
      }

      let storedCodeVerifier: string | null = null;

      if (currentProvider.config.pkce) {
        storedCodeVerifier = getCookie(c, "code_verifier") ?? null;
      }
      if (
        !code ||
        !state ||
        !storedState ||
        state !== storedState ||
        (currentProvider.config.pkce && !storedCodeVerifier)
      ) {
        return c.json({ error: "Token mismatch" }, 400);
      }

      try {
        const userId = await currentProvider.handleProviderCallback(code, storedCodeVerifier!, c.get("user")?.id);

        // Link account (already logged in)
        if (!userId) {
          return c.redirect("/settings");
        }

        const sessionToken = generateRandomToken();
        const session = await createSession(sessionToken, userId, {
          ipAddress: c.req.header("X-Forwarded-For") ?? "127.0.0.1",
          userAgent: c.req.header("User-Agent") || null,
        });

        const sessionCookie = createSessionCookie(sessionToken, session.expires_at);

        const cookieOptions: {
          httpOnly: boolean;
          path: string;
          sameSite: "lax" | "none";
          secure: boolean;
          expires: Date;
          domain?: string;
        } = {
          httpOnly: sessionCookie.attributes.httpOnly,
          path: sessionCookie.attributes.path,
          sameSite: sessionCookie.attributes.sameSite,
          secure: sessionCookie.attributes.secure,
          expires: sessionCookie.attributes.expires,
        };

        if (sessionCookie.attributes.domain) {
          cookieOptions.domain = sessionCookie.attributes.domain;
        }

        setCookie(c, sessionCookie.name, sessionCookie.value, cookieOptions);

        // Clean up temporary cookies
        deleteCookie(c, "oauth_state");
        deleteCookie(c, "code_verifier");
        deleteCookie(c, "callback_url");

        return c.redirect(callbackUrl ?? "/settings");
      } catch (error) {
        if (error instanceof OAuth2RequestError) {
          return c.json({ error: error.message }, 400);
        }

        return c.json({ error: "Internal server error" }, 500);
      }
    }
  )
  .post("/logout", ...protectedMiddlewares(), async (c) => {
    const session = c.get("session");

    if (session) {
      await invalidateSession(session.id);
      const cookie = createBlankSessionCookie();

      const cookieOptions: {
        httpOnly: boolean;
        path: string;
        sameSite: "lax" | "none";
        secure: boolean;
        maxAge: number;
        domain?: string;
      } = {
        httpOnly: cookie.attributes.httpOnly,
        path: cookie.attributes.path,
        sameSite: cookie.attributes.sameSite,
        secure: cookie.attributes.secure,
        maxAge: cookie.attributes.maxAge,
      };

      if (cookie.attributes.domain) {
        cookieOptions.domain = cookie.attributes.domain;
      }

      setCookie(c, cookie.name, cookie.value, cookieOptions);
    }

    return c.json({ success: true });
  });
