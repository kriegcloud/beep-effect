import { DbPool, PgLive } from "@beep/core-db";
import { serverEnv } from "@beep/core-env/server";
import type { ServerRuntimeError } from "@beep/runtime-server/types";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { PgClient } from "@effect/sql-pg/PgClient";
import * as Layer from "effect/Layer";

export type DbLayers = PgClient | SqlClient | DbPool;
export type DbLive = Layer.Layer<DbLayers, ServerRuntimeError, never>;
export const DbLive: DbLive = Layer.mergeAll(
  PgLive,
  DbPool.Live({
    url: serverEnv.db.pg.url,
    ssl: serverEnv.db.pg.ssl,
  })
);
