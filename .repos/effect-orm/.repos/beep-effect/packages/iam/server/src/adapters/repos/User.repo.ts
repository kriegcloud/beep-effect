import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-server/adapters/repos/_common";
import { IamDb } from "@beep/iam-server/db";
import { SharedEntityIds } from "@beep/shared-domain";
import { Repo } from "@beep/shared-server/Repo";
import * as Effect from "effect/Effect";

export class UserRepo extends Effect.Service<UserRepo>()("@beep/iam-server/adapters/repos/UserRepo", {
  dependencies,
  accessors: true,
  effect: Repo.make(
    SharedEntityIds.UserId,
    Entities.User.Model,
    Effect.gen(function* () {
      yield* IamDb.IamDb;

      return {
        // list,
      };
    })
  ),
}) {}
