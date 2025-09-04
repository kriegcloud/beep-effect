import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./Subscription.model";

export class SubscriptionRepo extends Effect.Service<SubscriptionRepo>()("SubscriptionRepo", {
  effect: M.makeRepository(Model, {
    tableName: "subscription",
    idColumn: "id",
    spanPrefix: "SubscriptionRepo",
  }),
}) {}
