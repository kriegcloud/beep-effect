import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-infra/adapters/repos/_common";
import { IamDb } from "@beep/iam-infra/db";
import { IamDbSchema } from "@beep/iam-tables";
import { IamEntityIds } from "@beep/shared-domain";
import { Repo } from "@beep/shared-domain/Repo";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

export class AccountRepo extends Effect.Service<AccountRepo>()("@beep/iam-infra/adapters/repos/AccountRepo", {
  dependencies,
  accessors: true,
  effect: Repo.make(
    IamEntityIds.AccountId,
    Entities.Account.Model,
    Effect.gen(function* () {
      const { makeQuery } = yield* IamDb.IamDb;
      // const list = makeQuery((execute, input: string) => execute((client) => client.query.accountTable.findMany()));
      const upsert = makeQuery((execute, input: typeof Entities.Account.Model.jsonCreate.Type) =>
        Effect.flatMap(S.encode(Entities.Account.Model.insert)(input), (i) =>
          execute((client) => client.insert(IamDbSchema.accountTable).values(i).returning())
        )
      );
      return {
        upsert,
      };
    })
  ),
}) {}
