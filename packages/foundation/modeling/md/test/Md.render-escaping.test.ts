// Wave 2d-3 writer fixes: each case pins the Markdown `Md.render` writes for
// a construct the parser would otherwise read back differently, through the
// direct adapter and a URL-policy adapter alike, and checks that the text
// re-parses (math on, the default) to the same document.

import { Md } from "@beep/md";
import { BrowserSafeUrlPolicySpec } from "@beep/md/Md.escape";
import {
  Admonition,
  A as Anchor,
  Code,
  Document,
  Em,
  Hr,
  Img,
  InlineMath,
  Li,
  Ol,
  P,
  Strong,
  Table,
  TableCell,
  TableRow,
  TaskItem,
  TaskList,
  Text,
  Ul,
} from "@beep/md/Md.model";
import { parseResult } from "@beep/md/Md.parse";
import { makeMarkdownAdapter, renderUnsafe, renderWithUnsafe, UrlRenderOptions } from "@beep/md/Md.render";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import * as O from "effect/Option";
import * as Result from "effect/Result";
import type { Block, Inline } from "@beep/md/Md.model";

const policyAdapter = makeMarkdownAdapter(UrlRenderOptions.make({ urlPolicy: BrowserSafeUrlPolicySpec }));

const encode = (document: Document): Document.Encoded => Result.getOrThrow(Document.encodeResult(document));

const reparsed = (markdown: string): Document.Encoded => encode(Result.getOrThrow(parseResult(markdown)).document);

const text = (value: string): Text => Text.make({ value });

const p = (...children: ReadonlyArray<Inline>): P => P.make({ children });

const link = (children: ReadonlyArray<Inline>, title: O.Option<string> = O.none()): Anchor =>
  Anchor.make({ href: "https://example.com", title, children });

// Renders through both adapters, checks the text, and checks that the text
// reads back to the same document.
const expectWriter = (blocks: ReadonlyArray<Block>, markdown: string): void => {
  const document = Document.make({ children: blocks });
  expect(renderUnsafe(document)).toBe(markdown);
  expect(renderWithUnsafe(policyAdapter, document)).toBe(markdown);
  expect(reparsed(markdown)).toStrictEqual(encode(document));
};

describe("@beep/md/Md.render writer escapes", () => {
  it("escapes an `&` only where it opens a character reference", () => {
    // In text the `#` escape already breaks a numeric reference, so only a
    // named one takes the `\&` escape; titles and destinations take both.
    expectWriter([p(text("AT&T &amp; &#38; &#x26; &foo; & ;"))], "AT&T \\&amp; &\\#38; &\\#x26; \\&foo; & ;");
    expectWriter([p(link([text("a")], O.some("&#38;")))], '[a](https://example.com "\\&#38;")');
  });

  it("escapes a `$` only where it could open inline math", () => {
    expectWriter([p(text("cost $5, $ 6 and a$b$"))], "cost \\$5, $ 6 and a\\$b\\$");
    expectWriter([p(text("pay $5 for "), InlineMath.make({ value: "x^2" }))], "pay \\$5 for $x^2$");
  });

  it("keeps a bare URL in text from becoming a link", () => {
    expectWriter([p(text("see https://example.com now"))], "see https\\://example\\.com now");
  });

  it("escapes a `!` that would turn a following link into an image", () => {
    expectWriter([p(text("Wow!"), link([text("a")]))], "Wow\\![a](https://example.com)");
  });

  it("writes block-edge whitespace as character references", () => {
    expectWriter([p(text(" \tindented "))], "&#32;&#9;indented&#32;");
    expectWriter([Md.h2(" spaced ")], "## &#32;spaced&#32;");
  });

  it("keeps line breaks and references in link and image titles", () => {
    expectWriter([p(link([text("a")], O.some("one\ntwo &amp;")))], '[a](https://example.com "one&#10;two \\&amp;")');
    expectWriter(
      [p(Img.make({ src: "https://example.com/i.png", alt: "x &amp; y", title: O.some("t\nu") }))],
      '![x \\&amp; y](https://example.com/i.png "t&#10;u")'
    );
  });

  it("escapes a character reference in a link destination", () => {
    expectWriter(
      [p(Anchor.make({ href: "https://example.com/a&amp;b", title: O.none(), children: [text("a")] }))],
      "[a](https://example.com/a\\&amp;b)"
    );
  });

  it("writes an all-space code span without padding", () => {
    expectWriter([p(Code.make({ value: " " }), text(" and "), Code.make({ value: " a" }))], "` ` and `  a `");
  });

  it("escapes a table-cell pipe once", () => {
    expectWriter(
      [
        Table.make({
          align: ["none"],
          headerRow: true,
          children: [
            TableRow.make({ children: [TableCell.make({ children: [text("a|b "), Code.make({ value: "c|d" })] })] }),
          ],
        }),
      ],
      "| a\\|b `c\\|d` |\n| --- |"
    );
  });

  it("delimits emphasis that opens on emphasis with underscores", () => {
    const em = Em.make({ children: [text("foo")] });
    expectWriter([p(Em.make({ children: [em] }))], "_*foo*_");
    expectWriter([p(Strong.make({ children: [em] }))], "__*foo*__");
    expectWriter([p(Em.make({ children: [Strong.make({ children: [text("foo")] })] }))], "***foo***");
  });
});

describe("@beep/md/Md.render writer blocks", () => {
  const item = (...children: ReadonlyArray<Inline>): Li => Li.make({ children });

  it("alternates the markers of adjacent lists of one family", () => {
    expectWriter(
      [
        Ul.make({ children: [item(text("a"))] }),
        Ul.make({ children: [item(text("b"))] }),
        Ul.make({ children: [item(text("c"))] }),
      ],
      "- a\n\n+ b\n\n- c"
    );
    expectWriter(
      [Ol.make({ start: 1, children: [item(text("a"))] }), Ol.make({ start: 3, children: [item(text("b"))] })],
      "1. a\n\n3) b"
    );
    expectWriter(
      [
        Ul.make({ children: [item(text("a"))] }),
        TaskList.make({ children: [TaskItem.make({ checked: false, children: [text("b")] })] }),
      ],
      "- a\n\n+ [ ] b"
    );
  });

  it("renders a list with paragraph items loose", () => {
    expectWriter(
      [
        Ul.make({
          children: [Li.make({ children: [p(text("a")), p(text("b"))] }), Li.make({ children: [p(text("c"))] })],
        }),
      ],
      "- a\n\n  b\n\n- c"
    );
  });

  it("indents a task item's blocks under its bullet", () => {
    expectWriter(
      [
        TaskList.make({
          children: [
            TaskItem.make({ checked: true, children: [p(text("a")), Ul.make({ children: [item(text("b"))] })] }),
          ],
        }),
      ],
      "- [x] a\n\n  - b"
    );
  });

  it("separates an admonition body from its marker line", () => {
    expectWriter(
      [
        Admonition.make({
          kind: "note",
          title: O.none(),
          children: [Ol.make({ start: 7, children: [item(text("seven"))] })],
        }),
      ],
      "> [!NOTE]\n>\n> 7. seven"
    );
  });

  it("writes thematic breaks as `***`, so a leading one is not a frontmatter fence", () => {
    expectWriter([Hr.make({}), p(text("x")), Hr.make({})], "***\n\nx\n\n***");
    expectWriter([Ul.make({ children: [Li.make({ children: [Hr.make({})] })] })], "- ***");
  });
});
