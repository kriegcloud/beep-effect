import { $CalendarDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const $I = $CalendarDomainId.create("value-objects/date-picker-control");

export const DatePickerControl = BS.OptionFromNullishOptionalProperty(
  BS.DateTimeUtcFromAllAcceptable,
  null
).annotations(
  $I.annotations("DatePickerControl", {
    description: "Datepicker control.",
  })
);

export declare namespace DatePickerControl {
  export type Type = S.Schema.Type<typeof DatePickerControl>;
  export type Encoded = S.Schema.Encoded<typeof DatePickerControl>;
}
