import { TaggedClass } from "@beep/schema/custom/Class.schema";
import { HexColor } from "@beep/schema/custom/Hex.schema";
import { IntFromStr } from "@beep/schema/custom/Transformations.schema";
import { destructiveTransform } from "@beep/schema/extended-schemas";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Tuple from "effect/Tuple";

export class RGBNumberPart extends S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(255)).annotations({
  schemaId: Symbol.for("@beep/schema/RGBNumberPart"),
  identifier: "RGBNumberPart",
  title: "RGB Number Part",
  description: "RGB Number Part",
}) {}

export class TaggedRGBNumberPart extends TaggedClass<TaggedRGBNumberPart>("TaggedRGBNumberPart")(
  "RGBNumberPart",
  {
    value: RGBNumberPart,
  },
  {
    schemaId: Symbol.for("@beep/schema/TaggedRGBNumberPart"),
    identifier: "TaggedRGBNumberPart",
    title: "Tagged RGB Number Part",
    description: "Tagged RGB Number Part",
  }
) {}

export declare namespace TaggedRGBNumberPart {
  export type Type = typeof TaggedRGBNumberPart.Type;
  export type Encoded = typeof TaggedRGBNumberPart.Encoded;
}

export class RGBPercentPart extends S.String.pipe(
  S.endsWith("%"),
  S.filter((i) =>
    F.pipe(
      Str.replace("%", "")(i),
      S.decodeUnknownOption(IntFromStr),
      O.match({
        onNone: () => false,
        onSome: (i) => P.and(Num.greaterThanOrEqualTo(0), Num.lessThanOrEqualTo(100))(i),
      })
    )
  )
).annotations({
  schemaId: Symbol.for("@beep/schema/RGBPercentPart"),
  identifier: "RGBPercentPart",
  title: "RGB Percent Part",
  description: "RGB Percent Part. (0-100%)",
}) {}

export class TaggedRGBPercentPart extends TaggedClass<TaggedRGBPercentPart>("TaggedRGBPercentPart")(
  "RGBPercentPart",
  {
    value: RGBPercentPart,
  },
  {
    schemaId: Symbol.for("@beep/schema/TaggedRGBPercentPart"),
    identifier: "TaggedRGBPercentPart",
    title: "Tagged RGB Percent Part",
    description: "Tagged RGB Percent Part",
  }
) {}

export declare namespace TaggedRGBPercentPart {
  export type Type = typeof TaggedRGBPercentPart.Type;
  export type Encoded = typeof TaggedRGBPercentPart.Encoded;
}

export class RGBPart extends S.Union(RGBPercentPart, RGBNumberPart).annotations({
  schemaId: Symbol.for("@beep/schema/RGBPart"),
  identifier: "RGBPart",
  title: "RGB Part",
  description: "RGB Part",
}) {}

export class DiscriminatedRGBPart extends S.Union(
  S.transform(RGBNumberPart, TaggedRGBNumberPart, {
    strict: true,
    decode: (i) => ({ _tag: "RGBNumberPart" as const, value: i }) as const,
    encode: (i) => i.value,
  }),
  S.transform(RGBPercentPart, TaggedRGBPercentPart, {
    strict: true,
    decode: (i) => ({ _tag: "RGBPercentPart" as const, value: i }) as const,
    encode: (i) => i.value,
  })
).annotations({
  schemaId: Symbol.for("@beep/schema/DiscriminatedRGBPart"),
  identifier: "DiscriminatedRGBPart",
  title: "Discriminated RGB Part",
  description: "Discriminated RGB Part",
}) {}

export declare namespace RGBPart {
  export type Type = typeof RGBPart.Type;
  export type Encoded = typeof RGBPart.Encoded;
}

export declare namespace RGBPercentPart {
  export type Type = typeof RGBPercentPart.Type;
  export type Encoded = typeof RGBPercentPart.Encoded;
}

export declare namespace RGBNumberPart {
  export type Type = typeof RGBNumberPart.Type;
  export type Encoded = typeof RGBNumberPart.Encoded;
}

export const RGBLiteralValueEncoded = S.TemplateLiteral(S.Number, " ", S.Number, " ", S.Number);

export declare namespace RGBLiteralValueEncoded {
  export type Type = typeof RGBLiteralValueEncoded.Type;
  export type Encoded = typeof RGBLiteralValueEncoded.Encoded;
}

// export const RGBValue = IntFromStr.pipe(
//
// )

export class RGBValuesTuple extends S.Tuple(RGBPart, RGBPart, RGBPart).annotations({
  schemaId: Symbol.for("@beep/schema/RGBValuesTuple"),
  identifier: "RGBValuesTuple",
  title: "RGB Values Tuple",
  description: "RGB Values Tuple",
}) {}

export declare namespace RGBValuesTuple {
  export type Type = typeof RGBValuesTuple.Type;
  export type Encoded = typeof RGBValuesTuple.Encoded;
}

const isRGBLiteralValue = (i: unknown): i is `${RGBPart.Type} ${RGBPart.Type} ${RGBPart.Type}` => {
  if (!Str.isString(i)) return false;
  if (!P.and(Str.isNonEmpty, Str.includes(" "))(i)) return false;
  const parts = Str.split(/\s+/)(Str.trim(i));
  if (!A.isNonEmptyReadonlyArray(parts) || A.length(parts) !== 3) return false;

  const partsOption = A.map(parts, O.fromNullable);

  if (
    !A.some(
      partsOption,
      O.match({
        onNone: () => false,
        onSome: () => true,
      })
    )
  )
    return false;

  const rgbValueParts = A.map(partsOption, O.getOrThrow);

  if (!P.isTupleOf(3)(rgbValueParts)) return false;

  const rgbValuesOption = S.decodeOption(RGBValuesTuple)(rgbValueParts);

  if (O.isNone(rgbValuesOption)) return false;

  const [r, g, b] = rgbValuesOption;

  return F.pipe(
    `${r} ${g} ${b}`,
    S.decodeUnknownOption(RGBLiteralValueEncoded),
    O.match({
      onNone: () => false,
      onSome: () => true,
    })
  );
};

