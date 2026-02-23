import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-server/adapters/repos/_common";
import { IamDb } from "@beep/iam-server/db";
import { $IamServerId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import { Repo } from "@beep/shared-server/Repo";
import * as Effect from "effect/Effect";

const $I = $IamServerId.create("adapters/repos/TeamMemberRepo");
export class TeamMemberRepo extends Effect.Service<TeamMemberRepo>()($I`TeamMemberRepo`, {
  dependencies,
  accessors: true,
  effect: Repo.make(
    IamEntityIds.TeamMemberId,
    Entities.TeamMember.Model,
    Effect.gen(function* () {
      yield* IamDb.IamDb;
      // const list = makeQuery((execute, input: string) => execute((client) => client.query.account.findMany()));

      return {
        // list,
      };
    })
  ),
}) {}
