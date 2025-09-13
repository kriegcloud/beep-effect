import "server-only";
import { DbPool, makeScopedDb, PgLive } from "@beep/core-db";
import { IamDbSchema } from "@beep/iam-tables";
import type * as SqlClient from "@effect/sql/SqlClient";
import type * as SqlError from "@effect/sql/SqlError";
import type * as PgClient from "@effect/sql-pg/PgClient";
import type * as ConfigError from "effect/ConfigError";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export namespace IamDb {
  const { makeService } = makeScopedDb(IamDbSchema);

  type Shape = Effect.Effect.Success<ReturnType<typeof makeService>>;

  export class IamDb extends Context.Tag("IamDb")<IamDb, Shape>() {}

  // No-deps layer: requires PgLive | DbPool.Live to be provided by the app runtime
  //
  export const layerWithoutDeps: Layer.Layer<IamDb, never, DbPool | SqlClient.SqlClient> = Layer.scoped(
    IamDb,
    makeService()
  );

  // Convenience layer: provides PgLive and DbPool.Live internally (avoid in app runtime to prevent duplication)
  export const layer: Layer.Layer<
    IamDb | DbPool | SqlClient.SqlClient | PgClient.PgClient,
    SqlError.SqlError | ConfigError.ConfigError,
    never
  > = layerWithoutDeps.pipe(Layer.provideMerge(Layer.mergeAll(PgLive, DbPool.Live)));
}
