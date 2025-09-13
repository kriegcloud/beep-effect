export * from "./db.factory";
export * from "./db.pool";
export * from "./errors";

import { serverEnv } from "@beep/core-env/server";
import type * as SqlClient from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import { PgClient } from "@effect/sql-pg";
import type { ConfigError } from "effect/ConfigError";
import type * as Layer from "effect/Layer";
import * as Str from "effect/String";

export const PgLive: Layer.Layer<PgClient.PgClient | SqlClient.SqlClient, ConfigError | SqlError, never> =
  PgClient.layer({
    port: serverEnv.db.pg.port,
    host: serverEnv.db.pg.host,
    username: serverEnv.db.pg.user,
    password: serverEnv.db.pg.password,
    ssl: serverEnv.db.pg.ssl,
    transformResultNames: Str.snakeToCamel,
  });
