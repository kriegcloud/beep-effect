import { makeScopedDb } from "@beep/db-scope";
import { DbPool } from "@beep/db-scope/db.pool";
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

  export const layer = Layer.mergeAll(Layer.scoped(AdminDb, makeService()).pipe(Layer.provideMerge(DbPool.Live)));
}
