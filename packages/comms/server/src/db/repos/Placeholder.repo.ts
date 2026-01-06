import { Entities } from "@beep/comms-domain";
import { CommsDb } from "@beep/comms-server/db";
import { $CommsServerId } from "@beep/identity/packages";
import { CommsEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-server";
import * as Effect from "effect/Effect";
import { dependencies } from "./_common";

const $I = $CommsServerId.create("db/repos/PlaceholderRepo");

export class PlaceholderRepo extends Effect.Service<PlaceholderRepo>()($I`PlaceholderRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    yield* CommsDb.Db;

    return yield* DbRepo.make(CommsEntityIds.PlaceholderId, Entities.Placeholder.Model, Effect.succeed({}));
  }),
}) {}
