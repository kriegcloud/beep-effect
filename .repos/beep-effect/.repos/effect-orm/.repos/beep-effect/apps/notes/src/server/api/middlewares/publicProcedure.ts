import { CookieNames } from "@beep/notes/lib/storage/cookies";

import { t } from "../trpc";
import { devMiddleware } from "./devMiddleware";
import { ratelimitMiddleware } from "./ratelimitMiddleware";

/**
 * Public (unauthenticated) procedure This is the base piece you use to build
 * new queries and mutations on your tRPC API. It does not guarantee that a user
 * querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(ratelimitMiddleware()).use(devMiddleware(CookieNames.devWait));
