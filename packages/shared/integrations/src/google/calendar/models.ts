import { $SharedIntegrationsId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SharedIntegrationsId.create("google/calendar/models");

export class ResponseStatus extends BS.StringLiteralKit("needsAction", "declined", "tentative", "accepted").annotations(
  $I.annotations("ResponseStatus", {
    description: "ResponseStatus",
  })
) {}

export declare namespace ResponseStatus {
  export type Type = typeof ResponseStatus.Type;
}

export class CalendarEventReminderMethod extends BS.StringLiteralKit("email", "group").annotations(
  $I.annotations("CalendarEventReminderMethod", {
    description: "CalendarEventReminderMethod",
  })
) {}

export declare namespace CalendarEventReminderMethod {
  export type Type = typeof CalendarEventReminderMethod.Type;
}

export class CalendarEventStatus extends BS.StringLiteralKit("confirmed", "tentative", "cancelled").annotations(
  $I.annotations("CalendarEventStatus", {
    description: "CalendarEventStatus",
  })
) {}

export declare namespace CalendarEventStatus {
  export type Type = typeof CalendarEventStatus.Type;
}

export class CalendarEventVisibility extends BS.StringLiteralKit(
  "default",
  "public",
  "private",
  "confidential"
).annotations(
  $I.annotations("CalendarEventVisibility", {
    description: "CalendarEventVisibility",
  })
) {}

export declare namespace CalendarEventVisibility {
  export type Type = typeof CalendarEventVisibility.Type;
}

export class CalendarInfoAccessRole extends BS.StringLiteralKit(
  "freeBusyReader",
  "reader",
  "writer",
  "owner"
).annotations(
  $I.annotations("CalendarInfoAccessRole", {
    description: "CalendarInfoAccessRole",
  })
) {}

export declare namespace CalendarInfoAccessRole {
  export type Type = typeof CalendarInfoAccessRole.Type;
}

export class ListEventOrderByOptions extends BS.StringLiteralKit("startTime", "updated").annotations(
  $I.annotations("ListEventOrderByOptions", {
    description: "ListEventOrderByOptions",
  })
) {}

export declare namespace ListEventOrderByOptions {
  export type Type = typeof ListEventOrderByOptions.Type;
}

export class CalendarEventOrganizer extends S.Class<CalendarEventOrganizer>($I`CalendarEventOrganizer`)(
  {
    email: BS.Email,
    displayName: S.optionalWith(S.String, { as: "Option" }),
    self: S.optionalWith(S.Boolean, { default: () => false }),
  },
  $I.annotations("CalendarEventOrganizer", {
    description: "CalendarEventOrganizer",
  })
) {}

export class CalendarEventCreator extends S.Class<CalendarEventCreator>($I`CalendarEventCreator`)(
  {
    email: BS.Email,
    displayName: S.optionalWith(S.String, { as: "Option" }),
    self: S.optionalWith(S.Boolean, { default: () => false }),
  },
  $I.annotations("CalendarEventCreator", {
    description: "CalendarEventCreator",
  })
) {}

export class ReminderOverride extends S.Class<ReminderOverride>($I`ReminderOverride`)(
  {
    method: CalendarEventReminderMethod,
    minutes: S.Number,
  },
  $I.annotations("ReminderOverride", {
    description: "Individual reminder override with method and minutes before event",
  })
) {}

export class CalendarEventReminder extends S.Class<CalendarEventReminder>($I`CalendarEventReminder`)(
  {
    useDefault: S.Boolean,
    overrides: S.optionalWith(S.Array(ReminderOverride), { as: "Option" }),
  },
  $I.annotations("CalendarEventReminder", {
    description: "CalendarEventReminder",
  })
) {}
