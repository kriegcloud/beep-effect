import { Db } from "@beep/core-db/db.factory";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Effect from "effect/Effect";
import * as Context from "effect/Context"
import * as Layer from "effect/Layer";
import * as IamDbSchema from "@beep/iam-tables/schema";
export namespace IamDb {
  const { serviceEffect } = Db.make(IamDbSchema);

  export type Layer = Layer.Layer<IamDb, SqlError | ConfigError, SqlClient>;
    export class IamDb extends Context.Tag("@beep/files-infra/IamDb")<IamDb, Db.Db<typeof IamDbSchema>>() {
    static readonly Live = Layer.scoped(this, serviceEffect.pipe(Effect.orDie));
  }
}
