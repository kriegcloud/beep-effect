/**
 * Line break node schema for Lexical serialization.
 *
 * Line break nodes represent explicit line breaks within content.
 *
 * @example
 * ```typescript
 * import { SerializedLineBreakNode } from "@beep/lexical-schemas/nodes/linebreak";
 * ```
 *
 * @category Nodes/LineBreak
 * @since 0.1.0
 */

import { $LexicalSchemasId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $LexicalSchemasId.create("nodes/linebreak");

/**
 * Serialized line break node.
 *
 * Line break nodes are leaf nodes (no children) that represent
 * an explicit line break character (`\n`).
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { SerializedLineBreakNode } from "@beep/lexical-schemas/nodes/linebreak";
 *
 * const lineBreakNode = S.decodeSync(SerializedLineBreakNode)({
 *   type: "linebreak",
 *   version: 1,
 * });
 * ```
 *
 * @category Nodes/LineBreak
 * @since 0.1.0
 */
export class SerializedLineBreakNode extends S.Struct({
  type: S.tag("linebreak"),
  version: S.Number,
}).annotations(
  $I.annotations("SerializedLineBreakNode", {
    description: "Line break leaf node representing a newline character",
    documentation:
      "Line break nodes are leaf nodes (no children) that represent an explicit line break character (\\n). They are created when the user presses Shift+Enter or inserts a soft break within a block element.",
    message: () => "Invalid line break node structure",
    parseIssueTitle: () => "Line break node validation failed",
  })
) {
  static readonly decodeSync = S.decodeSync(SerializedLineBreakNode);
  static readonly encodeSync = S.encodeSync(SerializedLineBreakNode);
}

/**
 * Namespace for SerializedLineBreakNode types.
 *
 * @category Nodes/LineBreak
 * @since 0.1.0
 */
export declare namespace SerializedLineBreakNode {
  /**
   * Runtime type for SerializedLineBreakNode.
   */
  export type Type = typeof SerializedLineBreakNode.Type;

  /**
   * Encoded type for SerializedLineBreakNode.
   */
  export type Encoded = typeof SerializedLineBreakNode.Encoded;
}
