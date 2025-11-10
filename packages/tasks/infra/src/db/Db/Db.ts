import { Db } from "@beep/core-db";
import * as TasksDbSchema from "@beep/shared-tables/schema";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as _Layer from "effect/Layer";

const { serviceEffect } = Db.make(TasksDbSchema);

export type Layer = _Layer.Layer<TasksDb, SqlError | ConfigError, SqlClient>;

export class TasksDb extends Context.Tag("@beep/files-infra/TasksDb")<TasksDb, Db.Db<typeof TasksDbSchema>>() {
  static readonly Live = _Layer.scoped(this, serviceEffect.pipe(Effect.orDie));
}
