import { Entities } from "@beep/iam-domain";
import { IamDb } from "@beep/iam-server/db";
import { dependencies } from "@beep/iam-server/db/repos/_common";
import { $IamServerId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-server/factories";
import * as Effect from "effect/Effect";

const $I = $IamServerId.create("db/repos/AccountRepo");

export class AccountRepo extends Effect.Service<AccountRepo>()($I`AccountRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    yield* IamDb.Db;

    return yield* DbRepo.make(IamEntityIds.AccountId, Entities.Account.Model, Effect.succeed({}));
  }),
}) {}
