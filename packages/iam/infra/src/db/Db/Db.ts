import { Db } from "@beep/core-db/Db";
import * as IamDbSchema from "@beep/iam-tables/schema";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as _Layer from "effect/Layer";

const { serviceEffect } = Db.make(IamDbSchema);

export type Layer = _Layer.Layer<IamDb, SqlError | ConfigError, SqlClient>;

export class IamDb extends Context.Tag("@beep/documents-infra/IamDb")<IamDb, Db.Db<typeof IamDbSchema>>() {
  static readonly Live = _Layer.scoped(this, serviceEffect.pipe(Effect.orDie));
}
