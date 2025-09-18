import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-infra/adapters/repos/_common";
import { IamDb } from "@beep/iam-infra/db";
import { IamEntityIds } from "@beep/shared-domain";
import { Repo } from "@beep/shared-domain/abstractions";
import * as Effect from "effect/Effect";

export class WalletAddressRepo extends Effect.Service<WalletAddressRepo>()(
  "@beep/iam-infra/adapters/repos/WalletAddressRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      IamEntityIds.WalletAddressId,
      Entities.WalletAddress.Model,
      Effect.gen(function* () {
        yield* IamDb.IamDb;
        // const list = makeQuery((execute, input: string) => execute((client) => client.query.accountTable.findMany()));

        return {
          // list,
        };
      })
    ),
  }
) {}
