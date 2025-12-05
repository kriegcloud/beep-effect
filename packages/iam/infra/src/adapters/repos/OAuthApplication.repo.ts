import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-infra/adapters/repos/_common";
import { IamDb } from "@beep/iam-infra/db";
import { IamEntityIds } from "@beep/shared-domain";
import { Repo } from "@beep/shared-infra/Repo";
import * as Effect from "effect/Effect";

export class OAuthApplicationRepo extends Effect.Service<OAuthApplicationRepo>()(
  "@beep/iam-infra/adapters/repos/OAuthApplicationRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      IamEntityIds.OAuthApplicationId,
      Entities.OAuthApplication.Model,
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
