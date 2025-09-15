import {Repo} from "@beep/shared-domain/Repo";
import * as Effect from "effect/Effect";
import {Entities} from "@beep/iam-domain";
import {SharedEntityIds} from "@beep/shared-domain";
import {IamDb} from "@beep/iam-infra/db";
import {dependencies} from "@beep/iam-infra/adapters/repos/_common";

export class TeamRepo extends Effect.Service<TeamRepo>()(
  "@beep/iam-infra/adapters/repos/TeamRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      SharedEntityIds.TeamId,
      Entities.Team.Model,
      Effect.gen(function* () {
        yield* IamDb.IamDb;
        // const list = makeQuery((execute, input: string) => execute((client) => client.query.accountTable.findMany()));

        return {
          // list,
        };
      })
    )

  }
) {
}

