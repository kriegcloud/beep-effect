import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./Member.model";

export class MemberRepo extends Effect.Service<MemberRepo>()("MemberRepo", {
  effect: M.makeRepository(Model, {
    tableName: "member",
    idColumn: "id",
    spanPrefix: "MemberRepo",
  }),
}) {}
