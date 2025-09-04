import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./Invitation.model";

export class InvitationRepo extends Effect.Service<InvitationRepo>()("InvitationRepo", {
  effect: M.makeRepository(Model, {
    tableName: "invitation",
    idColumn: "id",
    spanPrefix: "InvitationRepo",
  }),
}) {}
