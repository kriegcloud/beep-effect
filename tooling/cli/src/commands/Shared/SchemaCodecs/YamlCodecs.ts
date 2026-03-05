/**
 * Service-backed YAML schema codecs.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { thunkEffectSucceed } from "@beep/utils";
import { Effect, flow, Layer, pipe, SchemaIssue, SchemaTransformation, ServiceMap, Struct } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { parseDocument } from "yaml";

const $I = $RepoCliId.create("commands/Shared/SchemaCodecs/YamlCodecs");

const encodeUnsupported = (value: unknown): Effect.Effect<string, SchemaIssue.Issue> =>
  Effect.fail(
    new SchemaIssue.InvalidValue(O.some(value), {
      message: "Encoding unknown values to YAML text is not supported by YamlTextToUnknown.",
    })
  );

/**
 * Service contract for YAML parsing.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type YamlCodecServiceShape = {
  readonly parseUnknown: (content: string) => Effect.Effect<unknown, SchemaIssue.Issue>;
};

/**
 * Service tag for YAML parsing.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class YamlCodecService extends ServiceMap.Service<YamlCodecService, YamlCodecServiceShape>()(
  $I`YamlCodecService`
) {}

const parseUnknown: YamlCodecServiceShape["parseUnknown"] = Effect.fn(function* (content: string) {
  const document = parseDocument(content);

  return yield* A.match(document.errors, {
    onEmpty: thunkEffectSucceed(document.toJSON()),
    onNonEmpty: (errors) =>
      Effect.fail(
        new SchemaIssue.InvalidValue(O.some(content), {
          message: pipe(
            errors,
            A.map(Struct.get("message")),
            A.join("; "),
            (details) => `Invalid YAML input (${details}).`
          ),
        })
      ),
  });
});

/**
 * Live YAML codec service layer.
 *
 * @since 0.0.0
 * @category Layers
 */
export const YamlCodecServiceLive = Layer.succeed(
  YamlCodecService,
  YamlCodecService.of({
    parseUnknown,
  })
);

/**
 * Effectful schema transformation from YAML text to unknown document values.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const YamlTextToUnknown = S.String.pipe(
  S.decodeTo(
    S.Unknown,
    SchemaTransformation.transformOrFail({
      decode: (content) => YamlCodecService.use((service) => service.parseUnknown(content)),
      encode: encodeUnsupported,
    })
  ),
  S.annotate(
    $I.annote("YamlTextToUnknown", {
      description: "Service-backed schema transformation that parses YAML text into unknown values.",
    })
  )
);

/**
 * Decode YAML text into a target schema using effectful parsing and schema decoding.
 *
 * @param schema - Target schema to decode parsed YAML document into.
 * @returns Decoder function from YAML text to the target schema type.
 * @since 0.0.0
 * @category Utility
 */
export const decodeYamlTextAs = <Schema extends S.Top>(schema: Schema) => {
  const decodeYamlUnknown = S.decodeUnknownEffect(YamlTextToUnknown);
  const decodeTarget = S.decodeUnknownEffect(schema);
  return flow(decodeYamlUnknown, Effect.flatMap(decodeTarget));
};
