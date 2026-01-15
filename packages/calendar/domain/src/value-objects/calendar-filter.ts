import { $CalendarDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { DatePickerControl } from "./date-picker-control";

const $I = $CalendarDomainId.create("value-objects/calendar-filter");

export class CalendarFilter extends S.Class<CalendarFilter>($I`CalendarFilter`)(
  {
    colors: S.Array(S.String),
    startDate: DatePickerControl,
    endDate: DatePickerControl,
  },
  $I.annotations("CalendarFilter", {
    description: "Calendar filter",
  })
) {}
