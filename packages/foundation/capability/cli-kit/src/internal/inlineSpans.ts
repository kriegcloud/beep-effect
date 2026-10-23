import * as A from "effect/Array";
import { dual } from "effect/Function";
import { flatten } from "./layout.ts";
import { showsSuffix, targetText } from "./renderDoc.ts";
import type { Inline, LinkTarget } from "../Doc.ts";
import type { RenderContext } from "../Render.ts";
import type { Span } from "./layout.ts";

const linkRunEnd = (flat: ReadonlyArray<Span>, start: number): number => {
  const link = A.getUnsafe(flat, start).link;
  let end = start + 1;
  if (link === undefined) return end;
  while (end < flat.length && A.getUnsafe(flat, end).link === link) end++;
  return end;
};

/**
 * Flatten inline runs with a renderer-specific span and target suffix.
 * @category formatting
 * @since 0.0.0
 */
export const inlineSpans: {
  (
    inlines: ReadonlyArray<Inline>,
    ctx: RenderContext,
    render: (span: Span) => Span,
    showTarget: (link: LinkTarget, label: string) => boolean,
    suffix: (target: string) => Span
  ): ReadonlyArray<Span>;
  (
    ctx: RenderContext,
    render: (span: Span) => Span,
    showTarget: (link: LinkTarget, label: string) => boolean,
    suffix: (target: string) => Span
  ): (inlines: ReadonlyArray<Inline>) => ReadonlyArray<Span>;
} = dual(
  5,
  (
    inlines: ReadonlyArray<Inline>,
    ctx: RenderContext,
    render: (span: Span) => Span,
    showTarget: (link: LinkTarget, label: string) => boolean,
    suffix: (target: string) => Span
  ): ReadonlyArray<Span> => {
    const flat = flatten(inlines, ctx);
    const out: Array<Span> = [];
    let i = 0;
    while (i < flat.length) {
      const link = A.getUnsafe(flat, i).link;
      const start = i;
      i = linkRunEnd(flat, start);
      const run = A.makeBy(i - start, (offset) => A.getUnsafe(flat, start + offset));
      const label = A.join(
        A.map(run, (span) => span.text),
        ""
      );
      out.push(...A.map(run, render));
      if (link !== undefined && showTarget(link, label)) {
        const target = targetText(link, ctx);
        if (showsSuffix(A.getUnsafe(flat, i - 1).suffix, label, target)) out.push(suffix(target));
      }
    }
    return out;
  }
);
