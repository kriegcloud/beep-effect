import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./TeamMember.model";

export class TeamMemberRepo extends Effect.Service<TeamMemberRepo>()("TeamMemberRepo", {
  effect: M.makeRepository(Model, {
    tableName: "team_member",
    idColumn: "id",
    spanPrefix: "TeamMemberRepo",
  }),
}) {}