export class RGBLiteralValue extends S.declare(isRGBLiteralValue)
  .pipe(S.brand("RGBLiteralValue"))
  .annotations({
    schemaId: Symbol.for("@beep/schema/RGBLiteralValue"),
    identifier: "RGBLiteralValue",
    title: "RGB Literal Value ",
    description: "RGB Literal Value ",
  }) {
  static readonly toCssRGB = (i: RGBLiteralValue.Encoded): `rgb(${RGBPart.Type} ${RGBPart.Type} ${RGBPart.Type})` =>
    `rgb(${i})` as const;
}

export declare namespace RGBLiteralValue {
  export type Type = typeof RGBLiteralValue.Type;
  export type Encoded = typeof RGBLiteralValue.Encoded;
}

export class RGBLiteralValueFromString extends S.transformOrFail(S.NonEmptyTrimmedString, RGBLiteralValue, {
  strict: true,
  decode: (i, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(RGBLiteralValue)(i),
      catch: () => new ParseResult.Type(ast, i, "Invalid RGB literal value"),
    }),
  encode: (i) => ParseResult.succeed(i),
}).annotations({
  schemaId: Symbol.for("@beep/schema/RGBLiteralValueFromString"),
  identifier: "RGBLiteralValueFromString",
  title: "RGB Literal Value From String",
  description: "RGB Literal Value From String",
}) {}

export declare namespace RGBLiteralValueFromString {
  export type Type = typeof RGBLiteralValueFromString.Type;
  export type Encoded = typeof RGBLiteralValueFromString.Encoded;
}

export class RGBLiteralValueFromTuple extends S.transformOrFail(RGBValuesTuple, RGBLiteralValue, {
  strict: true,
  decode: (i, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(RGBLiteralValue)(`${i[0]} ${i[1]} ${i[2]}`),
      catch: () => new ParseResult.Type(ast, i, "Invalid RGB literal value from tuple"),
    }),
  encode: (i, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(RGBValuesTuple)(Str.split(/\s+/)(Str.trim(i))),
      catch: () => new ParseResult.Type(ast, i, "Invalid RGB literal value from tuple"),
    }),
}).annotations({
  schemaId: Symbol.for("@beep/schema/RGBLiteralValueFromTuple"),
  identifier: "RGBLiteralValueFromTuple",
  title: "RGB Literal Value From Tuple",
  description: "RGB Literal Value From Tuple",
}) {}

export declare namespace RGBLiteralValueFromTuple {
  export type Type = typeof RGBLiteralValueFromTuple.Type;
  export type Encoded = typeof RGBLiteralValueFromTuple.Encoded;
}

export const RGBFromHex = destructiveTransform((i: HexColor.Type) => {
  const r = Number.parseInt(i.substring(1, 3), 16);
  const g = Number.parseInt(i.substring(3, 5), 16);
  const b = Number.parseInt(i.substring(5, 7), 16);

  return S.decodeUnknownSync(RGBLiteralValue)(`${r} ${g} ${b}`);
})(HexColor);

export declare namespace RGBFromHex {
  export type Type = typeof RGBFromHex.Type;
  export type Encoded = typeof RGBFromHex.Encoded;
}

/**
 * Convert a space-separated "r g b" string into "#RRGGBB".
 * - Accepts numbers (0–255) or percentages (0%–100%).
 * - Clamps out-of-range values and rounds to the nearest integer.
 * - Set { uppercase: true } if you prefer "#FF007F".
 */
export function rgbChannelToHex(channel: string) {
  const parts = S.decodeUnknownSync(RGBValuesTuple)(Str.split(/\s+/)(Str.trim(channel)));

  const toBytes = (tuple: RGBValuesTuple.Type) => {
    const toByte = (i: RGBPart.Type): number => {
      const token = String(i);
      const m = token.match(/^([+-]?(?:\d+\.?\d*|\.\d+))(%)?$/);
      if (!m) throw new Error(`Invalid component: "${token}"`);
      const value = Number(m[1]);
      const isPct = !!m[2];
      // 0–255 for numbers; 0%–100% for percentages
      let n = isPct ? (value / 100) * 255 : value;
      // clamp + round to integer byte
      n = Math.min(255, Math.max(0, Math.round(n)));
      return n;
    };

    return S.decodeSync(RGBValuesTuple)(Tuple.map(tuple, toByte));
  };

  const [r, g, b] = toBytes(parts);

  const h2 = (n: number) => n.toString(16).padStart(2, "0");
  let hex = `#${h2(Number(r))}${h2(Number(g))}${h2(Number(b))}` as const;

  const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);

  if (m && m[1]?.[0] === m[1]?.[1] && m[2]?.[0] === m[2]?.[1] && m[3]?.[0] === m[3]?.[1]) {
    hex = `#${m[1]?.[0]}${m[2]?.[0]}${m[3]?.[0]}` as const;
  }

  return S.decodeSync(HexColor)(Str.toUpperCase(hex));
}
