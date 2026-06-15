import { describe, expect, it } from "tstyche";
import type {
  DocumentToPandocResult,
  PandocBlock,
  PandocCompatibilityReport,
  PandocDocument,
  PandocInline,
  PandocMappingProfile,
  PandocToDocumentResult,
} from "@beep/pandoc-ast";

describe("@beep/pandoc-ast public types", () => {
  it("pins recursive AST discriminants", () => {
    expect<PandocInline["_tag"]>().type.toBe<
      | "code"
      | "emph"
      | "image"
      | "linebreak"
      | "link"
      | "math"
      | "note"
      | "softbreak"
      | "space"
      | "span"
      | "str"
      | "strikeout"
      | "strong"
      | "unknownInline"
    >();
    expect<PandocBlock["_tag"]>().type.toBe<
      | "blockquote"
      | "bulletlist"
      | "codeblock"
      | "div"
      | "header"
      | "horizontalrule"
      | "orderedlist"
      | "para"
      | "plain"
      | "table"
      | "unknownBlock"
    >();
    expect<PandocDocument["_tag"]>().type.toBe<"pandocDocument">();
  });

  it("pins mapping result envelopes", () => {
    expect<PandocToDocumentResult["report"]>().type.toBeAssignableTo<PandocCompatibilityReport>();
    expect<DocumentToPandocResult["report"]>().type.toBeAssignableTo<PandocCompatibilityReport>();
    expect<PandocMappingProfile>().type.toBe<"supported" | "gap">();
  });
});
