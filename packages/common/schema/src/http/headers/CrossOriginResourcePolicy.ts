/**
 * Schema for the `Cross-Origin-Resource-Policy` header.
 *
 * @since 0.0.0
 * @module \@beep/schema/http/headers/CrossOriginResourcePolicy
 */
import { $SchemaId } from "@beep/identity";
import { Effect, SchemaTransformation } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { LiteralKit } from "../../LiteralKit.ts";
import * as SchemaUtils from "../../SchemaUtils/index.ts";
import * as internal from "./_internal/index.ts";
import { CrossOriginResourcePolicyError, type SecureHeaderError } from "./SecureHeaderError.ts";

const $I = $SchemaId.create("http/headers/CrossOriginResourcePolicy");

const headerName = "Cross-Origin-Resource-Policy" as const;

const CorpValueBase = LiteralKit(["same-site", "same-origin", "cross-origin"]);

/**
 * @since 0.0.0
 */
export const CorpValue = CorpValueBase.pipe(
  $I.annoteSchema("CorpValue", {
    description: "The supported `Cross-Origin-Resource-Policy` header values.",
  }),
  SchemaUtils.withLiteralKitStatics(CorpValueBase)
);

/**
 * @since 0.0.0
 */
export type CorpValue = typeof CorpValue.Type;

const CrossOriginResourcePolicyOptionBase = LiteralKit([false, ...CorpValueBase.Options]);

/**
 * @since 0.0.0
 */
export const CrossOriginResourcePolicyOption = CrossOriginResourcePolicyOptionBase.pipe(
  $I.annoteSchema("CrossOriginResourcePolicyOption", {
    description: "The supported `Cross-Origin-Resource-Policy` option values.",
  }),
  SchemaUtils.withLiteralKitStatics(CrossOriginResourcePolicyOptionBase)
);

/**
 * @since 0.0.0
 */
export type CrossOriginResourcePolicyOption = typeof CrossOriginResourcePolicyOption.Type;

/**
 * @since 0.0.0
 */
export class CrossOriginResourcePolicyResponseHeader extends S.Class<CrossOriginResourcePolicyResponseHeader>(
  $I`CrossOriginResourcePolicyResponseHeader`
)(
  {
    name: S.tag(headerName),
    value: S.OptionFromUndefinedOr(S.String),
  },
  $I.annote("CrossOriginResourcePolicyResponseHeader", {
    description: "The `Cross-Origin-Resource-Policy` response header.",
  })
) {}

type CrossOriginResourcePolicyResponseHeaderEncoded = typeof CrossOriginResourcePolicyResponseHeader.Encoded;

/**
 * @since 0.0.0
 */
export const CrossOriginResourcePolicyHeader = S.Union([CrossOriginResourcePolicyOption, S.Undefined]).pipe(
  S.decodeTo(
    CrossOriginResourcePolicyResponseHeader,
    SchemaTransformation.transformOrFail({
      decode: (input): Effect.Effect<CrossOriginResourcePolicyResponseHeaderEncoded> =>
        Effect.succeed({
          name: headerName,
          value: P.isUndefined(input) || input === false ? undefined : input,
        }),
      encode: internal.makeHeaderEncodeForbidden("CrossOriginResourcePolicyHeader"),
    })
  ),
  $I.annoteSchema("CrossOriginResourcePolicyHeader", {
    description: "A one-way schema that decodes CORP options into the Cross-Origin-Resource-Policy response header.",
  }),
  SchemaUtils.withStatics(() => {
    const createValue: (
      option?: undefined | CrossOriginResourcePolicyOption
    ) => Effect.Effect<O.Option<string>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | CrossOriginResourcePolicyOption
    ) {
      if (P.isUndefined(option) || option === false) {
        return O.none<string>();
      }

      if (S.is(CorpValue)(option)) {
        return O.some(option);
      }

      return yield* new CrossOriginResourcePolicyError({
        message: `Invalid value for ${headerName}: ${option}`,
        cause: O.none(),
      });
    });

    const create: (
      option?: undefined | CrossOriginResourcePolicyOption,
      headerValueCreator?: undefined | typeof createValue
    ) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | CrossOriginResourcePolicyOption,
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
export type CrossOriginResourcePolicyHeader = typeof CrossOriginResourcePolicyHeader.Type;
