import { $CalendarDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const $I = $CalendarDomainId.create("value-objects/list-view");

export class ListView extends BS.StringLiteralKit("list", "listDay", "listWeek", "listMonth", "listYear").annotations(
  $I.annotations("ListView", {
    description: "List view",
  })
) {}

export declare namespace ListView {
  export type Type = S.Schema.Type<typeof ListView>;
  export type Encoded = S.Schema.Encoded<typeof ListView>;
}
