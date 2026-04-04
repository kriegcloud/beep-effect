/**
 * JSONC parsing and schema transforms.
 *
 * @module @beep/schema/Jsonc
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity/packages";
import { Effect, flow, pipe, SchemaIssue, SchemaTransformation } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as jsonc from "jsonc-parser";

const $I = $SchemaId.create("Jsonc");

/**
 * JSONC parse diagnostics.
 *
 * @category DomainModel
 * @since 0.0.0
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

const decodeJsoncUnknown = Effect.fn("Jsonc.decodeJsoncUnknown")(function* (content: string) {
  const parseErrors = A.empty<jsonc.ParseError>();
  const parsed = jsonc.parse(content, parseErrors, {
    allowTrailingComma: true,
    disallowComments: false,
  });

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
 * Effectful schema transformation from JSONC text to unknown document values.
 *
 * @category Validation
 * @since 0.0.0
 */
export const JsoncTextToUnknown = S.String.pipe(
  S.decodeTo(
    S.Unknown,
    SchemaTransformation.transformOrFail({
      decode: decodeJsoncUnknown,
      encode: encodeUnsupported,
    })
  ),
  S.annotate(
    $I.annote("JsoncTextToUnknown", {
      description: "Schema transformation that parses JSONC text into unknown values.",
    })
  )
);

/**
 * Decode JSONC text into a target schema using schema-backed parsing and decoding.
 *
 * @param schema - Target schema to decode parsed JSONC document into.
 * @returns Decoder function from JSONC text to the target schema type.
 * @category Utility
 * @since 0.0.0
 */
export const decodeJsoncTextAs = <Schema extends S.Top>(schema: Schema) => {
  const decodeJsoncUnknownText = S.decodeUnknownEffect(JsoncTextToUnknown);
  const decodeTarget = S.decodeUnknownEffect(schema);

  return flow(decodeJsoncUnknownText, Effect.flatMap(decodeTarget));
};
