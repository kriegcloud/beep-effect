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

        setCookie(c, sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

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
      setCookie(c, cookie.name, cookie.value, cookie.attributes);
    }

    return c.json({ success: true });
  });
// .post(
//   '/signup',
//   ...publicMiddlewares(),
//   zValidator(
//     'json',
//     z.object({
//       email: z.string().email(),
//       name: z.string().optional(),
//       password: z.string().min(5),
//     })
//   ),
//   async (c) => {
//     const { email, name, password } = c.req.valid('json');

//     try {
//       // Check if user already exists
//       const existingUser = await prisma.user.findUnique({
//         where: {
//           email,
//         },
//       });

//       if (existingUser) {
//         return c.json({ error: 'Email already in use' }, 400);
//       }

//       const passwordHash = await hash(password, {
//         memoryCost: 19_456,
//         outputLen: 32,
//         parallelism: 1,
//         timeCost: 2,
//       });

//       const user = await findOrCreateUser({
//         email,
//         name,
//         password: passwordHash,
//         providerId: 'credentials',
//         providerUserId: email,
//       });

//       const sessionToken = generateRandomToken();
//       const session = await createSession(sessionToken, user.id, {
//         ipAddress: c.req.header('X-Forwarded-For') ?? '127.0.0.1',
//         userAgent: c.req.header('User-Agent') || null,
//       });

//       const sessionCookie = createSessionCookie(
//         sessionToken,
//         session.expires_at
//       );

//       setCookie(
//         c,
//         sessionCookie.name,
//         sessionCookie.value,
//         sessionCookie.attributes
//       );

//       return c.json({ success: true });
//     } catch (error) {
//       if (error instanceof Error) {
//         return c.json({ error: error.message }, 400);
//       }

//       return c.json({ error: 'Internal server error' }, 500);
//     }
//   }
// )
// .post(
//   '/login',
//   ...publicMiddlewares(),
//   zValidator(
//     'json',
//     z.object({
//       email: z.string().email(),
//       password: z.string(),
//     })
//   ),
//   async (c) => {
//     const { email, password } = c.req.valid('json');

//     try {
//       const user = await prisma.user.findUnique({
//         where: {
//           email,
//         },
//       });

//       if (!user?.password_hash) {
//         return c.json({ error: 'Invalid email or password' }, 400);
//       }

//       const validPassword = await verify(user.password_hash, password, {
//         memoryCost: 19_456,
//         outputLen: 32,
//         parallelism: 1,
//         timeCost: 2,
//       });

//       if (!validPassword) {
//         return c.json({ error: 'Invalid email or password' }, 400);
//       }

//       const sessionToken = generateRandomToken();
//       const session = await createSession(sessionToken, user.id, {
//         ipAddress: c.req.header('X-Forwarded-For') ?? '127.0.0.1',
//         userAgent: c.req.header('User-Agent') || null,
//       });

//       const sessionCookie = createSessionCookie(
//         sessionToken,
//         session.expires_at
//       );

//       setCookie(
//         c,
//         sessionCookie.name,
//         sessionCookie.value,
//         sessionCookie.attributes
//       );

//       return c.json({ success: true });
//     } catch (error) {
//       if (error instanceof Error) {
//         return c.json({ error: error.message }, 400);
//       }

//       return c.json({ error: 'Internal server error' }, 500);
//     }
//   }
// );
