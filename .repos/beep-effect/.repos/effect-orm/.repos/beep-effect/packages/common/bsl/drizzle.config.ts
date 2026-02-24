import { defineConfig } from "drizzle-kit";
// import * as Redacted from "effect/Redacted";
// import { env } from "./env-vars";
export default defineConfig({
  out: "./test/utils/drizzle/drizzle",
  schema: "./test/schema.ts",
  dialect: "postgresql",
  casing: "camelCase",
  dbCredentials: {
    // url: Redacted.value(env.pg.url),
    // TODO(ben): temporary
    url: process.env.DB_PG_URL as string,
  },
});
