/**
 * Schema for the `X-XSS-Protection` header.
 *
 * @since 0.0.0
 * @module \@beep/schema/http/headers/XSSProtection
 */
import { $SchemaId } from "@beep/identity";
import { Effect, SchemaIssue, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { LiteralKit } from "../../LiteralKit.ts";
import * as SchemaUtils from "../../SchemaUtils/index.ts";
import * as internal from "./_internal/index.ts";
import { type SecureHeaderError, XssProtectionError } from "./SecureHeaderError.ts";

const $I = $SchemaId.create("http/headers/XSSProtection");

const headerName = "X-XSS-Protection" as const;

const XSSProtectionModeBase = LiteralKit(["sanitize", "block-rendering"]);

/**
 * @since 0.0.0
 */
export const XSSProtectionMode = XSSProtectionModeBase.pipe(
  $I.annoteSchema("XSSProtectionMode", {
    description: "The direct `X-XSS-Protection` policy modes.",
  }),
  SchemaUtils.withLiteralKitStatics(XSSProtectionModeBase)
);

/**
 * @since 0.0.0
 */
export type XSSProtectionMode = typeof XSSProtectionMode.Type;

/**
 * @since 0.0.0
 */
export class XSSProtectionReportConfig extends S.Class<XSSProtectionReportConfig>($I`XSSProtectionReportConfig`)(
  {
    uri: internal.StringOrUrl,
  },
  $I.annote("XSSProtectionReportConfig", {
    description: "Configuration for the `X-XSS-Protection` report mode.",
  })
) {}

/**
 * @since 0.0.0
 */
export const XSSProtectionReport = S.Tuple([S.Literal("report"), XSSProtectionReportConfig]).pipe(
  $I.annoteSchema("XSSProtectionReport", {
    description: "Tuple form used to configure `X-XSS-Protection` report mode.",
  })
);

/**
 * @since 0.0.0
 */
export type XSSProtectionReport = typeof XSSProtectionReport.Type;

/**
 * @since 0.0.0
 */
export const XSSProtectionOption = S.Union([S.Literal(false), XSSProtectionMode, XSSProtectionReport]).pipe(
  $I.annoteSchema("XSSProtectionOption", {
    description: "The supported `X-XSS-Protection` option values.",
  })
);

/**
 * @since 0.0.0
 */
export type XSSProtectionOption = typeof XSSProtectionOption.Type;

/**
 * @since 0.0.0
 */
export class XSSProtectionResponseHeader extends S.Class<XSSProtectionResponseHeader>($I`XSSProtectionResponseHeader`)(
  {
    name: S.tag(headerName),
    value: S.OptionFromUndefinedOr(S.String),
  },
  $I.annote("XSSProtectionResponseHeader", {
    description: "The `X-XSS-Protection` response header.",
  })
) {}

type XSSProtectionResponseHeaderEncoded = typeof XSSProtectionResponseHeader.Encoded;

const encodeReportUri = (value: internal.StringOrUrl): Effect.Effect<string, XssProtectionError> =>
  Effect.try({
    try: () => internal.encodeStrictURI(value),
    catch: () =>
      new XssProtectionError({
        message: `Invalid value for ${headerName}: ${String(value)}`,
        cause: O.none(),
      }),
  });

const formatXSSProtectionValue = (option: undefined | XSSProtectionOption): Effect.Effect<string, XssProtectionError> =>
  Effect.gen(function* () {
    if (P.isUndefined(option) || option === "sanitize") {
      return "1";
    }

    if (option === false) {
      return "0";
    }

    if (option === "block-rendering") {
      return "1; mode=block";
    }

    if (A.isArray(option) && option[0] === "report") {
      const uri = yield* encodeReportUri(option[1].uri);

      return `1; report=${uri}`;
    }

    return yield* new XssProtectionError({
      message: `Invalid value for ${headerName}: ${option}`,
      cause: O.none(),
    });
  });

/**
 * @since 0.0.0
 */
export const XSSProtectionHeader = S.Union([XSSProtectionOption, S.Undefined]).pipe(
  S.decodeTo(
    XSSProtectionResponseHeader,
    SchemaTransformation.transformOrFail({
      decode: (input): Effect.Effect<XSSProtectionResponseHeaderEncoded, SchemaIssue.Issue> =>
        formatXSSProtectionValue(input).pipe(
          Effect.map((value) => ({
            name: headerName,
            value,
          })),
          Effect.mapError((error) => new SchemaIssue.InvalidValue(O.some(error), { message: error.message }))
        ),
      encode: internal.makeHeaderEncodeForbidden("XSSProtectionHeader"),
    })
  ),
  $I.annoteSchema("XSSProtectionHeader", {
    description: "A one-way schema that decodes `X-XSS-Protection` options into the response header.",
  }),
  SchemaUtils.withStatics(() => {
    const createValue: (
      option?: undefined | XSSProtectionOption
    ) => Effect.Effect<O.Option<string>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | XSSProtectionOption
    ) {
      return O.some(yield* formatXSSProtectionValue(option));
    });

    const create: (
      option?: undefined | XSSProtectionOption,
      headerValueCreator?: undefined | typeof createValue
    ) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | XSSProtectionOption,
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
export type XSSProtectionHeader = typeof XSSProtectionHeader.Type;
