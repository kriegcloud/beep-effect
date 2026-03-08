import { describe, expect, it } from "@effect/vitest"

import {
  AlignmentError,
  InferenceConfigError,
  InferenceRuntimeError,
  PrimedCacheError
} from "../../src/Errors.js"

describe("Error models", () => {
  it("creates tagged config errors", () => {
    const error = new InferenceConfigError({
      message: "Missing MODEL_ID"
    })

    expect(error._tag).toBe("InferenceConfigError")
    expect(error.message).toContain("MODEL_ID")
  })

  it("creates runtime errors with optional provider", () => {
    const error = new InferenceRuntimeError({
      message: "Request failed",
      provider: "openai"
    })

    expect(error._tag).toBe("InferenceRuntimeError")
    expect(error.provider).toBe("openai")
  })

  it("creates cache and alignment errors", () => {
    const cacheError = new PrimedCacheError({
      message: "Cache read failed",
      key: "abc123"
    })
    const alignmentError = new AlignmentError({
      message: "Alignment failed"
    })

    expect(cacheError._tag).toBe("PrimedCacheError")
    expect(cacheError.key).toBe("abc123")
    expect(alignmentError._tag).toBe("AlignmentError")
  })
})
