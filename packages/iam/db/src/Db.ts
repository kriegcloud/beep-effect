import {Config, makeScopedDb} from "@beep/db-scope";
import {IamDbSchema} from "@beep/iam-tables";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export namespace IamDb {
  const {makeService} = makeScopedDb(IamDbSchema);

  type Shape = Effect.Effect.Success<ReturnType<typeof makeService>>

  export class IamDb extends Effect.Tag("IamDb")<IamDb, Shape>() {
  }

  export const layer = (config: Config) => Layer.scoped(
    IamDb,
    makeService(config)
  );
}

