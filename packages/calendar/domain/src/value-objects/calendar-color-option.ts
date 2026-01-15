import { $CalendarDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const $I = $CalendarDomainId.create("value-objects/calendar-color-option");

export class CalendarColorOption extends BS.StringLiteralKit(
  "primary.main",
  "secondary.main",
  "info.main",
  "info.darker",
  "success.main",
  "warning.main",
  "error.main",
  "error.darker",
  {
    enumMapping: [
      ["primary.main", "PRIMARY_MAIN"],
      ["secondary.main", "SECONDARY_MAIN"],
      ["info.main", "INFO_MAIN"],
      ["info.darker", "INFO_DARKER"],
      ["success.main", "SUCCESS_MAIN"],
      ["warning.main", "WARNING_MAIN"],
      ["error.main", "ERROR_MAIN"],
      ["error.darker", "ERROR_DARKER"],
    ],
  }
).annotations(
  $I.annotations("CalendarColorOption", {
    description: "Calendar color option",
  })
) {}

export declare namespace CalendarColorOption {
  export type Type = S.Schema.Type<typeof CalendarColorOption>;
  export type Encoded = S.Schema.Encoded<typeof CalendarColorOption>;
}
