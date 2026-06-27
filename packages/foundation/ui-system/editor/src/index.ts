/**
 * React editor kit on Lexical for schema-first rich text: a read-only viewer
 * and composer primitives (theme, node registration, markdown shortcuts)
 * over the `@beep/lexical-schema` v1 vocabulary.
 *
 * @packageDocumentation \@beep/editor
 * @since 0.0.0
 */

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
 * Feature-flagged chat composer surface (toolbar, slash, mentions, attachments,
 * send/character-count) over the same v1 vocabulary as {@link EditorComposer}.
 *
 * @example
 * ```ts
 * import { ChatComposer } from "@beep/editor"
 *
 * console.log(ChatComposer.name) // "ChatComposer"
 * ```
 *
 * @since 0.0.0
 * @category components
 */
export * from "./chat/index.ts";
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
 * Mermaid code decorator plugin.
 *
 * @example
 * ```ts
 * import { MermaidCodeDecoratorPlugin } from "@beep/editor"
 *
 * console.log(MermaidCodeDecoratorPlugin.name) // "MermaidCodeDecoratorPlugin"
 * ```
 *
 * @since 0.0.0
 * @category components
 */
export * from "./mermaid-code-decorator-plugin.tsx";
/**
 * Mermaid SVG renderer.
 *
 * @example
 * ```ts
 * import { MermaidView } from "@beep/editor"
 *
 * console.log(MermaidView.name) // "MermaidView"
 * ```
 *
 * @since 0.0.0
 * @category components
 */
export * from "./mermaid-view.tsx";
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
/**
 * YouTube iframe embed component.
 *
 * @example
 * ```ts
 * import { YouTubeEmbed } from "@beep/editor"
 *
 * console.log(YouTubeEmbed.name) // "YouTubeEmbed"
 * ```
 *
 * @since 0.0.0
 * @category components
 */
export * from "./youtube-embed.tsx";
/**
 * YouTube runtime Lexical node.
 *
 * @example
 * ```ts
 * import { YouTubeNode } from "@beep/editor"
 *
 * console.log(YouTubeNode.getType()) // "youtube"
 * ```
 *
 * @since 0.0.0
 * @category components
 */
export * from "./youtube-node.tsx";
