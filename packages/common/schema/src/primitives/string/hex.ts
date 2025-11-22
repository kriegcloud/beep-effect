/**
 * Hex color schemas that validate CSS-style `#RGB`, `#RRGGBB`, or `#RRGGBBAA` values.
 *
 * Provides encoded and decoded variants along with a transform enforcing canonical formatting.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { HexColor } from "@beep/schema/primitives/string/hex";
 *
 * const color = S.decodeSync(HexColor)("#ff00ff");
 *
 * @category Primitives/String
 * @since 0.1.0
 */

import { $StringId } from "@beep/schema/internal";
import * as regexes from "@beep/schema/internal/regex/regexes";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

const { $HexId: Id } = $StringId.compose("hex");

/**
 * Hex color encoded schema capturing raw string literals.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { HexColorEncoded } from "@beep/schema/primitives/string/hex";
 *
 * S.decodeSync(HexColorEncoded)("#fff");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export const HexColorEncoded = S.TemplateLiteral("#", S.String).annotations(
  Id.annotations("hex/HexColorEncoded", {
    description: "CSS hex color encoded as a string.",
    jsonSchema: {
      type: "string",
      format: "hex-color",
    },
  })
);

/**
 * Namespace describing runtime and encoded types for {@link HexColorEncoded}.
 *
 * @example
 * import type { HexColorEncoded } from "@beep/schema/primitives/string/hex";
 *
 * type RawHex = HexColorEncoded.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace HexColorEncoded {
  /**
   * Runtime type alias for {@link HexColorEncoded}.
   *
   * @example
   * import type { HexColorEncoded } from "@beep/schema/primitives/string/hex";
   *
   * let raw: HexColorEncoded.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = typeof HexColorEncoded.Type;
  /**
   * Encoded type alias for {@link HexColorEncoded}.
   *
   * @example
   * import type { HexColorEncoded } from "@beep/schema/primitives/string/hex";
   *
   * let encoded: HexColorEncoded.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = typeof HexColorEncoded.Encoded;
}

/**
 * Trimmed, validated, branded hex color schema.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { HexColorDecoded } from "@beep/schema/primitives/string/hex";
 *
 * S.decodeSync(HexColorDecoded)("#ff00ff");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export const HexColorDecoded = S.NonEmptyTrimmedString.pipe(
  S.startsWith("#", { message: () => "Hex color must start with #" }),
  S.pattern(regexes.css_hex_color_regex, { message: () => "Hex color must be a valid CSS hex color" }),
  S.brand("HexColor")
).annotations(
  Id.annotations("hex/HexColorDecoded", {
    description: "Canonical representation of a CSS hex color.",
    jsonSchema: {
      type: "string",
      format: "hex-color",
    },
  })
);

/**
 * Namespace describing runtime and encoded types for {@link HexColorDecoded}.
 *
 * @example
 * import type { HexColorDecoded } from "@beep/schema/primitives/string/hex";
 *
 * type CanonicalHex = HexColorDecoded.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace HexColorDecoded {
  /**
   * Runtime type alias for {@link HexColorDecoded}.
   *
   * @example
   * import type { HexColorDecoded } from "@beep/schema/primitives/string/hex";
   *
   * let normalized: HexColorDecoded.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = typeof HexColorDecoded.Type;
  /**
   * Encoded type alias for {@link HexColorDecoded}.
   *
   * @example
   * import type { HexColorDecoded } from "@beep/schema/primitives/string/hex";
   *
   * let encoded: HexColorDecoded.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = typeof HexColorDecoded.Encoded;
}

/**
 * Transform schema that enforces bidirectional conversion between encoded and decoded hex colors.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { HexColor } from "@beep/schema/primitives/string/hex";
 *
 * const decoded = S.decodeSync(HexColor)("#ffffff");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class HexColor extends S.transformOrFail(HexColorEncoded, HexColorDecoded, {
  strict: true,
  decode: (value, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(HexColorDecoded)(value),
      catch: () => new ParseResult.Type(ast, value, "Invalid hex color"),
    }),
  encode: (value, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(HexColorEncoded)(value),
      catch: () => new ParseResult.Type(ast, value, "Invalid hex color"),
    }),
}).annotations(
  Id.annotations("hex/HexColor", {
    description: "Hex color schema with encoding/decoding guarantees.",
  })
) {
  /**
   * Constructs a decoded hex color from the encoded representation.
   */
  static readonly make = (value: HexColorEncoded.Type) => HexColorDecoded.make(value);
}

/**
 * Namespace describing runtime and encoded types for {@link HexColor}.
 *
 * @example
 * import type { HexColor } from "@beep/schema/primitives/string/hex";
 *
 * type HexValue = HexColor.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace HexColor {
  /**
   * Runtime type alias for {@link HexColor}.
   *
   * @example
   * import type { HexColor } from "@beep/schema/primitives/string/hex";
   *
   * let color: HexColor.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = typeof HexColor.Type;
  /**
   * Encoded type alias for {@link HexColor}.
   *
   * @example
   * import type { HexColor } from "@beep/schema/primitives/string/hex";
   *
   * let encoded: HexColor.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = typeof HexColor.Encoded;
}
