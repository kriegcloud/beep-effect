import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./ApiKey.model";

export class ApiKeyRepo extends Effect.Service<ApiKeyRepo>()("ApiKeyRepo", {
  effect: M.makeRepository(Model, {
    tableName: "apikey",
    idColumn: "id",
    spanPrefix: "ApiKeyRepo",
  }),
}) {}
