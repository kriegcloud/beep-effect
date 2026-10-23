import { MdxJsxAttributeValueExpression } from "@beep/markdown/MarkdownMdx";
import * as Node from "@beep/markdown/MarkdownNode";
import { MarkdownNodeKind } from "@beep/markdown/MarkdownNode";
import { assert, describe, expectTypeOf, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { MdxJsxAttributeContent } from "@beep/markdown/MarkdownMdx";
import type { MarkdownNode } from "@beep/markdown/MarkdownNode";

describe("MarkdownNodeKind", () => {
  it("is exactly the node unions' `type` tags, attribute carriers included", () => {
    expectTypeOf<MarkdownNodeKind>().toEqualTypeOf<
      MarkdownNode["type"] | MdxJsxAttributeContent["type"] | MdxJsxAttributeValueExpression["type"]
    >();
  });

  it("holds the 34 discriminators: 26 core and 8 MDX", () => {
    assert.strictEqual(MarkdownNodeKind.literals.length, 34);
    assert.strictEqual(A.dedupe(MarkdownNodeKind.literals).length, 34);
    const mdx = A.filter(MarkdownNodeKind.literals, Str.startsWith("mdx"));
    assert.strictEqual(mdx.length, 8);
  });

  it("admits every node schema's own tag and nothing else", () => {
    const parsed = Node.Root.make({ children: [Node.Paragraph.make({ children: [Node.Text.make({ value: "x" })] })] });
    assert.isTrue(S.is(MarkdownNodeKind)(parsed.type));
    assert.isTrue(S.is(MarkdownNodeKind)(MdxJsxAttributeValueExpression.make({ value: "x" }).type));
    assert.isFalse(S.is(MarkdownNodeKind)("yaml"));
  });
});
