import { env } from "@beep/notes/env";
import pg from "pg";

export const pgPool = new pg.Pool({ connectionString: env.DATABASE_URL });
