import { Repo } from "@beep/core-db/Repo";
import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-infra/adapters/repos/_common";
import { IamDb } from "@beep/iam-infra/db";
import { IamEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

export class TwoFactorRepo extends Effect.Service<TwoFactorRepo>()("@beep/iam-infra/adapters/repos/TwoFactorRepo", {
  dependencies,
  accessors: true,
  effect: Repo.make(
    IamEntityIds.TwoFactorId,
    Entities.TwoFactor.Model,
    Effect.gen(function* () {
      yield* IamDb.IamDb;
      // const list = makeQuery((execute, input: string) => execute((client) => client.query.accountTable.findMany()));

      return {
        // list,
      };
    })
  ),
}) {}
