/**
 * `@beep/html` — Effect Schema driven HTML AST.
 *
 * A complete, schema-first AST of the WHATWG HTML specification: every element
 * (conforming and obsolete) modeled as an `effect/Schema` `TaggedClass`, combined
 * into the {@link HtmlNode} discriminated union via `S.toTaggedUnion("_tag")`.
 *
 * @packageDocumentation \@beep/html
 * @since 0.0.0
 */

/**
 * Global-attribute overlay: the shared `GlobalAttributes` field bundle and its
 * reusable enumerated value schemas.
 *
 * @category schemas
 * @since 0.0.0
 */
export * from "./Html.attributes.ts";
/**
 * Per-element metadata table (`ELEMENT_META`): interface, conformance, content
 * categories, and void/raw-text classification.
 *
 * @category models
 * @since 0.0.0
 */
export * from "./Html.meta.ts";
/**
 * The generated element classes, the recursive `HtmlChildren` list, the
 * {@link HtmlNode} discriminated union, and advisory content-category sub-unions.
 *
 * @example
 * ```ts
 * import { Div } from "@beep/html"
 *
 * console.log(Div.make({ children: [] })._tag) // "div"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export * from "./Html.model.ts";
/**
 * Non-element AST node classes (`Text`, `Comment`, `Doctype`).
 *
 * @example
 * ```ts
 * import { Text } from "@beep/html"
 *
 * console.log(Text.make({ value: "hi" })._tag) // "#text"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export * from "./Html.nodes.ts";
