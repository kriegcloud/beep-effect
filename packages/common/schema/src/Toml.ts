/**
 * TOML parsing and schema transforms.
 *
 * @module @beep/schema/Toml
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity/packages";
import { Effect, flow, SchemaIssue, SchemaTransformation } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $SchemaId.create("Toml");
const UnknownTomlDocument = S.Record(S.String, S.Unknown);
const decodeUnknownTomlDocument = S.decodeUnknownEffect(UnknownTomlDocument);

const encodeUnsupported = (value: typeof UnknownTomlDocument.Type): Effect.Effect<string, SchemaIssue.Issue> =>
  Effect.fail(
    new SchemaIssue.InvalidValue(O.some(value), {
      message: "Encoding unknown values to TOML text is not supported by TomlTextToUnknown.",
    })
  );

const invalidTomlInput = (content: string, message: string): SchemaIssue.InvalidValue =>
  new SchemaIssue.InvalidValue(O.some(content), {
    message,
  });

const hasMessage = (input: unknown): input is { readonly message: string } =>
  P.isObject(input) && P.hasProperty(input, "message") && P.isString(input.message);

const decodeTomlUnknown = Effect.fn("Toml.decodeTomlUnknown")(function* (content: string) {
  const parsed = yield* Effect.try({
    try: () => Bun.TOML.parse(content),
    catch: (cause) =>
      invalidTomlInput(content, hasMessage(cause) ? `Invalid TOML input (${cause.message}).` : "Invalid TOML input."),
  });

  return yield* decodeUnknownTomlDocument(parsed).pipe(
    Effect.mapError(() => invalidTomlInput(content, "Invalid TOML input (Expected TOML object output)."))
  );
});

/**
 * Effectful schema transformation from TOML text to unknown document values.
 *
 * @category Validation
 * @since 0.0.0
 */
export const TomlTextToUnknown = S.String.pipe(
  S.decodeTo(
    UnknownTomlDocument,
    SchemaTransformation.transformOrFail({
      decode: decodeTomlUnknown,
      encode: encodeUnsupported,
    })
  ),
  S.annotate(
    $I.annote("TomlTextToUnknown", {
      description: "Schema transformation that parses TOML text into unknown values.",
    })
  )
);

/**
 * Decode TOML text into a target schema using Bun-backed parsing and schema decoding.
 *
 * @param schema - Target schema to decode parsed TOML document into.
 * @returns Decoder function from TOML text to the target schema type.
 * @category Utility
 * @since 0.0.0
 */
export const decodeTomlTextAs = <Schema extends S.Top>(schema: Schema) => {
  const decodeTomlUnknownText = S.decodeUnknownEffect(TomlTextToUnknown);
  const decodeTarget = S.decodeUnknownEffect(schema);

  return flow(decodeTomlUnknownText, Effect.flatMap(decodeTarget));
};
