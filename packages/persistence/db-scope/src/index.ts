export * from "./db.factory";
export * from "./db.pool";
export * from "./errors";

import { serverEnv } from "@beep/env/server";
import { PgClient } from "@effect/sql-pg";
import * as Str from "effect/String";

export const PgLive = PgClient.layer({
  port: serverEnv.db.pg.port,
  host: serverEnv.db.pg.host,
  username: serverEnv.db.pg.user,
  password: serverEnv.db.pg.password,
  ssl: serverEnv.db.pg.ssl,
  transformResultNames: Str.snakeToCamel,
});
