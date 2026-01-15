import { Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { SecureHeadersError } from "./errors.js";
import { wrapArray } from "./helpers.js";
import type { ResponseHeader } from "./types.js";

const headerName = "Referrer-Policy";

const supportedValues = [
  "no-referrer",
  "no-referrer-when-downgrade",
  "origin",
  "origin-when-cross-origin",
  "same-origin",
  "strict-origin",
  "strict-origin-when-cross-origin",
] as const;

/**
 * Schema for a single referrer policy value.
 */
export const ReferrerPolicyValueSchema = S.Literal(...supportedValues);

export type ReferrerPolicyValue = typeof ReferrerPolicyValueSchema.Type;

/**
 * Schema for the referrer policy option value.
 * Accepts:
 * - `false` to disable
 * - A single value from supportedValues
 * - An array of values from supportedValues (for legacy browser fallback)
 */
export const ReferrerPolicyOptionSchema = S.Union(
  S.Literal(false),
  ReferrerPolicyValueSchema,
  S.Array(ReferrerPolicyValueSchema)
);

export type ReferrerPolicyOption = typeof ReferrerPolicyOptionSchema.Type;

/**
 * Schema for the Referrer-Policy response header output.
 */
const ReferrerPolicyResponseHeaderSchema = S.Struct({
  name: S.Literal(headerName),
  value: S.UndefinedOr(S.String),
});

/**
 * Schema for the Referrer-Policy response header.
 * Transforms a ReferrerPolicyOption input into a ResponseHeader output.
 *
 * - `false` → decodes to `{ name: "Referrer-Policy", value: undefined }`
 * - `undefined` → decodes to `{ name: "Referrer-Policy", value: undefined }`
 * - Single value → decodes to `{ name: "Referrer-Policy", value: "<value>" }`
 * - Array of values → decodes to `{ name: "Referrer-Policy", value: "<value1>, <value2>, ..." }`
 */
export const ReferrerPolicyHeaderSchema = S.transformOrFail(
  S.Union(ReferrerPolicyOptionSchema, S.Undefined),
  ReferrerPolicyResponseHeaderSchema,
  {
    strict: true,
    decode: (option, _, ast) => {
      if (option === undefined) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (option === false) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }

      const values = wrapArray(option as ReferrerPolicyValue | ReferrerPolicyValue[]);

      for (const value of values) {
        if ((value as string) === "unsafe-url") {
          return ParseResult.fail(
            new ParseResult.Type(ast, option, `Cannot specify a dangerous value for ${headerName}: ${value}`)
          );
        }
        if (!supportedValues.includes(value as ReferrerPolicyValue)) {
          return ParseResult.fail(new ParseResult.Type(ast, option, `Invalid value for ${headerName}: ${value}`));
        }
      }

      const headerValue = pipe(values, A.join(", "));
      return ParseResult.succeed({ name: headerName as typeof headerName, value: headerValue });
    },
    encode: (header, _, ast) => {
      if (header.value === undefined) {
        return ParseResult.succeed(false as const);
      }

      const values = header.value.split(", ").map((v) => v.trim());

      // Validate all values
      for (const value of values) {
        if (!supportedValues.includes(value as ReferrerPolicyValue)) {
          return ParseResult.fail(new ParseResult.Type(ast, header, `Cannot encode header value: ${header.value}`));
        }
      }

      if (values.length === 1) {
        return ParseResult.succeed(values[0] as ReferrerPolicyValue);
      }
      return ParseResult.succeed(values as ReferrerPolicyValue[]);
    },
  }
).annotations({ identifier: "ReferrerPolicyHeaderSchema" });

export type ReferrerPolicyHeader = typeof ReferrerPolicyHeaderSchema.Type;

export const createReferrerPolicyHeaderValue: (
  option?: undefined | ReferrerPolicyOption
) => Effect.Effect<string | undefined, SecureHeadersError, never> = Effect.fn("createReferrerPolicyHeaderValue")(
  function* (option?: undefined | ReferrerPolicyOption) {
    if (P.isNullable(option)) return undefined;
    if (option === false) return undefined;

    const values = wrapArray(option as ReferrerPolicyValue | ReferrerPolicyValue[]);

    for (const value of values) {
      if ((value as string) === "unsafe-url")
        return yield* new SecureHeadersError({
          type: "REFERRER_POLICY",
          message: `Cannot specify a dangerous value for ${headerName}: ${value}`,
        });
      if (!supportedValues.includes(value))
        return yield* new SecureHeadersError({
          type: "REFERRER_POLICY",
          message: `Invalid value for ${headerName}: ${value}`,
        });
    }

    return pipe(values, A.join(", "));
  }
);

export const createReferrerPolicyHeader: (
  option?: undefined | ReferrerPolicyOption,
  headerValueCreator?: typeof createReferrerPolicyHeaderValue
) => Effect.Effect<O.Option<ResponseHeader>, SecureHeadersError, never> = Effect.fn("createReferrerPolicyHeader")(
  function* (option?: undefined | ReferrerPolicyOption, headerValueCreator = createReferrerPolicyHeaderValue) {
    if (P.isNullable(option)) return O.none<ResponseHeader>();
    if (option === false) return O.none<ResponseHeader>();

    const value = yield* headerValueCreator(option);

    if (value === undefined) return O.none<ResponseHeader>();
    return O.some({ name: headerName, value });
  }
);
