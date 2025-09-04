import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./Jwks.model";

export class JwksRepo extends Effect.Service<JwksRepo>()("JwksRepo", {
  effect: M.makeRepository(Model, {
    tableName: "jwks",
    idColumn: "id",
    spanPrefix: "JwksRepo",
  }),
}) {}
