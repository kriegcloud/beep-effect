import { defineConfig } from "drizzle-kit";

export default defineConfig({
  casing: "camelCase",
  dbCredentials: {
    url: process.env.BEEP_TEST_DATABASE_URL ?? "postgres://postgres:postgres@127.0.0.1:5432/postgres",
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/schema.ts",
});
