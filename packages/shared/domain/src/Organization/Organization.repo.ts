import { makeRepo } from "@beep/shared-domain/Repo";
import * as M from "@effect/sql/Model";
import * as Arbitrary from "effect/Arbitrary";
import * as Effect from "effect/Effect";
import * as FastCheck from "effect/FastCheck";
import * as F from "effect/Function";
import { Model } from "./Organization.model";

export class OrganizationRepo extends Effect.Service<OrganizationRepo>()("OrganizationRepo", {
  accessors: true,
  effect: makeRepo(
    Effect.gen(function* () {
      const r = yield* M.makeRepository(Model, {
        tableName: "organization",
        idColumn: "id",
        spanPrefix: "OrganizationRepo",
      });
      return {
        ...r,
        list: (input: typeof Model.select.Type) =>
          Effect.gen(function* () {
            const mocked = F.pipe(Arbitrary.make(Model), (arb) => FastCheck.sample(arb, 10));

            return yield* Effect.succeed(mocked);
          }),
      };
    })
  ),
}) {}
