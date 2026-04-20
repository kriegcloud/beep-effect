/**
 * Schema for the `X-Content-Type-Options` header.
 *
 * @since 0.0.0
 * @module \@beep/schema/http/headers/NoSniff
 */
import { $SchemaId } from "@beep/identity";
import { Effect, SchemaTransformation } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { LiteralKit } from "../../LiteralKit.ts";
import * as SchemaUtils from "../../SchemaUtils/index.ts";
import * as internal from "./_internal/index.ts";
import { NoSniffError, type SecureHeaderError } from "./SecureHeaderError.ts";

const $I = $SchemaId.create("http/headers/NoSniff");

const headerName = "X-Content-Type-Options" as const;
const defaultValue = "nosniff" as const;

const NoSniffValueBase = LiteralKit([defaultValue]);

/**
 * Schema for supported `X-Content-Type-Options` header values.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { NoSniffValue } from "@beep/schema/http/headers/NoSniff"
 *
 * const decoded = S.decodeUnknownSync(NoSniffValue)("nosniff")
 * void decoded
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const NoSniffValue = NoSniffValueBase.pipe(
  $I.annoteSchema("NoSniffValue", {
    description: "The supported `X-Content-Type-Options` header values.",
  }),
  SchemaUtils.withLiteralKitStatics(NoSniffValueBase)
);

/**
 * Type-level representation of {@link NoSniffValue}.
 *
 * @since 0.0.0
 * @category models
 */
export type NoSniffValue = typeof NoSniffValue.Type;

const NoSniffOptionBase = LiteralKit([false, ...NoSniffValueBase.Options]);

/**
 * Schema for `X-Content-Type-Options` option values, including `false` to disable.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { NoSniffOption } from "@beep/schema/http/headers/NoSniff"
 *
 * const decoded = S.decodeUnknownSync(NoSniffOption)(false)
 * void decoded
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const NoSniffOption = NoSniffOptionBase.pipe(
  $I.annoteSchema("NoSniffOption", {
    description: "The supported `X-Content-Type-Options` option values.",
  }),
  SchemaUtils.withLiteralKitStatics(NoSniffOptionBase)
);

/**
 * Type-level representation of {@link NoSniffOption}.
 *
 * @since 0.0.0
 * @category models
 */
export type NoSniffOption = typeof NoSniffOption.Type;

/**
 * Parsed `X-Content-Type-Options` response header with name and optional value.
 *
 * @example
 * ```ts
 * import * as Option from "effect/Option"
 * import { NoSniffResponseHeader } from "@beep/schema/http/headers/NoSniff"
 *
 * const header = new NoSniffResponseHeader({ name: "X-Content-Type-Options", value: Option.none() })
 * void header
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class NoSniffResponseHeader extends S.Class<NoSniffResponseHeader>($I`NoSniffResponseHeader`)(
  {
    name: S.tag(headerName),
    value: S.OptionFromUndefinedOr(S.String),
  },
  $I.annote("NoSniffResponseHeader", {
    description: "The `X-Content-Type-Options` response header.",
  })
) {}

type NoSniffResponseHeaderEncoded = typeof NoSniffResponseHeader.Encoded;

/**
 * One-way schema that decodes `X-Content-Type-Options` options into the response header.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { NoSniffHeader } from "@beep/schema/http/headers/NoSniff"
 *
 * const program = NoSniffHeader.create()
 * void program
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const NoSniffHeader = S.Union([NoSniffOption, S.Undefined]).pipe(
  S.decodeTo(
    NoSniffResponseHeader,
    SchemaTransformation.transformOrFail({
      decode: (input): Effect.Effect<NoSniffResponseHeaderEncoded> =>
        Effect.succeed({
          name: headerName,
          value: P.isUndefined(input) ? defaultValue : input === false ? undefined : input,
        }),
      encode: internal.makeHeaderEncodeForbidden("NoSniffHeader"),
    })
  ),
  $I.annoteSchema("NoSniffHeader", {
    description: "A one-way schema that decodes `X-Content-Type-Options` options into the response header.",
  }),
  SchemaUtils.withStatics(() => {
    const createValue: (option?: undefined | NoSniffOption) => Effect.Effect<O.Option<string>, SecureHeaderError> =
      Effect.fnUntraced(function* (option?: undefined | NoSniffOption) {
        if (P.isUndefined(option)) {
          return O.some(defaultValue);
        }

        if (option === false) {
          return O.none<string>();
        }

        if (S.is(NoSniffValue)(option)) {
          return O.some(option);
        }

        return yield* new NoSniffError({
          message: `Invalid value for ${headerName}: ${option}`,
          cause: O.none(),
        });
      });

    const create: (
      option?: undefined | NoSniffOption,
      headerValueCreator?: undefined | typeof createValue
    ) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | NoSniffOption,
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
 * Type-level representation of {@link NoSniffHeader}.
 *
 * @since 0.0.0
 * @category models
 */
export type NoSniffHeader = typeof NoSniffHeader.Type;
