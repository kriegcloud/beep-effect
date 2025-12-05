import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-infra/adapters/repos/_common";
import { IamDb } from "@beep/iam-infra/db";
import { IamEntityIds } from "@beep/shared-domain";
import { Repo } from "@beep/shared-infra/Repo";
import * as Effect from "effect/Effect";

export class VerificationRepo extends Effect.Service<VerificationRepo>()(
  "@beep/iam-infra/adapters/repos/VerificationRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      IamEntityIds.VerificationId,
      Entities.Verification.Model,
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
