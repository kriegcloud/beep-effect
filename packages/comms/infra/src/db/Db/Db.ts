import * as CommsDbSchema from "@beep/comms-tables/schema";
import { Db } from "@beep/core-db";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as _Layer from "effect/Layer";

const { serviceEffect } = Db.make(CommsDbSchema);

export type Layer = _Layer.Layer<CommsDb, SqlError | ConfigError, SqlClient>;

export class CommsDb extends Context.Tag("@beep/comms-infra/CommsDb")<CommsDb, Db.Db<typeof CommsDbSchema>>() {
  static readonly Live = _Layer.scoped(this, serviceEffect.pipe(Effect.orDie));
}
