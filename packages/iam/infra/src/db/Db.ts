import { Db } from "@beep/core-db";
import { IamDbSchema } from "@beep/iam-tables";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
export namespace IamDb {
  const { serviceEffect } = Db.make(IamDbSchema);

  export class IamDb extends Context.Tag("@beep/iam-infra/IamDb")<IamDb, Db.Db<typeof IamDbSchema>>() {}

  export const layer: Layer.Layer<IamDb, SqlError | ConfigError, SqlClient> = Layer.scoped(IamDb, serviceEffect);
}
