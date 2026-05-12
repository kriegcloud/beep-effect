import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: process.env.BEEP_TEST_DATABASE_URL ?? "postgres://postgres:postgres@127.0.0.1:5432/postgres",
  },
  dialect: "postgresql",
  introspect: {
    casing: "camel",
  },
  out: "./drizzle",
  schema: "./src/schema.ts",
});
