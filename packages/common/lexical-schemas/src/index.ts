/**
 * @beep/lexical-schemas
 *
 * 100% type-safe Effect Schema validation for Lexical editor state.
 *
 * This package provides Effect Schemas for validating Lexical's serialized
 * editor state, enabling type-safe persistence and runtime validation.
 *
 * ## Quick Start
 *
 * ```typescript
 * import { SerializedEditorState } from "@beep/lexical-schemas";
 * import * as S from "effect/Schema";
 *
 * // Validate editor state from JSON
 * const editorState = SerializedEditorState.decodeUnknownSync(jsonInput);
 *
 * // Type-safe access to nodes
 * const rootChildren = editorState.root.children;
 * ```
 *
 * ## Schema Hierarchy
 *
 * - `SerializedEditorState` - Top-level structure containing `root`
 *   - `SerializedRootNode` - Root container (type: "root")
 *     - `SerializedLexicalNode` - Union of all node types
 *       - `SerializedTextNode` - Text leaf (type: "text")
 *       - `SerializedLineBreakNode` - Line break (type: "linebreak")
 *       - `SerializedTabNode` - Tab character (type: "tab")
 *       - `SerializedParagraphNode` - Paragraph container (type: "paragraph")
 *
 * ## Replacing S.Any in apps/notes
 *
 * ```typescript
 * // Before (no validation):
 * contentRich: S.optional(S.Any)
 *
 * // After (full validation):
 * import { SerializedEditorState } from "@beep/lexical-schemas";
 * contentRich: S.optional(SerializedEditorState)
 * ```
 *
 * @module
 * @since 0.1.0
 */

// Error types
export { LexicalSchemaValidationError, UnknownNodeTypeError } from "./errors.js";

// Node schemas
export {
  ElementFormatType,
  NODE_STATE_KEY,
  SerializedLexicalNode,
  SerializedLexicalNodeBase,
  SerializedParagraphNode,
  SerializedRootNode,
  TextDirectionType,
  TextModeType,
} from "./nodes/index.js";
export { SerializedLineBreakNode } from "./nodes/linebreak.js";
export { SerializedTabNode } from "./nodes/tab.js";
// Re-export individual leaf nodes from their modules
export { SerializedTextNode } from "./nodes/text.js";
// Main exports
export {
  decodeEditorStateSync,
  decodeEditorStateUnknownSync,
  encodeEditorStateSync,
  SerializedEditorState,
} from "./state.js";
