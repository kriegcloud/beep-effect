import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-infra/adapters/repos/_common";
import { IamDb } from "@beep/iam-infra/db";
import { IamEntityIds } from "@beep/shared-domain";
import { Repo } from "@beep/shared-domain/abstractions";
import * as Effect from "effect/Effect";

export class MemberRepo extends Effect.Service<MemberRepo>()("@beep/iam-infra/adapters/repos/MemberRepo", {
  dependencies,
  accessors: true,
  effect: Repo.make(
    IamEntityIds.MemberId,
    Entities.Member.Model,
    Effect.gen(function* () {
      yield* IamDb.IamDb;
      // const list = makeQuery((execute, input: string) => execute((client) => client.query.accountTable.findMany()));

      return {
        // list,
      };
    })
  ),
}) {}
