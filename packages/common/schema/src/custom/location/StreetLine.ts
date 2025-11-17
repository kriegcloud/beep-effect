import { faker } from "@faker-js/faker";
import * as S from "effect/Schema";
import { Id } from "./_id";
export class StreetLine extends S.NonEmptyTrimmedString.pipe(S.maxLength(200)).annotations(
  Id.annotations("StreetLine", {
    description: "A street line",
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.location.streetAddress()),
    jsonSchema: {
      type: "string",
      format: "street-line",
    },
  })
) {}

export declare namespace StreetLine {
  export type Type = S.Schema.Type<typeof StreetLine>;
  export type Encoded = S.Schema.Encoded<typeof StreetLine>;
}
