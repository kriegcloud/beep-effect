import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-server/adapters/repos/_common";
import { IamDb } from "@beep/iam-server/db";
import { $IamServerId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import { Repo } from "@beep/shared-server/Repo";
import * as Effect from "effect/Effect";

const $I = $IamServerId.create("adapters/repos/AccountRepo");

export class AccountRepo extends Effect.Service<AccountRepo>()($I`AccountRepo`, {
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
