import { makeScopedDb } from "@beep/core-db";
import * as SharedDbSchema from "@beep/shared-tables/schema";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export namespace FileDb {
  const { makeService } = makeScopedDb<typeof SharedDbSchema>(SharedDbSchema);

  type Shape = Effect.Effect.Success<ReturnType<typeof makeService>>;

  export class FileDb extends Context.Tag("FileDb")<FileDb, Shape>() {}

  export const layer = Layer.scoped(FileDb, makeService());
}
