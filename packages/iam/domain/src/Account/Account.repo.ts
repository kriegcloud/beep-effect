import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./Account.model";

export class AccountRepo extends Effect.Service<AccountRepo>()("AccountRepo", {
  effect: M.makeRepository(Model, {
    tableName: "account",
    idColumn: "id",
    spanPrefix: "AccountRepo",
  }),
}) {}
