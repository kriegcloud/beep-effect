import * as regexes from "@beep/schema/regexes";
import { faker } from "@faker-js/faker";
import * as S from "effect/Schema";

export class NameAttribute extends S.NonEmptyTrimmedString.pipe(
  S.minLength(1),
  S.maxLength(200),
  S.pattern(regexes.NO_ASCII_CTRL)
).annotations({
  schemaId: Symbol.for("@beep/schema/custom/NameAttribute"),
  identifier: "NameAttribute",
  title: "NameAttribute",
  description: "A generic name attribute of some entity or object",
  arbitrary: () => (fc) => fc.constantFrom(null).map(() => faker.lorem.word()),
}) {}

export declare namespace NameAttribute {
  export type Type = S.Schema.Type<typeof NameAttribute>;
  export type Encoded = S.Schema.Encoded<typeof NameAttribute>;
}
