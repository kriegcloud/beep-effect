import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./SsoProvider.model";

export class SsoProviderRepo extends Effect.Service<SsoProviderRepo>()("SsoProviderRepo", {
  effect: M.makeRepository(Model, {
    tableName: "sso_provider",
    idColumn: "id",
    spanPrefix: "SsoProviderRepo",
  }),
}) {}
