import { describe, expect, it } from "@effect/vitest"

import { errorMessage } from "../../src/internal/errorMessage.js"
import { fnv1aHash } from "../../src/internal/hash.js"
import { asRecord } from "../../src/internal/records.js"

describe("Internal utility modules", () => {
  it("computes stable FNV-1a hashes", () => {
    expect(fnv1aHash("prompt-a")).toBe(fnv1aHash("prompt-a"))
    expect(fnv1aHash("prompt-a")).not.toBe(fnv1aHash("prompt-b"))
  })

  it("extracts object records safely", () => {
    expect(asRecord({ ok: true })).toEqual({ ok: true })
    expect(asRecord(null)).toBeUndefined()
    expect(asRecord([1, 2, 3])).toBeUndefined()
  })

  it("normalizes unknown errors to messages", () => {
    expect(errorMessage(new Error("boom"))).toBe("boom")
    expect(errorMessage({ message: 123 })).toBe("123")
    expect(errorMessage("raw")).toBe("raw")
  })
})
