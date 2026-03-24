/**
 * Schema for the `Permissions-Policy` header.
 *
 * @since 0.0.0
 * @module @beep/schema/http/headers/PermissionsPolicy
 */
import { $SchemaId } from "@beep/identity";
import { Struct } from "@beep/utils";
import { Effect, pipe, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { LiteralKit } from "../../LiteralKit.ts";
import * as SchemaUtils from "../../SchemaUtils/index.ts";
import * as internal from "./_internal/index.ts";
import { PermissionsPolicyError, type SecureHeaderError } from "./SecureHeaderError.ts";

const $I = $SchemaId.create("http/headers/PermissionsPolicy");

const headerName = "Permissions-Policy" as const;
const quotedOriginPattern = /^".*"$/;

const PermissionsPolicyDirectiveBase = LiteralKit([
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
]);

/**
 * @since 0.0.0
 */
export const PermissionsPolicyDirective = PermissionsPolicyDirectiveBase.pipe(
  $I.annoteSchema("PermissionsPolicyDirective", {
    description: "The supported directive names for the `Permissions-Policy` header.",
  }),
  SchemaUtils.withLiteralKitStatics(PermissionsPolicyDirectiveBase)
);

/**
 * @since 0.0.0
 */
export type PermissionsPolicyDirective = typeof PermissionsPolicyDirective.Type;

/**
 * @since 0.0.0
 */
export const PermissionsPolicyDirectiveKey = S.String.check(
  S.makeFilter(S.is(PermissionsPolicyDirective), {
    identifier: "PermissionsPolicyDirectiveKey",
    title: "PermissionsPolicyDirectiveKey",
    description: "A valid `Permissions-Policy` directive name.",
    message: "Invalid directive name",
  })
).pipe(
  $I.annoteSchema("PermissionsPolicyDirectiveKey", {
    description: "A validated `Permissions-Policy` directive record key.",
  })
);

/**
 * @since 0.0.0
 */
export type PermissionsPolicyDirectiveKey = typeof PermissionsPolicyDirectiveKey.Type;

/**
 * @since 0.0.0
 */
export const QuotedOrigin = S.String.check(
  S.isPattern(quotedOriginPattern, {
    title: "QuotedOrigin",
    description: "A quoted origin string.",
    message: "Origin must be quoted",
  })
).pipe(
  $I.annoteSchema("QuotedOrigin", {
    description: "A quoted origin value used by `Permissions-Policy`.",
  })
);

/**
 * @since 0.0.0
 */
export type QuotedOrigin = typeof QuotedOrigin.Type;

const PermissionsPolicyDirectiveValueSingleBase = LiteralKit(["*", "self", "none"]);

/**
 * @since 0.0.0
 */
export const PermissionsPolicyDirectiveValueSingle = PermissionsPolicyDirectiveValueSingleBase.pipe(
  $I.annoteSchema("PermissionsPolicyDirectiveValueSingle", {
    description: "Single-value `Permissions-Policy` allowlist forms.",
  }),
  SchemaUtils.withLiteralKitStatics(PermissionsPolicyDirectiveValueSingleBase)
);

/**
 * @since 0.0.0
 */
export type PermissionsPolicyDirectiveValueSingle = typeof PermissionsPolicyDirectiveValueSingle.Type;

/**
 * @since 0.0.0
 */
export const PermissionsPolicyAllowlistedOrigin = S.Union([S.Literal("self"), QuotedOrigin]).pipe(
  $I.annoteSchema("PermissionsPolicyAllowlistedOrigin", {
    description: "A `Permissions-Policy` allowlisted origin item.",
  })
);

/**
 * @since 0.0.0
 */
export type PermissionsPolicyAllowlistedOrigin = typeof PermissionsPolicyAllowlistedOrigin.Type;

/**
 * @since 0.0.0
 */
export const PermissionsPolicyDirectiveValue = S.Union([
  PermissionsPolicyDirectiveValueSingle,
  QuotedOrigin,
  S.Array(PermissionsPolicyAllowlistedOrigin),
]).pipe(
  $I.annoteSchema("PermissionsPolicyDirectiveValue", {
    description: "A `Permissions-Policy` directive value.",
  })
);

/**
 * @since 0.0.0
 */
export type PermissionsPolicyDirectiveValue = typeof PermissionsPolicyDirectiveValue.Type;

/**
 * @since 0.0.0
 */
export const PermissionsPolicyDirectives = S.Record(
  PermissionsPolicyDirectiveKey,
  PermissionsPolicyDirectiveValue
).pipe(
  $I.annoteSchema("PermissionsPolicyDirectives", {
    description: "A record of `Permissions-Policy` directives to allowlist values.",
  })
);

/**
 * @since 0.0.0
 */
export type PermissionsPolicyDirectives = typeof PermissionsPolicyDirectives.Type;

/**
 * @since 0.0.0
 */
export class PermissionsPolicyOptionStruct extends S.Class<PermissionsPolicyOptionStruct>(
  $I`PermissionsPolicyOptionStruct`
)(
  {
    directives: PermissionsPolicyDirectives,
  },
  $I.annote("PermissionsPolicyOptionStruct", {
    description: "Structured configuration for the `Permissions-Policy` header.",
  })
) {}

/**
 * @since 0.0.0
 */
export const PermissionsPolicyOption = S.Union([S.Literal(false), PermissionsPolicyOptionStruct]).pipe(
  $I.annoteSchema("PermissionsPolicyOption", {
    description: "The supported `Permissions-Policy` option values.",
  })
);

/**
 * @since 0.0.0
 */
export type PermissionsPolicyOption = typeof PermissionsPolicyOption.Type;

/**
 * @since 0.0.0
 */
export class PermissionsPolicyResponseHeader extends S.Class<PermissionsPolicyResponseHeader>(
  $I`PermissionsPolicyResponseHeader`
)(
  {
    name: S.tag(headerName),
    value: S.OptionFromUndefinedOr(S.String),
  },
  $I.annote("PermissionsPolicyResponseHeader", {
    description: "The `Permissions-Policy` response header.",
  })
) {}

type PermissionsPolicyResponseHeaderEncoded = typeof PermissionsPolicyResponseHeader.Encoded;

const formatDirectiveValue = (value: PermissionsPolicyDirectiveValue): string => {
  if (value === "*") {
    return "*";
  }

  if (value === "none") {
    return "()";
  }

  if (value === "self") {
    return "(self)";
  }

  if (A.isArray(value)) {
    return `(${A.join(value, " ")})`;
  }

  return `(${value})`;
};

const buildHeaderValue = (directives: PermissionsPolicyDirectives): O.Option<string> =>
  pipe(
    Struct.entries(directives),
    A.map(([key, value]) => `${key}=${formatDirectiveValue(value)}`),
    A.match({
      onEmpty: O.none<string>,
      onNonEmpty: (parts) => O.some(A.join(parts, ", ")),
    })
  );

/**
 * @since 0.0.0
 */
export const PermissionsPolicyHeader = S.Union([PermissionsPolicyOption, S.Undefined]).pipe(
  S.decodeTo(
    PermissionsPolicyResponseHeader,
    SchemaTransformation.transformOrFail({
      decode: (input): Effect.Effect<PermissionsPolicyResponseHeaderEncoded> =>
        Effect.succeed({
          name: headerName,
          value:
            P.isUndefined(input) || input === false ? undefined : O.getOrUndefined(buildHeaderValue(input.directives)),
        }),
      encode: internal.makeHeaderEncodeForbidden("PermissionsPolicyHeader"),
    })
  ),
  $I.annoteSchema("PermissionsPolicyHeader", {
    description: "A one-way schema that decodes `Permissions-Policy` options into the response header.",
  }),
  SchemaUtils.withStatics(() => {
    const createValue: (
      option?: undefined | PermissionsPolicyOption
    ) => Effect.Effect<O.Option<string>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | PermissionsPolicyOption
    ) {
      if (P.isUndefined(option) || option === false) {
        return O.none<string>();
      }

      const decodedOption = yield* S.decodeUnknownEffect(PermissionsPolicyOptionStruct)(option).pipe(
        Effect.mapError(
          (cause) =>
            new PermissionsPolicyError({
              message: cause.message,
              cause: O.none(),
            })
        )
      );

      return buildHeaderValue(decodedOption.directives);
    });

    const create: (
      option?: undefined | PermissionsPolicyOption,
      headerValueCreator?: undefined | typeof createValue
    ) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | PermissionsPolicyOption,
      headerValueCreator: typeof createValue = createValue
    ) {
      const value = yield* headerValueCreator(option);

      return internal.makeResponseHeaderOption(headerName, value);
    });

    return {
      createValue,
      create,
    };
  })
);

/**
 * @since 0.0.0
 */
export type PermissionsPolicyHeader = typeof PermissionsPolicyHeader.Type;
