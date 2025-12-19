import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-server/adapters/repos/_common";
import { IamDb } from "@beep/iam-server/db";
import { SharedEntityIds } from "@beep/shared-domain";
import { Repo } from "@beep/shared-server/Repo";
import * as Effect from "effect/Effect";

export class SessionRepo extends Effect.Service<SessionRepo>()("@beep/iam-server/adapters/repos/SessionRepo", {
  dependencies,
  accessors: true,
  effect: Repo.make(
    SharedEntityIds.SessionId,
    Entities.Session.Model,
    Effect.gen(function* () {
      yield* IamDb.IamDb;
      // const list = makeQuery((execute, input: string) => execute((client) => client.query.account.findMany()));

      return {
        // list,
      };
    })
  ),
}) {}
