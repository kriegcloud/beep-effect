/**
 * Service-backed JSONC schema codecs.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { Effect, Layer, pipe, SchemaTransformation, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as SchemaIssue from "effect/SchemaIssue";
import * as jsonc from "jsonc-parser";

const $I = $RepoCliId.create("commands/Shared/SchemaCodecs/JsoncCodecs");

/**
 * JSONC parse diagnostics.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JsoncParseDiagnostic extends S.Class<JsoncParseDiagnostic>($I`JsoncParseDiagnostic`)(
  {
    code: S.Number,
    offset: S.Number,
    length: S.Number,
  },
  $I.annote("JsoncParseDiagnostic", {
    description: "Single JSONC parse diagnostic produced by jsonc-parser.",
  })
) {}

const encodeUnsupported = (value: unknown): Effect.Effect<string, SchemaIssue.Issue> =>
  Effect.fail(
    new SchemaIssue.InvalidValue(O.some(value), {
      message: "Encoding unknown values to JSONC text is not supported by JsoncTextToUnknown.",
    })
  );

/**
 * Service contract for JSONC parsing.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type JsoncCodecServiceShape = {
  readonly parseUnknown: (content: string) => Effect.Effect<unknown, SchemaIssue.Issue>;
};

/**
 * Service tag for JSONC parsing.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class JsoncCodecService extends ServiceMap.Service<JsoncCodecService, JsoncCodecServiceShape>()(
  $I`JsoncCodecService`
) {}

const parseUnknown: JsoncCodecServiceShape["parseUnknown"] = Effect.fn(function* (content: string) {
  const parseErrors = A.empty<jsonc.ParseError>();
  const parsed = jsonc.parse(content, parseErrors);

  return yield* A.match(parseErrors, {
    onEmpty: () => Effect.succeed(parsed),
    onNonEmpty: (errors) =>
      Effect.fail(
        new SchemaIssue.InvalidValue(O.some(content), {
          message: pipe(
            errors,
            A.map((error) => `${jsonc.printParseErrorCode(error.error)}@${error.offset}:${error.length}`),
            A.join(", "),
            (details) => `Invalid JSONC input (${details}).`
          ),
        })
      ),
  });
});

/**
 * Live JSONC codec service layer.
 *
 * @since 0.0.0
 * @category Layers
 */
export const JsoncCodecServiceLive = Layer.succeed(
  JsoncCodecService,
  JsoncCodecService.of({
    parseUnknown,
  })
);

/**
 * Effectful schema transformation from JSONC text to unknown document values.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const JsoncTextToUnknown = S.String.pipe(
  S.decodeTo(
    S.Unknown,
    SchemaTransformation.transformOrFail({
      decode: (content) => JsoncCodecService.use((service) => service.parseUnknown(content)),
      encode: encodeUnsupported,
    })
  ),
  S.annotate(
    $I.annote("JsoncTextToUnknown", {
      description: "Service-backed schema transformation that parses JSONC text into unknown values.",
    })
  )
);

/**
 * Decode JSONC text into a target schema using effectful parsing and schema decoding.
 *
 * @since 0.0.0
 * @category Utility
 */
export const decodeJsoncTextAs = <Schema extends S.Top>(schema: Schema) => {
  const decodeJsoncUnknown = S.decodeUnknownEffect(JsoncTextToUnknown);
  const decodeTarget = S.decodeUnknownEffect(schema);
  return (content: string) => decodeJsoncUnknown(content).pipe(Effect.flatMap(decodeTarget));
};
