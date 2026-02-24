import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DB_PG_URL ?? process.env.DATABASE_URL ?? "");

export const db = drizzle({ client: sql, schema });
