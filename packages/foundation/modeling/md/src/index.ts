/**
 * Effect Schema driven Markdown AST builder.
 *
 * @packageDocumentation \@beep/md
 * @since 0.0.0
 */

/**
 * Schema-first Markdown AST models.
 *
 * @example
 * ```ts
 * import { Document } from "@beep/md"
 *
 * console.log(Document.make({ children: [] })._tag) // "document"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * from "./Md.model.ts";
/**
 * Render adapters and schema transformations.
 *
 * @example
 * ```ts
 * import { Md, MarkdownAdapter } from "@beep/md"
 *
 * console.log(MarkdownAdapter.render(Md.make([Md.p`Hello`]))) // "Hello"
 * ```
 *
 * @since 0.0.0
 * @category formatting
 */
export * from "./Md.render.ts";
/**
 * Public Markdown builder namespace and constructor helpers.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { Result } from "effect"
 *
 * const markdown = Md.render(Md.make([Md.h1`Hello`]))
 * console.log(Result.getOrThrow(markdown)) // "# Hello"
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export * from "./Md.ts";
/**
 * Low-level rendering utilities.
 *
 * @example
 * ```ts
 * import { escapeMarkdownText } from "@beep/md"
 *
 * console.log(escapeMarkdownText("#")) // "\\#"
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export * from "./Md.utils.ts";
