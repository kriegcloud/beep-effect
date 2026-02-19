import { getUserRatelimit, type RatelimitKey } from "@beep/notes/server/ratelimit";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";

export function getRatelimit(c: Context, key?: undefined | RatelimitKey) {
  return getUserRatelimit({
    key,
    ip: c.req.header("x-forwarded-for"),
    user: c.get("user"),
  });
}

export async function ratelimitGuard(c: Context, key?: undefined | RatelimitKey) {
  const { limit, message, remaining, reset, success } = await getRatelimit(c, key);

  if (!success) {
    c.header("X-RateLimit-Limit", limit.toString());
    c.header("X-RateLimit-Remaining", remaining.toString());
    c.header("X-RateLimit-Reset", reset.toString());

    return c.json({ error: message }, 429);
  }

  return undefined;
}

export function ratelimitMiddleware(key?: undefined | RatelimitKey) {
  return createMiddleware(async (c, next) => {
    // const { pathname } = new URL(c.req.url);

    await ratelimitGuard(c, key);

    await next();
  });
}
