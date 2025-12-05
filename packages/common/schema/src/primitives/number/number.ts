/**
 * Numeric helper schemas covering dual string/number inputs.
 *
 * Converts lenient external payloads into normalized numbers without leaking parser errors downstream.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { StringOrNumberToNumber } from "@beep/schema/primitives/number/number";
 *
 * const parsed = S.decodeSync(StringOrNumberToNumber)("42.5");
 *
 * @category Primitives/Number
 * @since 0.1.0
 */

import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { $NumberId } from "../../internal";

const { $NumberId: Id } = $NumberId.compose("number");
/**
 * Schema transformer that converts string or number input to number output.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { StringOrNumberToNumber } from "@beep/schema/primitives/number/number";
 *
 * const parsed = S.decodeSync(StringOrNumberToNumber)(0);
 *
 * @category Primitives/Number
 * @since 0.1.0
 */
export const StringOrNumberToNumber = S.transformOrFail(S.Union(S.String, S.Number), S.Number, {
  decode: (value) => {
    if (typeof value === "number") {
      return ParseResult.succeed(value);
    }
    const parsed = Number.parseFloat(value);
    if (Number.isNaN(parsed)) {
      return ParseResult.fail(new ParseResult.Type(S.Number.ast, value));
    }
    return ParseResult.succeed(parsed);
  },
  encode: (value) => ParseResult.succeed(String(value)),
  strict: true,
}).annotations(
  Id.annotations("number/StringOrNumberToNumber", {
    description: "Schema transformer that converts string or number input to number output.",
  })
);

/**
 * Namespace exposing helper types for the `StringOrNumberToNumber` schema.
 *
 * @example
 * import type { StringOrNumberToNumber } from "@beep/schema/primitives/number/number";
 *
 * type Parsed = StringOrNumberToNumber.Type;
 *
 * @category Primitives/Number
 * @since 0.1.0
 */
export declare namespace StringOrNumberToNumber {
  /**
   * Runtime type emitted by the `StringOrNumberToNumber` schema.
   *
   * @example
   * import type { StringOrNumberToNumber } from "@beep/schema/primitives/number/number";
   *
   * let result: StringOrNumberToNumber.Type;
   *
   * @category Primitives/Number
   * @since 0.1.0
   */
  export type Type = typeof StringOrNumberToNumber.Type;
  /**
   * Encoded representation accepted by the `StringOrNumberToNumber` schema.
   *
   * @example
   * import type { StringOrNumberToNumber } from "@beep/schema/primitives/number/number";
   *
   * let encoded: StringOrNumberToNumber.Encoded;
   *
   * @category Primitives/Number
   * @since 0.1.0
   */
  export type Encoded = typeof StringOrNumberToNumber.Encoded;
}
