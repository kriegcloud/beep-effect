/**
 * TransformText tool definition.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";

const $I = $NlpId.create("Tools/TransformText");
const TransformOperationKit = LiteralKit([
  "lowercase",
  "uppercase",
  "trim",
  "removeHtml",
  "removePunctuation",
  "removeExtraSpaces",
  "removeSpecialChars",
  "retainAlphaNums",
  "removeElisions",
] as const);
const TransformOperation = TransformOperationKit.pipe(
  $I.annoteSchema("TransformOperation", {
    description: "Supported text transformation operation.",
  }),
  SchemaUtils.withLiteralKitStatics(TransformOperationKit)
);

class TransformTextParameters extends S.Class<TransformTextParameters>($I`TransformTextParameters`)(
  {
    operations: S.Array(TransformOperation).annotateKey({
      description: "Ordered list of transformations to apply",
      examples: [["removeHtml", "lowercase", "trim"]],
    }),
    text: S.String.annotateKey({
      description: "The text to transform",
      examples: ["<b>Hello</b>  WORLD!! "],
    }),
  },
  $I.annote("TransformTextParameters", {
    description: "Inputs required to apply a sequence of text normalization operations.",
  })
) {}

class TransformTextSuccess extends S.Class<TransformTextSuccess>($I`TransformTextSuccess`)(
  {
    operationsApplied: S.Array(S.String).annotateKey({
      description: "List of operations that were applied",
    }),
    result: S.String.annotateKey({
      description: "The transformed text",
    }),
  },
  $I.annote("TransformTextSuccess", {
    description: "Transformed text and the ordered operations that were applied.",
  })
) {}

/**
 * Tool for applying text cleaning and normalization operations.
 *
 * @example
 * ```ts
 * import { TransformText } from "@beep/nlp/Tools/TransformText"
 *
 * console.log(TransformText)
 * ```
 *
 * @since 0.0.0
 * @category Tools
 */
export const TransformText = Tool.make("TransformText", {
  description: "Apply text transformation operations in sequence for cleaning and normalization.",
  parameters: TransformTextParameters,
  success: TransformTextSuccess,
});
