import { describe, expect, it } from "vitest"
import fc from "fast-check"
import { fuzzyMatch } from "../src/utils/fuzzyMatch.js"

describe("fuzzyMatch properties", () => {
  it("empty query always matches with score 0", () => {
    fc.assert(
      fc.property(fc.string(), (text) => {
        const result = fuzzyMatch("", text)
        expect(result).toEqual({ score: 0, matchedIndices: [] })
      })
    )
  })

  it("never returns null when query is a substring (contiguous)", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.nat(19),
        fc.nat(19),
        (text, startRaw, lenRaw) => {
          if (text.length === 0) return
          const start = startRaw % text.length
          const len = (lenRaw % (text.length - start)) + 1
          const query = text.slice(start, start + len)
          const result = fuzzyMatch(query, text)
          expect(result).not.toBeNull()
        }
      )
    )
  })

  it("matched indices are strictly increasing", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 10 }), fc.string({ minLength: 1, maxLength: 50 }), (query, text) => {
        const result = fuzzyMatch(query, text)
        if (result === null) return
        for (let i = 1; i < result.matchedIndices.length; i++) {
          expect(result.matchedIndices[i]!).toBeGreaterThan(result.matchedIndices[i - 1]!)
        }
      })
    )
  })

  it("matched indices length equals query length when match succeeds", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 10 }), fc.string({ minLength: 1, maxLength: 50 }), (query, text) => {
        const result = fuzzyMatch(query, text)
        if (result === null) return
        expect(result.matchedIndices.length).toBe(query.length)
      })
    )
  })

  it("score is always non-negative for successful matches", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 10 }), fc.string({ minLength: 1, maxLength: 50 }), (query, text) => {
        const result = fuzzyMatch(query, text)
        if (result === null) return
        expect(result.score).toBeGreaterThanOrEqual(0)
      })
    )
  })

  it("matched indices are valid positions in the text", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 10 }), fc.string({ minLength: 1, maxLength: 50 }), (query, text) => {
        const result = fuzzyMatch(query, text)
        if (result === null) return
        for (const idx of result.matchedIndices) {
          expect(idx).toBeGreaterThanOrEqual(0)
          expect(idx).toBeLessThan(text.length)
        }
      })
    )
  })

  it("characters at matched indices correspond to query characters (case-insensitive)", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 10 }), fc.string({ minLength: 1, maxLength: 50 }), (query, text) => {
        const result = fuzzyMatch(query, text)
        if (result === null) return
        for (let i = 0; i < query.length; i++) {
          expect(text[result.matchedIndices[i]!]!.toLowerCase()).toBe(query[i]!.toLowerCase())
        }
      })
    )
  })

  it("self-match always succeeds for non-empty strings", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 30 }), (text) => {
        const result = fuzzyMatch(text, text)
        expect(result).not.toBeNull()
        expect(result!.matchedIndices).toEqual(Array.from({ length: text.length }, (_, i) => i))
      })
    )
  })
})
