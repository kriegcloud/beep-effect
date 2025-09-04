import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./OAuthConsent.model";

export class OAuthConsentRepo extends Effect.Service<OAuthConsentRepo>()("OAuthConsentRepo", {
  effect: M.makeRepository(Model, {
    tableName: "oauth_consent",
    idColumn: "id",
    spanPrefix: "OAuthConsentRepo",
  }),
}) {}
