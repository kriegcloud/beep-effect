/**
 * Schema for the `Referrer-Policy` header.
 *
 * @since 0.0.0
 * @module
 */
import { $SchemaId } from "@beep/identity";
import { Effect, SchemaIssue, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { LiteralKit } from "../../LiteralKit.ts";
import * as SchemaUtils from "../../SchemaUtils/index.ts";
import * as internal from "./_internal/index.ts";
import { ReferrerPolicyError, type SecureHeaderError } from "./SecureHeaderError.ts";

const $I = $SchemaId.create("http/headers/ReferrerPolicy");

const headerName = "Referrer-Policy" as const;

const ReferrerPolicyValueBase = LiteralKit([
  "no-referrer",
  "no-referrer-when-downgrade",
  "origin",
  "origin-when-cross-origin",
  "same-origin",
  "strict-origin",
  "strict-origin-when-cross-origin",
]);

/**
 * @since 0.0.0
 */
export const ReferrerPolicyValue = ReferrerPolicyValueBase.pipe(
  $I.annoteSchema("ReferrerPolicyValue", {
    description: "The supported `Referrer-Policy` header values.",
  }),
  SchemaUtils.withLiteralKitStatics(ReferrerPolicyValueBase)
);

/**
 * @since 0.0.0
 */
export type ReferrerPolicyValue = typeof ReferrerPolicyValue.Type;

/**
 * @since 0.0.0
 */
export const ReferrerPolicyValueList = S.Array(ReferrerPolicyValue).pipe(
  $I.annoteSchema("ReferrerPolicyValueList", {
    description: "A fallback list of `Referrer-Policy` values for legacy browser support.",
  })
);

/**
 * @since 0.0.0
 */
export type ReferrerPolicyValueList = typeof ReferrerPolicyValueList.Type;

/**
 * @since 0.0.0
 */
export const ReferrerPolicyOption = S.Union([S.Literal(false), ReferrerPolicyValue, ReferrerPolicyValueList]).pipe(
  $I.annoteSchema("ReferrerPolicyOption", {
    description: "The supported `Referrer-Policy` option values.",
  })
);

/**
 * @since 0.0.0
 */
export type ReferrerPolicyOption = typeof ReferrerPolicyOption.Type;

/**
 * @since 0.0.0
 */
export class ReferrerPolicyResponseHeader extends S.Class<ReferrerPolicyResponseHeader>(
  $I`ReferrerPolicyResponseHeader`
)(
  {
    name: S.tag(headerName),
    value: S.OptionFromUndefinedOr(S.String),
  },
  $I.annote("ReferrerPolicyResponseHeader", {
    description: "The `Referrer-Policy` response header.",
  })
) {}

type ReferrerPolicyResponseHeaderEncoded = typeof ReferrerPolicyResponseHeader.Encoded;

const formatReferrerPolicyValue = (
  option: ReferrerPolicyValue | ReferrerPolicyValueList
): Effect.Effect<string, ReferrerPolicyError> =>
  Effect.gen(function* () {
    const values = internal.wrapArray(option);

    if (A.some(values, (value) => value === ("unsafe-url" as never))) {
      return yield* new ReferrerPolicyError({
        message: `Cannot specify a dangerous value for ${headerName}: unsafe-url`,
        cause: O.none(),
      });
    }

    if (A.every(values, S.is(ReferrerPolicyValue))) {
      return A.join(values, ", ");
    }

    return yield* new ReferrerPolicyError({
      message: `Invalid value for ${headerName}: ${String(option)}`,
      cause: O.none(),
    });
  });

/**
 * @since 0.0.0
 */
export const ReferrerPolicyHeader = S.Union([ReferrerPolicyOption, S.Undefined]).pipe(
  S.decodeTo(
    ReferrerPolicyResponseHeader,
    SchemaTransformation.transformOrFail({
      decode: (input): Effect.Effect<ReferrerPolicyResponseHeaderEncoded, SchemaIssue.Issue> =>
        Effect.gen(function* () {
          if (P.isUndefined(input) || input === false) {
            return {
              name: headerName,
              value: undefined,
            } as const;
          }

          const value = yield* formatReferrerPolicyValue(input).pipe(
            Effect.mapError((error) => new SchemaIssue.InvalidValue(O.some(error), { message: error.message }))
          );

          return {
            name: headerName,
            value,
          } as const;
        }),
      encode: internal.makeHeaderEncodeForbidden("ReferrerPolicyHeader"),
    })
  ),
  $I.annoteSchema("ReferrerPolicyHeader", {
    description: "A one-way schema that decodes `Referrer-Policy` options into the response header.",
  }),
  SchemaUtils.withStatics(() => {
    const createValue: (
      option?: undefined | ReferrerPolicyOption
    ) => Effect.Effect<O.Option<string>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | ReferrerPolicyOption
    ) {
      if (P.isUndefined(option) || option === false) {
        return O.none<string>();
      }

      return O.some(yield* formatReferrerPolicyValue(option));
    });

    const create: (
      option?: undefined | ReferrerPolicyOption,
      headerValueCreator?: undefined | typeof createValue
    ) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | ReferrerPolicyOption,
      headerValueCreator: typeof createValue = createValue
    ) {
      const value = yield* headerValueCreator(option);

      return internal.makeResponseHeaderOption(headerName, value);
    });

    return {
      createValue,
      create,
    };
  })
);

/**
 * @since 0.0.0
 */
export type ReferrerPolicyHeader = typeof ReferrerPolicyHeader.Type;
