import { Entities } from "@beep/calendar-domain";
import { CalendarDb } from "@beep/calendar-server/db";
import { $CalendarServerId } from "@beep/identity/packages";
import { CalendarEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-domain/factories";
import * as Effect from "effect/Effect";
import { dependencies } from "./_common";

const $I = $CalendarServerId.create("db/repos/PlaceholderRepo");

export class PlaceholderRepo extends Effect.Service<PlaceholderRepo>()($I`PlaceholderRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    yield* CalendarDb.Db;

    return yield* DbRepo.make(CalendarEntityIds.PlaceholderId, Entities.Placeholder.Model, Effect.succeed({}));
  }),
}) {}
