/**
 * React editor kit on Lexical for schema-first rich text: a read-only viewer
 * and composer primitives (theme, node registration, markdown shortcuts)
 * over the `@beep/lexical-schema` v1 vocabulary.
 *
 * @packageDocumentation \@beep/editor
 * @since 0.0.0
 */

/**
 * Package version.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/editor"
 *
 * console.log(VERSION) // "0.0.0"
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const VERSION = "0.0.0" as const;

/**
 * Runtime artifact-ref decorator node.
 *
 * @example
 * ```ts
 * import { ArtifactRefNode } from "@beep/editor"
 *
 * console.log(ArtifactRefNode.getType()) // "artifact-ref"
 * ```
 *
 * @since 0.0.0
 * @category components
 */
export * from "./artifact-ref-node.tsx";
/**
 * Editable composer with markdown shortcuts.
 *
 * @example
 * ```ts
 * import { EditorComposer } from "@beep/editor"
 *
 * console.log(EditorComposer.name) // "EditorComposer"
 * ```
 *
 * @since 0.0.0
 * @category components
 */
export * from "./composer.tsx";
/**
 * Node registration for the schema v1 vocabulary.
 *
 * @example
 * ```ts
 * import { editorNodes } from "@beep/editor"
 *
 * console.log(editorNodes.length > 0) // true
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export * from "./nodes.ts";
/**
 * The `@beep/ui` Lexical theme.
 *
 * @example
 * ```ts
 * import { editorTheme } from "@beep/editor"
 *
 * console.log(typeof editorTheme) // "object"
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export * from "./theme.ts";
/**
 * Read-only viewer.
 *
 * @example
 * ```ts
 * import { EditorViewer } from "@beep/editor"
 *
 * console.log(EditorViewer.name) // "EditorViewer"
 * ```
 *
 * @since 0.0.0
 * @category components
 */
export * from "./viewer.tsx";
