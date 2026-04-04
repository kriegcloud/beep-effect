import { describe, expect, it } from "@effect/vitest";
import * as Core from "../src/Core.js";

const expectFencedCode = (
  markdown: string,
  expectedExamples: ReadonlyArray<string>,
  expectedWarnings: ReadonlyArray<string>
) => {
  expect(Core.extractFencedCode(markdown)).toEqual([expectedExamples, expectedWarnings]);
};

describe("Core", () => {
  describe("[internal] extractFencedCode", () => {
    it("should extract fenced code blocks from markdown (backticks)", () => {
      expectFencedCode("a\n\n```ts\nconst a = 1\n```\n\nb", ["const a = 1"], []);
    });

    it("should extract fenced code blocks from markdown (tildes)", () => {
      expectFencedCode("a\n\n~~~ts\nconst a = 1\n~~~~\n\nb", ["const a = 1"], []);
    });

    it("should skip-type-checking (backticks)", () => {
      expectFencedCode("a\n\n```ts skip-type-checking a=1\nconst a = 1\n```\n\nb", [], []);
    });

    it("should skip-type-checking (tildes)", () => {
      expectFencedCode("a\n\n~~~ts skip-type-checking a=1\nconst a = 1\n~~~~\n\nb", [], []);
    });

    it("should handle metadata (backticks)", () => {
      expectFencedCode("a\n\n```ts a=1\nconst a = 1\n```\n\nb", ["const a = 1"], []);
    });

    it("should handle metadata (tildes)", () => {
      expectFencedCode("a\n\n~~~ts a=1\nconst a = 1\n~~~~\n\nb", ["const a = 1"], []);
    });

    it("should handle non closing fences (backticks)", () => {
      expectFencedCode(
        "a\n\n```ts\nconst a = 1",
        ["const a = 1"],
        ["Code block does not have a matching closing fence:\na\n\n```ts\nconst a = 1"]
      );
    });

    it("should handle non closing fences (tildes)", () => {
      expectFencedCode(
        "a\n\n~~~ts\nconst a = 1",
        ["const a = 1"],
        ["Code block does not have a matching closing fence:\na\n\n~~~ts\nconst a = 1"]
      );
    });
  });
});
