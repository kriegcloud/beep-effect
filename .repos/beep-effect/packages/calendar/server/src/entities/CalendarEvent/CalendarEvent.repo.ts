import { Entities } from "@beep/calendar-domain";
import { CalendarDb } from "@beep/calendar-server/db";
import { CalendarEntityIds } from "@beep/shared-domain";
import type { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import * as Layer from "effect/Layer";

const serviceEffect = DbRepo.make(CalendarEntityIds.CalendarEventId, Entities.CalendarEvent.Model);

export const RepoLive: Layer.Layer<Entities.CalendarEvent.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Entities.CalendarEvent.Repo,
  serviceEffect
).pipe(Layer.provide(CalendarDb.layer));
