import { makeScopedDb } from "@beep/db-scope";
import type { ConnectionOptions } from "@beep/db-scope/types";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as DbSchema from "./schema";

/**
 * @internal
 */
export namespace AdminDb {
  const { makeService, makeSql } = makeScopedDb(DbSchema);

  type Shape = Effect.Effect.Success<ReturnType<typeof makeService>>;

  export class AdminDb extends Effect.Tag("IamDb")<AdminDb, Shape>() {}

  export const layer = (config: ConnectionOptions) =>
    Layer.mergeAll(Layer.scoped(AdminDb, makeService(config)), makeSql());
}
