import { describe, expect, test } from "bun:test"
import { resolveUsageTokens } from "../src/LlmCall"

describe("resolveUsageTokens", () => {
  test("uses provider totalTokens when available", () => {
    const total = resolveUsageTokens({
      inputTokens: 10,
      outputTokens: 20,
      totalTokens: 7
    })
    expect(total).toBe(7)
  })

  test("falls back to input+output when totalTokens is missing", () => {
    const total = resolveUsageTokens({
      inputTokens: 3,
      outputTokens: 4,
      totalTokens: undefined
    })
    expect(total).toBe(7)
  })

  test("returns undefined when all usage counters are missing or zero", () => {
    const total = resolveUsageTokens({
      inputTokens: undefined,
      outputTokens: 0,
      totalTokens: undefined
    })
    expect(total).toBeUndefined()
  })
})
