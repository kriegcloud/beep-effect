/**
 * Re-exports all Lexical node schemas.
 *
 * @example
 * ```typescript
 * import {
 *   SerializedLexicalNode,
 *   SerializedTextNode,
 *   SerializedParagraphNode,
 *   SerializedRootNode,
 * } from "@beep/lexical-schemas/nodes";
 * ```
 *
 * @module
 * @category Nodes
 * @since 0.1.0
 */

// Base types
export {
  ElementFormatType,
  NODE_STATE_KEY,
  SerializedLexicalNodeBase,
  TextDirectionType,
  TextModeType,
} from "./base.js";

// Main recursive union and container nodes
export {
  SerializedLexicalNode,
  SerializedParagraphNode,
  SerializedRootNode,
} from "./element.js";
