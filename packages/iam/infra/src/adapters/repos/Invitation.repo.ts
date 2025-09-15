import {Repo} from "@beep/shared-domain/Repo";
import * as Effect from "effect/Effect";
import {Entities} from "@beep/iam-domain";
import {IamEntityIds} from "@beep/shared-domain";
import {IamDb} from "@beep/iam-infra/db";
import {dependencies} from "@beep/iam-infra/adapters/repos/_common";

export class InvitationRepo extends Effect.Service<InvitationRepo>()(
  "@beep/iam-infra/adapters/repos/InvitationRepo",
  {
    dependencies,
    accessors: true,
    effect: Repo.make(
      IamEntityIds.InvitationId,
      Entities.Invitation.Model,
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

