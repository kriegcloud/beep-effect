import { Entities } from "@beep/iam-domain";
import { IamDb } from "@beep/iam-server/db";
import { dependencies } from "@beep/iam-server/db/repos/_common";
import { $IamServerId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-server/factories";
import * as Effect from "effect/Effect";

const $I = $IamServerId.create("db/repos/SubscriptionRepo");
export class SubscriptionRepo extends Effect.Service<SubscriptionRepo>()($I`SubscriptionRepo`, {
  dependencies,
  accessors: true,
  effect: DbRepo.make(
    IamEntityIds.SubscriptionId,
    Entities.Subscription.Model,
    Effect.gen(function* () {
      yield* IamDb.Db;
      // const list = makeQuery((execute, input: string) => execute((client) => client.query.account.findMany()));

      return {
        // list,
      };
    })
  ),
}) {}
