import { Entities } from "@beep/iam-domain";
import { IamDb } from "@beep/iam-server/db";
import { dependencies } from "@beep/iam-server/db/repos/_common";
import { $IamServerId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-server/factories";
import * as Effect from "effect/Effect";

const $I = $IamServerId.create("db/repos/User.repo");

export class UserRepo extends Effect.Service<UserRepo>()($I`UserRepo`, {
  dependencies,
  accessors: true,
  effect: DbRepo.make(
    SharedEntityIds.UserId,
    Entities.User.Model,
    Effect.gen(function* () {
      yield* IamDb.Db;

      return {
        // list,
      };
    })
  ),
}) {}
