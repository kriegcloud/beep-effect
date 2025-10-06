import { Db } from "@beep/core-db/db.factory";
import * as IamDbSchema from "@beep/iam-tables/schema";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Effect from "effect/Effect";
import type * as Layer from "effect/Layer";
export namespace IamDb {
  const factory = Db.make<typeof IamDbSchema>(IamDbSchema);

  export type Layer = Layer.Layer<IamDb, SqlError | ConfigError, SqlClient>;

  export class IamDb extends Effect.Service<IamDb>()("@beep/iam-infra/IamDb", {
    effect: factory.serviceEffect,
    accessors: true,
  }) {
    static readonly Live = IamDb.Default;
  }

  export const TransactionContext = factory.TransactionContext;
}
