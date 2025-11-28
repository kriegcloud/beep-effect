import { sleep } from "@beep/notes/lib/sleep";
import { CookieNames } from "@beep/notes/lib/storage/cookies";

import { t } from "../trpc";
import { getCookieNumber } from "../utils/getCookie";

export const devMiddleware = (key: string) =>
  t.middleware(async ({ ctx, next, path }) => {
    if (!t._config.isDev) {
      return next({ ctx });
    }

    // or t._config.isDev
    const timeout = getCookieNumber(ctx.cookies, CookieNames[key as keyof typeof CookieNames]);

    if (timeout) {
      const start = Date.now();

      // Throws an error for large timeout (e.g. 2000)
      await sleep(timeout);

      const result = await next();

      const end = Date.now();
      console.info(`[TRPC] ${path} took ${end - start}ms to execute`);

      return result;
    }

    return next({ ctx });
  });
