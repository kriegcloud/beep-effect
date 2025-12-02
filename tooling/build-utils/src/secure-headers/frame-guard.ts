import { Effect } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { SecureHeadersError } from "./errors.ts";
import { encodeStrictURI } from "./helpers.ts";
import type { ResponseHeader } from "./types.ts";

const headerName = "X-Frame-Options";

/**
 * Schema for the allow-from option in frame guard.
 */
const FrameGuardAllowFromSchema = S.Tuple(
  S.Literal("allow-from"),
  S.Struct({ uri: S.Union(S.String, S.instanceOf(URL)) })
);

/**
 * Schema for the frame guard option value.
 * Accepts:
 * - `undefined` to use default (deny)
 * - `false` to disable
 * - `"deny"` to deny framing
 * - `"sameorigin"` to allow same-origin framing
 * - `["allow-from", { uri: string | URL }]` to allow framing from specific origin
 */
export const FrameGuardOptionSchema = S.Union(
  S.Undefined,
  S.Literal(false),
  S.Literal("deny"),
  S.Literal("sameorigin"),
  FrameGuardAllowFromSchema
);

export type FrameGuardOption = typeof FrameGuardOptionSchema.Type;

/**
 * Schema for the X-Frame-Options response header output.
 */
const FrameGuardResponseHeaderSchema = S.Struct({
  name: S.Literal(headerName),
  value: S.UndefinedOr(S.String),
});

/**
 * Schema for the X-Frame-Options response header.
 * Transforms a FrameGuardOption input into a ResponseHeader output.
 *
 * - `undefined` (default) → decodes to `{ name: "X-Frame-Options", value: "deny" }`
 * - `false` → decodes to `{ name: "X-Frame-Options", value: undefined }`
 * - `"deny"` → decodes to `{ name: "X-Frame-Options", value: "deny" }`
 * - `"sameorigin"` → decodes to `{ name: "X-Frame-Options", value: "sameorigin" }`
 * - `["allow-from", { uri }]` → decodes to `{ name: "X-Frame-Options", value: "allow-from <uri>" }`
 */
export const FrameGuardHeaderSchema = S.transformOrFail(FrameGuardOptionSchema, FrameGuardResponseHeaderSchema, {
  strict: true,
  decode: (option, _, ast) => {
    if (option === undefined) {
      return ParseResult.succeed({ name: headerName as typeof headerName, value: "deny" });
    }
    if (option === false) {
      return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
    }
    if (option === "deny") {
      return ParseResult.succeed({ name: headerName as typeof headerName, value: "deny" });
    }
    if (option === "sameorigin") {
      return ParseResult.succeed({ name: headerName as typeof headerName, value: "sameorigin" });
    }
    if (A.isArray(option) && option[0] === "allow-from") {
      const encodedUri = encodeStrictURI(option[1].uri);
      return ParseResult.succeed({ name: headerName as typeof headerName, value: `allow-from ${encodedUri}` });
    }
    return ParseResult.fail(new ParseResult.Type(ast, option, `Invalid value for ${headerName}: ${String(option)}`));
  },
  encode: (header, _, ast) => {
    if (header.value === undefined) {
      return ParseResult.succeed(false as const);
    }
    if (header.value === "deny") {
      return ParseResult.succeed("deny" as const);
    }
    if (header.value === "sameorigin") {
      return ParseResult.succeed("sameorigin" as const);
    }
    if (header.value.startsWith("allow-from ")) {
      const uri = header.value.slice("allow-from ".length);
      return ParseResult.succeed(["allow-from", { uri }] as const);
    }
    return ParseResult.fail(new ParseResult.Type(ast, header, `Cannot encode header value: ${header.value}`));
  },
}).annotations({ identifier: "FrameGuardHeaderSchema" });

export type FrameGuardHeader = typeof FrameGuardHeaderSchema.Type;

export const createXFrameOptionsHeaderValue = (
  option?: undefined | FrameGuardOption,
  strictURIEncoder = encodeStrictURI
): Effect.Effect<string | undefined, SecureHeadersError, never> =>
  Effect.gen(function* () {
    if (option == undefined) return "deny";
    if (option === false) return undefined;
    if (option === "deny") return option;
    if (option === "sameorigin") return option;

    if (A.isArray(option)) {
      if (option[0] === "allow-from") return `${option[0]} ${strictURIEncoder(option[1].uri)}`;
    }

    return yield* new SecureHeadersError({
      type: "FRAME_GUARD",
      message: `Invalid value for ${headerName}: ${option}`,
    });
  }).pipe(Effect.withSpan("createXFrameOptionsHeaderValue"));

export const createFrameGuardHeader = (
  option?: FrameGuardOption,
  headerValueCreator = createXFrameOptionsHeaderValue
): Effect.Effect<O.Option<ResponseHeader>, SecureHeadersError, never> =>
  Effect.gen(function* () {
    const value = yield* headerValueCreator(option);

    if (value === undefined) return O.none<ResponseHeader>();
    return O.some({ name: headerName, value });
  }).pipe(Effect.withSpan("createFrameGuardHeader"));
