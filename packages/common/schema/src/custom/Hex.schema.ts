import * as regexes from "@beep/schema/regexes";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
export const HexColorEncoded = S.TemplateLiteral("#", S.String).annotations({
  schemaId: Symbol.for("@beep/schema/HexColorEncoded"),
  identifier: "HexColorEncoded",
  title: "Css Hex Color",
  description: "Represents a css hex color encoded as a string",
  jsonSchema: {
    type: "string",
    format: "hex-color",
  },
});

export declare namespace HexColorEncoded {
  export type Type = typeof HexColorEncoded.Type;
  export type Encoded = typeof HexColorEncoded.Encoded;
}

export const HexColorDecoded = S.NonEmptyTrimmedString.pipe(
  S.startsWith("#", { message: () => "Hex color must start with #" }),
  S.pattern(regexes.css_hex_color_regex, { message: () => "Hex color must be a valid css hex color" }),
  S.brand("HexColor")
).annotations({
  schemaId: Symbol.for("@beep/schema/HexColorDecoded"),
  identifier: "HexColorDecoded",
  title: "Css Hex Color",
  description: "Represents a css hex color",
  jsonSchema: {
    type: "string",
    format: "hex-color",
  },
});

export declare namespace HexColorDecoded {
  export type Type = typeof HexColorDecoded.Type;
  export type Decoded = typeof HexColorDecoded.Encoded;
}

export class HexColor extends S.transformOrFail(HexColorEncoded, HexColorDecoded, {
  strict: true,
  decode: (i, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(HexColorDecoded)(i),
      catch: () => new ParseResult.Type(ast, i, "Invalid hex color"),
    }),
  encode: (i, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(HexColorEncoded)(i),
      catch: () => new ParseResult.Type(ast, i, "Invalid hex color"),
    }),
}).annotations({
  schemaId: Symbol.for("@beep/schema/HexColor"),
  identifier: "HexColor",
  title: "Css Hex Color",
  description: "Represents a css hex color",
}) {
  static readonly make = (i: HexColorEncoded.Type) => HexColorDecoded.make(i);
}

export declare namespace HexColor {
  export type Type = typeof HexColor.Type;
  export type Encoded = typeof HexColor.Encoded;
}
