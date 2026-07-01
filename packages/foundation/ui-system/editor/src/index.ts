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
 * const packageVersion: "0.0.0" = VERSION
 * console.log(packageVersion) // "0.0.0"
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

export * from "./artifact-ref-node.tsx";
export * from "./chat/index.ts";
export * from "./composer.tsx";
export * from "./mermaid-code-decorator-plugin.tsx";
export * from "./mermaid-view.tsx";
export * from "./nodes.ts";
export * from "./theme.ts";
export * from "./viewer.tsx";
export * from "./youtube-embed.tsx";
export * from "./youtube-node.tsx";
