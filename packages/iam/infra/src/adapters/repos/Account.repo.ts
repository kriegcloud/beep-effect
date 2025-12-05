import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-infra/adapters/repos/_common";
import { IamDb } from "@beep/iam-infra/db";
import { IamEntityIds } from "@beep/shared-domain";
import { Repo } from "@beep/shared-infra/Repo";
import * as Effect from "effect/Effect";

export class AccountRepo extends Effect.Service<AccountRepo>()("@beep/iam-infra/adapters/repos/AccountRepo", {
  dependencies,
  accessors: true,
  effect: Repo.make(
    IamEntityIds.AccountId,
    Entities.Account.Model,
    Effect.gen(function* () {
      yield* IamDb.IamDb;

      return {};
    })
  ),
}) {}
