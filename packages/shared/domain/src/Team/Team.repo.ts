import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./Team.model";

export class TeamRepo extends Effect.Service<TeamRepo>()("TeamRepo", {
  effect: M.makeRepository(Model, {
    tableName: "team",
    idColumn: "id",
    spanPrefix: "TeamRepo",
  }),
}) {}
