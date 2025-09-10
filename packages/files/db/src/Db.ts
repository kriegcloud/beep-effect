import { makeScopedDb } from "@beep/db-scope";
import * as SharedDbSchema from "@beep/shared-tables/schema";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export namespace FileDb {
  const { makeService, makeSql } = makeScopedDb(SharedDbSchema);

  type Shape = Effect.Effect.Success<ReturnType<typeof makeService>>;

  export class FileDb extends Context.Tag("FileDb")<FileDb, Shape>() {}

  export const layer = Layer.mergeAll(Layer.scoped(FileDb, makeService()), makeSql());
}
