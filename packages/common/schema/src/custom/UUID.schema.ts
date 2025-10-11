import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { v4 as randomUUID } from "uuid";
export const BrandedUUID = <const Brand extends string>(brand: Brand) => S.UUID.pipe(S.brand(brand));
// todo should be check for length on these string but `S.TemplateLiteral` doesn't support it yet.
export class UUIDLiteralEncoded extends S.TemplateLiteral(
  S.String,
  "-",
  S.String,
  "-",
  S.String,
  "-",
  S.String,
  "-",
  S.String
).annotations({
  schemaId: Symbol.for("@beep/schema/custom/UUIDLiteralEncoded"),
  identifier: "UUIDLiteralEncoded",
  title: "UUID Literal Encoded",
  description: "UUID Literal Encoded",
}) {
  static readonly make = (): UUIDLiteralEncoded.Type =>
    randomUUID() as `${string}-${string}-${string}-${string}-${string}`;
}

export declare namespace UUIDLiteralEncoded {
  export type Type = S.Schema.Type<typeof UUIDLiteralEncoded>;
  export type Encoded = S.Schema.Encoded<typeof UUIDLiteralEncoded>;
}

export class UUIDLiteral extends S.transformOrFail(UUIDLiteralEncoded, S.UUID, {
  strict: true,
  decode: (i, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(S.UUID)(i),
      catch: () => new ParseResult.Type(ast, i, "Invalid UUID"),
    }),
  encode: (i, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(UUIDLiteralEncoded)(i),
      catch: () => new ParseResult.Type(ast, i, "Invalid UUID"),
    }),
}) {}

export declare namespace UUIDLiteral {
  export type Type = S.Schema.Type<typeof UUIDLiteral>;
  export type Encoded = S.Schema.Encoded<typeof UUIDLiteral>;
}
