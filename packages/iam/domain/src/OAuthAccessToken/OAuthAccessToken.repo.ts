import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./OAuthAccessToken.model";

export class OAuthAccessTokenRepo extends Effect.Service<OAuthAccessTokenRepo>()("OAuthAccessTokenRepo", {
  effect: M.makeRepository(Model, {
    tableName: "oauth_access_token",
    idColumn: "id",
    spanPrefix: "OAuthAccessTokenRepo",
  }),
}) {}
