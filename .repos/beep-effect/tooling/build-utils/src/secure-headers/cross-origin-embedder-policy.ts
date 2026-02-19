import { Effect } from "effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { SecureHeadersError } from "./errors.js";
import type { ResponseHeader } from "./types.js";

const headerName = "Cross-Origin-Embedder-Policy";

/**
 * Supported Cross-Origin-Embedder-Policy values.
 */
const coepValues = ["unsafe-none", "require-corp", "credentialless"] as const;

type CoepValue = (typeof coepValues)[number];

/**
 * Schema for COEP option values.
 * Accepts `false` to disable or one of the valid COEP values.
 */
export const CrossOriginEmbedderPolicyOptionSchema = S.Literal(false, "unsafe-none", "require-corp", "credentialless");

export type CrossOriginEmbedderPolicyOption = typeof CrossOriginEmbedderPolicyOptionSchema.Type;

/**
 * Schema for the Cross-Origin-Embedder-Policy response header output.
 */
const COEPResponseHeaderSchema = S.Struct({
  name: S.Literal(headerName),
  value: S.UndefinedOr(S.String),
});

/**
 * Schema for the Cross-Origin-Embedder-Policy response header.
 * Transforms a CrossOriginEmbedderPolicyOption input into a ResponseHeader output.
 *
 * - `false` → decodes to `{ name: "Cross-Origin-Embedder-Policy", value: undefined }`
 * - `undefined` → decodes to `{ name: "Cross-Origin-Embedder-Policy", value: undefined }` (no default)
 * - Valid COEP value → decodes to `{ name: "Cross-Origin-Embedder-Policy", value: <value> }`
 */
export const CrossOriginEmbedderPolicyHeaderSchema = S.transformOrFail(
  S.Union(CrossOriginEmbedderPolicyOptionSchema, S.Undefined),
  COEPResponseHeaderSchema,
  {
    strict: true,
    decode: (option, _, ast) => {
      if (option === undefined) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (option === false) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (coepValues.includes(option as CoepValue)) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: option });
      }
      return ParseResult.fail(new ParseResult.Type(ast, option, `Invalid value for ${headerName}: ${String(option)}`));
    },
    encode: (header, _, ast) => {
      if (header.value === undefined) {
        return ParseResult.succeed(false as const);
      }
      if (coepValues.includes(header.value as CoepValue)) {
        return ParseResult.succeed(header.value as CrossOriginEmbedderPolicyOption);
      }
      return ParseResult.fail(new ParseResult.Type(ast, header, `Cannot encode header value: ${header.value}`));
    },
  }
).annotations({ identifier: "CrossOriginEmbedderPolicyHeaderSchema" });

export type CrossOriginEmbedderPolicyHeader = typeof CrossOriginEmbedderPolicyHeaderSchema.Type;

/**
 * Creates the header value string from a CrossOriginEmbedderPolicyOption.
 */
export const createCrossOriginEmbedderPolicyHeaderValue: (
  option?: undefined | CrossOriginEmbedderPolicyOption
) => Effect.Effect<string | undefined, SecureHeadersError, never> = Effect.fn(
  "createCrossOriginEmbedderPolicyHeaderValue"
)(function* (option?: undefined | CrossOriginEmbedderPolicyOption) {
  if (option === undefined) return undefined;
  if (option === false) return undefined;
  if (coepValues.includes(option as CoepValue)) return option;

  return yield* new SecureHeadersError({
    type: "CROSS_ORIGIN_EMBEDDER_POLICY",
    message: `Invalid value for ${headerName}: ${option}`,
  });
});

/**
 * Creates the Cross-Origin-Embedder-Policy header wrapped in Option.
 */
export const createCrossOriginEmbedderPolicyHeader: (
  option?: undefined | CrossOriginEmbedderPolicyOption,
  headerValueCreator?: typeof createCrossOriginEmbedderPolicyHeaderValue
) => Effect.Effect<O.Option<ResponseHeader>, SecureHeadersError, never> = Effect.fn(
  "createCrossOriginEmbedderPolicyHeader"
)(function* (
  option?: undefined | CrossOriginEmbedderPolicyOption,
  headerValueCreator = createCrossOriginEmbedderPolicyHeaderValue
) {
  const value = yield* headerValueCreator(option);

  if (value === undefined) return O.none<ResponseHeader>();
  return O.some({ name: headerName, value });
});
