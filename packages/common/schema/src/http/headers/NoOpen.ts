/**
 * Schema for the `X-Download-Options` header.
 *
 * @since 0.0.0
 * @module @beep/schema/http/headers/NoOpen
 */
import { $SchemaId } from "@beep/identity";
import { Effect, SchemaTransformation } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { LiteralKit } from "../../LiteralKit.ts";
import * as SchemaUtils from "../../SchemaUtils/index.ts";
import * as internal from "./_internal/index.ts";
import { NoOpenError, type SecureHeaderError } from "./SecureHeaderError.ts";

const $I = $SchemaId.create("http/headers/NoOpen");

const headerName = "X-Download-Options" as const;
const defaultValue = "noopen" as const;

const NoOpenValueBase = LiteralKit([defaultValue]);

/**
 * @since 0.0.0
 */
export const NoOpenValue = NoOpenValueBase.pipe(
  $I.annoteSchema("NoOpenValue", {
    description: "The supported `X-Download-Options` header values.",
  }),
  SchemaUtils.withLiteralKitStatics(NoOpenValueBase)
);

/**
 * @since 0.0.0
 */
export type NoOpenValue = typeof NoOpenValue.Type;

const NoOpenOptionBase = LiteralKit([false, ...NoOpenValueBase.Options]);

/**
 * @since 0.0.0
 */
export const NoOpenOption = NoOpenOptionBase.pipe(
  $I.annoteSchema("NoOpenOption", {
    description: "The supported `X-Download-Options` option values.",
  }),
  SchemaUtils.withLiteralKitStatics(NoOpenOptionBase)
);

/**
 * @since 0.0.0
 */
export type NoOpenOption = typeof NoOpenOption.Type;

/**
 * @since 0.0.0
 */
export class NoOpenResponseHeader extends S.Class<NoOpenResponseHeader>($I`NoOpenResponseHeader`)(
  {
    name: S.tag(headerName),
    value: S.OptionFromUndefinedOr(S.String),
  },
  $I.annote("NoOpenResponseHeader", {
    description: "The `X-Download-Options` response header.",
  })
) {}

type NoOpenResponseHeaderEncoded = typeof NoOpenResponseHeader.Encoded;

/**
 * @since 0.0.0
 */
export const NoOpenHeader = S.Union([NoOpenOption, S.Undefined]).pipe(
  S.decodeTo(
    NoOpenResponseHeader,
    SchemaTransformation.transformOrFail({
      decode: (input): Effect.Effect<NoOpenResponseHeaderEncoded> =>
        Effect.succeed({
          name: headerName,
          value: P.isUndefined(input) ? defaultValue : input === false ? undefined : input,
        }),
      encode: internal.makeHeaderEncodeForbidden("NoOpenHeader"),
    })
  ),
  $I.annoteSchema("NoOpenHeader", {
    description: "A one-way schema that decodes `X-Download-Options` options into the response header.",
  }),
  SchemaUtils.withStatics(() => {
    const createValue: (option?: undefined | NoOpenOption) => Effect.Effect<O.Option<string>, SecureHeaderError> =
      Effect.fnUntraced(function* (option?: undefined | NoOpenOption) {
        if (P.isUndefined(option)) {
          return O.some(defaultValue);
        }

        if (option === false) {
          return O.none<string>();
        }

        if (S.is(NoOpenValue)(option)) {
          return O.some(option);
        }

        return yield* new NoOpenError({
          message: `Invalid value for ${headerName}: ${option}`,
          cause: O.none(),
        });
      });

    const create: (
      option?: undefined | NoOpenOption,
      headerValueCreator?: undefined | typeof createValue
    ) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | NoOpenOption,
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
export type NoOpenHeader = typeof NoOpenHeader.Type;
