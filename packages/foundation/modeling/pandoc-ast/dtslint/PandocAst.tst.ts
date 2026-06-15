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
    expect<PandocInline["_tag"]>().type.toBeAssignableTo<string>();
    expect<PandocBlock["_tag"]>().type.toBeAssignableTo<string>();
    expect<PandocDocument["_tag"]>().type.toBe<"pandocDocument">();
  });

  it("pins mapping result envelopes", () => {
    expect<PandocToDocumentResult["report"]>().type.toBeAssignableTo<PandocCompatibilityReport>();
    expect<DocumentToPandocResult["report"]>().type.toBeAssignableTo<PandocCompatibilityReport>();
    expect<PandocMappingProfile>().type.toBe<"supported" | "gap">();
  });
});
