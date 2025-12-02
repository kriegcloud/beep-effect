import { Effect } from "effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { SecureHeadersError } from "./errors.ts";
import type { ResponseHeader } from "./types.ts";

const headerName = "X-Content-Type-Options";

/**
 * Schema for the `nosniff` option value.
 * Accepts `false` to disable or `"nosniff"` to enable.
 */
export const NosniffOptionSchema = S.Union(S.Literal(false), S.Literal("nosniff"));

export type NosniffOption = typeof NosniffOptionSchema.Type;

/**
 * Schema for the X-Content-Type-Options response header output.
 */
const NosniffResponseHeaderSchema = S.Struct({
  name: S.Literal(headerName),
  value: S.UndefinedOr(S.String),
});

/**
 * Schema for the X-Content-Type-Options response header.
 * Transforms a NosniffOption input into a ResponseHeader output.
 *
 * - `false` → decodes to `{ name: "X-Content-Type-Options", value: undefined }`
 * - `"nosniff"` → decodes to `{ name: "X-Content-Type-Options", value: "nosniff" }`
 * - `undefined` (default) → decodes to `{ name: "X-Content-Type-Options", value: "nosniff" }`
 */
export const NosniffHeaderSchema = S.transformOrFail(
  S.Union(NosniffOptionSchema, S.Undefined),
  NosniffResponseHeaderSchema,
  {
    strict: true,
    decode: (option, _, ast) => {
      if (option === undefined) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: "nosniff" });
      }
      if (option === false) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (option === "nosniff") {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: "nosniff" });
      }
      return ParseResult.fail(new ParseResult.Type(ast, option, `Invalid value for ${headerName}: ${String(option)}`));
    },
    encode: (header, _, ast) => {
      if (header.value === undefined) {
        return ParseResult.succeed(false as const);
      }
      if (header.value === "nosniff") {
        return ParseResult.succeed("nosniff" as const);
      }
      return ParseResult.fail(new ParseResult.Type(ast, header, `Cannot encode header value: ${header.value}`));
    },
  }
).annotations({ identifier: "NosniffHeaderSchema" });

export type NosniffHeader = typeof NosniffHeaderSchema.Type;

export const createXContentTypeOptionsHeaderValue = (
  option?: undefined | NosniffOption
): Effect.Effect<string | undefined, SecureHeadersError, never> =>
  Effect.gen(function* () {
    if (option == undefined) return "nosniff";
    if (option === false) return undefined;
    if (option === "nosniff") return option;

    return yield* new SecureHeadersError({
      type: "NO_SNIFF",
      message: `Invalid value for ${headerName}: ${option}`,
    });
  }).pipe(Effect.withSpan("createXContentTypeOptionsHeaderValue"));

export const createNosniffHeader = (
  option?: undefined | NosniffOption,
  headerValueCreator = createXContentTypeOptionsHeaderValue
): Effect.Effect<O.Option<ResponseHeader>, SecureHeadersError, never> =>
  Effect.gen(function* () {
    const value = yield* headerValueCreator(option);

    if (value === undefined) return O.none<ResponseHeader>();
    return O.some({ name: headerName, value });
  }).pipe(Effect.withSpan("createNosniffHeader"));
