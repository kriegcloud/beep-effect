/**
 * Schema for the `Strict-Transport-Security` header.
 *
 * @since 0.0.0
 * @module @beep/schema/http/headers/ForceHttpsRedirect
 */
import { $SchemaId } from "@beep/identity";
import { Effect, pipe, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as SchemaUtils from "../../SchemaUtils/index.ts";
import * as internal from "./_internal/index.ts";
import { ForceHttpsRedirectError, type SecureHeaderError } from "./SecureHeaderError.ts";

const $I = $SchemaId.create("http/headers/ForceHttpsRedirect");

const headerName = "Strict-Transport-Security" as const;
const defaultMaxAge = 60 * 60 * 24 * 365 * 2;

/**
 * @since 0.0.0
 */
export class ForceHttpsRedirectConfig extends S.Class<ForceHttpsRedirectConfig>($I`ForceHttpsRedirectConfig`)(
  {
    maxAge: S.optionalKey(S.Finite),
    includeSubDomains: S.optionalKey(S.Boolean),
    preload: S.optionalKey(S.Boolean),
  },
  $I.annote("ForceHttpsRedirectConfig", {
    description: "Optional configuration values for the `Strict-Transport-Security` header.",
  })
) {}

/**
 * @since 0.0.0
 */
export const ForceHttpsRedirectEnabled = S.Tuple([S.Literal(true), ForceHttpsRedirectConfig]).pipe(
  $I.annoteSchema("ForceHttpsRedirectEnabled", {
    description: "Tuple form used to enable `Strict-Transport-Security` with additional configuration.",
  })
);

/**
 * @since 0.0.0
 */
export type ForceHttpsRedirectEnabled = typeof ForceHttpsRedirectEnabled.Type;

/**
 * @since 0.0.0
 */
export const ForceHttpsRedirectOption = S.Union([S.Boolean, ForceHttpsRedirectEnabled]).pipe(
  $I.annoteSchema("ForceHttpsRedirectOption", {
    description: "The supported `Strict-Transport-Security` option values.",
  })
);

/**
 * @since 0.0.0
 */
export type ForceHttpsRedirectOption = typeof ForceHttpsRedirectOption.Type;

/**
 * @since 0.0.0
 */
export class ForceHttpsRedirectResponseHeader extends S.Class<ForceHttpsRedirectResponseHeader>(
  $I`ForceHttpsRedirectResponseHeader`
)(
  {
    name: S.tag(headerName),
    value: S.OptionFromUndefinedOr(S.String),
  },
  $I.annote("ForceHttpsRedirectResponseHeader", {
    description: "The `Strict-Transport-Security` response header.",
  })
) {}

type ForceHttpsRedirectResponseHeaderEncoded = typeof ForceHttpsRedirectResponseHeader.Encoded;

const formatForceHttpsRedirectValue = (config: ForceHttpsRedirectConfig): string =>
  pipe(
    A.make(
      `max-age=${config.maxAge ?? defaultMaxAge}`,
      config.includeSubDomains === true ? "includeSubDomains" : undefined,
      config.preload === true ? "preload" : undefined
    ),
    A.filter(P.isNotUndefined),
    A.join("; ")
  );

/**
 * @since 0.0.0
 */
export const ForceHttpsRedirectHeader = S.Union([ForceHttpsRedirectOption, S.Undefined]).pipe(
  S.decodeTo(
    ForceHttpsRedirectResponseHeader,
    SchemaTransformation.transformOrFail({
      decode: (input): Effect.Effect<ForceHttpsRedirectResponseHeaderEncoded> =>
        Effect.succeed({
          name: headerName,
          value:
            P.isUndefined(input) || input === true
              ? `max-age=${defaultMaxAge}`
              : input === false
                ? undefined
                : formatForceHttpsRedirectValue(input[1]),
        }),
      encode: internal.makeHeaderEncodeForbidden("ForceHttpsRedirectHeader"),
    })
  ),
  $I.annoteSchema("ForceHttpsRedirectHeader", {
    description: "A one-way schema that decodes `Strict-Transport-Security` options into the response header.",
  }),
  SchemaUtils.withStatics(() => {
    const createValue: (
      option?: undefined | ForceHttpsRedirectOption
    ) => Effect.Effect<O.Option<string>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | ForceHttpsRedirectOption
    ) {
      if (P.isUndefined(option) || option === true) {
        return O.some(`max-age=${defaultMaxAge}`);
      }

      if (option === false) {
        return O.none<string>();
      }

      const enabled = yield* S.decodeUnknownEffect(ForceHttpsRedirectEnabled)(option).pipe(
        Effect.mapError(
          (cause) =>
            new ForceHttpsRedirectError({
              message: cause.message,
              cause: O.none(),
            })
        )
      );

      return O.some(formatForceHttpsRedirectValue(enabled[1]));
    });

    const create: (
      option?: undefined | ForceHttpsRedirectOption,
      headerValueCreator?: undefined | typeof createValue
    ) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | ForceHttpsRedirectOption,
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
export type ForceHttpsRedirectHeader = typeof ForceHttpsRedirectHeader.Type;
