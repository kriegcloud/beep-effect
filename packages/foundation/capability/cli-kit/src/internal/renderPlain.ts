import * as A from "effect/Array";
import { dual, pipe } from "effect/Function";
import { inlineSpans } from "./inlineSpans.ts";
import { renderDocLines } from "./renderDoc.ts";
import type { Document, Inline } from "../Doc.ts";
import type { RenderContext } from "../Render.ts";
import type { Span } from "./layout.ts";
import type { Flavour, Line } from "./renderDoc.ts";

/**
 * Inline content as spans of plain text: code in backticks, and a link as its label followed by its target in
 * parentheses unless the label already is the target. Tokens and links are dropped, as plain text has neither.
 *
 * **Example** (Flatten text to unstyled spans)
 *
 * ```ts
 * import { plainInline } from "@beep/cli-kit/internal/renderPlain"
 * import { Doc } from "@beep/cli-kit/Doc"
 * import { Render } from "@beep/cli-kit/Render"
 * const ctx = Render.contextOf({ audience: "human", color: "none" })
 * console.log(JSON.stringify(plainInline([Doc.text("Ready")], ctx))) // [{"text":"Ready"}]
 * ```
 *
 * @category formatting
 * @since 0.0.0
 */
export const plainInline: {
  (ctx: RenderContext): (inlines: ReadonlyArray<Inline>) => ReadonlyArray<Span>;
  (inlines: ReadonlyArray<Inline>, ctx: RenderContext): ReadonlyArray<Span>;
} = dual(
  2,
  (inlines: ReadonlyArray<Inline>, ctx: RenderContext): ReadonlyArray<Span> =>
    inlineSpans(
      inlines,
      ctx,
      (span) => ({ text: span.code === true ? `\`${span.text}\`` : span.text }),
      () => true,
      (target) => ({ text: ` (${target})` })
    )
);

const plain: Flavour = {
  inline: plainInline,
  finish: dual(2, (line: Line, _ctx: RenderContext): string =>
    pipe(
      line,
      A.map((span) => span.text),
      A.join("")
    )
  ),
};

/**
 * {@link renderPlain}'s finished lines, one entry per line: a block that draws nothing contributes none.
 *
 * **Example** (Inspect individual output lines)
 *
 * ```ts
 * import { renderPlainLines } from "@beep/cli-kit/internal/renderPlain"
 * import { Doc } from "@beep/cli-kit/Doc"
 * import { Render } from "@beep/cli-kit/Render"
 * const ctx = Render.contextOf({ audience: "human", color: "none" })
 * console.log(JSON.stringify(renderPlainLines([Doc.paragraph("Ready")], ctx))) // ["Ready"]
 * ```
 *
 * @internal
 * @category formatting
 * @since 0.0.0
 */
export const renderPlainLines: {
  (ctx: RenderContext): (doc: Document) => ReadonlyArray<string>;
  (doc: Document, ctx: RenderContext): ReadonlyArray<string>;
} = dual(
  2,
  (doc: Document, ctx: RenderContext): ReadonlyArray<string> =>
    // Plain text is for agents whatever the context says, so the path separator is always the agent one, and the
    // context's paint and link are never reached: a span's token and link are dropped when its line is finished.
    renderDocLines(doc, { ...ctx, audience: "agent" }, plain)
);

/**
 * Render a document as plain text for an agent: no escape sequences, no decoration.
 *
 * **Example** (Render a paragraph)
 *
 * ```ts
 * import { renderPlain } from "@beep/cli-kit/internal/renderPlain"
 * import { Doc } from "@beep/cli-kit/Doc"
 * import { Render } from "@beep/cli-kit/Render"
 * const ctx = Render.contextOf({ audience: "human", color: "none" })
 * console.log(renderPlain([Doc.paragraph("Ready")], ctx)) // Ready
 * ```
 *
 * @internal
 * @category formatting
 * @since 0.0.0
 */
export const renderPlain: {
  (ctx: RenderContext): (doc: Document) => string;
  (doc: Document, ctx: RenderContext): string;
} = dual(2, (doc: Document, ctx: RenderContext): string => A.join(renderPlainLines(doc, ctx), "\n"));
