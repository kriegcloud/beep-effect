import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./Verification.model";

export class VerificationRepo extends Effect.Service<VerificationRepo>()("VerificationRepo", {
  effect: M.makeRepository(Model, {
    tableName: "verification",
    idColumn: "id",
    spanPrefix: "VerificationRepo",
  }),
}) {}
