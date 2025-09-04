import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./TwoFactor.model";

export class TwoFactorRepo extends Effect.Service<TwoFactorRepo>()("TwoFactorRepo", {
  effect: M.makeRepository(Model, {
    tableName: "two_factor",
    idColumn: "id",
    spanPrefix: "TwoFactorRepo",
  }),
}) {}
