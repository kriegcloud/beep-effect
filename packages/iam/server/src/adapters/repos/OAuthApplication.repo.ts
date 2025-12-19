import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-server/adapters/repos/_common";
import { IamDb } from "@beep/iam-server/db";
import { IamEntityIds } from "@beep/shared-domain";
import { Repo } from "@beep/shared-server/Repo";
import * as Effect from "effect/Effect";

export class OAuthApplicationRepo extends Effect.Service<OAuthApplicationRepo>()(
  "@beep/iam-server/adapters/repos/OAuthApplicationRepo",
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
