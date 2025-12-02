import { pipe } from "effect";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { SecureHeadersError } from "./errors.ts";
import type { ResponseHeader } from "./types.ts";

const headerName = "Strict-Transport-Security";
const defaultMaxAge = 60 * 60 * 24 * 365 * 2; // 2 years

/**
 * Schema for the HSTS options when enabled with configuration.
 */
const HSTSConfigSchema = S.Struct({
  maxAge: S.optional(S.Number),
  includeSubDomains: S.optional(S.Boolean),
  preload: S.optional(S.Boolean),
});

/**
 * Schema for the Force HTTPS Redirect (HSTS) option value.
 * Accepts:
 * - `boolean` - true enables with defaults, false disables
 * - `[true, { maxAge?, includeSubDomains?, preload? }]` - tuple with configuration
 */
export const ForceHTTPSRedirectOptionSchema = S.Union(S.Boolean, S.Tuple(S.Literal(true), HSTSConfigSchema));

export type ForceHTTPSRedirectOption = typeof ForceHTTPSRedirectOptionSchema.Type;

/**
 * Schema for the Strict-Transport-Security response header output.
 */
const HSTSResponseHeaderSchema = S.Struct({
  name: S.Literal(headerName),
  value: S.UndefinedOr(S.String),
});

/**
 * Schema for the Strict-Transport-Security response header.
 * Transforms a ForceHTTPSRedirectOption input into a ResponseHeader output.
 *
 * - `undefined` → decodes to `{ name: "Strict-Transport-Security", value: "max-age=63072000" }`
 * - `false` → decodes to `{ name: "Strict-Transport-Security", value: undefined }`
 * - `true` → decodes to `{ name: "Strict-Transport-Security", value: "max-age=63072000" }`
 * - `[true, { maxAge, includeSubDomains, preload }]` → decodes to formatted header value
 */
export const ForceHTTPSRedirectHeaderSchema = S.transformOrFail(
  S.Union(ForceHTTPSRedirectOptionSchema, S.Undefined),
  HSTSResponseHeaderSchema,
  {
    strict: true,
    decode: (option, _, ast) => {
      if (option === undefined) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: `max-age=${defaultMaxAge}` });
      }
      if (option === false) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (option === true) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: `max-age=${defaultMaxAge}` });
      }

      if (A.isArray(option)) {
        if (!A.isNonEmptyReadonlyArray(option)) {
          return ParseResult.fail(
            new ParseResult.Type(ast, option, `Invalid value for ${headerName} in the first option: ${option[0]}`)
          );
        }

        const maxAge = option[1].maxAge ?? defaultMaxAge;
        if (!P.isNumber(maxAge) || !Number.isFinite(maxAge)) {
          return ParseResult.fail(
            new ParseResult.Type(ast, option, `Invalid value for "maxAge" option in ${headerName}: ${maxAge}`)
          );
        }

        const { includeSubDomains, preload } = option[1];

        const headerValue = pipe(
          A.make(
            `max-age=${maxAge}`,
            includeSubDomains ? "includeSubDomains" : undefined,
            preload ? "preload" : undefined
          ),
          A.filter(P.isNotNullable),
          A.join("; ")
        );

        return ParseResult.succeed({ name: headerName as typeof headerName, value: headerValue });
      }

      return ParseResult.fail(new ParseResult.Type(ast, option, `Invalid value for ${headerName}: ${String(option)}`));
    },
    encode: (header, _, ast) => {
      if (header.value === undefined) {
        return ParseResult.succeed(false as const);
      }

      // Parse the header value back to options
      const parts = header.value.split("; ").map((p) => p.trim());
      const config: { maxAge?: number; includeSubDomains?: boolean; preload?: boolean } = {};

      for (const part of parts) {
        if (part.startsWith("max-age=")) {
          config.maxAge = Number.parseInt(part.slice("max-age=".length), 10);
        } else if (part === "includeSubDomains") {
          config.includeSubDomains = true;
        } else if (part === "preload") {
          config.preload = true;
        }
      }

      // If only max-age with default value, return simple true
      if (config.maxAge === defaultMaxAge && config.includeSubDomains === undefined && config.preload === undefined) {
        return ParseResult.succeed(true as const);
      }

      // Return tuple format if there's any configuration
      if (config.maxAge !== undefined) {
        return ParseResult.succeed([
          true,
          {
            ...(config.maxAge !== defaultMaxAge && { maxAge: config.maxAge }),
            ...(config.includeSubDomains && { includeSubDomains: config.includeSubDomains }),
            ...(config.preload && { preload: config.preload }),
          },
        ] as const);
      }

      return ParseResult.fail(new ParseResult.Type(ast, header, `Cannot encode header value: ${header.value}`));
    },
  }
).annotations({ identifier: "ForceHTTPSRedirectHeaderSchema" });

export type ForceHTTPSRedirectHeader = typeof ForceHTTPSRedirectHeaderSchema.Type;

export const createHSTSHeaderValue = (
  option?: undefined | ForceHTTPSRedirectOption
): Effect.Effect<string | undefined, SecureHeadersError, never> =>
  Effect.gen(function* () {
    if (option == undefined) return `max-age=${defaultMaxAge}`;
    if (option === false) return undefined;
    if (option === true) return `max-age=${defaultMaxAge}`;

    if (A.isArray(option)) {
      if (!A.isNonEmptyReadonlyArray(option)) {
        return yield* new SecureHeadersError({
          type: "FORCE_HTTPS_REDIRECT",
          message: `Invalid value for ${headerName} in the first option: ${option[0]}`,
        });
      }

      const maxAge = option[1].maxAge ?? defaultMaxAge;
      if (!P.isNumber(maxAge) || !Number.isFinite(maxAge)) {
        return yield* new SecureHeadersError({
          type: "FORCE_HTTPS_REDIRECT",
          message: `Invalid value for "maxAge" option in ${headerName}: ${maxAge}`,
        });
      }
      const { includeSubDomains, preload } = option[1];
      return pipe(
        A.make(
          `max-age=${maxAge}`,
          includeSubDomains ? "includeSubDomains" : undefined,
          preload ? "preload" : undefined
        ),
        A.filter(P.isNotNullable),
        A.join("; ")
      );
    }

    return yield* new SecureHeadersError({
      type: "FORCE_HTTPS_REDIRECT",
      message: `Invaild value for ${headerName}: ${option}`,
    });
  }).pipe(Effect.withSpan("createHSTSHeaderValue"));

export const createForceHTTPSRedirectHeader = (
  option?: undefined | ForceHTTPSRedirectOption,
  headerValueCreator = createHSTSHeaderValue
): Effect.Effect<O.Option<ResponseHeader>, SecureHeadersError, never> =>
  Effect.gen(function* () {
    const value = yield* headerValueCreator(option);

    if (value === undefined) return O.none<ResponseHeader>();
    return O.some({ name: headerName, value });
  }).pipe(Effect.withSpan("createForceHTTPSRedirectHeader"));
