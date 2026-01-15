import { Effect } from "effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { SecureHeadersError } from "./errors.js";
import type { ResponseHeader } from "./types.js";

const headerName = "Cross-Origin-Resource-Policy";

/**
 * Supported Cross-Origin-Resource-Policy values.
 */
const corpValues = ["same-site", "same-origin", "cross-origin"] as const;

type CorpValue = (typeof corpValues)[number];

/**
 * Schema for CORP option values.
 * Accepts `false` to disable or one of the valid CORP values.
 */
export const CrossOriginResourcePolicyOptionSchema = S.Union(
  S.Literal(false),
  S.Literal("same-site"),
  S.Literal("same-origin"),
  S.Literal("cross-origin")
);

export type CrossOriginResourcePolicyOption = typeof CrossOriginResourcePolicyOptionSchema.Type;

/**
 * Schema for the Cross-Origin-Resource-Policy response header output.
 */
const CORPResponseHeaderSchema = S.Struct({
  name: S.Literal(headerName),
  value: S.UndefinedOr(S.String),
});

/**
 * Schema for the Cross-Origin-Resource-Policy response header.
 * Transforms a CrossOriginResourcePolicyOption input into a ResponseHeader output.
 *
 * - `false` → decodes to `{ name: "Cross-Origin-Resource-Policy", value: undefined }`
 * - `undefined` → decodes to `{ name: "Cross-Origin-Resource-Policy", value: undefined }` (no default)
 * - Valid CORP value → decodes to `{ name: "Cross-Origin-Resource-Policy", value: <value> }`
 */
export const CrossOriginResourcePolicyHeaderSchema = S.transformOrFail(
  S.Union(CrossOriginResourcePolicyOptionSchema, S.Undefined),
  CORPResponseHeaderSchema,
  {
    strict: true,
    decode: (option, _, ast) => {
      if (option === undefined) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (option === false) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (corpValues.includes(option as CorpValue)) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: option });
      }
      return ParseResult.fail(new ParseResult.Type(ast, option, `Invalid value for ${headerName}: ${String(option)}`));
    },
    encode: (header, _, ast) => {
      if (header.value === undefined) {
        return ParseResult.succeed(false as const);
      }
      if (corpValues.includes(header.value as CorpValue)) {
        return ParseResult.succeed(header.value as CrossOriginResourcePolicyOption);
      }
      return ParseResult.fail(new ParseResult.Type(ast, header, `Cannot encode header value: ${header.value}`));
    },
  }
).annotations({ identifier: "CrossOriginResourcePolicyHeaderSchema" });

export type CrossOriginResourcePolicyHeader = typeof CrossOriginResourcePolicyHeaderSchema.Type;

/**
 * Creates the header value string from a CrossOriginResourcePolicyOption.
 */
export const createCrossOriginResourcePolicyHeaderValue: (
  option?: undefined | CrossOriginResourcePolicyOption
) => Effect.Effect<string | undefined, SecureHeadersError, never> = Effect.fn(
  "createCrossOriginResourcePolicyHeaderValue"
)(function* (option?: undefined | CrossOriginResourcePolicyOption) {
  if (option === undefined) return undefined;
  if (option === false) return undefined;
  if (corpValues.includes(option as CorpValue)) return option;

  return yield* new SecureHeadersError({
    type: "CROSS_ORIGIN_RESOURCE_POLICY",
    message: `Invalid value for ${headerName}: ${option}`,
  });
});

/**
 * Creates the Cross-Origin-Resource-Policy header wrapped in Option.
 */
export const createCrossOriginResourcePolicyHeader: (
  option?: undefined | CrossOriginResourcePolicyOption,
  headerValueCreator?: typeof createCrossOriginResourcePolicyHeaderValue
) => Effect.Effect<O.Option<ResponseHeader>, SecureHeadersError, never> = Effect.fn(
  "createCrossOriginResourcePolicyHeader"
)(function* (
  option?: undefined | CrossOriginResourcePolicyOption,
  headerValueCreator = createCrossOriginResourcePolicyHeaderValue
) {
  const value = yield* headerValueCreator(option);

  if (value === undefined) return O.none<ResponseHeader>();
  return O.some({ name: headerName, value });
});
