/**
 * Schema for the `Cross-Origin-Opener-Policy` header.
 *
 * @since 0.0.0
 * @module @beep/schema/http/headers/CrossOriginOpenerPolicy
 */
import { $SchemaId } from "@beep/identity";
import { Effect, SchemaTransformation } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { LiteralKit } from "../../LiteralKit.ts";
import * as SchemaUtils from "../../SchemaUtils/index.ts";
import * as internal from "./_internal/index.ts";
import { CrossOriginOpenerPolicyError, type SecureHeaderError } from "./SecureHeaderError.ts";

const $I = $SchemaId.create("http/headers/CrossOriginOpenerPolicy");

const headerName = "Cross-Origin-Opener-Policy" as const;

const CoopValueBase = LiteralKit(["unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"]);

/**
 * Schema for supported `Cross-Origin-Opener-Policy` header values.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { CoopValue } from "@beep/schema/http/headers/CrossOriginOpenerPolicy"
 *
 * const decoded = S.decodeUnknownSync(CoopValue)("same-origin")
 * void decoded
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const CoopValue = CoopValueBase.pipe(
  $I.annoteSchema("CoopValue", {
    description: "The supported `Cross-Origin-Opener-Policy` header values.",
  }),
  SchemaUtils.withLiteralKitStatics(CoopValueBase)
);

/**
 * Type-level representation of {@link CoopValue}.
 *
 * @since 0.0.0
 * @category models
 */
export type CoopValue = typeof CoopValue.Type;

const CrossOriginOpenerPolicyOptionBase = LiteralKit([false, ...CoopValueBase.Options]);

/**
 * Schema for `Cross-Origin-Opener-Policy` option values, including `false` to disable.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { CrossOriginOpenerPolicyOption } from "@beep/schema/http/headers/CrossOriginOpenerPolicy"
 *
 * const decoded = S.decodeUnknownSync(CrossOriginOpenerPolicyOption)(false)
 * void decoded
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const CrossOriginOpenerPolicyOption = CrossOriginOpenerPolicyOptionBase.pipe(
  $I.annoteSchema("CrossOriginOpenerPolicyOption", {
    description: "The supported `Cross-Origin-Opener-Policy` option values.",
  }),
  SchemaUtils.withLiteralKitStatics(CrossOriginOpenerPolicyOptionBase)
);

/**
 * Type-level representation of {@link CrossOriginOpenerPolicyOption}.
 *
 * @since 0.0.0
 * @category models
 */
export type CrossOriginOpenerPolicyOption = typeof CrossOriginOpenerPolicyOption.Type;

/**
 * Parsed `Cross-Origin-Opener-Policy` response header with name and optional value.
 *
 * @example
 * ```ts
 * import { CrossOriginOpenerPolicyResponseHeader } from "@beep/schema/http/headers/CrossOriginOpenerPolicy"
 *
 * const header = new CrossOriginOpenerPolicyResponseHeader({
 *   name: "Cross-Origin-Opener-Policy",
 *   value: undefined,
 * })
 * void header
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class CrossOriginOpenerPolicyResponseHeader extends S.Class<CrossOriginOpenerPolicyResponseHeader>(
  $I`CrossOriginOpenerPolicyResponseHeader`
)(
  {
    name: S.tag(headerName),
    value: S.OptionFromUndefinedOr(S.String),
  },
  $I.annote("CrossOriginOpenerPolicyResponseHeader", {
    description: "The `Cross-Origin-Opener-Policy` response header.",
  })
) {}

type CrossOriginOpenerPolicyResponseHeaderEncoded = typeof CrossOriginOpenerPolicyResponseHeader.Encoded;

/**
 * One-way schema that decodes COOP options into the `Cross-Origin-Opener-Policy` response header.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { CrossOriginOpenerPolicyHeader } from "@beep/schema/http/headers/CrossOriginOpenerPolicy"
 *
 * const program = CrossOriginOpenerPolicyHeader.create("same-origin")
 * void program
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const CrossOriginOpenerPolicyHeader = S.Union([CrossOriginOpenerPolicyOption, S.Undefined]).pipe(
  S.decodeTo(
    CrossOriginOpenerPolicyResponseHeader,
    SchemaTransformation.transformOrFail({
      decode: (input): Effect.Effect<CrossOriginOpenerPolicyResponseHeaderEncoded> =>
        Effect.succeed({
          name: headerName,
          value: P.isUndefined(input) || input === false ? undefined : input,
        }),
      encode: internal.makeHeaderEncodeForbidden("CrossOriginOpenerPolicyHeader"),
    })
  ),
  $I.annoteSchema("CrossOriginOpenerPolicyHeader", {
    description: "A one-way schema that decodes COOP options into the Cross-Origin-Opener-Policy response header.",
  }),
  SchemaUtils.withStatics(() => {
    const createValue: (
      option?: undefined | CrossOriginOpenerPolicyOption
    ) => Effect.Effect<O.Option<string>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | CrossOriginOpenerPolicyOption
    ) {
      if (P.isUndefined(option) || option === false) {
        return O.none<string>();
      }

      if (S.is(CoopValue)(option)) {
        return O.some(option);
      }

      return yield* new CrossOriginOpenerPolicyError({
        message: `Invalid value for ${headerName}: ${option}`,
        cause: O.none(),
      });
    });

    const create: (
      option?: undefined | CrossOriginOpenerPolicyOption,
      headerValueCreator?: undefined | typeof createValue
    ) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | CrossOriginOpenerPolicyOption,
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
 * Type-level representation of {@link CrossOriginOpenerPolicyHeader}.
 *
 * @since 0.0.0
 * @category models
 */
export type CrossOriginOpenerPolicyHeader = typeof CrossOriginOpenerPolicyHeader.Type;
