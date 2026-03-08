import { describe, expect, it } from "@effect/vitest"
import {
  applyEditRange,
  findEditCandidates,
  generateUnifiedDiff
} from "../src/tools/file/FileEditMatcher.js"

describe("FileEditMatcher", () => {
  it("finds exact unique matches first", () => {
    const result = findEditCandidates("alpha beta gamma", "beta")
    expect(result.strategy).toBe("exact")
    expect(result.ranges).toHaveLength(1)
    expect(result.ranges[0]?.start).toBe(6)
  })

  it("falls back to normalized matching when exact match is absent", () => {
    const content = "line one\r\nline two\r\n"
    const needle = "line one\nline two\n"
    const result = findEditCandidates(content, needle)
    expect(result.strategy).toBe("normalized")
    expect(result.ranges).toHaveLength(1)
  })

  it("reports ambiguity for repeated candidate ranges", () => {
    const result = findEditCandidates("token x token", "token")
    expect(result.ranges).toHaveLength(2)
    expect(result.ranges.map((range) => range.line)).toEqual([1, 1])
  })

  it("applies replacement only to the matched span", () => {
    const content = "prefix\nTARGET\nsuffix\n"
    const result = findEditCandidates(content, "TARGET")
    expect(result.ranges).toHaveLength(1)
    const updated = applyEditRange(content, result.ranges[0]!, "PATCHED")
    expect(updated).toBe("prefix\nPATCHED\nsuffix\n")
  })

  it("generates unified diff output", () => {
    const diff = generateUnifiedDiff({
      oldContent: "a\nb\nc\n",
      newContent: "a\nB\nc\n",
      path: "tmp/sample.txt"
    })
    expect(diff).toContain("--- a/tmp/sample.txt")
    expect(diff).toContain("+++ b/tmp/sample.txt")
    expect(diff).toContain("-b")
    expect(diff).toContain("+B")
  })
})
