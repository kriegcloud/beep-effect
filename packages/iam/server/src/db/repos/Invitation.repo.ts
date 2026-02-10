import { Entities } from "@beep/iam-domain";
import { IamDb } from "@beep/iam-server/db";
import { dependencies } from "@beep/iam-server/db/repos/_common";
import { $IamServerId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-server/factories";
import * as Effect from "effect/Effect";

const $I = $IamServerId.create("db/repos/InvitationRepo");
export class InvitationRepo extends Effect.Service<InvitationRepo>()($I`InvitationRepo`, {
  dependencies,
  accessors: true,
  effect: DbRepo.make(
    IamEntityIds.InvitationId,
    Entities.Invitation.Model,
    Effect.gen(function* () {
      yield* IamDb.Db;
      // const list = makeQuery((execute, input: string) => execute((client) => client.query.account.findMany()));

      return {
        // list,
      };
    })
  ),
}) {}
