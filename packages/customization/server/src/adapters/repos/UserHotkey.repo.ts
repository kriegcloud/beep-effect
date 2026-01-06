import { Entities } from "@beep/customization-domain";
import { CustomizationDb } from "@beep/customization-server/db";
import { $CustomizationServerId } from "@beep/identity/packages";
import { CustomizationEntityIds } from "@beep/shared-domain";
import { Repo } from "@beep/shared-server/Repo";
import * as Effect from "effect/Effect";
import { dependencies } from "./_common";

const $I = $CustomizationServerId.create("adapters/repos/UserHotkeyRepo");

export class UserHotkeyRepo extends Effect.Service<UserHotkeyRepo>()($I`UserHotkeyRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    yield* CustomizationDb.CustomizationDb;

    return yield* Repo.make(CustomizationEntityIds.UserHotkeyId, Entities.UserHotkey.Model, Effect.succeed({}));
  }),
}) {}
