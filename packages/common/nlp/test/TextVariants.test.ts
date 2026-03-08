import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as IdentifierText from "../src/IdentifierText.ts";
import * as PathText from "../src/PathText.ts";
import * as QueryText from "../src/QueryText.ts";
import * as VariantText from "../src/VariantText.ts";

describe("@beep/nlp deterministic helpers", () => {
  it("normalizes question and phrase text deterministically", () => {
    expect(QueryText.normalizeQuestion("  describe   `answer`  ")).toBe("describe `answer`");
    expect(QueryText.normalizePhrase(' " src / index.ts ? ')).toBe("src/index.ts");
    expect(O.getOrThrow(QueryText.extractBacktickValue("describe `repoMemoryAnswerHelper`"))).toBe(
      "repoMemoryAnswerHelper"
    );
  });

  it("returns none for missing or empty backtick captures", () => {
    expect(O.isNone(QueryText.extractBacktickValue("describe repoMemoryAnswerHelper"))).toBe(true);
    expect(O.isNone(QueryText.extractBacktickValue("describe ``"))).toBe(true);
  });

  it("generates identifier variants for spaced and camelCase phrases", () => {
    const spaced = IdentifierText.variants("repo memory answer helper");
    const camel = IdentifierText.variants("repoMemoryAnswerHelper");

    expect(spaced).toContain("repoMemoryAnswerHelper");
    expect(spaced).toContain("repo_memory_answer_helper");
    expect(spaced).toContain("repo-memory-answer-helper");
    expect(spaced).toContain("repomemoryanswerhelper");
    expect(camel).toContain("repo memory answer helper");
    expect(camel).toContain("repoMemoryAnswerHelper");
  });

  it("tokenizes mixed identifier styles and drops punctuation-only inputs", () => {
    expect(IdentifierText.tokens("RepoMemory-answer_helper")).toEqual(["repo", "memory", "answer", "helper"]);
    expect(IdentifierText.variants("...")).toEqual([]);
  });

  it("generates path and module variants with basename and extensionless forms", () => {
    expect(PathText.filePathVariants("./src/index.ts")).toEqual([
      "./src/index.ts",
      "src/index.ts",
      "src/index",
      "index.ts",
      "index",
    ]);
    expect(PathText.moduleSpecifierVariants("./util.ts")).toEqual(["./util.ts", "util.ts", "util"]);
    expect(PathText.isPathLike("src/index")).toBe(true);
    expect(PathText.isPathLike("repo memory helper")).toBe(false);
  });

  it("normalizes windows-style path phrases and preserves bounded single-fragment modules", () => {
    expect(PathText.normalizePathPhrase(" .\\\\src\\\\index.ts ")).toBe("./src/index.ts");
    expect(PathText.filePathVariants(" .\\\\src\\\\index.ts ")).toEqual([
      "./src/index.ts",
      "src/index.ts",
      "src/index",
      "index.ts",
      "index",
    ]);
    expect(PathText.moduleSpecifierVariants("util")).toEqual(["util"]);
  });

  it("deduplicates variants while preserving the first occurrence", () => {
    expect(VariantText.orderedDedupe(["answer", "", "answer", "greet", "greet"])).toEqual(["answer", "greet"]);
  });
});
