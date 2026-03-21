/**
 * Schema for the `Cross-Origin-Embedder-Policy` header.
 *
 * @since 0.0.0
 * @module @beep/schema/http/headers/CrossOriginEmbedderPolicy
 */

import { $SchemaId } from "@beep/identity";
import { O } from "@beep/utils";
import { Effect, pipe, SchemaIssue, SchemaTransformation } from "effect";
import * as Eq from "effect/Equal";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { LiteralKit } from "../../LiteralKit.ts";
import * as SchemaUtils from "../../SchemaUtils/index.ts";
import { ResponseHeader } from "./_internal/index.ts";
import { CrossOriginEmbedderPolicyError, type SecureHeaderError } from "./SecureHeaderError.ts";

const $I = $SchemaId.create("http/headers/CrossOriginEmbedderPolicy");

const headerName = "Cross-Origin-Embedder-Policy" as const;

const CoepValueBase = LiteralKit(["unsafe-none", "require-corp", "credentialless"]);

/**
 * @since 0.0.0
 */
export const CoepValue = CoepValueBase.pipe(
  $I.annoteSchema("CoepValue", {
    description: "The value of the `Cross-Origin-Embedder-Policy` header.",
  }),
  SchemaUtils.withLiteralKitStatics(CoepValueBase)
);

/**
 * @since 0.0.0
 */
export type CoepValue = typeof CoepValue.Type;

const CrossOriginEmbedderPolicyOptionBase = LiteralKit([false, ...CoepValueBase.Options]);

/**
 * @since 0.0.0
 */
export const CrossOriginEmbedderPolicyOption = CrossOriginEmbedderPolicyOptionBase.pipe(
  $I.annoteSchema("CrossOriginEmbedderPolicyOption", {
    description: "The value of the `Cross-Origin-Embedder-Policy` header.",
  }),
  SchemaUtils.withLiteralKitStatics(CrossOriginEmbedderPolicyOptionBase)
);

/**
 * @since 0.0.0
 */
export type CrossOriginEmbedderPolicyOption = typeof CrossOriginEmbedderPolicyOption.Type;

/**
 * Schema for the Cross-Origin-Embedder-Policy response header output.
 * @since 0.0.0
 */
export class COEPResponseHeader extends S.Class<COEPResponseHeader>($I`COEPResponseHeader`)(
  {
    name: S.tag(headerName),
    value: S.OptionFromUndefinedOr(S.String),
  },
  $I.annote("COEPResponseHeader", {
    description: "The `Cross-Origin-Embedder-Policy` response header.",
  })
) {}

type COEPResponseHeaderEncoded = typeof COEPResponseHeader.Encoded;

/**
 * Schema for the Cross-Origin-Embedder-Policy response header.
 * Transforms a CrossOriginEmbedderPolicyOption input into a ResponseHeader output.
 *
 * - `false` → decodes to `{ name: "Cross-Origin-Embedder-Policy", value: undefined }`
 * - `undefined` → decodes to `{ name: "Cross-Origin-Embedder-Policy", value: undefined }` (no default)
 * - Valid COEP value → decodes to `{ name: "Cross-Origin-Embedder-Policy", value: <value> }`
 * @since 0.0.0
 */
export const CrossOriginEmbedderPolicyHeader = S.Union([CrossOriginEmbedderPolicyOption, S.Undefined]).pipe(
  S.decodeTo(
    COEPResponseHeader,
    SchemaTransformation.transformOrFail({
      decode: (input): Effect.Effect<COEPResponseHeaderEncoded, SchemaIssue.Issue> =>
        Effect.succeed({
          name: headerName,
          value: input === false || input === undefined ? undefined : input,
        }),
      encode: (
        header: COEPResponseHeaderEncoded
      ): Effect.Effect<CrossOriginEmbedderPolicyOption | undefined, SchemaIssue.Issue> =>
        Effect.fail(
          new SchemaIssue.Forbidden(O.some(header), {
            message: "Encoding CrossOriginEmbedderPolicyHeader back to the original input is not supported",
          })
        ),
    })
  ),
  $I.annoteSchema("CrossOriginEmbedderPolicyHeader", {
    description: "A one-way schema that decodes COEP options into the Cross-Origin-Embedder-Policy response header.",
  }),
  SchemaUtils.withStatics(() => {
    const createValue = Effect.fnUntraced(function* (
      option?: undefined | CrossOriginEmbedderPolicyOption
    ): Effect.fn.Return<O.Option<string>, SecureHeaderError> {
      if (P.isUndefined(option)) {
        return O.none<string>();
      }
      if (Eq.equals(false)(option)) {
        return O.none<string>();
      }

      if (S.is(CoepValue)(option)) {
        return O.some(option);
      }

      return yield* new CrossOriginEmbedderPolicyError({
        message: `Invalid value for ${headerName}: ${option}`,
        cause: O.none(),
      });
    });

    const create: (
      option?: undefined | CrossOriginEmbedderPolicyOption,
      headerValueCreator?: undefined | typeof createValue
    ) => Effect.Effect<O.Option<ResponseHeader>, SecureHeaderError> = Effect.fnUntraced(function* (
      option?: undefined | CrossOriginEmbedderPolicyOption,
      headerValueCreator: typeof createValue = createValue
    ): Effect.fn.Return<O.Option<ResponseHeader>, SecureHeaderError> {
      const value = yield* headerValueCreator(option);

      return pipe(
        value,
        O.match({
          onNone: O.none<ResponseHeader>,
          onSome: (value) =>
            O.some(
              new ResponseHeader({
                name: headerName,
                value: O.some(value),
              })
            ),
        })
      );
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
export type CrossOriginEmbedderPolicyHeader = typeof CrossOriginEmbedderPolicyHeader.Type;
