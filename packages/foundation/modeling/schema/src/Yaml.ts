/**
 * YAML parsing and schema transforms.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity/packages";
import { A } from "@beep/utils";
import { Effect, flow, Result, SchemaGetter, SchemaIssue } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { getGlobalYamlRuntime, loadYamlModule, makeParseYaml, makeParseYamlForSchema } from "./internal/yaml.ts";

const $I = $SchemaId.create("Yaml");
const yamlRuntime = getGlobalYamlRuntime();

const parseYamlResult = makeParseYamlForSchema(yamlRuntime, loadYamlModule);

const invalidYamlInput: {
  (content: unknown, message: string): SchemaIssue.InvalidValue;
  (message: string): (content: unknown) => SchemaIssue.InvalidValue;
} = dual(
  2,
  (content: unknown, message: string): SchemaIssue.InvalidValue =>
    new SchemaIssue.InvalidValue(O.some(content), {
      message,
    })
);

const encodeUnsupported = (value: unknown): Effect.Effect<string, SchemaIssue.Issue> =>
  Effect.fail(invalidYamlInput(value, "Encoding unknown values to YAML text is not supported by YamlTextToUnknown."));

const renderYamlIssueMessage = (messages: ReadonlyArray<string>): string =>
  `Invalid YAML input (${A.join(messages, "; ")}).`;

const toYamlIssue = (input: string, cause: unknown): SchemaIssue.InvalidValue =>
  invalidYamlInput(input, P.isError(cause) ? cause.message : "Invalid YAML input.");

const decodeYamlUnknown = (input: string): Effect.Effect<unknown, SchemaIssue.Issue> =>
  Effect.try({
    try: () => parseYamlResult(input),
    catch: (cause) => toYamlIssue(input, cause),
  }).pipe(
    Effect.flatMap((parsed) =>
      parsed.pipe(
        Result.mapError((messages) => invalidYamlInput(input, renderYamlIssueMessage(messages))),
        Result.match({
          onSuccess: Effect.succeed,
          onFailure: Effect.fail,
        })
      )
    )
  );

/**
 * Parses a YAML string into a JavaScript value. Uses `Bun.YAML` when available
 * and otherwise falls back to the `yaml` package.
 *
 * @example
 * ```ts
 * import { parseYaml } from "@beep/schema/Yaml"
 *
 * const value = parseYaml("name: Alice\nage: 30")
 * void value
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const parseYaml = makeParseYaml(yamlRuntime, loadYamlModule);

/**
 * Schema transformation that decodes YAML text into an unknown parsed value.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { YamlTextToUnknown } from "@beep/schema/Yaml"
 *
 * const program = Effect.gen(function* () {
 *
 *
 *
 *
 * })
 * void program
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const YamlTextToUnknown = S.String.pipe(
  S.decodeTo(S.Unknown, {
    decode: SchemaGetter.transformOrFail(decodeYamlUnknown),
    encode: SchemaGetter.transformOrFail(encodeUnsupported),
  }),
  $I.annoteSchema("YamlTextToUnknown", {
    description: "Schema transformation that parses YAML text into unknown values.",
  })
);

/**
 * Builds a decoder that parses YAML text and then decodes the result through a
 * target schema.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { decodeYamlTextAs } from "@beep/schema/Yaml"
 *
 * const Config = S.Struct({ name: S.String, age: S.Number })
 * const decodeConfig = decodeYamlTextAs(Config)
 *
 * const program = Effect.gen(function* () {
 *
 *
 * })
 * void program
 * ```
 *
 * @param schema - Target schema to decode parsed YAML document into.
 * @returns Decoder function from YAML text to the target schema type.
 * @category utilities
 * @since 0.0.0
 */
export const decodeYamlTextAs = <Schema extends S.Top>(schema: Schema) => {
  const decodeYamlUnknownText = S.decodeUnknownEffect(YamlTextToUnknown);
  const decodeTargetSchema = S.decodeUnknownEffect(schema);

  return flow(decodeYamlUnknownText, Effect.flatMap(decodeTargetSchema));
};
