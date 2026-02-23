/**
 * Text node schemas for Lexical serialization.
 *
 * Text nodes are leaf nodes that contain the actual text content
 * with optional formatting.
 *
 * @example
 * ```typescript
 * import { SerializedTextNode } from "@beep/lexical-schemas/nodes/text";
 * ```
 *
 * @category Nodes/Text
 * @since 0.1.0
 */

import { $LexicalSchemasId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { TextModeType } from "./base.js";

const $I = $LexicalSchemasId.create("nodes/text");

/**
 * Serialized text node containing text content with formatting.
 *
 * Text nodes are leaf nodes (no children) that contain:
 * - `text`: The actual text content
 * - `format`: 32-bit bitmask for text formatting (bold=0x001, italic=0x002, etc.)
 * - `detail`: Flag bits for directionless (0x001) or unmergeable (0x002)
 * - `mode`: Navigation and deletion behavior
 * - `style`: Inline CSS styles
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { SerializedTextNode } from "@beep/lexical-schemas/nodes/text";
 *
 * const textNode = S.decodeSync(SerializedTextNode)({
 *   type: "text",
 *   version: 1,
 *   text: "Hello world",
 *   format: 1, // bold
 *   mode: "normal",
 *   style: "",
 *   detail: 0,
 * });
 * ```
 *
 * @category Nodes/Text
 * @since 0.1.0
 */
export class SerializedTextNode extends S.Struct({
  type: S.tag("text"),
  version: S.Number,
  text: S.String.annotations({
    description: "The actual text content",
  }),
  format: S.Number.annotations({
    description:
      "32-bit bitmask for text formatting: bold=0x001, italic=0x002, strikethrough=0x004, underline=0x008, code=0x010, highlight=0x020, subscript=0x040, superscript=0x080",
  }),
  mode: TextModeType.annotations({
    description: "Navigation and deletion behavior: normal, token, or segmented",
  }),
  style: S.String.annotations({
    description: "Inline CSS style string",
  }),
  detail: S.Number.annotations({
    description: "Detail flags: directionless=0x001, unmergeable=0x002",
  }),
}).annotations(
  $I.annotations("SerializedTextNode", {
    description: "Text leaf node with formatting and style",
    documentation:
      "Text nodes are leaf nodes (no children) that contain the actual text content with optional formatting. The format field is a 32-bit bitmask for styles like bold, italic, underline. The detail field tracks directionless and unmergeable flags.",
    message: () => "Invalid text node structure",
    parseIssueTitle: () => "Text node validation failed",
  })
) {
  static readonly decodeSync = S.decodeSync(SerializedTextNode);
  static readonly encodeSync = S.encodeSync(SerializedTextNode);
}

/**
 * Namespace for SerializedTextNode types.
 *
 * @category Nodes/Text
 * @since 0.1.0
 */
export declare namespace SerializedTextNode {
  /**
   * Runtime type for SerializedTextNode.
   */
  export type Type = typeof SerializedTextNode.Type;

  /**
   * Encoded type for SerializedTextNode.
   */
  export type Encoded = typeof SerializedTextNode.Encoded;
}
