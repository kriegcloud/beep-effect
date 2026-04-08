/**
 * Branded schema and one-way transform for JavaScript regular expression
 * pattern strings.
 *
 * @since 0.0.0
 * @module @beep/schema/RegExp
 */

import { $SchemaId } from "@beep/identity/packages";
import { Effect, Option, SchemaIssue, SchemaTransformation } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $SchemaId.create("RegExp");

const makeRegExp = (value: string): globalThis.RegExp => new globalThis.RegExp(value);

const canMakeRegExp = (value: string): boolean => {
  try {
    makeRegExp(value);
    return true;
  } catch {
    return false;
  }
};

const RegExpStrCheck = S.makeFilter(canMakeRegExp, {
  identifier: $I`RegExpStrCheck`,
  title: "RegExp String",
  description: "A string that can be converted to a JavaScript RegExp with new RegExp(value).",
  message: "Expected a valid regular expression pattern string",
});

const decodeRegExp = (value: string): Effect.Effect<globalThis.RegExp, SchemaIssue.Issue> =>
  Effect.try({
    try: () => makeRegExp(value),
    catch: (cause) =>
      new SchemaIssue.InvalidValue(Option.some(value), {
        message: P.isError(cause) ? cause.message : "Expected a valid regular expression pattern string",
      }),
  });

/**
 * Branded schema for strings that can be converted directly to a JavaScript `RegExp`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { RegExpStr } from "@beep/schema/RegExp"
 *
 * const pattern = S.decodeUnknownSync(RegExpStr)("^[a-z]+$")
 * console.log(pattern) // "^[a-z]+$"
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const RegExpStr = S.String.check(RegExpStrCheck).pipe(
  S.brand("RegExpStr"),
  S.annotate(
    $I.annote("RegExpStr", {
      description: "A string that can be converted directly to a JavaScript RegExp using new RegExp(value).",
    })
  )
);

/**
 * Type for {@link RegExpStr}.
 *
 * @example
 * ```ts
 * import type { RegExpStr } from "@beep/schema/RegExp"
 *
 * const pattern: RegExpStr = "\\d+" as RegExpStr
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type RegExpStr = typeof RegExpStr.Type;

const encodeRegExpStrForbidden = (value: globalThis.RegExp): Effect.Effect<RegExpStr, SchemaIssue.Issue> =>
  Effect.fail(
    new SchemaIssue.Forbidden(Option.some(value), {
      message: "Encoding RegExpFromStr back to the original pattern string is not supported",
    })
  );

/**
 * One-way schema that decodes a valid pattern string into a JavaScript `RegExp` object.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { RegExpFromStr } from "@beep/schema/RegExp"
 *
 * const program = Effect.gen(function* () {
 *   const re = yield* S.decodeUnknownEffect(RegExpFromStr)("^hello")
 *   console.log(re.test("hello world")) // true
 * })
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const RegExpFromStr = RegExpStr.pipe(
  S.decodeTo(
    S.RegExp,
    SchemaTransformation.transformOrFail({
      decode: decodeRegExp,
      encode: encodeRegExpStrForbidden,
    })
  ),
  S.annotate(
    $I.annote("RegExpFromStr", {
      description: "A one-way schema that decodes RegExp-compatible pattern strings into JavaScript RegExp values.",
    })
  )
);

/**
 * Type for {@link RegExpFromStr}.
 *
 * @example
 * ```ts
 * import type { RegExpFromStr } from "@beep/schema/RegExp"
 *
 * const re: RegExpFromStr = /hello/ as RegExpFromStr
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type RegExpFromStr = typeof RegExpFromStr.Type;
