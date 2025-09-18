import { Db } from "@beep/core-db";
import { IamDbSchema } from "@beep/iam-tables";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Effect from "effect/Effect";
import type * as Layer from "effect/Layer";
export namespace IamDb {
  const { serviceEffect } = Db.make<typeof IamDbSchema>(IamDbSchema);

  export type Layer = Layer.Layer<IamDb, SqlError | ConfigError, SqlClient>;

  export class IamDb extends Effect.Service<IamDb>()("@beep/iam-infra/IamDb", {
    dependencies: [Db.Live],
    effect: serviceEffect,
    accessors: true,
  }) {
    static readonly Live = IamDb.Default;
  }
}
