import { Entities } from "@beep/iam-domain";
import { IamDb } from "@beep/iam-server/db";
import { dependencies } from "@beep/iam-server/db/repos/_common";
import { SharedEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-server";
import * as Effect from "effect/Effect";

export class UserRepo extends Effect.Service<UserRepo>()("@beep/iam-server/db/repos/UserRepo", {
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
