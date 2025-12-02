import { Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { SecureHeadersError } from "./errors.ts";
import { encodeStrictURI } from "./helpers.ts";
import type { ResponseHeader } from "./types.ts";

const headerName = "Expect-CT";
const defaultMaxAge = 60 * 60 * 24; // 1 day

/**
 * Schema for the Expect-CT options when enabled with configuration.
 */
const ExpectCTConfigSchema = S.Struct({
  maxAge: S.optional(S.Number),
  enforce: S.optional(S.Boolean),
  reportURI: S.optional(S.Union(S.String, S.instanceOf(URL))),
});

/**
 * Schema for the Expect-CT option value.
 * Accepts:
 * - `boolean` - true enables with defaults, false disables
 * - `[true, { maxAge?, enforce?, reportURI? }]` - tuple with configuration
 */
export const ExpectCTOptionSchema = S.Union(
  S.Boolean,
  S.Tuple(S.Literal(true), ExpectCTConfigSchema)
);

export type ExpectCTOption = typeof ExpectCTOptionSchema.Type;

/**
 * Schema for the Expect-CT response header output.
 */
const ExpectCTResponseHeaderSchema = S.Struct({
  name: S.Literal(headerName),
  value: S.UndefinedOr(S.String),
});

/**
 * Schema for the Expect-CT response header.
 * Transforms an ExpectCTOption input into a ResponseHeader output.
 *
 * - `undefined` → decodes to `{ name: "Expect-CT", value: undefined }`
 * - `false` → decodes to `{ name: "Expect-CT", value: undefined }`
 * - `true` → decodes to `{ name: "Expect-CT", value: "max-age=86400" }`
 * - `[true, { maxAge, enforce, reportURI }]` → decodes to formatted header value
 */
export const ExpectCTHeaderSchema = S.transformOrFail(
  S.Union(ExpectCTOptionSchema, S.Undefined),
  ExpectCTResponseHeaderSchema,
  {
    strict: true,
    decode: (option, _, ast) => {
      if (option === undefined) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (option === false) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (option === true) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: `max-age=${defaultMaxAge}` });
      }

      if (A.isArray(option)) {
        if (!option[0]) {
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

        const { enforce, reportURI } = option[1];

        const headerValue = pipe(
          A.make(
            `max-age=${maxAge}`,
            enforce ? "enforce" : undefined,
            reportURI != undefined ? `report-uri=${encodeStrictURI(reportURI)}` : undefined
          ),
          A.filter(P.isNotNullable),
          A.join(", ")
        );

        return ParseResult.succeed({ name: headerName as typeof headerName, value: headerValue });
      }

      return ParseResult.fail(
        new ParseResult.Type(ast, option, `Invalid value for ${headerName}: ${String(option)}`)
      );
    },
    encode: (header, _, ast) => {
      if (header.value === undefined) {
        return ParseResult.succeed(false as const);
      }

      // Parse the header value back to options
      const parts = header.value.split(", ").map((p) => p.trim());
      const config: { maxAge?: number; enforce?: boolean; reportURI?: string } = {};

      for (const part of parts) {
        if (part.startsWith("max-age=")) {
          config.maxAge = Number.parseInt(part.slice("max-age=".length), 10);
        } else if (part === "enforce") {
          config.enforce = true;
        } else if (part.startsWith("report-uri=")) {
          config.reportURI = part.slice("report-uri=".length);
        }
      }

      // If only max-age with default value, return simple true
      if (
        config.maxAge === defaultMaxAge &&
        config.enforce === undefined &&
        config.reportURI === undefined
      ) {
        return ParseResult.succeed(true as const);
      }

      // Return tuple format if there's any configuration
      if (config.maxAge !== undefined) {
        return ParseResult.succeed([
          true,
          {
            ...(config.maxAge !== defaultMaxAge && { maxAge: config.maxAge }),
            ...(config.enforce && { enforce: config.enforce }),
            ...(config.reportURI && { reportURI: config.reportURI }),
          },
        ] as const);
      }

      return ParseResult.fail(
        new ParseResult.Type(ast, header, `Cannot encode header value: ${header.value}`)
      );
    },
  }
).annotations({ identifier: "ExpectCTHeaderSchema" });

export type ExpectCTHeader = typeof ExpectCTHeaderSchema.Type;

export const createExpectCTHeaderValue = (
  option?: undefined | ExpectCTOption,
  strictURIEncoder = encodeStrictURI
): Effect.Effect<string | undefined, SecureHeadersError, never> =>
  Effect.gen(function* () {
    if (option == undefined) return undefined;
    if (option === false) return undefined;
    if (option === true) return `max-age=${defaultMaxAge}`;

    if (A.isArray(option)) {
      if (!option[0]) {
        return yield* new SecureHeadersError({
          type: "EXPECT_CT",
          message: `Invalid value for ${headerName} in the first option: ${option[0]}`,
        });
      }

      const maxAge = option[1].maxAge ?? defaultMaxAge;
      if (!P.isNumber(maxAge) || !Number.isFinite(maxAge)) {
        return yield* new SecureHeadersError({
          type: "EXPECT_CT",
          message: `Invalid value for "maxAge" option in ${headerName}: ${maxAge}`,
        });
      }
      const { enforce, reportURI } = option[1];

      return pipe(
        A.make(
          `max-age=${maxAge}`,
          enforce ? "enforce" : undefined,
          reportURI != undefined ? `report-uri=${strictURIEncoder(reportURI)}` : undefined
        ),
        A.filter(P.isNotNullable),
        A.join(", ")
      );
    }

    return yield* new SecureHeadersError({
      type: "EXPECT_CT",
      message: `Invalid value for ${headerName}: ${option}`,
    });
  }).pipe(Effect.withSpan("createExpectCTHeaderValue"));

export const createExpectCTHeader = (
  option?: undefined | ExpectCTOption,
  headerValueCreator = createExpectCTHeaderValue
): Effect.Effect<O.Option<ResponseHeader>, SecureHeadersError, never> =>
  Effect.gen(function* () {
    if (option == undefined) return O.none<ResponseHeader>();
    if (option === false) return O.none<ResponseHeader>();

    const value = yield* headerValueCreator(option);

    if (value === undefined) return O.none<ResponseHeader>();
    return O.some({ name: headerName, value });
  }).pipe(Effect.withSpan("createExpectCTHeader"));
