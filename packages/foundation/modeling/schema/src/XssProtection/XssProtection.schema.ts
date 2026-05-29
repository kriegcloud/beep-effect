/**
 * Schema for the `X-XSS-Protection` header.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $SchemaId } from "@beep/identity";
import { A } from "@beep/utils";
import { Effect, SchemaIssue, SchemaTransformation } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as internal from "../Http/Http.headers.shared.ts";
import { LiteralKit } from "../LiteralKit/index.ts";
import * as SchemaUtils from "../SchemaUtils/index.ts";
import { XssProtectionError } from "../SecureHeaderError/index.ts";
import type { SecureHeaderError } from "../SecureHeaderError/index.ts";

const $I = $SchemaId.create("XssProtection");

const headerName = "X-XSS-Protection" as const;

const XSSProtectionModeBase = LiteralKit(["sanitize", "block-rendering"]);

/**
 * @category schemas
 * @since 0.0.0
 */
export const XSSProtectionMode = XSSProtectionModeBase.pipe(
  $I.annoteSchema("XSSProtectionMode", {
    description: "The direct `X-XSS-Protection` policy modes.",
  }),
  SchemaUtils.withLiteralKitStatics(XSSProtectionModeBase)
);

/**
 * @category models
 * @since 0.0.0
 */
export type XSSProtectionMode = typeof XSSProtectionMode.Type;

/**
 * @category models
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
 * @category schemas
 * @since 0.0.0
 */
export const XSSProtectionReport = S.Tuple([S.Literal("report"), XSSProtectionReportConfig]).pipe(
  $I.annoteSchema("XSSProtectionReport", {
    description: "Tuple form used to configure `X-XSS-Protection` report mode.",
  })
);

/**
 * @category models
 * @since 0.0.0
 */
export type XSSProtectionReport = typeof XSSProtectionReport.Type;

/**
 * @category schemas
 * @since 0.0.0
 */
export const XSSProtectionOption = S.Union([S.Literal(false), XSSProtectionMode, XSSProtectionReport]).pipe(
  $I.annoteSchema("XSSProtectionOption", {
    description: "The supported `X-XSS-Protection` option values.",
  })
);

/**
 * @category models
 * @since 0.0.0
 */
export type XSSProtectionOption = typeof XSSProtectionOption.Type;

/**
 * @category models
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
      XssProtectionError.make({
        message: `Invalid value for ${headerName}: ${String(value)}`,
        cause: O.none(),
      }),
  });

const formatXSSProtectionValue = Effect.fn("XSSProtection.formatXSSProtectionValue")(function* (
  option: undefined | XSSProtectionOption
): Effect.fn.Return<string, XssProtectionError> {
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

  return yield* XssProtectionError.make({
    message: `Invalid value for ${headerName}: ${option}`,
    cause: O.none(),
  });
});

/**
 * @category schemas
 * @since 0.0.0
 */
export const XSSProtectionHeader = S.Union([XSSProtectionOption, S.Undefined]).pipe(
  S.decodeTo(
    XSSProtectionResponseHeader,
    SchemaTransformation.transformOrFail({
      decode: Effect.fnUntraced(function* (input): Effect.fn.Return<
        XSSProtectionResponseHeaderEncoded,
        SchemaIssue.Issue
      > {
        return yield* formatXSSProtectionValue(input).pipe(
          Effect.map((value) => ({
            name: headerName,
            value,
          })),
          Effect.mapError((error) => new SchemaIssue.InvalidValue(O.some(error), { message: error.message }))
        );
      }),
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

    const create = Effect.fnUntraced(function* (
      option?: undefined | XSSProtectionOption,
      headerValueCreator: typeof createValue = createValue
    ): Effect.fn.Return<O.Option<internal.ResponseHeader>, SecureHeaderError> {
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
 * @category models
 * @since 0.0.0
 */
export type XSSProtectionHeader = typeof XSSProtectionHeader.Type;

/**
 * Public aliases for concise namespace roles.
 *
 * @category schemas
 * @since 0.0.0
 */
export {
  XSSProtectionHeader as Header,
  XSSProtectionMode as Mode,
  XSSProtectionOption as Option,
  XSSProtectionResponseHeader as ResponseHeader,
};
