import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { type Auth, makeAuth } from "./internal/auth";

export const auth: Auth = makeAuth({
  database: drizzleAdapter(NodePgDatabase, {
    provider: "pg",
    schema: {},
  }),
  rateLimit: {
    enabled: true,
    storage: "database",
  },
});
