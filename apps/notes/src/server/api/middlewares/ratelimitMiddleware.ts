import { env } from "@beep/notes/env";
import { getUserRatelimit, type RatelimitKey } from "@beep/notes/server/ratelimit";
import { TRPCError } from "@trpc/server";

import { type TRPCContext, t } from "../trpc";

export const ratelimitGuard = async (ctx: TRPCContext, key?: RatelimitKey) => {
  if (!env.UPSTASH_REDIS_REST_TOKEN) return;

  const ip = ctx.headers.get("x-forwarded-for");

  if (ip === null) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Missing IP address",
    });
  }
  const { message, success } = await getUserRatelimit({
    key,
    ip: ip,
    user: ctx.user,
  });

  if (!success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message,
    });
  }
};

export const ratelimitMiddleware = (key?: RatelimitKey) =>
  t.middleware(async ({ ctx, next }) => {
    await ratelimitGuard(ctx, key);

    return next({ ctx });
  });
