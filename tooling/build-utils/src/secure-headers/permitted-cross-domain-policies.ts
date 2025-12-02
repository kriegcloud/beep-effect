import { Effect } from "effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { SecureHeadersError } from "./errors.ts";
import type { ResponseHeader } from "./types.ts";

const headerName = "X-Permitted-Cross-Domain-Policies";

/**
 * Supported X-Permitted-Cross-Domain-Policies values.
 */
const permittedCrossDomainValues = ["none", "master-only", "by-content-type", "by-ftp-filename", "all"] as const;

type PermittedCrossDomainValue = (typeof permittedCrossDomainValues)[number];

/**
 * Schema for X-Permitted-Cross-Domain-Policies option values.
 * Accepts `false` to disable or one of the valid values.
 */
export const PermittedCrossDomainPoliciesOptionSchema = S.Literal(
  false,
  "none",
  "master-only",
  "by-content-type",
  "by-ftp-filename",
  "all"
);

export type PermittedCrossDomainPoliciesOption = typeof PermittedCrossDomainPoliciesOptionSchema.Type;

/**
 * Schema for the X-Permitted-Cross-Domain-Policies response header output.
 */
const PermittedCrossDomainPoliciesResponseHeaderSchema = S.Struct({
  name: S.Literal(headerName),
  value: S.UndefinedOr(S.String),
});

/**
 * Schema for the X-Permitted-Cross-Domain-Policies response header.
 * Transforms a PermittedCrossDomainPoliciesOption input into a ResponseHeader output.
 *
 * - `false` → decodes to `{ name: "X-Permitted-Cross-Domain-Policies", value: undefined }`
 * - `undefined` → decodes to `{ name: "X-Permitted-Cross-Domain-Policies", value: "none" }` (secure default)
 * - Valid value → decodes to `{ name: "X-Permitted-Cross-Domain-Policies", value: <value> }`
 */
export const PermittedCrossDomainPoliciesHeaderSchema = S.transformOrFail(
  S.Union(PermittedCrossDomainPoliciesOptionSchema, S.Undefined),
  PermittedCrossDomainPoliciesResponseHeaderSchema,
  {
    strict: true,
    decode: (option, _, ast) => {
      // Default to "none" (secure default) when undefined
      if (option === undefined) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: "none" });
      }
      if (option === false) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (permittedCrossDomainValues.includes(option as PermittedCrossDomainValue)) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: option });
      }
      return ParseResult.fail(new ParseResult.Type(ast, option, `Invalid value for ${headerName}: ${String(option)}`));
    },
    encode: (header, _, ast) => {
      if (header.value === undefined) {
        return ParseResult.succeed(false as const);
      }
      if (permittedCrossDomainValues.includes(header.value as PermittedCrossDomainValue)) {
        return ParseResult.succeed(header.value as PermittedCrossDomainPoliciesOption);
      }
      return ParseResult.fail(new ParseResult.Type(ast, header, `Cannot encode header value: ${header.value}`));
    },
  }
).annotations({ identifier: "PermittedCrossDomainPoliciesHeaderSchema" });

export type PermittedCrossDomainPoliciesHeader = typeof PermittedCrossDomainPoliciesHeaderSchema.Type;

/**
 * Creates the header value string from a PermittedCrossDomainPoliciesOption.
 * Defaults to "none" (secure default) when undefined.
 */
export const createPermittedCrossDomainPoliciesHeaderValue = (
  option?: undefined | PermittedCrossDomainPoliciesOption
): Effect.Effect<string | undefined, SecureHeadersError, never> =>
  Effect.gen(function* () {
    // Default to "none" (secure default) when undefined
    if (option === undefined) return "none";
    if (option === false) return undefined;
    if (permittedCrossDomainValues.includes(option as PermittedCrossDomainValue)) return option;

    return yield* new SecureHeadersError({
      type: "PERMITTED_CROSS_DOMAIN_POLICIES",
      message: `Invalid value for ${headerName}: ${option}`,
    });
  }).pipe(Effect.withSpan("createPermittedCrossDomainPoliciesHeaderValue"));

/**
 * Creates the X-Permitted-Cross-Domain-Policies header wrapped in Option.
 */
export const createPermittedCrossDomainPoliciesHeader = (
  option?: undefined | PermittedCrossDomainPoliciesOption,
  headerValueCreator = createPermittedCrossDomainPoliciesHeaderValue
): Effect.Effect<O.Option<ResponseHeader>, SecureHeadersError, never> =>
  Effect.gen(function* () {
    const value = yield* headerValueCreator(option);

    if (value === undefined) return O.none<ResponseHeader>();
    return O.some({ name: headerName, value });
  }).pipe(Effect.withSpan("createPermittedCrossDomainPoliciesHeader"));
