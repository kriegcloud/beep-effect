import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";

const runs = { arbitrary: fcRuns(100) };

import { prepareInline, trimWithSegments } from "@beep/markdown/internal/rawInline";
import { stringifyTree } from "@beep/markdown/internal/stringify";
import { Paragraph, Point, Position, Root } from "@beep/markdown/MarkdownNode";
import { dual } from "effect/Function";
import * as HashMap from "effect/HashMap";
import { codePointWord } from "./inlines/propertyFloor.ts";
import type { BlockNode } from "@beep/markdown/internal/blockTypes";
import type { Definition } from "@beep/markdown/MarkdownNode";

const prose = codePointWord("word");
const position: {
  (start: number, end: number): Position;
  (end: number): (start: number) => Position;
} = dual(
  2,
  (start: number, end: number): Position =>
    Position.make({
      start: Point.make({ line: 1, column: start + 1, offset: start }),
      end: Point.make({ line: 1, column: end + 1, offset: end }),
    })
);
const block = (text: string): BlockNode => ({
  type: "paragraph",
  parent: undefined,
  children: [],
  open: false,
  stringContent: text,
  segments: [{ textOffset: 0, sourceOffset: 0, length: text.length }],
  startOffset: 0,
  endOffset: text.length,
  startLine: 1,
  endLine: 1,
  depth: 1,
  data: {},
});
describe("raw inline properties", () => {
  it.effect.prop(
    "trimming is idempotent and preserves surviving source positions",
    [prose],
    ([value]) =>
      Effect.sync(() => {
        const text = `  ${value}  `;
        const trimmed = trimWithSegments(text, [{ textOffset: 0, sourceOffset: 10, length: text.length }], /\s/);
        assert.deepStrictEqual(trimWithSegments(trimmed.text, trimmed.segments, /\s/), trimmed);
        assert.deepStrictEqual(trimmed, {
          text: value,
          segments: [{ textOffset: 0, sourceOffset: 12, length: value.length }],
        });
      }),
    runs
  );
  it.effect.prop(
    "prepared inline text survives stringify/reparse and canonical formatting stabilizes",
    [prose],
    ([value]) =>
      Effect.sync(() => {
        const first = prepareInline(block(`  ${value}  `), position, HashMap.empty<string, Definition>());
        const emit = (children: Paragraph["children"]) =>
          stringifyTree(Root.make({ children: [Paragraph.make({ children })] }));
        const emitted = emit(first.children);
        const second = prepareInline(position, HashMap.empty<string, Definition>())(block(emitted));
        assert.strictEqual(second.text, first.text);
        assert.deepStrictEqual(
          A.map(second.children, (node) => (node.type === "text" ? node.value : node.type)),
          A.map(first.children, (node) => (node.type === "text" ? node.value : node.type))
        );
        assert.strictEqual(emit(second.children), emitted);
      }),
    runs
  );
});
