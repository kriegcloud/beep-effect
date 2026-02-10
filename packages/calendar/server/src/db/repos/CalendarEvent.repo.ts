import { Entities } from "@beep/calendar-domain";
import { CalendarDb } from "@beep/calendar-server/db";
import { $CalendarServerId } from "@beep/identity/packages";
import { CalendarEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-server/factories";
import * as Effect from "effect/Effect";
import { dependencies } from "./_common";

const $I = $CalendarServerId.create("db/repos/CalendarEventRepo");

export class CalendarEventRepo extends Effect.Service<CalendarEventRepo>()($I`CalendarEventRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    yield* CalendarDb.Db;

    return yield* DbRepo.make(CalendarEntityIds.CalendarEventId, Entities.CalendarEvent.Model, Effect.succeed({}));
  }),
}) {}
