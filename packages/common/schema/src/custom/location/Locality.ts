import { faker } from "@faker-js/faker";
import type * as B from "effect/Brand";
import * as S from "effect/Schema";
import { Id } from "./_id";
/** Human locality / city name */
export class Locality extends S.String.pipe(
  S.trimmed(),
  S.minLength(1),
  S.maxLength(120),
  // keep it lenient — diacritics, spaces, punctuation are all fine
  // (avoid over-restricting, addresses are messy)
  S.brand("Locality")
).annotations(
  Id.annotations("Locality", {
    description: "Human locality / city name",
    arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.location.city() as B.Branded<string, "Locality">),
    jsonSchema: {
      type: "string",
      format: "locality",
    },
  })
) {}

export declare namespace Locality {
  export type Type = S.Schema.Type<typeof Locality>;
  export type Encoded = S.Schema.Encoded<typeof Locality>;
}
