import { $CalendarDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $CalendarDomainId.create("value-objects/calendar-event");

export class CalendarEvent extends S.Class<CalendarEvent>($I`CalendarEvent`)(
  {
    id: S.String,
    color: S.String,
    allDay: S.Boolean,
    description: S.String,
    end: BS.DateTimeUtcFromAllAcceptable,
    start: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("CalendarEvent", {
    description: "Calendar event",
  })
) {}
