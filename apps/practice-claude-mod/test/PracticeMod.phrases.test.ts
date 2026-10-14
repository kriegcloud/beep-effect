import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import { phraseToolCall, practiceKgToolOf } from "@/PracticeMod.phrases";

describe("practiceKgToolOf", () => {
  it("recognizes a practice-kg tool on a configured server", () => {
    expect(O.getOrNull(practiceKgToolOf(["practice-kg"], "mcp__practice-kg__kg_matter_lookup"))).toBe(
      "kg_matter_lookup"
    );
  });

  it("ignores the same tool name on another server", () => {
    expect(O.isNone(practiceKgToolOf(["practice-kg"], "mcp__other__kg_find"))).toBe(true);
  });

  it("ignores built-in tools and unknown practice-kg tools", () => {
    expect(O.isNone(practiceKgToolOf(["practice-kg"], "Bash"))).toBe(true);
    expect(O.isNone(practiceKgToolOf(["practice-kg"], "mcp__practice-kg__kg_delete"))).toBe(true);
  });
});

describe("phraseToolCall", () => {
  it("names the matter being looked up", () => {
    expect(phraseToolCall("kg_matter_lookup", { reference: "12345.10008US01", budgetBytes: 4000 })).toBe(
      "Looking up matter 12345.10008US01"
    );
  });

  it("quotes a search and cuts a long query", () => {
    const sentence = phraseToolCall("corpus_search_text", { query: "a".repeat(80) });
    expect(sentence.startsWith("Searching the firm's documents for \"")).toBe(true);
    expect(sentence.endsWith('..."')).toBe(true);
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
