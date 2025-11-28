import { env } from "@beep/notes/env";
import { Ratelimit, type RatelimitConfig } from "@upstash/ratelimit";

import { redis as redisClient } from "./redis";

export const ratelimits = {
  "ai/command": {
    limiters: {
      free: [Ratelimit.slidingWindow(30, "1 h"), Ratelimit.slidingWindow(100, "1 d")],
      public: [Ratelimit.slidingWindow(10, "1 h"), Ratelimit.slidingWindow(50, "1 d")],
    },
  },
  "ai/copilot": {
    limiters: {
      free: [Ratelimit.slidingWindow(30, "1 h"), Ratelimit.slidingWindow(150, "1 d")],
      public: [Ratelimit.slidingWindow(5, "1 h"), Ratelimit.slidingWindow(25, "1 d")],
    },
  },
  "comment/create": {
    limiter: Ratelimit.slidingWindow(30, "1 h"),
  },
  "discussion/create": {
    limiter: Ratelimit.slidingWindow(20, "1 h"),
  },
  "document/create": {
    limiter: Ratelimit.slidingWindow(10, "1 d"),
  },
  "export/pdf": {
    limiters: [Ratelimit.slidingWindow(5, "1 h"), Ratelimit.slidingWindow(20, "1 d")],
  },
  free: {
    limiter: Ratelimit.slidingWindow(40, "10 s"),
  },
  public: {
    limiter: Ratelimit.slidingWindow(20, "10 s"),
  },
  upload: {
    limiters: {
      free: [Ratelimit.slidingWindow(5, "1 h"), Ratelimit.slidingWindow(20, "1 d")],
    },
  },
  "version/create": {
    limiter: Ratelimit.slidingWindow(5, "1 d"),
  },
} satisfies Record<string, RatelimitOptions>;

Object.values(ratelimits).forEach((ratelimit) => {
  (ratelimit as RatelimitOptions).ephemeralCache = new Map<string, number>();
});

export type RatelimitKey = keyof typeof ratelimits;

export type RatelimitOptions = {
  limiters?: RatelimitConfig["limiter"][] | Record<string, RatelimitConfig["limiter"][]>;
  message?: string;
  prefix?: string;
} & Omit<RatelimitConfig, "limiter" | "redis"> & {
    limiter?: RatelimitConfig["limiter"];
  };

export const getRatelimitResponse = async (
  key: RatelimitKey,
  id: string,
  tier: "admin" | "free" | "pro" | "public",
  orgName = "plate"
) => {
  if (!env.UPSTASH_REDIS_REST_TOKEN || tier === "admin") {
    return { limit: 0, message: "", remaining: 0, reset: 0, success: true };
  }

  const ratelimit: RatelimitOptions = ratelimits[key] ?? ratelimits.public;

  const {
    analytics = true,
    limiter,
    limiters,
    message = "Rate limit exceeded",
    prefix = `@${orgName}/ratelimit/${key}`,
    ...config
  } = ratelimit;

  let allLimiters: RatelimitConfig["limiter"][] | undefined;
  let actualPrefix = prefix;

  if (Array.isArray(limiters)) {
    allLimiters = limiters;
  } else if (limiters) {
    // Fallback pro -> free -> public
    if (tier === "pro" && !limiters.pro) {
      if (limiters.free || limiters.public) {
        allLimiters = limiters.free ?? limiters.public;
      }
    } else if (tier === "free" && !limiters.free) {
      allLimiters = limiters.public;
    } else {
      allLimiters = limiters[tier];
    }

    actualPrefix = `${prefix}:${tier}`;
  } else {
    allLimiters = [limiter!];
  }

  if (!allLimiters) {
    return { limit: 0, message: "", remaining: 0, reset: 0, success: true };
  }

  if (!allLimiters.length) {
    return { limit: 0, message: "", remaining: 0, reset: 0, success: true };
  }

  for (const limiter of allLimiters) {
    const res = await new Ratelimit({
      ...config,
      analytics,
      limiter,
      prefix: actualPrefix,
      redis: redisClient,
    }).limit(id);

    if (!res.success) {
      return { ...res, message };
    }
  }

  return { limit: 0, message: "", remaining: 0, reset: 0, success: true };
};

export const getUserRatelimit = async ({
  key,
  ip,
  user,
}: {
  user: { id: string; isAdmin?: boolean; isPro?: boolean } | null;
  key?: RatelimitKey;
  ip?: string | null;
}) => {
  if (!user) {
    return getRatelimitResponse(key ?? "public", ip ?? "127.0.0.1", "public");
  }

  return getRatelimitResponse(key ?? "free", user.id, user.isAdmin ? "admin" : user.isPro ? "pro" : "free");
};
