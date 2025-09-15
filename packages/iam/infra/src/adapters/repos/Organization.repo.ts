import {Repo} from "@beep/shared-domain/Repo";
import * as Effect from "effect/Effect";
import {Entities} from "@beep/iam-domain";
import {SharedEntityIds} from "@beep/shared-domain";
import {IamDb} from "@beep/iam-infra/db";
import {dependencies} from "@beep/iam-infra/adapters/repos/_common";

export class OrganizationRepo extends Effect.Service<OrganizationRepo>()(
  "@beep/iam-infra/adapters/repos/OrganizationRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      SharedEntityIds.OrganizationId,
      Entities.Organization.Model,
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

