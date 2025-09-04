import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./RateLimit.model";

export class RateLimitRepo extends Effect.Service<RateLimitRepo>()("RateLimitRepo", {
  effect: M.makeRepository(Model, {
    tableName: "rate_limit",
    idColumn: "id",
    spanPrefix: "RateLimitRepo",
  }),
}) {}
