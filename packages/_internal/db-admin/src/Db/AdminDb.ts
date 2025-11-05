import { Db } from "@beep/core-db";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Context from "effect/Context";
import * as _Layer from "effect/Layer";
import * as DbSchema from "../schema";

const { serviceEffect } = Db.make(DbSchema);

export type Layer = _Layer.Layer<AdminDb, SqlError | ConfigError, SqlClient>;

export class AdminDb extends Context.Tag("@beep/admin-db/AdminDb")<AdminDb, Db.Db<typeof DbSchema>>() {
  static readonly Live: Layer = _Layer.scoped(AdminDb, serviceEffect);
}
