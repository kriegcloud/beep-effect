import { $CalendarDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $CalendarDomainId.create("values/CalendarRange.value");

export class CalendarRange extends S.Class<CalendarRange>($I`CalendarRange`)(
  {
    start: BS.DateTimeUtcFromAllAcceptable,
    end: BS.DateTimeUtcFromAllAcceptable,
  },
  $I.annotations("CalendarRange", {
    description: "Calendar range",
  })
) {}
