/**
 * Tests for Retrieval Utilities
 *
 * @since 2.0.0
 * @module test/Utils/Retrieval
 */

import * as fc from "fast-check"
import { describe, expect, it } from "vitest"
import { rrfFusion, rrfScore } from "../../src/Utils/Retrieval.js"

describe("rrfScore", () => {
  it("returns 0 for empty ranks", () => {
    expect(rrfScore([])).toBe(0)
  })

  it("computes score for single rank", () => {
    expect(rrfScore([1], 60)).toBeCloseTo(1 / 61, 5)
  })

  it("computes score for multiple ranks", () => {
    const expected = 1 / 61 + 1 / 62 + 1 / 63
    expect(rrfScore([1, 2, 3], 60)).toBeCloseTo(expected, 5)
  })

  it("uses custom k parameter", () => {
    const expected = 1 / 11 + 1 / 12
    expect(rrfScore([1, 2], 10)).toBeCloseTo(expected, 5)
  })

  it("gives higher scores to lower ranks", () => {
    expect(rrfScore([1], 60)).toBeGreaterThan(rrfScore([10], 60))
  })
})

describe("rrfFusion", () => {
  it("returns empty array for empty input", () => {
    expect(rrfFusion([])).toEqual([])
  })

  it("returns single list with rrfScore added", () => {
    const list = [{ id: "a", value: 1 }, { id: "b", value: 2 }]
    const result = rrfFusion([list])

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe("a")
    expect(result[0].rrfScore).toBeCloseTo(1 / 61, 5)
  })

  it("combines multiple lists", () => {
    const list1 = [{ id: "a", value: 1 }, { id: "b", value: 2 }]
    const list2 = [{ id: "b", value: 3 }, { id: "c", value: 4 }]

    const result = rrfFusion([list1, list2])

    expect(result).toHaveLength(3)
    expect(result.map((r) => r.id)).toContain("a")
    expect(result.map((r) => r.id)).toContain("b")
    expect(result.map((r) => r.id)).toContain("c")
  })

  it("sorts by descending RRF score", () => {
    const list1 = [{ id: "a" }, { id: "b" }, { id: "c" }]
    const list2 = [{ id: "b" }, { id: "a" }]
    const list3 = [{ id: "b" }]

    const result = rrfFusion([list1, list2, list3])

    // "b" appears in all 3 lists - should have highest score
    expect(result[0].id).toBe("b")

    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].rrfScore).toBeGreaterThanOrEqual(result[i + 1].rrfScore)
    }
  })

  it("handles duplicate IDs across lists", () => {
    const list1 = [{ id: "a", data: "v1" }]
    const list2 = [{ id: "a", data: "v2" }]

    const result = rrfFusion([list1, list2])

    expect(result).toHaveLength(1)
    expect(result[0].rrfScore).toBeCloseTo(1 / 61 + 1 / 61, 5)
  })

  it("handles empty lists in input", () => {
    const list1 = [{ id: "a", value: 1 }]
    const list2: Array<{ id: string; value: number }> = []

    const result = rrfFusion([list1, list2])

    expect(result).toHaveLength(1)
  })
})

describe("Property Testing", () => {
  it("rrfScore is always non-negative", () => {
    fc.assert(
      fc.property(
        fc.array(fc.nat(1000), { minLength: 0, maxLength: 20 }),
        fc.nat(100),
        (ranks, k) => {
          const score = rrfScore(ranks, Math.max(1, k))
          expect(score).toBeGreaterThanOrEqual(0)
        }
      )
    )
  })

  it("rrfFusion always returns items in descending score order", () => {
    const arbItem = fc.record({
      id: fc.constantFrom("a", "b", "c", "d"),
      value: fc.nat()
    })

    fc.assert(
      fc.property(
        fc.array(fc.array(arbItem, { minLength: 0, maxLength: 5 }), { minLength: 0, maxLength: 5 }),
        (lists) => {
          const result = rrfFusion(lists)

          for (let i = 0; i < result.length - 1; i++) {
            expect(result[i].rrfScore).toBeGreaterThanOrEqual(result[i + 1].rrfScore)
          }
        }
      )
    )
  })

  it("rrfFusion produces unique items", () => {
    const arbItem = fc.record({
      id: fc.constantFrom("a", "b", "c"),
      value: fc.nat()
    })

    fc.assert(
      fc.property(
        fc.array(fc.array(arbItem, { minLength: 0, maxLength: 5 }), { minLength: 0, maxLength: 5 }),
        (lists) => {
          const result = rrfFusion(lists)
          const ids = result.map((r) => r.id)
          const uniqueIds = new Set(ids)
          expect(ids.length).toBe(uniqueIds.size)
        }
      )
    )
  })
})
