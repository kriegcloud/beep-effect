import { POSTAL_CODE_REGEX } from "@beep/schema/regexes";
import { faker } from "@faker-js/faker";
import * as F from "effect/Function";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Str from "effect/String";
export class PostalCodeRawEncoded extends S.NonEmptyTrimmedString.pipe(
  S.uppercased(),
  S.minLength(1),
  S.maxLength(16)
).annotations({
  schemaId: Symbol.for("@beep/schema/custom/location/PostalCode/PostalCodeRawEncoded"),
  identifier: "PostalCodeRawEncoded",
  title: "Postal Code Raw Encoded",
  description: "A postal code in its raw encoded form",
}) {}

export declare namespace PostalCodeRawEncoded {
  export type Type = S.Schema.Type<typeof PostalCodeRawEncoded>;
  export type Encoded = S.Schema.Encoded<typeof PostalCodeRawEncoded>;
}

export class PostalCodeRawDecoded extends PostalCodeRawEncoded.pipe(S.brand("PostalCodeRaw")).annotations({
  schemaId: Symbol.for("@beep/schema/custom/location/PostalCode/PostalCodeRawDecoded"),
  identifier: "PostalCodeRawDecoded",
  title: "Postal Code Raw Decoded",
  description: "A postal code in its raw decoded form",
}) {}

export declare namespace PostalCodeRawDecoded {
  export type Type = S.Schema.Type<typeof PostalCodeRawDecoded>;
  export type Encoded = S.Schema.Encoded<typeof PostalCodeRawDecoded>;
}

export class PostalCodeRaw extends S.transformOrFail(PostalCodeRawEncoded, PostalCodeRawDecoded, {
  strict: true,
  decode: (i, _, ast) =>
    ParseResult.try({
      try: () => F.pipe(i, Str.replace(/\s+/g, " "), Str.trim, S.decodeUnknownSync(PostalCodeRawDecoded)),
      catch: () => new ParseResult.Type(ast, i, "Invalid postal code raw decoded"),
    }),
  encode: (i) => ParseResult.succeed(i),
}).annotations({
  schemaId: Symbol.for("@beep/schema/custom/location/PostalCode/PostalCodeRaw"),
  identifier: "PostalCodeRaw",
  title: "Postal Code Raw",
  description: "A postal code in its raw form",
}) {}

export declare namespace PostalCodeRaw {
  export type Type = S.Schema.Type<typeof PostalCodeRaw>;
  export type Encoded = S.Schema.Encoded<typeof PostalCodeRaw>;
}

export class PostalCode extends S.Union(
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.US)),
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.CANADA)),
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.GREAT_BRITAIN)),
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.GERMANY)),
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.FRANCE)),
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.NETHERLANDS)),
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.AUSTRALIA)),
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.BRAZIL)),
  PostalCodeRaw.pipe(S.pattern(POSTAL_CODE_REGEX.IRELAND))
).annotations({
  schemaId: Symbol.for("@beep/schema/custom/location/PostalCode/PostalCode"),
  identifier: "PostalCode",
  title: "Postal Code",
  description: "A postal code",
  arbitrary: () => (fc) => fc.constantFrom(null).map(() => PostalCodeRawDecoded.make(faker.location.zipCode())),
}) {}

export declare namespace PostalCode {
  export type Type = S.Schema.Type<typeof PostalCode>;
  export type Encoded = S.Schema.Encoded<typeof PostalCode>;
}
