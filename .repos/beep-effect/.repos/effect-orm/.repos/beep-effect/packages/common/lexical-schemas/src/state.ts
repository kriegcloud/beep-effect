/**
 * Editor state schema for Lexical serialization.
 *
 * The SerializedEditorState is the top-level structure for persisting
 * Lexical editor content to a database.
 *
 * @example
 * ```typescript
 * import { SerializedEditorState } from "@beep/lexical-schemas/state";
 * ```
 *
 * @category State
 * @since 0.1.0
 */

import { $LexicalSchemasId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { SerializedRootNode } from "./nodes/element.js";

const $I = $LexicalSchemasId.create("state");

/**
 * Complete Lexical editor state for database persistence.
 *
 * This is the top-level schema that wraps the entire editor content.
 * It contains a single `root` property with the serialized root node.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { SerializedEditorState } from "@beep/lexical-schemas/state";
 *
 * const editorState = S.decodeSync(SerializedEditorState)({
 *   root: {
 *     type: "root",
 *     version: 1,
 *     children: [
 *       {
 *         type: "paragraph",
 *         version: 1,
 *         children: [
 *           {
 *             type: "text",
 *             version: 1,
 *             text: "Hello world",
 *             format: 0,
 *             mode: "normal",
 *             style: "",
 *             detail: 0,
 *           }
 *         ],
 *         direction: "ltr",
 *         format: "",
 *         indent: 0,
 *       }
 *     ],
 *     direction: null,
 *     format: "",
 *     indent: 0,
 *   }
 * });
 * ```
 *
 * @category State
 * @since 0.1.0
 */
export class SerializedEditorState extends S.Struct({
  root: SerializedRootNode,
}).annotations(
  $I.annotations("SerializedEditorState", {
    description: "Top-level Lexical editor state for database persistence",
    documentation:
      "The complete serialized state of a Lexical editor, containing the root node and all nested content. This is the primary structure persisted to the database. Use decodeEditorStateUnknownSync to validate external input.",
    message: () => "Invalid editor state structure",
    parseIssueTitle: () => "Editor state validation failed",
  })
) {}

/**
 * Decode SerializedEditorState from an unknown value synchronously.
 * @throws {ParseError} if validation fails.
 */
export const decodeEditorStateSync = S.decodeSync(SerializedEditorState);

/**
 * Encode SerializedEditorState synchronously.
 */
export const encodeEditorStateSync = S.encodeSync(SerializedEditorState);

/**
 * Decode SerializedEditorState from an unknown value synchronously.
 * @throws {ParseError} if validation fails.
 */
export const decodeEditorStateUnknownSync = S.decodeUnknownSync(SerializedEditorState);

/**
 * Namespace for SerializedEditorState types.
 *
 * @example
 * ```typescript
 * import type { SerializedEditorState } from "@beep/lexical-schemas/state";
 *
 * function persistEditorState(state: SerializedEditorState.Type): void {
 *   // ...
 * }
 * ```
 *
 * @category State
 * @since 0.1.0
 */
export declare namespace SerializedEditorState {
  /**
   * Runtime type for SerializedEditorState.
   */
  export type Type = typeof SerializedEditorState.Type;

  /**
   * Encoded type for SerializedEditorState.
   */
  export type Encoded = typeof SerializedEditorState.Encoded;
}
