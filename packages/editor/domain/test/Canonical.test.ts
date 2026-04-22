import {
  createPageDocument,
  DocumentBlock,
  exportPageExtension,
  exportPageMimeType,
  extractPageLinks,
  makeHeadingBlock,
  makeParagraphBlock,
  makeQuoteBlock,
  normalizePageSlug,
  PageDocument,
  pageToExport,
  pageToMarkdown,
  pageToPlainText,
  refreshPageDocument,
} from "@beep/editor-domain";
import { NonEmptyTrimmedStr } from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import { DateTime } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";

const decodeNonEmptyTrimmedStr = S.decodeUnknownSync(NonEmptyTrimmedStr);
const decodePageDocumentJson = S.decodeUnknownSync(S.fromJsonString(PageDocument));

describe("Canonical editor document helpers", () => {
  it("supports both curried and direct tagged-union block matching", () => {
    const paragraph = makeParagraphBlock("Dual matcher");
    const matchBlockText = DocumentBlock.match({
      paragraph: ({ text }) => text,
      heading: ({ text }) => text,
      quote: ({ text }) => text,
    });

    expect(matchBlockText(paragraph)).toBe("Dual matcher");
    expect(
      DocumentBlock.match(paragraph, {
        paragraph: ({ text }) => text,
        heading: ({ text }) => text,
        quote: ({ text }) => text,
      })
    ).toBe("Dual matcher");
  });

  it("projects canonical blocks to plain text and markdown via tagged-union matching", () => {
    const now = DateTime.nowUnsafe();
    const page = createPageDocument({
      title: decodeNonEmptyTrimmedStr("Home"),
      now,
      blocks: [
        makeHeadingBlock("Welcome", 2),
        makeParagraphBlock("Write once [[daily-notes]] and publish anywhere."),
        makeQuoteBlock("Keep the canonical model local-first."),
      ],
    });

    expect(pageToPlainText(page)).toBe(
      ["Welcome", "Write once [[daily-notes]] and publish anywhere.", "Keep the canonical model local-first."].join(
        "\n"
      )
    );
    expect(pageToMarkdown(page)).toBe(
      [
        "## Welcome",
        "Write once [[daily-notes]] and publish anywhere.",
        "> Keep the canonical model local-first.",
      ].join("\n\n")
    );
  });

  it("derives outbound links for created and refreshed page documents", () => {
    const created = createPageDocument({
      title: decodeNonEmptyTrimmedStr("Daily Notes"),
      now: DateTime.nowUnsafe(),
      blocks: [makeParagraphBlock("Link to [[home]] and [[daily-notes]].")],
    });

    expect(A.map(extractPageLinks(created), (link) => link.targetSlug)).toEqual(["home", "daily-notes"]);
    expect(A.map(created.outboundLinks ?? [], (link) => link.targetSlug)).toEqual(["home", "daily-notes"]);

    const refreshed = refreshPageDocument(created, {
      title: created.title,
      slug: created.slug,
      now: DateTime.nowUnsafe(),
      blocks: [makeParagraphBlock("Now linking to [[home]] and [[writing]].")],
    });

    expect(A.map(refreshed.outboundLinks ?? [], (link) => link.targetSlug)).toEqual(["home", "writing"]);
  });

  it("exports canonical pages with schema-first codecs and shared format metadata", () => {
    const page = createPageDocument({
      title: decodeNonEmptyTrimmedStr("Home"),
      slug: normalizePageSlug("Home"),
      now: DateTime.nowUnsafe(),
      blocks: [makeParagraphBlock("Hello [[writing]]")],
    });

    const jsonExport = pageToExport(page, "json");
    const markdownExport = pageToExport(page, "markdown");

    expect(exportPageExtension("json")).toBe("json");
    expect(exportPageExtension("markdown")).toBe("md");
    expect(exportPageMimeType("json")).toBe("application/json");
    expect(exportPageMimeType("markdown")).toBe("text/markdown");

    expect(jsonExport.fileName).toBe("home.json");
    expect(decodePageDocumentJson(jsonExport.content).slug).toBe("home");

    expect(markdownExport.fileName).toBe("home.md");
    expect(markdownExport.content).toBe("Hello [[writing]]");
  });
});
