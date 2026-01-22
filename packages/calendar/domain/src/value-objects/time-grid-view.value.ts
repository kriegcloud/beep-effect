import { $CalendarDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const $I = $CalendarDomainId.create("value-objects/time-grid-view");

export class TimeGridView extends BS.StringLiteralKit("timeGrid", "timeGridDay", "timeGridWeek").annotations(
  $I.annotations("TimeGridView", {
    description: "Time grid view",
  })
) {}

export declare namespace TimeGridView {
  export type Type = S.Schema.Type<typeof TimeGridView>;
  export type Encoded = S.Schema.Encoded<typeof TimeGridView>;
}
