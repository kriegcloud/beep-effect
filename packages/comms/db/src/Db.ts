// import { Config, makeScopedDb } from "@beep/db-scope";
// import { CommsDbSchema } from "@beep/comms-tables";
// import * as Effect from "effect/Effect";
// import * as Layer from "effect/Layer";
//
// export namespace CommsDb {
//   const { makeService } = makeScopedDb(CommsDbSchema);
//
//   type Shape = Effect.Effect.Success<ReturnType<typeof makeService>>;
//
//   export class CommsDb extends Effect.Tag("CommsDb")<CommsDb, Shape>() {}
//
//   export const layer = (config: Config) =>
//     Layer.scoped(IamDb, makeService(config));
// }
