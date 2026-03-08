import { describe, expect, it } from "vitest"
import { fuzzyMatch } from "../src/utils/fuzzyMatch.js"

describe("fuzzyMatch", () => {
  it("empty query matches everything with score 0", () => {
    const result = fuzzyMatch("", "Switch Theme")
    expect(result).toEqual({ score: 0, matchedIndices: [] })
  })

  it("exact match scores highest", () => {
    const exact = fuzzyMatch("Switch Theme", "Switch Theme")
    const partial = fuzzyMatch("sw th", "Switch Theme")
    expect(exact).not.toBeNull()
    expect(partial).not.toBeNull()
    expect(exact!.score).toBeGreaterThan(partial!.score)
  })

  it("consecutive character runs score higher than scattered matches", () => {
    const consecutive = fuzzyMatch("Swit", "Switch Theme")
    const scattered = fuzzyMatch("Swhm", "Switch Theme")
    expect(consecutive).not.toBeNull()
    expect(scattered).not.toBeNull()
    expect(consecutive!.score).toBeGreaterThan(scattered!.score)
  })

  it("no match returns null", () => {
    expect(fuzzyMatch("xyz", "Switch Theme")).toBeNull()
  })

  it("case-insensitive matching", () => {
    const result = fuzzyMatch("switch", "Switch Theme")
    expect(result).not.toBeNull()
    expect(result!.matchedIndices).toEqual([0, 1, 2, 3, 4, 5])
  })

  it("returns correct matched indices", () => {
    const result = fuzzyMatch("st", "Switch Theme")
    expect(result).not.toBeNull()
    // S matches at 0, t matches at 7 ("Theme")
    expect(result!.matchedIndices[0]).toBe(0)
  })

  it("start-of-word characters get bonus", () => {
    // "N S" — matching "New Session" (both at word starts) should score
    // higher than "nxs" in "openxsession" (mid-word matches)
    const wordStart = fuzzyMatch("ns", "New Session")
    const midWord = fuzzyMatch("ns", "openxsession")
    expect(wordStart).not.toBeNull()
    expect(midWord).not.toBeNull()
    expect(wordStart!.score).toBeGreaterThan(midWord!.score)
  })
})
