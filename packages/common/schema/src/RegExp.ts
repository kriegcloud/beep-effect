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
 * Branded schema for strings that can be converted directly to `RegExp`.
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
 * One-way schema that decodes {@link RegExpStr} into `S.RegExp`.
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
 * @since 0.0.0
 * @category DomainModel
 */
export type RegExpFromStr = typeof RegExpFromStr.Type;
