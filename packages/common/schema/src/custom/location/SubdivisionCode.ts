import * as S from "effect/Schema";

/** ISO 3166-2 subdivision code (e.g., US-CA, CA-ON, GB-ENG, CN-11) */
export class SubdivisionCode extends S.NonEmptyTrimmedString.pipe(
  S.uppercased(),
  // CC-XXX where right side is 1..3 letters/digits (covers common patterns)
  S.pattern(/^[A-Z]{2}-[A-Z0-9]{1,3}$/),
  S.brand("SubdivisionCode")
).annotations({
  schemaId: Symbol.for("@beep/schema/custom/location/SubdivisionCode"),
  identifier: "SubdivisionCode",
  title: "Subdivision Code",
  description: "ISO 3166-2 subdivision code (e.g., US-CA, CA-ON, GB-ENG, CN-11)",
  jsonSchema: {
    type: "string",
    format: "subdivision-code",
  },
}) {}

export declare namespace SubdivisionCode {
  export type Type = S.Schema.Type<typeof SubdivisionCode>;
  export type Encoded = S.Schema.Encoded<typeof SubdivisionCode>;
}
