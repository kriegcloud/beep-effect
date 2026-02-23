import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const DEFAULT = {
  PORT: "3000",
};

export const env = createEnv({
  /**
   * Specify your client-side environment variables schema here. This way you
   * can ensure the app isn't built with invalid env vars. To expose them to the
   * client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_API_URL: z.string().default("http://localhost:4000"),
    NEXT_PUBLIC_ENVIRONMENT: z.string().default("development"),
    NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().default(""),
    NEXT_PUBLIC_SITE_URL: z.string().optional(),
    NEXT_PUBLIC_STORAGE_PREFIX: z.string().default("/images"),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().default(""),
    NEXT_PUBLIC_YJS_URL: z.string().default("ws://localhost:4444/yjs"),
  },

  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR:
   * z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge
   * runtimes (e.g. middlewares) or client-side so we need to destruct
   * manually.
   */
  experimental__runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL && process.env.VERCEL_ENV !== "development"
        ? `https://${process.env.VERCEL_URL}`
        : `http://localhost:${process.env.PORT || DEFAULT.PORT}`),
    NEXT_PUBLIC_STORAGE_PREFIX: process.env.NEXT_PUBLIC_STORAGE_PREFIX,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_YJS_URL: process.env.NEXT_PUBLIC_YJS_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Specify your server-side environment variables schema here. This way you
   * can ensure the app isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string(),
    GITHUB_CLIENT_ID: z.string().default(""),
    GITHUB_CLIENT_SECRET: z.string().default(""),
    GOOGLE_API_KEY: z.string().default(""),
    OPENAI_API_KEY: z.string().default(""),
    PORT: z.string().default(DEFAULT.PORT),
    SENTRY_DSN: z.string().default(""),
    SENTRY_ORG: z.string().default(""),
    SENTRY_PROJECT: z.string().default(""),
    STRIPE_API_KEY: z.string().default(""),
    STRIPE_WEBHOOK_SECRET: z.string().default(""),
    SUPERADMIN: z.string().default(""),
    UPSTASH_REDIS_REST_TOKEN: z.string().default(""),
    UPSTASH_REDIS_REST_URL: z.string().default(""),
  },
  shared: {
    NEXT_PUBLIC_ENVIRONMENT: z.string().default("development"),
    NEXT_PUBLIC_SITE_URL: z.string().default(""),
    NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
