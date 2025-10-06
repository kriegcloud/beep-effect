import { Repo } from "@beep/core-db/Repo";
import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-infra/adapters/repos/_common";
import { IamDb } from "@beep/iam-infra/db";
import { IamEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

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
        // const list = makeQuery((execute, input: string) => execute((client) => client.query.account.findMany()));

        return {
          // list,
        };
      })
    ),
  }
) {}
