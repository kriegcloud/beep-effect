import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DB_PG_URL ?? process.env.DATABASE_URL ?? "";
const hasResolvedDatabaseUrl = databaseUrl.length > 0 && !databaseUrl.startsWith("op://");
const fallbackDatabaseUrl = "postgres://postgres:postgres@127.0.0.1:5432/postgres";

if (!hasResolvedDatabaseUrl) {
  console.warn("No resolved database URL found. Database operations will fail until DB_PG_URL or DATABASE_URL is set.");
}

const sql = neon(hasResolvedDatabaseUrl ? databaseUrl : fallbackDatabaseUrl);

export const db = drizzle({ client: sql, schema });
