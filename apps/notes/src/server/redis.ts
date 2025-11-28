import { env } from "@beep/notes/env";
import { Redis } from "@upstash/redis";

export const redis = (
  env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        token: env.UPSTASH_REDIS_REST_TOKEN,
        url: env.UPSTASH_REDIS_REST_URL,
      })
    : {}
) as Redis;
