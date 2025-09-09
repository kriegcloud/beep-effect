import { makeScopedDb } from "@beep/db-scope";
import type { ConnectionOptions } from "@beep/db-scope/types";
import * as SharedDbSchema from "@beep/shared-tables/schema";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export namespace FileDb {
  const { makeService, makeSql } = makeScopedDb(SharedDbSchema);

  type Shape = Effect.Effect.Success<ReturnType<typeof makeService>>;

  export class FileDb extends Effect.Tag("FileDb")<FileDb, Shape>() {}

  export const layer = (config: ConnectionOptions) =>
    Layer.mergeAll(Layer.scoped(FileDb, makeService(config)), makeSql());
}
