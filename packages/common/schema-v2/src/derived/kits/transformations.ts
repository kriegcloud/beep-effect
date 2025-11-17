/**
 * Derived transformations that convert between primitive schema inputs.
 *
 * Houses helpers like string-to-int conversions used by legacy DTOs.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { IntFromStr } from "@beep/schema-v2/derived/kits/transformations";
 *
 * const parsed = S.decodeSync(IntFromStr)("42");
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
import { Id } from "@beep/schema-v2/derived/kits/_id";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

/**
 * Transformation that parses an integer from a string.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { IntFromStr } from "@beep/schema-v2/derived/kits/transformations";
 *
 * S.decodeSync(IntFromStr)("123");
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export class IntFromStr extends S.transformOrFail(S.String, S.Int, {
  strict: true,
  decode: (i, _, ast) =>
    ParseResult.try({
      try: () => S.decodeSync(S.Int)(Number.parseInt(i, 10)),
      catch: () => new ParseResult.Type(ast, i, "Invalid int from string"),
    }),
  encode: (i, _) => ParseResult.succeed(String(i)),
}).annotations(
  Id.annotations("transformations/IntFromStr", {
    description: "Transforms a string into an integer",
  })
) {}

/**
 * Namespace exposing helper types for the `IntFromStr` schema.
 *
 * @example
 * import type { IntFromStr } from "@beep/schema-v2/derived/kits/transformations";
 *
 * type Parsed = IntFromStr.Type;
 *
 * @category Derived/Kits
 * @since 0.1.0
 */
export declare namespace IntFromStr {
  /**
   * Runtime type of the integer transformation schema.
   *
   * @example
   * import type { IntFromStr } from "@beep/schema-v2/derived/kits/transformations";
   *
   * let value: IntFromStr.Type;
   *
   * @category Derived/Kits
   * @since 0.1.0
   */
  export type Type = typeof IntFromStr.Type;
  /**
   * Encoded representation accepted by the integer transformation schema.
   *
   * @example
   * import type { IntFromStr } from "@beep/schema-v2/derived/kits/transformations";
   *
   * let encoded: IntFromStr.Encoded;
   *
   * @category Derived/Kits
   * @since 0.1.0
   */
  export type Encoded = typeof IntFromStr.Encoded;
}
