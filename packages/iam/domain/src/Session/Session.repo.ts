import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./Session.model";

export class SessionRepo extends Effect.Service<SessionRepo>()("SessionRepo", {
  effect: M.makeRepository(Model, {
    tableName: "session",
    idColumn: "id",
    spanPrefix: "SessionRepo",
  }),
}) {}
