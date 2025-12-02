import { Effect } from "effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { SecureHeadersError } from "./errors.ts";
import type { ResponseHeader } from "./types.ts";

const headerName = "X-Download-Options";

/**
 * Schema for the `noopen` option value.
 * Accepts `false` to disable or `"noopen"` to enable.
 */
export const NoopenOptionSchema = S.Union(S.Literal(false), S.Literal("noopen"));

export type NoopenOption = typeof NoopenOptionSchema.Type;

/**
 * Schema for the X-Download-Options response header output.
 */
const NoopenResponseHeaderSchema = S.Struct({
  name: S.Literal(headerName),
  value: S.UndefinedOr(S.String),
});

/**
 * Schema for the X-Download-Options response header.
 * Transforms a NoopenOption input into a ResponseHeader output.
 *
 * - `false` → decodes to `{ name: "X-Download-Options", value: undefined }`
 * - `"noopen"` → decodes to `{ name: "X-Download-Options", value: "noopen" }`
 * - `undefined` (default) → decodes to `{ name: "X-Download-Options", value: "noopen" }`
 */
export const NoopenHeaderSchema = S.transformOrFail(
  S.Union(NoopenOptionSchema, S.Undefined),
  NoopenResponseHeaderSchema,
  {
    strict: true,
    decode: (option, _, ast) => {
      if (option === undefined) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: "noopen" });
      }
      if (option === false) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (option === "noopen") {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: "noopen" });
      }
      return ParseResult.fail(
        new ParseResult.Type(ast, option, `Invalid value for ${headerName}: ${String(option)}`)
      );
    },
    encode: (header, _, ast) => {
      if (header.value === undefined) {
        return ParseResult.succeed(false as const);
      }
      if (header.value === "noopen") {
        return ParseResult.succeed("noopen" as const);
      }
      return ParseResult.fail(
        new ParseResult.Type(ast, header, `Cannot encode header value: ${header.value}`)
      );
    },
  }
).annotations({ identifier: "NoopenHeaderSchema" });

export type NoopenHeader = typeof NoopenHeaderSchema.Type;

export const createXDownloadOptionsHeaderValue = (
  option?: undefined | NoopenOption
): Effect.Effect<string | undefined, SecureHeadersError, never> =>
  Effect.gen(function* () {
    if (option == undefined) return "noopen";
    if (option === false) return undefined;
    if (option === "noopen") return option;

    return yield* new SecureHeadersError({
      type: "NO_OPEN",
      message: `Invalid value for ${headerName}: ${option}`,
    });
  }).pipe(Effect.withSpan("createXDownloadOptionsHeaderValue"));

export const createNoopenHeader = (
  option?: NoopenOption,
  headerValueCreator = createXDownloadOptionsHeaderValue
): Effect.Effect<O.Option<ResponseHeader>, SecureHeadersError, never> =>
  Effect.gen(function* () {
    const value = yield* headerValueCreator(option);

    if (value === undefined) return O.none<ResponseHeader>();
    return O.some({ name: headerName, value });
  }).pipe(Effect.withSpan("createNoopenHeader"));
