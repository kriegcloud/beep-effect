/**
 * YAML parsing and schema transforms.
 *
 * @module @beep/schema/Yaml
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity/packages";
import { Effect, flow, Match, SchemaIssue, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import {
  getGlobalYamlRuntime,
  loadYamlModule,
  makeParseYaml,
  makeParseYamlForSchema,
  type YamlParseResult,
} from "./internal/yaml.ts";

const $I = $SchemaId.create("Yaml");
const yamlRuntime = getGlobalYamlRuntime();

const parseYamlResult = makeParseYamlForSchema(yamlRuntime, loadYamlModule);

const encodeUnsupported = (value: unknown): Effect.Effect<string, SchemaIssue.Issue> =>
  Effect.fail(
    new SchemaIssue.InvalidValue(O.some(value), {
      message: "Encoding unknown values to YAML text is not supported by YamlTextToUnknown.",
    })
  );

const renderYamlIssueMessage = (messages: ReadonlyArray<string>): string =>
  `Invalid YAML input (${A.join(messages, "; ")}).`;

const toYamlIssue = (input: string, cause: unknown): SchemaIssue.InvalidValue =>
  new SchemaIssue.InvalidValue(O.some(input), {
    message: P.isError(cause) ? cause.message : "Invalid YAML input.",
  });

const decodeYamlUnknown = Effect.fn("Yaml.decodeYamlUnknown")(function* (input: string) {
  const parsed = yield* Effect.try({
    try: () => parseYamlResult(input),
    catch: (cause) => toYamlIssue(input, cause),
  });

  const matchParsedYaml = Match.type<YamlParseResult>().pipe(
    Match.tag("success", ({ value }) => Effect.succeed(value)),
    Match.tag("failure", ({ messages }) =>
      Effect.fail(
        new SchemaIssue.InvalidValue(O.some(input), {
          message: renderYamlIssueMessage(messages),
        })
      )
    ),
    Match.exhaustive
  );

  return yield* matchParsedYaml(parsed);
});

/**
 * YAML parsing wrapper.
 *
 * Uses Bun.YAML when available and otherwise falls back to the `yaml` package.
 *
 * @category Utility
 * @since 0.0.0
 */
export const parseYaml = makeParseYaml(yamlRuntime, loadYamlModule);

/**
 * Effectful schema transformation from YAML text to unknown document values.
 *
 * @category Validation
 * @since 0.0.0
 */
export const YamlTextToUnknown = S.String.pipe(
  S.decodeTo(
    S.Unknown,
    SchemaTransformation.transformOrFail({
      decode: decodeYamlUnknown,
      encode: encodeUnsupported,
    })
  ),
  S.annotate(
    $I.annote("YamlTextToUnknown", {
      description: "Schema transformation that parses YAML text into unknown values.",
    })
  )
);

/**
 * Decode YAML text into a target schema using schema-backed parsing and decoding.
 *
 * @param schema - Target schema to decode parsed YAML document into.
 * @returns Decoder function from YAML text to the target schema type.
 * @category Utility
 * @since 0.0.0
 */
export const decodeYamlTextAs = <Schema extends S.Top>(schema: Schema) => {
  const decodeYamlUnknownText = S.decodeUnknownEffect(YamlTextToUnknown);
  const decodeTarget = S.decodeUnknownEffect(schema);

  return flow(decodeYamlUnknownText, Effect.flatMap(decodeTarget));
};
