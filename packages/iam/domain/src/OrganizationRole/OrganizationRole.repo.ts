import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./OrganizationRole.model";

export class OrganizationRoleRepo extends Effect.Service<OrganizationRoleRepo>()("OrganizationRoleRepo", {
  effect: M.makeRepository(Model, {
    tableName: "organization_role",
    idColumn: "id",
    spanPrefix: "OrganizationRoleRepo",
  }),
}) {}
