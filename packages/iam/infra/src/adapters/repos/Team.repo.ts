import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-infra/adapters/repos/_common";
import { IamDb } from "@beep/iam-infra/db";
import { SharedEntityIds } from "@beep/shared-domain";
import { Repo } from "@beep/shared-infra/Repo";
import * as Effect from "effect/Effect";

export class TeamRepo extends Effect.Service<TeamRepo>()("@beep/iam-infra/adapters/repos/TeamRepo", {
  dependencies,
  accessors: true,
  effect: Repo.make(
    SharedEntityIds.TeamId,
    Entities.Team.Model,
    Effect.gen(function* () {
      yield* IamDb.IamDb;
      // const list = makeQuery((execute, input: string) => execute((client) => client.query.account.findMany()));

      return {
        // list,
      };
    })
  ),
}) {}
