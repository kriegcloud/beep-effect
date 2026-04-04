/**
 * JSONL parsing and schema transforms.
 *
 * @module @beep/schema/Jsonl
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity/packages";
import { Effect, flow, pipe, SchemaIssue, SchemaTransformation } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SchemaId.create("Jsonl");
const JsonlValues = S.Array(S.Unknown).pipe(S.toType);
const decodeJsonlValues = S.decodeUnknownEffect(JsonlValues);

const encodeUnsupported = (value: typeof JsonlValues.Type): Effect.Effect<string, SchemaIssue.Issue> =>
  Effect.fail(
    new SchemaIssue.InvalidValue(O.some(value), {
      message: "Encoding unknown values to JSONL text is not supported by JsonlTextToUnknown.",
    })
  );

const invalidJsonlInput = (content: string, message: string): SchemaIssue.InvalidValue =>
  new SchemaIssue.InvalidValue(O.some(content), {
    message,
  });

const decodeJsonlUnknown = Effect.fn("Jsonl.decodeJsonlUnknown")(function* (content: string) {
  const parsed = yield* Effect.try({
    try: () => Bun.JSONL.parseChunk(content),
    catch: (cause) =>
      invalidJsonlInput(content, P.isError(cause) ? `Invalid JSONL input (${cause.message}).` : "Invalid JSONL input."),
  });

  if (parsed.error !== null) {
    return yield* Effect.fail(invalidJsonlInput(content, `Invalid JSONL input (${parsed.error.message}).`));
  }

  const trailingRemainder = pipe(content, Str.substring(parsed.read), Str.trim);

  if (!parsed.done || !Str.isEmpty(trailingRemainder)) {
    return yield* Effect.fail(
      invalidJsonlInput(content, `Invalid JSONL input (Incomplete JSONL input after ${parsed.read} characters).`)
    );
  }

  return yield* decodeJsonlValues(parsed.values).pipe(
    Effect.mapError(() => invalidJsonlInput(content, "Invalid JSONL input (Expected JSONL value array output)."))
  );
});

/**
 * Effectful schema transformation from JSONL text to parsed JSONL values.
 *
 * @category Validation
 * @since 0.0.0
 */
export const JsonlTextToUnknown = S.String.pipe(
  S.decodeTo(
    JsonlValues,
    SchemaTransformation.transformOrFail({
      decode: decodeJsonlUnknown,
      encode: encodeUnsupported,
    })
  ),
  S.annotate(
    $I.annote("JsonlTextToUnknown", {
      description: "Schema transformation that parses strict JSONL text into unknown values.",
    })
  )
);

/**
 * Decode JSONL text into a target schema using Bun-backed parsing and schema decoding.
 *
 * @param schema - Target schema to decode the parsed JSONL value array into.
 * @returns Decoder function from JSONL text to the target schema type.
 * @category Utility
 * @since 0.0.0
 */
export const decodeJsonlTextAs = <Schema extends S.Top>(schema: Schema) => {
  const decodeJsonlUnknownText = S.decodeUnknownEffect(JsonlTextToUnknown);
  const decodeTarget = S.decodeUnknownEffect(schema);

  return flow(decodeJsonlUnknownText, Effect.flatMap(decodeTarget));
};
