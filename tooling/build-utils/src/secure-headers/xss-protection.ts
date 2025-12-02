import { Effect } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { SecureHeadersError } from "./errors.ts";
import { encodeStrictURI } from "./helpers.ts";
import type { ResponseHeader } from "./types.ts";

const headerName = "X-XSS-Protection";

/**
 * Schema for the report option in XSS protection.
 */
const XSSReportOptionSchema = S.Tuple(S.Literal("report"), S.Struct({ uri: S.Union(S.String, S.instanceOf(URL)) }));

/**
 * Schema for the XSS protection option value.
 * Accepts:
 * - `false` to disable
 * - `"sanitize"` to enable sanitization mode
 * - `"block-rendering"` to block rendering on XSS detection
 * - `["report", { uri: string | URL }]` to enable reporting mode
 */
export const XSSProtectionOptionSchema = S.Union(
  S.Literal(false),
  S.Literal("sanitize"),
  S.Literal("block-rendering"),
  XSSReportOptionSchema
);

export type XSSProtectionOption = typeof XSSProtectionOptionSchema.Type;

/**
 * Schema for the X-XSS-Protection response header output.
 */
const XSSProtectionResponseHeaderSchema = S.Struct({
  name: S.Literal(headerName),
  value: S.String,
});

/**
 * Schema for the X-XSS-Protection response header.
 * Transforms an XSSProtectionOption input into a ResponseHeader output.
 *
 * - `false` → decodes to `{ name: "X-XSS-Protection", value: "0" }`
 * - `"sanitize"` → decodes to `{ name: "X-XSS-Protection", value: "1" }`
 * - `"block-rendering"` → decodes to `{ name: "X-XSS-Protection", value: "1; mode=block" }`
 * - `["report", { uri }]` → decodes to `{ name: "X-XSS-Protection", value: "1; report=<uri>" }`
 * - `undefined` (default) → decodes to `{ name: "X-XSS-Protection", value: "1" }`
 */
export const XSSProtectionHeaderSchema = S.transformOrFail(
  S.Union(XSSProtectionOptionSchema, S.Undefined),
  XSSProtectionResponseHeaderSchema,
  {
    strict: true,
    decode: (option, _, ast) => {
      if (option === undefined) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: "1" });
      }
      if (option === false) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: "0" });
      }
      if (option === "sanitize") {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: "1" });
      }
      if (option === "block-rendering") {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: "1; mode=block" });
      }
      if (A.isArray(option) && option[0] === "report") {
        const encodedUri = encodeStrictURI(option[1].uri);
        return ParseResult.succeed({ name: headerName as typeof headerName, value: `1; report=${encodedUri}` });
      }
      return ParseResult.fail(new ParseResult.Type(ast, option, `Invalid value for ${headerName}: ${String(option)}`));
    },
    encode: (header, _, ast) => {
      if (header.value === "0") {
        return ParseResult.succeed(false as const);
      }
      if (header.value === "1") {
        return ParseResult.succeed("sanitize" as const);
      }
      if (header.value === "1; mode=block") {
        return ParseResult.succeed("block-rendering" as const);
      }
      if (header.value.startsWith("1; report=")) {
        const uri = header.value.slice("1; report=".length);
        return ParseResult.succeed(["report", { uri }] as const);
      }
      return ParseResult.fail(new ParseResult.Type(ast, header, `Cannot encode header value: ${header.value}`));
    },
  }
).annotations({ identifier: "XSSProtectionHeaderSchema" });

export type XSSProtectionHeader = typeof XSSProtectionHeaderSchema.Type;

export const createXXSSProtectionHeaderValue = (
  option?: undefined | XSSProtectionOption,
  strictURIEncoder = encodeStrictURI
): Effect.Effect<string, SecureHeadersError, never> =>
  Effect.gen(function* () {
    if (option == undefined) return "1";
    if (option === false) return "0";
    if (option === "sanitize") return "1";
    if (option === "block-rendering") return "1; mode=block";

    if (A.isArray(option)) {
      if (option[0] === "report") return `1; report=${strictURIEncoder(option[1].uri)}`;
    }

    return yield* new SecureHeadersError({
      type: "XSS_PROTECTION",
      message: `Invalid value for ${headerName}: ${option}`,
    });
  }).pipe(Effect.withSpan("createXXSSProtectionHeaderValue"));

export const createXSSProtectionHeader = (
  option?: undefined | XSSProtectionOption,
  headerValueCreator = createXXSSProtectionHeaderValue
): Effect.Effect<O.Option<ResponseHeader>, SecureHeadersError, never> =>
  Effect.gen(function* () {
    const value = yield* headerValueCreator(option);

    return O.some({ name: headerName, value });
  }).pipe(Effect.withSpan("createXSSProtectionHeader"));
