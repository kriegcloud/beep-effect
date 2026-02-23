import { CookieNames } from "@beep/notes/lib/storage/cookies";

import { t } from "../trpc";
import { authorizationMiddleware } from "./authorizationMiddleware";
import { devMiddleware } from "./devMiddleware";
import { loggedInMiddleware } from "./loggedInMiddleware";
import { ratelimitMiddleware } from "./ratelimitMiddleware";

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees `ctx.session.user` is
 * not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(async (opts) => {
    const result = await opts.next();

    if (!result.ok) {
      console.error(`Non-OK ${opts.type}:`, opts.path);
    }

    return result;
  })
  .use(loggedInMiddleware)
  .use(ratelimitMiddleware())
  .use(devMiddleware(CookieNames.devWait));

export const adminProcedure = t.procedure
  .use(loggedInMiddleware)
  .use(authorizationMiddleware({ role: "ADMIN" }))
  .use(ratelimitMiddleware());

export const superAdminProcedure = t.procedure
  .use(loggedInMiddleware)
  .use(authorizationMiddleware({ role: "SUPERADMIN" }))
  .use(ratelimitMiddleware());
