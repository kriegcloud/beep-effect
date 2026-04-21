/**
 * Schema for the `X-Frame-Options` header.
 *
 * @since 0.0.0
 * @module
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
import { FrameGuardError, type SecureHeaderError } from "./SecureHeaderError.ts";

const $I = $SchemaId.create("http/headers/FrameGuard");

const headerName = "X-Frame-Options" as const;
const defaultValue = "deny" as const;

const FrameGuardModeBase = LiteralKit(["deny", "sameorigin"]);

/**
 * @since 0.0.0
 */
export const FrameGuardMode = FrameGuardModeBase.pipe(
  $I.annoteSchema("FrameGuardMode", {
    description: "The direct `X-Frame-Options` policy values.",
  }),
  SchemaUtils.withLiteralKitStatics(FrameGuardModeBase)
);

/**
 * @since 0.0.0
 */
export type FrameGuardMode = typeof FrameGuardMode.Type;

/**
 * @since 0.0.0
 */
export class FrameGuardAllowFromConfig extends S.Class<FrameGuardAllowFromConfig>($I`FrameGuardAllowFromConfig`)(
  {
    uri: internal.StringOrUrl,
  },
  $I.annote("FrameGuardAllowFromConfig", {
    description: "Configuration for the deprecated `allow-from` `X-Frame-Options` variant.",
  })
) {}

/**
 * @since 0.0.0
 */
export const FrameGuardAllowFrom = S.Tuple([S.Literal("allow-from"), FrameGuardAllowFromConfig]).pipe(
  $I.annoteSchema("FrameGuardAllowFrom", {
    description: "Tuple form used to configure `X-Frame-Options: allow-from`.",
  })
);

/**
 * @since 0.0.0
 */
export type FrameGuardAllowFrom = typeof FrameGuardAllowFrom.Type;

/**
 * @since 0.0.0
 */
export const FrameGuardOption = S.Union([S.Literal(false), FrameGuardMode, FrameGuardAllowFrom]).pipe(
  $I.annoteSchema("FrameGuardOption", {
    description: "The supported `X-Frame-Options` option values.",
  })
);

/**
 * @since 0.0.0
 */
export type FrameGuardOption = typeof FrameGuardOption.Type;

/**
 * @since 0.0.0
 */
export class FrameGuardResponseHeader extends S.Class<FrameGuardResponseHeader>($I`FrameGuardResponseHeader`)(
  {
    name: S.tag(headerName),
    value: S.OptionFromUndefinedOr(S.String),
  },
  $I.annote("FrameGuardResponseHeader", {
    description: "The `X-Frame-Options` response header.",
  })
) {}

type FrameGuardResponseHeaderEncoded = typeof FrameGuardResponseHeader.Encoded;

const encodeAllowFromUri = (value: internal.StringOrUrl, message: string): Effect.Effect<string, FrameGuardError> =>
  Effect.try({
    try: () => internal.encodeStrictURI(value),
    catch: () =>
      new FrameGuardError({
        message,
        cause: O.none(),
      }),
  });

const formatFrameGuardValue = (option: FrameGuardMode | FrameGuardAllowFrom): Effect.Effect<string, FrameGuardError> =>
  Effect.gen(function* () {
    if (option === "deny" || option === "sameorigin") {
      return option;
    }

    if (A.isArray(option) && option[0] === "allow-from") {
      const uri = yield* encodeAllowFromUri(option[1].uri, `Invalid value for ${headerName}: ${String(option[1].uri)}`);

      return `${option[0]} ${uri}`;
    }

    return yield* new FrameGuardError({
      message: `Invalid value for ${headerName}: ${option}`,
      cause: O.none(),
    });
  });

/**
 * @since 0.0.0
 */
export const FrameGuardHeader = S.Union([FrameGuardOption, S.Undefined]).pipe(
  S.decodeTo(
    FrameGuardResponseHeader,
    SchemaTransformation.transformOrFail({
      decode: (input): Effect.Effect<FrameGuardResponseHeaderEncoded, SchemaIssue.Issue> =>
        Effect.gen(function* () {
          if (P.isUndefined(input)) {
            return {
              name: headerName,
              value: defaultValue,
            } as const;
          }

          if (input === false) {
            return {
              name: headerName,
              value: undefined,
            } as const;
          }

          const value = yield* formatFrameGuardValue(input).pipe(
            Effect.mapError((error) => new SchemaIssue.InvalidValue(O.some(error), { message: error.message }))
          );

          return {
            name: headerName,
            value,
          } as const;
        }),
      encode: internal.makeHeaderEncodeForbidden("FrameGuardHeader"),
    })
  ),
  $I.annoteSchema("FrameGuardHeader", {
    description: "A one-way schema that decodes `X-Frame-Options` options into the response header.",
  }),
  SchemaUtils.withStatics(() => {
    const createValue: (option?: undefined | FrameGuardOption) => Effect.Effect<O.Option<string>, SecureHeaderError> =
      Effect.fnUntraced(function* (option?: undefined | FrameGuardOption) {
        if (P.isUndefined(option)) {
          return O.some(defaultValue);
        }

        if (option === false) {
          return O.none<string>();
        }

        return O.some(yield* formatFrameGuardValue(option));
      });

    const create: (
      option?: undefined | FrameGuardOption,
      headerValueCreator?: undefined | typeof createValue
    ) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | FrameGuardOption,
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
export type FrameGuardHeader = typeof FrameGuardHeader.Type;
