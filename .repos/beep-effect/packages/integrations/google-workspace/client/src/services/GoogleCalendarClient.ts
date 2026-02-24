import type { GoogleApiError } from "@beep/google-workspace-domain";
import { $GoogleWorkspaceClientId } from "@beep/identity/packages";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";

const $I = $GoogleWorkspaceClientId.create("services/GoogleCalendarClient");
export class GoogleCalendarClient extends Context.Tag($I`GoogleCalendarClient`)<
  GoogleCalendarClient,
  {
    readonly listEvents: (calendarId?: string) => Effect.Effect<ReadonlyArray<unknown>, GoogleApiError>;
  }
>() {}
