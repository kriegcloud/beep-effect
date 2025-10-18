import { faker } from "@faker-js/faker";
import * as S from "effect/Schema";
export class StreetLine extends S.NonEmptyTrimmedString.pipe(S.maxLength(200)).annotations({
  schemaId: Symbol.for("@beep/schema/custom/location/StreetLine"),
  identifier: "StreetLine",
  title: "Street Line",
  description: "A street line",
  arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.location.streetAddress()),
  jsonSchema: {
    type: "string",
    format: "street-line",
  },
}) {}

export declare namespace StreetLine {
  export type Type = S.Schema.Type<typeof StreetLine>;
  export type Encoded = S.Schema.Encoded<typeof StreetLine>;
}
