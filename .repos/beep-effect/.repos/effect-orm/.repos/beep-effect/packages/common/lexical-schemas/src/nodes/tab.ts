/**
 * Tab node schema for Lexical serialization.
 *
 * Tab nodes represent tab characters within content.
 *
 * @example
 * ```typescript
 * import { SerializedTabNode } from "@beep/lexical-schemas/nodes/tab";
 * ```
 *
 * @category Nodes/Tab
 * @since 0.1.0
 */

import { $LexicalSchemasId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { TextModeType } from "./base.js";

const $I = $LexicalSchemasId.create("nodes/tab");

/**
 * Serialized tab node.
 *
 * Tab nodes extend TextNode but are restricted:
 * - Always contain exactly one tab character (`\t`)
 * - Cannot be merged with adjacent nodes
 * - Text cannot be inserted before or after
 *
 * The serialization format matches SerializedTextNode for compatibility.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { SerializedTabNode } from "@beep/lexical-schemas/nodes/tab";
 *
 * const tabNode = S.decodeSync(SerializedTabNode)({
 *   type: "tab",
 *   version: 1,
 *   text: "\t",
 *   format: 0,
 *   mode: "normal",
 *   style: "",
 *   detail: 2, // IS_UNMERGEABLE
 * });
 * ```
 *
 * @category Nodes/Tab
 * @since 0.1.0
 */
export class SerializedTabNode extends S.Struct({
  type: S.tag("tab"),
  version: S.Number,
  text: S.String.annotations({
    description: "Always contains a single tab character",
  }),
  format: S.Number.annotations({
    description: "Text format flags (inherited from TextNode)",
  }),
  mode: TextModeType.annotations({
    description: "Always 'normal' for tab nodes",
  }),
  style: S.String.annotations({
    description: "Inline CSS style string",
  }),
  detail: S.Number.annotations({
    description: "Detail flags, always includes IS_UNMERGEABLE (0x002)",
  }),
}).annotations(
  $I.annotations("SerializedTabNode", {
    description: "Tab leaf node representing a tab character",
    documentation:
      "Tab nodes extend TextNode but are restricted: they always contain exactly one tab character (\\t), cannot be merged with adjacent nodes, and text cannot be inserted before or after. The detail field always includes IS_UNMERGEABLE (0x002).",
    message: () => "Invalid tab node structure",
    parseIssueTitle: () => "Tab node validation failed",
  })
) {
  static readonly decodeSync = S.decodeSync(SerializedTabNode);
  static readonly encodeSync = S.encodeSync(SerializedTabNode);
}

/**
 * Namespace for SerializedTabNode types.
 *
 * @category Nodes/Tab
 * @since 0.1.0
 */
export declare namespace SerializedTabNode {
  /**
   * Runtime type for SerializedTabNode.
   */
  export type Type = typeof SerializedTabNode.Type;

  /**
   * Encoded type for SerializedTabNode.
   */
  export type Encoded = typeof SerializedTabNode.Encoded;
}
