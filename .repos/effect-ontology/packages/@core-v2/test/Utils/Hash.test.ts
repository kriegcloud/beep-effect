/**
 * Tests for Hash Utilities
 *
 * @since 2.0.0
 * @module test/Utils/Hash
 */

import { Effect } from "effect"
import * as fc from "fast-check"
import { describe, expect, it } from "vitest"
import { hashEmbeddingKey, hashEmbeddingKeySync, sha256 } from "../../src/Utils/Hash.js"

describe("sha256", () => {
  it("produces deterministic hash", async () => {
    const hash1 = await Effect.runPromise(sha256("hello"))
    const hash2 = await Effect.runPromise(sha256("hello"))
    expect(hash1).toBe(hash2)
  })

  it("produces known hash for 'hello'", async () => {
    const hash = await Effect.runPromise(sha256("hello"))
    expect(hash).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")
  })

  it("different inputs produce different hashes", async () => {
    const hash1 = await Effect.runPromise(sha256("hello"))
    const hash2 = await Effect.runPromise(sha256("world"))
    expect(hash1).not.toBe(hash2)
  })

  it("handles empty string", async () => {
    const hash = await Effect.runPromise(sha256(""))
    expect(hash).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  })

  it("handles unicode", async () => {
    const hash = await Effect.runPromise(sha256("🚀"))
    expect(hash).toHaveLength(64) // SHA-256 hex is 64 chars
  })
})

describe("hashEmbeddingKey", () => {
  it("produces deterministic hash", async () => {
    const hash1 = await Effect.runPromise(hashEmbeddingKey("hello", "search_document"))
    const hash2 = await Effect.runPromise(hashEmbeddingKey("hello", "search_document"))
    expect(hash1).toBe(hash2)
  })

  it("different texts produce different hashes", async () => {
    const hash1 = await Effect.runPromise(hashEmbeddingKey("hello", "search_document"))
    const hash2 = await Effect.runPromise(hashEmbeddingKey("world", "search_document"))
    expect(hash1).not.toBe(hash2)
  })

  it("different task types produce different hashes", async () => {
    const hash1 = await Effect.runPromise(hashEmbeddingKey("hello", "search_document"))
    const hash2 = await Effect.runPromise(hashEmbeddingKey("hello", "search_query"))
    expect(hash1).not.toBe(hash2)
  })

  it("separator prevents collision", async () => {
    // "abc::xyz" vs "ab::cxyz"
    const hash1 = await Effect.runPromise(hashEmbeddingKey("abc", "xyz"))
    const hash2 = await Effect.runPromise(hashEmbeddingKey("ab", "cxyz"))
    expect(hash1).not.toBe(hash2)
  })
})

describe("hashEmbeddingKeySync", () => {
  it("produces same result as async version", async () => {
    const asyncHash = await Effect.runPromise(hashEmbeddingKey("hello", "search_document"))
    const syncHash = hashEmbeddingKeySync("hello", "search_document")
    expect(asyncHash).toBe(syncHash)
  })

  it("is deterministic", () => {
    const hash1 = hashEmbeddingKeySync("hello", "search_document")
    const hash2 = hashEmbeddingKeySync("hello", "search_document")
    expect(hash1).toBe(hash2)
  })
})

// =============================================================================
// Property Tests - Critical invariants for rock-solid hash functions
// =============================================================================

describe("Property Tests", () => {
  describe("sha256 properties", () => {
    it("is deterministic - same input always gives same output", async () => {
      await fc.assert(
        fc.asyncProperty(fc.string({ maxLength: 1000 }), async (input) => {
          const hash1 = await Effect.runPromise(sha256(input))
          const hash2 = await Effect.runPromise(sha256(input))
          expect(hash1).toBe(hash2)
        }),
        { numRuns: 200 }
      )
    })

    it("always produces 64-character hex string", async () => {
      await fc.assert(
        fc.asyncProperty(fc.string({ maxLength: 1000 }), async (input) => {
          const hash = await Effect.runPromise(sha256(input))
          expect(hash).toHaveLength(64)
          expect(hash).toMatch(/^[a-f0-9]{64}$/)
        }),
        { numRuns: 200 }
      )
    })

    it("different inputs produce different hashes (collision resistance)", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 500 }),
          fc.string({ minLength: 1, maxLength: 500 }),
          async (a, b) => {
            fc.pre(a !== b) // Only test when inputs are different
            const hashA = await Effect.runPromise(sha256(a))
            const hashB = await Effect.runPromise(sha256(b))
            expect(hashA).not.toBe(hashB)
          }
        ),
        { numRuns: 200 }
      )
    })
  })

  describe("hashEmbeddingKeySync properties", () => {
    const arbTaskType = fc.constantFrom("search_document", "search_query", "clustering", "classification")

    it("is deterministic - same input always gives same output", () => {
      fc.assert(
        fc.property(fc.string({ maxLength: 500 }), arbTaskType, (text, taskType) => {
          const hash1 = hashEmbeddingKeySync(text, taskType)
          const hash2 = hashEmbeddingKeySync(text, taskType)
          expect(hash1).toBe(hash2)
        }),
        { numRuns: 500 }
      )
    })

    it("different task types produce different hashes", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 500 }), (text) => {
          const docHash = hashEmbeddingKeySync(text, "search_document")
          const queryHash = hashEmbeddingKeySync(text, "search_query")
          expect(docHash).not.toBe(queryHash)
        }),
        { numRuns: 300 }
      )
    })

    it("always produces 64-character hex string", () => {
      fc.assert(
        fc.property(fc.string({ maxLength: 500 }), arbTaskType, (text, taskType) => {
          const hash = hashEmbeddingKeySync(text, taskType)
          expect(hash).toHaveLength(64)
          expect(hash).toMatch(/^[a-f0-9]{64}$/)
        }),
        { numRuns: 300 }
      )
    })

    it("separator prevents collision between adjacent boundaries", () => {
      // Critical: "abc::xyz" should not equal "ab::cxyz"
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (a, b, c) => {
            fc.pre(b.length > 0 && c.length > 0) // Ensure both parts exist

            // If text1+sep+task1 could equal text2+sep+task2 due to boundary shift
            const text1 = a + b
            const task1 = c
            const text2 = a
            const task2 = b + c

            // These should still be different due to separator
            const hash1 = hashEmbeddingKeySync(text1, task1)
            const hash2 = hashEmbeddingKeySync(text2, task2)

            // Can only assert they're different if the composite strings differ
            if (`${text1}::${task1}` !== `${text2}::${task2}`) {
              expect(hash1).not.toBe(hash2)
            }
          }
        ),
        { numRuns: 300 }
      )
    })
  })

  describe("async/sync equivalence", () => {
    const arbTaskType = fc.constantFrom("search_document", "search_query", "clustering", "classification")

    it("async and sync versions produce identical results", async () => {
      await fc.assert(
        fc.asyncProperty(fc.string({ maxLength: 500 }), arbTaskType, async (text, taskType) => {
          const asyncHash = await Effect.runPromise(hashEmbeddingKey(text, taskType))
          const syncHash = hashEmbeddingKeySync(text, taskType)
          expect(asyncHash).toBe(syncHash)
        }),
        { numRuns: 200 }
      )
    })
  })
})
