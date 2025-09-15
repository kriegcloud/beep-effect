import { makeScopedDb } from "@beep/core-db";

import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as DbSchema from "./schema";

/**
 * @internal
 */
export namespace AdminDb {
  const { makeService } = makeScopedDb(DbSchema);

  type Shape = Effect.Effect.Success<ReturnType<typeof makeService>>;

  export class AdminDb extends Context.Tag("IamDb")<AdminDb, Shape>() {}

  // No-deps layer: requires PgLive | DbPool.Live to be provided by the app runtime
  export const layerWithoutDeps = Layer.scoped(AdminDb, makeService());
}
