import {Repo} from "@beep/shared-domain/Repo";
import * as Effect from "effect/Effect";
import {Entities} from "@beep/iam-domain";
import {IamEntityIds} from "@beep/shared-domain";
import {IamDb} from "@beep/iam-infra/db";
import {dependencies} from "@beep/iam-infra/adapters/repos/_common";

export class OrganizationRoleRepo extends Effect.Service<OrganizationRoleRepo>()(
  "@beep/iam-infra/adapters/repos/OrganizationRoleRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      IamEntityIds.OrganizationRoleId,
      Entities.OrganizationRole.Model,
      Effect.gen(function* () {
        yield* IamDb.IamDb;
        // const list = makeQuery((execute, input: string) => execute((client) => client.query.accountTable.findMany()));

        return {
          // list,
        };
      })
    )

  }
) {
}

