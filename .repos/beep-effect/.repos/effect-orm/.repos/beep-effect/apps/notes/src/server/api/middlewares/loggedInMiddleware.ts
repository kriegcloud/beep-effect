import { TRPCError } from "@trpc/server";

import { t } from "../trpc";

export const loggedInMiddleware = t.middleware(async ({ ctx, next }) => {
  const userId = ctx.session?.user_id;

  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Login required",
    });
  }

  return next({ ctx });
});
