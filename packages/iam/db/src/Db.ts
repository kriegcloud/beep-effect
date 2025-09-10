import { makeScopedDb } from "@beep/db-scope";
import { IamDbSchema } from "@beep/iam-tables";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
export namespace IamDb {
  const { makeService, makeSql } = makeScopedDb(IamDbSchema);

  type Shape = Effect.Effect.Success<ReturnType<typeof makeService>>;

  export class IamDb extends Context.Tag("IamDb")<IamDb, Shape>() {}

  export const layer = Layer.mergeAll(Layer.scoped(IamDb, makeService()), makeSql());
}
