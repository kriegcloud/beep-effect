import { $CalendarDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const $I = $CalendarDomainId.create("value-objects/calendar-view");

// Combined view options from ListView, DayGridView, and TimeGridView
export class CalendarView extends BS.StringLiteralKit(
  // ListView options
  "list",
  "listDay",
  "listWeek",
  "listMonth",
  "listYear",
  // DayGridView options
  "dayGrid",
  "dayGridDay",
  "dayGridWeek",
  "dayGridMonth",
  "dayGridYear",
  // TimeGridView options
  "timeGrid",
  "timeGridDay",
  "timeGridWeek"
).annotations(
  $I.annotations("CalendarView", {
    description: "calendar view",
  })
) {}

export declare namespace CalendarView {
  export type Type = S.Schema.Type<typeof CalendarView>;
  export type Encoded = S.Schema.Encoded<typeof CalendarView>;
}
