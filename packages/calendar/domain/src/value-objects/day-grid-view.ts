import { $CalendarDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const $I = $CalendarDomainId.create("value-objects/day-grid-view");

export class DayGridView extends BS.StringLiteralKit(
  "dayGrid",
  "dayGridDay",
  "dayGridWeek",
  "dayGridMonth",
  "dayGridYear"
).annotations(
  $I.annotations("DayGridView", {
    description: "Day grid view",
  })
) {}

export declare namespace DayGridView {
  export type Type = S.Schema.Type<typeof DayGridView>;
  export type Encoded = S.Schema.Encoded<typeof DayGridView>;
}
