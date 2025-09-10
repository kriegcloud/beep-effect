import { makeScopedDb } from "@beep/db-scope";
import { WmsDbSchema } from "@beep/wms-tables";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export namespace WmsDb {
  const { makeService } = makeScopedDb(WmsDbSchema);

  type Shape = Effect.Effect.Success<ReturnType<typeof makeService>>;

  export class WmsDb extends Context.Tag("WmsDb")<WmsDb, Shape>() {}

  export const layer = Layer.scoped(WmsDb, makeService());
}
