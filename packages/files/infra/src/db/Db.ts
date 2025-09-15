import { type DbPool, makeScopedDb } from "@beep/core-db";
import * as SharedDbSchema from "@beep/shared-tables/schema";
import type * as SqlClient from "@effect/sql/SqlClient";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
export namespace FileDb {
  const { makeService } = makeScopedDb<typeof SharedDbSchema>(SharedDbSchema);

  type Shape = Effect.Effect.Success<ReturnType<typeof makeService>>;

  export class FileDb extends Context.Tag("FileDb")<FileDb, Shape>() {}

  // No-deps layer: requires PgLive | DbPool.Live to be provided by the app runtime
  export const layerWithoutDeps: Layer.Layer<FileDb, never, DbPool | SqlClient.SqlClient> = Layer.scoped(
    FileDb,
    makeService()
  );
}
