import { Config, makeScopedDb } from "@beep/db-scope";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as DbSchema from "./schema";

/**
 * @internal
 */
export namespace AdminDb {
  const { makeService } = makeScopedDb(DbSchema);

  type Shape = Effect.Effect.Success<ReturnType<typeof makeService>>;

  export class AdminDb extends Effect.Tag("IamDb")<AdminDb, Shape>() {}

  export const layer = (config: Config) =>
    Layer.scoped(AdminDb, makeService(config));
}
