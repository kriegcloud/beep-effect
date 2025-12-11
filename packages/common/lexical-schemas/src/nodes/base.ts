/**
 * Base schemas for all Lexical serialized nodes.
 *
 * Provides the common fields shared by all Lexical nodes: `type`, `version`,
 * and optional `__nodeState` for complex state storage.
 *
 * @example
 * ```typescript
 * import { SerializedLexicalNodeBase } from "@beep/lexical-schemas/nodes/base";
 * ```
 *
 * @category Nodes/Base
 * @since 0.1.0
 */

import { $LexicalSchemasId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $LexicalSchemasId.create("nodes/base");
/**
 * The key used by Lexical to store complex node state.
 * This matches the NODE_STATE_KEY constant from Lexical.
 */
export const NODE_STATE_KEY = "__nodeState" as const;

/**
 * Element format type for block-level alignment.
 *
 * @example
 * ```typescript
 * const format: ElementFormatType = "center";
 * ```
 *
 * @category Nodes/Base
 * @since 0.1.0
 */
export class ElementFormatType extends BS.LiteralKit(
  "left",
  "start",
  "center",
  "right",
  "end",
  "justify",
  ""
).annotations(
  $I.annotations("ElementFormatType", {
    description: "Block-level text alignment format",
    documentation:
      "Defines how block-level elements are aligned within their container. Supports standard CSS alignment values: left, start, center, right, end, justify, or empty string for default.",
    examples: ["left", "start", "center", "right", "end", "justify", ""],
    message: () =>
      "Invalid element format. Expected one of: left, start, center, right, end, justify, or empty string.",
    parseIssueTitle: () => "Invalid element format type",
  })
) {}

/**
 * Namespace for ElementFormatType types.
 *
 * @category Nodes/Base
 * @since 0.1.0
 */
export declare namespace ElementFormatType {
  export type Type = typeof ElementFormatType.Type;
  export type Encoded = typeof ElementFormatType.Encoded;
}

/**
 * Text direction type for bidirectional text support.
 *
 * @example
 * ```typescript
 * const direction: TextDirectionType = "ltr";
 * ```
 *
 * @category Nodes/Base
 * @since 0.1.0
 */
export class TextDirectionType extends BS.LiteralKit("ltr", "rtl", null).annotations(
  $I.annotations("TextDirectionType", {
    description: "Text direction: left-to-right, right-to-left, or null",
    documentation:
      "Specifies the text direction for bidirectional content. 'ltr' for left-to-right (Latin, Cyrillic), 'rtl' for right-to-left (Arabic, Hebrew), or null for auto/inherit.",
    examples: ["ltr", "rtl", null],
    message: () => "Invalid text direction. Expected: ltr, rtl, or null.",
    parseIssueTitle: () => "Invalid text direction type",
  })
) {}

/**
 * Namespace for TextDirectionType types.
 *
 * @category Nodes/Base
 * @since 0.1.0
 */
export declare namespace TextDirectionType {
  export type Type = typeof TextDirectionType.Type;
  export type Encoded = typeof TextDirectionType.Encoded;
}

/**
 * Text mode type for navigation and deletion behavior.
 *
 * - `normal`: Standard text navigation and deletion
 * - `token`: Navigate character-by-character, delete as a unit
 * - `segmented`: Navigate character-by-character, delete by word/segment
 *
 * @example
 * ```typescript
 * const mode: TextModeType = "normal";
 * ```
 *
 * @category Nodes/Base
 * @since 0.1.0
 */
export class TextModeType extends BS.LiteralKit("normal", "token", "segmented").annotations(
  $I.annotations("TextModeType", {
    description: "Text mode for navigation and deletion behavior",
    documentation:
      "Controls how text nodes behave during navigation and deletion. 'normal' for standard behavior, 'token' for atomic deletion (entire text deleted as one unit), 'segmented' for character-by-character navigation with word-based deletion.",
    examples: ["normal", "token", "segmented"],
    message: () => "Invalid text mode. Expected: normal, token, or segmented.",
    parseIssueTitle: () => "Invalid text mode type",
  })
) {}

/**
 * Namespace for TextModeType types.
 *
 * @category Nodes/Base
 * @since 0.1.0
 */
export declare namespace TextModeType {
  export type Type = typeof TextModeType.Type;
  export type Encoded = typeof TextModeType.Encoded;
}

/**
 * Base schema for all Lexical serialized nodes.
 *
 * Every serialized node must have:
 * - `type`: Unique identifier string (e.g., 'text', 'paragraph', 'root')
 * - `version`: Schema version for migrations (typically 1)
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { SerializedLexicalNodeBase } from "@beep/lexical-schemas/nodes/base";
 *
 * const node = S.decodeSync(SerializedLexicalNodeBase)({
 *   type: "text",
 *   version: 1
 * });
 * ```
 *
 * @category Nodes/Base
 * @since 0.1.0
 */
export class SerializedLexicalNodeBase extends S.Struct({
  type: S.String.annotations({
    description: "Node type discriminator (e.g., 'text', 'paragraph', 'root')",
  }),
  version: S.Number.annotations({
    description: "Schema version (typically 1, not recommended for use)",
  }),
}).annotations(
  $I.annotations("SerializedLexicalNodeBase", {
    description: "Base fields present on all Lexical serialized nodes",
    documentation:
      "The foundational schema that all Lexical node types extend. Contains the 'type' discriminator for pattern matching and 'version' for schema migrations.",
    message: () => "Invalid Lexical node base structure",
    parseIssueTitle: () => "Node base validation failed",
  })
) {}

/**
 * Namespace for SerializedLexicalNodeBase types.
 *
 * @category Nodes/Base
 * @since 0.1.0
 */
export declare namespace SerializedLexicalNodeBase {
  /**
   * Runtime type for SerializedLexicalNodeBase.
   */
  export type Type = typeof SerializedLexicalNodeBase.Type;

  /**
   * Encoded type for SerializedLexicalNodeBase.
   */
  export type Encoded = typeof SerializedLexicalNodeBase.Encoded;
}
