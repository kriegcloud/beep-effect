import { Db } from "@beep/core-db";
import * as SharedDbSchema from "@beep/shared-tables/schema";
import type { SqlClient } from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import type { ConfigError } from "effect/ConfigError";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
export namespace FilesDb {
  const { serviceEffect } = Db.make(SharedDbSchema);

  export class FilesDb extends Context.Tag("@beep/files-infra/FilesDb")<FilesDb, Db.Db<typeof SharedDbSchema>>() {}

  export const layer: Layer.Layer<FilesDb, SqlError | ConfigError, SqlClient> = Layer.scoped(FilesDb, serviceEffect);
}
