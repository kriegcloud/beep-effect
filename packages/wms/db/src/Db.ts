import { type Config, makeScopedDb } from "@beep/db-scope";
import { WmsDbSchema } from "@beep/wms-tables";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export namespace WmsDb {
  const { makeService } = makeScopedDb(WmsDbSchema);

  type Shape = Effect.Effect.Success<ReturnType<typeof makeService>>;

  export class WmsDb extends Effect.Tag("WmsDb")<WmsDb, Shape>() {}

  export const layer = (config: Config) => Layer.scoped(WmsDb, makeService(config));
}
