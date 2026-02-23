import { GoogleCalendarClient } from "@beep/google-workspace-client";
import { GoogleApiError } from "@beep/google-workspace-domain";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export const GoogleCalendarClientLive = Layer.succeed(
  GoogleCalendarClient,
  GoogleCalendarClient.of({
    listEvents: (_calendarId) =>
      Effect.fail(
        new GoogleApiError({
          message: "Not implemented - Phase 2 will add Google Calendar API integration",
          statusCode: 501,
          endpoint: "calendar.events.list",
        })
      ),
  })
);
