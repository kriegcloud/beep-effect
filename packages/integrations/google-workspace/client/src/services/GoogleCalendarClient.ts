import type { GoogleApiError } from "@beep/google-workspace-domain";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";

export class GoogleCalendarClient extends Context.Tag("GoogleCalendarClient")<
  GoogleCalendarClient,
  {
    readonly listEvents: (calendarId?: string) => Effect.Effect<ReadonlyArray<unknown>, GoogleApiError>;
  }
>() {}
