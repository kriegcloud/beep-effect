import { makeScopedDb } from "@beep/db-scope";
import type { ConnectionOptions } from "@beep/db-scope/types";
import { WmsDbSchema } from "@beep/wms-tables";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export namespace WmsDb {
  const { makeService, makeSql } = makeScopedDb(WmsDbSchema);

  type Shape = Effect.Effect.Success<ReturnType<typeof makeService>>;

  export class WmsDb extends Effect.Tag("WmsDb")<WmsDb, Shape>() {}

  export const layer = (config: ConnectionOptions) =>
    Layer.mergeAll(Layer.scoped(WmsDb, makeService(config)), makeSql());
}
