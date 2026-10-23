import { MarkdownDocument } from "@beep/markdown/MarkdownDocument";
import { MdxJsxFlowElement } from "@beep/markdown/MarkdownMdx";
import {
  ImageReference,
  InlineCode,
  Link,
  List,
  ListItem,
  Paragraph,
  Root,
  Table,
  TableCell,
  TableRow,
  Text,
} from "@beep/markdown/MarkdownNode";
import { A as Anchor, Document, Em, Heading, Li, Ol, Ul } from "@beep/md/Md.model";
import { parseResult } from "@beep/md/Md.parse";
import { fromMarkdownDocument, MdSourceEntry, MdSourceMap, positionAt } from "@beep/md/Md.syntax";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as Result from "effect/Result";
import type { MdParseOptions } from "@beep/md/Md.parse";
import type { MdFromSyntax, MdSyntaxOptions } from "@beep/md/Md.syntax";

const bridge = (text: string, options?: MdParseOptions.Encoded): MdFromSyntax =>
  Result.getOrThrow(parseResult(text, options));

const blocks = (result: MdFromSyntax): Document.Encoded["children"] =>
  Result.getOrThrow(Document.encodeResult(result.document)).children;

const reasons = (result: MdFromSyntax): ReadonlyArray<string> => A.map(result.losses, (loss) => loss.reason);

const handBuilt = (root: Root, options?: MdSyntaxOptions.Encoded): MdFromSyntax =>
  Result.getOrThrow(
    fromMarkdownDocument(
      MarkdownDocument.make({ source: "", root, diagnostics: [], definitions: HashMap.empty(), definitionOrder: [] }),
      options
    )
  );

describe("@beep/md/Md.syntax admonition head line", () => {
  it("takes the whole paragraph as the title when the head line never ends", () => {
    const result = bridge("> [!NOTE] *t*");
    expect(blocks(result)).toEqual([{ _tag: "admonition", kind: "note", title: "t", children: [] }]);
    expect(reasons(result)).toEqual(["admonitionTitleFlattened"]);
  });

  it("flattens inline code to its value and an image to its alt text", () => {
    const result = bridge("> [!TIP] Run `x` ![pic](/u.png)\n> body");
    expect(blocks(result)).toEqual([
      {
        _tag: "admonition",
        kind: "tip",
        title: "Run x pic",
        children: [{ _tag: "p", children: [{ _tag: "text", value: "body" }] }],
      },
    ]);
    expect(reasons(result)).toEqual(["admonitionTitleFlattened"]);
  });

  it("flattens a head-line node with neither a value nor alt text to nothing", () => {
    const result = bridge("> [!NOTE] See[^n]\n> body\n\n[^n]: note");
    expect(blocks(result)[0]).toMatchObject({ _tag: "admonition", title: "See" });
    expect(reasons(result)).toContain("admonitionTitleFlattened");
  });

  it("drops a hard break nested in head-line markup without ending the head line", () => {
    const result = bridge("> [!NOTE] *a\\\n> b*\n> body");
    expect(blocks(result)).toEqual([
      {
        _tag: "admonition",
        kind: "note",
        title: "ab",
        children: [{ _tag: "p", children: [{ _tag: "text", value: "body" }] }],
      },
    ]);
  });

  it("drops a nested <br> under breakTag and applies the html policy to it otherwise", () => {
    const source = "> [!NOTE] *a<br>b*\n> body";
    const asBreak = bridge(source);
    expect(blocks(asBreak)[0]).toMatchObject({ title: "ab" });
    expect(reasons(asBreak)).toEqual(["admonitionTitleFlattened"]);

    const escaped = bridge(source, { breakTag: false });
    expect(blocks(escaped)[0]).toMatchObject({ title: "a<br>b" });
    expect(reasons(escaped)).toEqual(["admonitionTitleFlattened", "htmlEscapedAsText"]);

    const dropped = bridge(source, { breakTag: false, html: "drop" });
    expect(blocks(dropped)[0]).toMatchObject({ title: "ab" });
    expect(reasons(dropped)).toEqual(["admonitionTitleFlattened", "htmlDropped"]);
  });
});

