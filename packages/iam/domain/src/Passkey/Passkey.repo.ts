import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./Passkey.model";

export class PasskeyRepo extends Effect.Service<PasskeyRepo>()("PasskeyRepo", {
  effect: M.makeRepository(Model, {
    tableName: "passkey",
    idColumn: "id",
    spanPrefix: "PasskeyRepo",
  }),
}) {}
