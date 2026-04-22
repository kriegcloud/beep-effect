/**
 * HTTP header schema helpers.
 *
 * @module
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import { cast } from "@beep/utils/Function";
import { Effect, identity, Option, SchemaIssue, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $SchemaId.create("http/headers/_internal/helpers");

/**
 * @since 0.0.0
 */
export const ArrayOfStrOrStr = S.Union([S.String, S.Array(S.String)]).pipe(
  $I.annoteSchema("ArrayOfStrOrStr", {
    description: "A string or array of strings.",
  })
);

/**
 * @since 0.0.0
 */
export type ArrayOfStrOrStr = typeof ArrayOfStrOrStr.Type;

/**
 * @since 0.0.0
 */
export const StringOrUrl = S.Union([S.String, S.URL]).pipe(
  $I.annoteSchema("StringOrUrl", {
    description: "A string or URL.",
  })
);

/**
 * @since 0.0.0
 */
export type StringOrUrl = typeof StringOrUrl.Type;

/**
 * @since 0.0.0
 */
export const EncodedStrictURIFromStrOrURL = StringOrUrl.pipe(
  S.decodeTo(
    S.String.pipe(S.brand("EncodedStrictURIFromStrOrURL")),
    SchemaTransformation.transformOrFail({
      decode: (input) =>
        Effect.try({
          try: () => new URL(String(input)).toString(),
          catch: (cause) =>
            new SchemaIssue.InvalidValue(Option.some(input), {
              message: P.isError(cause) ? cause.message : "Expected a valid absolute URL.",
            }),
        }),
      encode: (uri) => Effect.succeed(identity(uri)),
    })
  ),
  $I.annoteSchema("EncodedStrictURIFromStrOrURL", {
    description: "A destructively transformed encoded strict URI string from a string or URL.",
  })
);

/**
 * @since 0.0.0
 */
export type EncodedStrictURIFromStrOrURL = typeof EncodedStrictURIFromStrOrURL.Type;

const decodeStrictURI = S.decodeUnknownSync(EncodedStrictURIFromStrOrURL);

/**
 * @since 0.0.0
 */
export const encodeStrictURI = (value: StringOrUrl): EncodedStrictURIFromStrOrURL => decodeStrictURI(value);

/**
 * @since 0.0.0
 */
export const encodeStrictURIOption = S.decodeUnknownOption(EncodedStrictURIFromStrOrURL);

/**
 * @since 0.0.0
 */
export const wrapArray = <T>(value: T | ReadonlyArray<T>): readonly T[] =>
  A.isArray(value) ? cast(value) : cast(A.make(value));

/**
 * @since 0.0.0
 */
export class ResponseHeader extends S.Class<ResponseHeader>($I`ResponseHeader`)(
  {
    name: S.String,
    value: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("ResponseHeader", {
    description: "A response header.",
  })
) {}

/**
 * @since 0.0.0
 */
export const makeHeaderEncodeForbidden =
  <A>(schemaName: string) =>
  (header: A): Effect.Effect<never, SchemaIssue.Issue> =>
    Effect.fail(
      new SchemaIssue.Forbidden(Option.some(header), {
        message: `Encoding ${schemaName} back to the original input is not supported`,
      })
    );

/**
 * @since 0.0.0
 */
export const makeResponseHeader = (name: string, value: string): ResponseHeader =>
  new ResponseHeader({
    name,
    value: Option.some(value),
  });

/**
 * @since 0.0.0
 */
export const makeResponseHeaderOption = (name: string, value: Option.Option<string>): Option.Option<ResponseHeader> =>
  Option.map(value, (headerValue) => makeResponseHeader(name, headerValue));