describe("@beep/md/Md.syntax hand-built syntax trees", () => {
  it("drops a text run that joins to the empty string", () => {
    const result = handBuilt(
      Root.make({
        children: [
          Paragraph.make({
            children: [Text.make({ value: "" }), Text.make({ value: "" }), InlineCode.make({ value: "c" })],
          }),
        ],
      })
    );
    expect(blocks(result)).toEqual([{ _tag: "p", children: [{ _tag: "code", value: "c" }] }]);
    expect(result.losses).toEqual([]);
    expect(A.map(result.sourceMap.entries, (entry) => entry.tag)).toEqual(["document", "p", "code"]);
  });

  it("gives an image reference without alt text an empty alt", () => {
    const parsed = Result.getOrThrow(MarkdownDocument.parseResult("![x][r]\n\n[r]: /i.png"));
    const root = Root.make({
      children: [
        Paragraph.make({ children: [ImageReference.make({ identifier: "r", referenceType: "full" })] }),
        ...A.drop(parsed.root.children, 1),
      ],
    });
    const result = Result.getOrThrow(fromMarkdownDocument(MarkdownDocument.make({ ...parsed, root })));
    expect(blocks(result)).toEqual([{ _tag: "p", children: [{ _tag: "img", src: "/i.png", alt: "" }] }]);
  });

  it("starts an ordered list without a start number at one", () => {
    const result = handBuilt(
      Root.make({
        children: [
          List.make({
            ordered: true,
            children: [ListItem.make({ children: [Paragraph.make({ children: [Text.make({ value: "a" })] })] })],
          }),
        ],
      })
    );
    expect(blocks(result)).toEqual([
      { _tag: "ol", start: 1, children: [{ _tag: "li", children: [{ _tag: "text", value: "a" }] }] },
    ]);
  });

  it("maps a table without alignment to no column alignments", () => {
    const result = handBuilt(
      Root.make({
        children: [
          Table.make({
            children: [TableRow.make({ children: [TableCell.make({ children: [Text.make({ value: "h" })] })] })],
          }),
        ],
      })
    );
    expect(blocks(result)).toEqual([
      {
        _tag: "table",
        align: [],
        headerRow: true,
        children: [{ _tag: "tableRow", children: [{ _tag: "tableCell", children: [{ _tag: "text", value: "h" }] }] }],
      },
    ]);
  });

  it("names an unwrapped MDX fragment in its loss", () => {
    const result = handBuilt(
      Root.make({
        children: [
          MdxJsxFlowElement.make({
            name: null,
            attributes: [],
            children: [Paragraph.make({ children: [Text.make({ value: "inner" })] })],
          }),
        ],
      })
    );
    expect(blocks(result)).toEqual([{ _tag: "p", children: [{ _tag: "text", value: "inner" }] }]);
    expect(reasons(result)).toEqual(["mdxElementUnwrapped"]);
    assertSome(result.losses[0]?.detail ?? O.none(), "fragment");
  });

  it("keeps a YouTube link whose text is not one plain text node as a link", () => {
    const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const result = handBuilt(
      Root.make({
        children: [
          Paragraph.make({
            children: [Link.make({ url, children: [Text.make({ value: url }), Text.make({ value: "!" })] })],
          }),
        ],
      }),
      { youtube: true }
    );
    expect(blocks(result)).toEqual([
      { _tag: "p", children: [{ _tag: "a", href: url, children: [{ _tag: "text", value: `${url}!` }] }] },
    ]);
    const youtube = bridge(`[*${url}*](${url})`, { youtube: true });
    expect(blocks(youtube)[0]?._tag).toBe("p");
    expect(youtube.losses).toEqual([]);
  });
});

describe("@beep/md/Md.syntax source map lookups", () => {
  const result = bridge("# T\n\n- a\n- [b](/u) *c*");
  const text = (value: string) => Text.make({ value });
  const heading = (level: 1 | 2) => Heading.make({ level, children: [text("T")] });
  const plainItem = Li.make({ children: [text("a")] });
  const linkItem = (href: string, label: string) =>
    Li.make({
      children: [Anchor.make({ href, children: [text(label)] }), text(" "), Em.make({ children: [text("c")] })],
    });
  const rebuilt = (level: 1 | 2, href: string, label: string): Document =>
    Document.make({ children: [heading(level), Ul.make({ children: [plainItem, linkItem(href, label)] })] });
  const link = ["children", 1, "children", 1, "children", 0] as const;
  const offsetAt = (document: Document, path: ReadonlyArray<string | number>) =>
    O.map(positionAt(result.sourceMap, document, path), (span) => span.start.offset);

  it("resolves an equal rebuild of the bridged document", () => {
    assertSome(offsetAt(result.document, link), 11);
    assertSome(offsetAt(rebuilt(1, "/u", "b"), link), 11);
    assertSome(offsetAt(rebuilt(1, "/u", "b"), ["children", 0]), 0);
  });

  it("returns None when an ancestor changes its tag or its child count", () => {
    const retagged = Document.make({
      children: [heading(1), Ol.make({ start: 1, children: [plainItem, linkItem("/u", "b")] })],
    });
    assertNone(offsetAt(retagged, link));
    const shorter = Document.make({ children: [heading(1), Ul.make({ children: [linkItem("/u", "b")] })] });
    assertNone(offsetAt(shorter, ["children", 1, "children", 0]));
  });

  it("returns None when an attribute or a leaf below the target changed in place", () => {
    assertNone(offsetAt(rebuilt(1, "/v", "b"), link));
    assertNone(offsetAt(rebuilt(1, "/u", "z"), link));
    assertNone(offsetAt(rebuilt(2, "/u", "b"), ["children", 0]));
    assertSome(offsetAt(rebuilt(2, "/u", "b"), link), 11);
  });

  it("places inline math after a soft line break on its own source line", () => {
    const bridged = bridge("a\nb $c$", { math: true });
    expect(blocks(bridged)).toEqual([
      {
        _tag: "p",
        children: [
          { _tag: "text", value: "a b " },
          { _tag: "inlineMath", value: "c" },
        ],
      },
    ]);
    assertSome(
      O.map(positionAt(bridged.sourceMap, bridged.document, ["children", 0, "children", 1]), (span) => [
        span.start.line,
        span.start.column,
        span.start.offset,
      ]),
      [2, 3, 4]
    );
  });

  it("returns None on a map whose descendant counts overrun the entries", () => {
    const bridged = bridge("a");
    const overrun = MdSourceMap.make({
      entries: A.map(bridged.sourceMap.entries, (entry, ordinal) =>
        ordinal === 1 ? MdSourceEntry.make({ ...entry, descendants: 5 }) : entry
      ),
    });
    assertSome(
      O.map(
        positionAt(bridged.sourceMap, bridged.document, ["children", 0, "children", 0]),
        (span) => span.start.offset
      ),
      0
    );
    assertNone(positionAt(overrun, bridged.document, ["children", 0, "children", 0]));
    assertNone(positionAt(overrun, bridged.document, ["children", 0]));
  });
});
