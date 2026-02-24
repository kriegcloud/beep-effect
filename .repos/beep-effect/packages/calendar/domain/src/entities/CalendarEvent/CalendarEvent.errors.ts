import { $CalendarDomainId } from "@beep/identity/packages";
import { CalendarEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $CalendarDomainId.create("entities/CalendarEvent/CalendarEvent.errors");

export class CalendarEventNotFoundError extends S.TaggedError<CalendarEventNotFoundError>()(
  $I`CalendarEventNotFoundError`,
  { id: CalendarEntityIds.CalendarEventId },
  $I.annotationsHttp("CalendarEventNotFoundError", {
    status: 404,
    description: "Error when a calendar event with the specified ID cannot be found.",
  })
) {}

export class CalendarEventPermissionDeniedError extends S.TaggedError<CalendarEventPermissionDeniedError>()(
  $I`CalendarEventPermissionDeniedError`,
  { id: CalendarEntityIds.CalendarEventId },
  $I.annotationsHttp("CalendarEventPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the calendar event.",
  })
) {}

export const Errors = S.Union(CalendarEventNotFoundError, CalendarEventPermissionDeniedError);
export type Errors = typeof Errors.Type;
