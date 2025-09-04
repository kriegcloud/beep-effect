import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./User.model";

export class UserRepo extends Effect.Service<UserRepo>()("UserRepo", {
  effect: M.makeRepository(Model, {
    tableName: "user",
    idColumn: "id",
    spanPrefix: "UserRepo",
  }),
}) {}
