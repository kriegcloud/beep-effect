import { Db } from "@beep/core-db";
import * as SharedDbSchema from "@beep/shared-tables/schema";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as _Layer from "effect/Layer";

const { serviceEffect } = Db.make(SharedDbSchema);

export type Layer = _Layer.Layer<FilesDb, SqlError | ConfigError, SqlClient>;

export class FilesDb extends Context.Tag("@beep/files-infra/FilesDb")<FilesDb, Db.Db<typeof SharedDbSchema>>() {
  static readonly Live = _Layer.scoped(this, serviceEffect.pipe(Effect.orDie));
}
