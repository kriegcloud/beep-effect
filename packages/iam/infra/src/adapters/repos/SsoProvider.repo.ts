import {Repo} from "@beep/shared-domain/Repo";
import * as Effect from "effect/Effect";
import {Entities} from "@beep/iam-domain";
import {IamEntityIds} from "@beep/shared-domain";
import {IamDb} from "@beep/iam-infra/db";
import {dependencies} from "@beep/iam-infra/adapters/repos/_common";

export class SsoProviderRepo extends Effect.Service<SsoProviderRepo>()(
  "@beep/iam-infra/adapters/repos/SsoProviderRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      IamEntityIds.SsoProviderId,
      Entities.SsoProvider.Model,
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

