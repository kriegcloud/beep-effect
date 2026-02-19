import { Effect } from "effect";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { SecureHeadersError } from "./errors.js";
import type { ResponseHeader } from "./types.js";

const headerName = "Permissions-Policy";

/**
 * All supported Permissions-Policy directives.
 */
export const permissionsPolicyDirectives = [
  "accelerometer",
  "ambient-light-sensor",
  "autoplay",
  "battery",
  "camera",
  "cross-origin-isolated",
  "display-capture",
  "document-domain",
  "encrypted-media",
  "execution-while-not-rendered",
  "execution-while-out-of-viewport",
  "fullscreen",
  "geolocation",
  "gyroscope",
  "keyboard-map",
  "magnetometer",
  "microphone",
  "midi",
  "navigation-override",
  "payment",
  "picture-in-picture",
  "publickey-credentials-get",
  "screen-wake-lock",
  "sync-xhr",
  "usb",
  "web-share",
  "xr-spatial-tracking",
] as const;

type DirectiveName = (typeof permissionsPolicyDirectives)[number];

/**
 * Allowlist value for a directive.
 * - `*` - Allow all origins
 * - `self` - Allow same origin only
 * - `none` - Deny all (renders as empty parens)
 * - `"https://example.com"` - Allow specific origin (quoted)
 * - Array of `self` or quoted origins - Multiple origins
 */
export type PermissionsPolicyDirectiveValue = "*" | "self" | "none" | `"${string}"` | Array<"self" | `"${string}"`>;

export type PermissionsPolicyDirectives = Partial<{
  readonly [K in DirectiveName]: PermissionsPolicyDirectiveValue;
}>;

export type PermissionsPolicyOption =
  | false
  | {
      readonly directives: PermissionsPolicyDirectives;
    };

/**
 * Schema for individual directive values.
 */
const DirectiveValueSchema = S.Union(
  S.Literal("*", "self", "none"),
  S.String.pipe(S.filter((s) => s.startsWith('"') && s.endsWith('"'), { message: () => "Origin must be quoted" })),
  S.Array(
    S.Union(
      S.Literal("self"),
      S.String.pipe(S.filter((s) => s.startsWith('"') && s.endsWith('"'), { message: () => "Origin must be quoted" }))
    )
  )
);

/**
 * Schema for Permissions-Policy option.
 */
export const PermissionsPolicyOptionSchema = S.Union(
  S.Literal(false),
  S.Struct({
    directives: S.Record({
      key: S.String.pipe(
        S.filter((s) => permissionsPolicyDirectives.includes(s as DirectiveName), {
          message: () => "Invalid directive name",
        })
      ),
      value: DirectiveValueSchema,
    }),
  })
);

export type PermissionsPolicyOptionType = typeof PermissionsPolicyOptionSchema.Type;

/**
 * Schema for the Permissions-Policy response header output.
 */
const PermissionsPolicyResponseHeaderSchema = S.Struct({
  name: S.Literal(headerName),
  value: S.UndefinedOr(S.String),
});

/**
 * Formats a directive value to its header string representation.
 */
const formatDirectiveValue = (value: PermissionsPolicyDirectiveValue): string => {
  if (value === "*") return "*";
  if (value === "none") return "()";
  if (value === "self") return "(self)";
  if (Array.isArray(value)) {
    return `(${value.join(" ")})`;
  }
  // Single quoted origin
  return `(${value})`;
};

/**
 * Builds the header value string from directives.
 */
const buildHeaderValue = (directives: PermissionsPolicyDirectives): string | undefined => {
  const entries = Object.entries(directives) as Array<[DirectiveName, PermissionsPolicyDirectiveValue]>;
  if (entries.length === 0) return undefined;

  const parts = entries
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${formatDirectiveValue(value)}`);

  return parts.length > 0 ? parts.join(", ") : undefined;
};

/**
 * Schema for the Permissions-Policy response header.
 * Transforms a PermissionsPolicyOption input into a ResponseHeader output.
 */
export const PermissionsPolicyHeaderSchema = S.transformOrFail(
  S.Union(PermissionsPolicyOptionSchema, S.Undefined),
  PermissionsPolicyResponseHeaderSchema,
  {
    strict: true,
    decode: (option, _) => {
      if (option === undefined) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }
      if (option === false) {
        return ParseResult.succeed({ name: headerName as typeof headerName, value: undefined });
      }

      const headerValue = buildHeaderValue(option.directives as PermissionsPolicyDirectives);
      return ParseResult.succeed({ name: headerName as typeof headerName, value: headerValue });
    },
    encode: (header, _, ast) => {
      if (header.value === undefined) {
        return ParseResult.succeed(false as const);
      }
      // Note: Full parsing back to directives object is complex
      // For now, encoding from header back to option is not fully reversible
      return ParseResult.fail(
        new ParseResult.Type(ast, header, `Encoding Permissions-Policy header back to option is not supported`)
      );
    },
  }
).annotations({ identifier: "PermissionsPolicyHeaderSchema" });

export type PermissionsPolicyHeader = typeof PermissionsPolicyHeaderSchema.Type;

/**
 * Creates the header value string from a PermissionsPolicyOption.
 */
export const createPermissionsPolicyHeaderValue: (
  option?: undefined | PermissionsPolicyOption
) => Effect.Effect<string | undefined, SecureHeadersError, never> = Effect.fn("createPermissionsPolicyHeaderValue")(
  function* (option?: undefined | PermissionsPolicyOption) {
    if (option === undefined) return undefined;
    if (option === false) return undefined;

    const directives = option.directives;
    const entries = Object.entries(directives) as Array<[string, PermissionsPolicyDirectiveValue]>;

    // Validate directive names
    for (const [key, _] of entries) {
      if (!permissionsPolicyDirectives.includes(key as DirectiveName)) {
        return yield* new SecureHeadersError({
          type: "PERMISSIONS_POLICY",
          message: `Invalid directive name for ${headerName}: ${key}`,
        });
      }
    }

    return buildHeaderValue(directives);
  }
);

/**
 * Creates the Permissions-Policy header wrapped in Option.
 */
export const createPermissionsPolicyHeader: (
  option?: undefined | PermissionsPolicyOption,
  headerValueCreator?: typeof createPermissionsPolicyHeaderValue
) => Effect.Effect<O.Option<ResponseHeader>, SecureHeadersError, never> = Effect.fn("createPermissionsPolicyHeader")(
  function* (option?: undefined | PermissionsPolicyOption, headerValueCreator = createPermissionsPolicyHeaderValue) {
    const value = yield* headerValueCreator(option);

    if (value === undefined) return O.none<ResponseHeader>();
    return O.some({ name: headerName, value });
  }
);
