import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";
import * as Str from "effect/String";
import { phraseToolCall, practiceKgToolOf } from "@/PracticeMod.phrases";

describe("practiceKgToolOf", () => {
  it("recognizes a practice-kg tool on a configured server", () => {
    assertSome(practiceKgToolOf(["practice-kg"], "mcp__practice-kg__kg_matter_lookup"), "kg_matter_lookup");
  });

  it("ignores the same tool name on another server", () => {
    assertNone(practiceKgToolOf(["practice-kg"], "mcp__other__kg_find"));
  });

  it("ignores built-in tools and unknown practice-kg tools", () => {
    assertNone(practiceKgToolOf(["practice-kg"], "Bash"));
    assertNone(practiceKgToolOf(["practice-kg"], "mcp__practice-kg__kg_delete"));
  });
});

describe("phraseToolCall", () => {
  it("names the matter being looked up", () => {
    expect(phraseToolCall("kg_matter_lookup", { reference: "12345.10008US01", budgetBytes: 4000 })).toBe(
      "Looking up matter 12345.10008US01"
    );
  });

  it("quotes a search and cuts a long query", () => {
    const sentence = phraseToolCall("corpus_search_text", { query: Str.repeat(80)("a") });
    expect(Str.startsWith("Searching the firm's documents for \"")(sentence)).toBe(true);
    expect(Str.endsWith('..."')(sentence)).toBe(true);
  });

  it("shows only the file name of an opened document", () => {
    expect(phraseToolCall("corpus_get_document", { organized_path: "clients/12345/office-action.pdf" })).toBe(
      "Opening office-action.pdf"
    );
  });

  it("combines query and sender for an email search", () => {
    expect(phraseToolCall("email_search", { query: "restriction", sender: "examiner@uspto.gov" })).toBe(
      'Searching filed email for "restriction" from examiner@uspto.gov'
    );
  });

  it("still phrases a call whose input does not decode", () => {
    expect(phraseToolCall("kg_find", "not an object")).toBe("Searching the firm's records");
  });
});
