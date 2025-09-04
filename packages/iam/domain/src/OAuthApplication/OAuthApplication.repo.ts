import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./OAuthApplication.model";

export class OAuthApplicationRepo extends Effect.Service<OAuthApplicationRepo>()("OAuthApplicationRepo", {
  effect: M.makeRepository(Model, {
    tableName: "oauth_application",
    idColumn: "id",
    spanPrefix: "OAuthApplicationRepo",
  }),
}) {}
