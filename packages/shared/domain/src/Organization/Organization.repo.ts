import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./Organization.model";

export class OrganizationRepo extends Effect.Service<OrganizationRepo>()("OrganizationRepo", {
  accessors: true,
  effect: Effect.scoped(
    Effect.gen(function* () {
      const repoBase = yield* M.makeRepository(Model, {
        tableName: "organization",
        idColumn: "id",
        spanPrefix: "OrganizationRepo",
      });
      const dataLoaders = yield* M.makeDataLoaders(Model, {
        tableName: "organization",
        idColumn: "id",
        spanPrefix: "OrganizationRepo",
        window: 10,
      });

      return {
        ...repoBase,
        ...dataLoaders,
      };
    })
  ),
}) {}
