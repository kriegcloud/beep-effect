import { dual } from "effect/Function";
import { inlineSpans } from "./inlineSpans.ts";
import { paintSpans } from "./layout.ts";
import { renderDoc } from "./renderDoc.ts";
import type { Document, Inline } from "../Doc.ts";
import type { RenderContext } from "../Render.ts";
import type { Span } from "./layout.ts";
import type { Flavour } from "./renderDoc.ts";

/**
 * Inline content as styled spans: code painted `accent` with no backticks, and links kept on their spans so that
 * painting wraps them through `ctx.link`.
 *
 * **Details**
 *
 * When `ctx.link` does not make a hyperlink (it returns the label unchanged), the target would be lost, so it follows
 * the label in parentheses, muted, unless the label already is the target. That is decided here, before layout, so
 * widths and wrapping count it.
 */
const inline: {
  (inlines: ReadonlyArray<Inline>, ctx: RenderContext.Encoded): ReadonlyArray<Span.Encoded>;
  (ctx: RenderContext.Encoded): (inlines: ReadonlyArray<Inline>) => ReadonlyArray<Span.Encoded>;
} = dual(
  2,
  (inlines: ReadonlyArray<Inline>, ctx: RenderContext.Encoded): ReadonlyArray<Span.Encoded> =>
    inlineSpans(
      inlines,
      ctx,
      (span) => (span.code === true && span.token === undefined ? { ...span, token: "accent" } : span),
      (link, label) => ctx.link(link, label) === label,
      (target) => ({ text: ` (${target})`, token: "muted" })
    )
);

const ansi: Flavour = {
  inline,
  finish: paintSpans,
};

/**
 * Render a document for a person: the layout of plain text, painted with the context's tokens and linked through its
 * `link` function.
 *
 * **Example** (Render a paragraph)
 *
 * ```ts
 * import { renderAnsi } from "@beep/cli-kit/internal/renderAnsi"
 * import { Doc } from "@beep/cli-kit/Doc"
 * import { Render } from "@beep/cli-kit/Render"
 * const ctx = Render.contextOf({ audience: "human", color: "none" })
 * console.log(renderAnsi([Doc.paragraph("Ready")], ctx)) // Ready
 * ```
 *
 * @internal
 * @category formatting
 * @since 0.0.0
 */
export const renderAnsi: {
  (ctx: RenderContext.Encoded): (doc: Document) => string;
  (doc: Document, ctx: RenderContext.Encoded): string;
} = dual(2, (doc: Document, ctx: RenderContext.Encoded): string => renderDoc(doc, ctx, ansi));
