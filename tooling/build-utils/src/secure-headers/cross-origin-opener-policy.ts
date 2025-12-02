import { Effect } from "effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { SecureHeadersError } from "./errors.ts";
import type { ResponseHeader } from "./types.ts";

const headerName = "Cross-Origin-Opener-Policy";

/**
 * Supported Cross-Origin-Opener-Policy values.
 */
const coopValues = ["unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"] as const;

type CoopValue = (typeof coopValues)[number];

/**
 * Schema for COOP option values.
 * Accepts `false` to disable or one of the valid COOP values.
 */
export const CrossOriginOpenerPolicyOptionSchema = S.Literal(
  false,
  "unsafe-none",
  "same-origin-allow-popups",
  "same-origin",
  "same-origin-plus-COEP"
);

export type CrossOriginOpenerPolicyOption = typeof CrossOriginOpenerPolicyOptionSchema.Type;

/**
 * Schema for the Cross-Origin-Opener-Policy response header output.
 */
const COOPResponseHeaderSchema = S.Struct({
  name: S.Literal(headerName),
  value: S.UndefinedOr(S.String),
});

/**
 * Schema for the Cross-Origin-Opener-Policy response header.
 * Transforms a CrossOriginOpenerPolicyOption input into a ResponseHeader output.
 *
 * - `false` → decodes to `{ name: "Cross-Origin-Opener-Policy", value: undefined }`
 * - `undefined` → decodes to `{ name: "Cross-Origin-Opener-Policy", value: undefined }` (no default)
 * - Valid COOP value → decodes to `{ name: "Cross-Origin-Opener-Policy", value: <value> }`
 */
export const CrossOriginOpenerPolicyHeaderSchema = S.transformOrFail(
  S.Union(CrossOriginOpenerPolicyOptionSchema, S.Undefined),
  COOPResponseHeaderSchema,
  {
    strict: true,
    decode: (option, _, ast) => {
      if (option === undefined) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (option === false) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (coopValues.includes(option as CoopValue)) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: option });
      }
      return ParseResult.fail(new ParseResult.Type(ast, option, `Invalid value for ${headerName}: ${String(option)}`));
    },
    encode: (header, _, ast) => {
      if (header.value === undefined) {
        return ParseResult.succeed(false as const);
      }
      if (coopValues.includes(header.value as CoopValue)) {
        return ParseResult.succeed(header.value as CrossOriginOpenerPolicyOption);
      }
      return ParseResult.fail(new ParseResult.Type(ast, header, `Cannot encode header value: ${header.value}`));
    },
  }
).annotations({ identifier: "CrossOriginOpenerPolicyHeaderSchema" });

export type CrossOriginOpenerPolicyHeader = typeof CrossOriginOpenerPolicyHeaderSchema.Type;

/**
 * Creates the header value string from a CrossOriginOpenerPolicyOption.
 */
export const createCrossOriginOpenerPolicyHeaderValue = (
  option?: undefined | CrossOriginOpenerPolicyOption
): Effect.Effect<string | undefined, SecureHeadersError, never> =>
  Effect.gen(function* () {
    if (option === undefined) return undefined;
    if (option === false) return undefined;
    if (coopValues.includes(option as CoopValue)) return option;

    return yield* new SecureHeadersError({
      type: "CROSS_ORIGIN_OPENER_POLICY",
      message: `Invalid value for ${headerName}: ${option}`,
    });
  }).pipe(Effect.withSpan("createCrossOriginOpenerPolicyHeaderValue"));

/**
 * Creates the Cross-Origin-Opener-Policy header wrapped in Option.
 */
export const createCrossOriginOpenerPolicyHeader = (
  option?: undefined | CrossOriginOpenerPolicyOption,
  headerValueCreator = createCrossOriginOpenerPolicyHeaderValue
): Effect.Effect<O.Option<ResponseHeader>, SecureHeadersError, never> =>
  Effect.gen(function* () {
    const value = yield* headerValueCreator(option);

    if (value === undefined) return O.none<ResponseHeader>();
    return O.some({ name: headerName, value });
  }).pipe(Effect.withSpan("createCrossOriginOpenerPolicyHeader"));
