import "server-only";
import { type DbPool, makeScopedDb } from "@beep/core-db";
import { IamDbSchema } from "@beep/iam-tables";
import type * as SqlClient from "@effect/sql/SqlClient";
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
}
