import type { AuthUser } from "@beep/notes/server/auth/getAuthUser";
import type { AuthSession } from "@beep/notes/server/auth/lucia";

import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import type { RequestCookie } from "./utils/getCookie";

export type TRPCContext = ReturnType<typeof createTRPCContext>;

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 * These allow you to access things when processing a request, like the
 * database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and
 * RSC clients each wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = (opts: {
  readonly headers: Headers;
  readonly session: AuthSession | null;
  readonly user: AuthUser | null;
  readonly cookies?: undefined | RequestCookie[];
}) => {
  // const source = opts.headers.get('x-trpc-source') ?? 'unknown';
  // console.info('>>> tRPC Request from', source, 'by', session?.user);
  return {
    cookies: opts.cookies,
    headers: opts.headers,
    session: opts.session,
    user: opts.user,
    userId: opts.session?.user_id ?? "",
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ error, shape }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createRouter = t.router;

export const mergeRouters = t.mergeRouters;
