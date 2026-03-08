import { describe, expect, test } from "bun:test"
import { canonicalizeJson, hashSchema, makeSubcallCacheKey } from "../../src/scheduler/CacheKey"

describe("scheduler/CacheKey", () => {
  test("makeSubcallCacheKey is deterministic", () => {
    const parts = {
      completionId: "completion-1",
      parentCallId: "root",
      method: "llm_query",
      query: "extract",
      context: "ctx",
      depth: 1,
      modelRoute: "route:recursive"
    }

    const a = makeSubcallCacheKey(parts)
    const b = makeSubcallCacheKey(parts)

    expect(a).toBe(b)
    expect(a.startsWith("subcall:")).toBe(true)
  })

  test("makeSubcallCacheKey changes across discriminators", () => {
    const base = {
      completionId: "completion-1",
      parentCallId: "root",
      method: "llm_query",
      query: "extract",
      context: "ctx",
      depth: 1,
      modelRoute: "route:recursive"
    }

    const recursive = makeSubcallCacheKey(base)
    const oneShot = makeSubcallCacheKey({ ...base, modelRoute: "route:oneshot" })
    const sibling = makeSubcallCacheKey({ ...base, parentCallId: "other-root" })

    expect(recursive).not.toBe(oneShot)
    expect(recursive).not.toBe(sibling)
  })

  test("canonicalizeJson sorts nested object keys deterministically", () => {
    const a = canonicalizeJson({
      z: 1,
      inner: {
        b: 2,
        a: 1
      }
    })

    const b = canonicalizeJson({
      inner: {
        a: 1,
        b: 2
      },
      z: 1
    })

    expect(a).toBe(b)
  })

  test("canonicalizeJson drops undefined object keys", () => {
    const withUndefined = canonicalizeJson({ a: 1, b: undefined })
    const withoutUndefined = canonicalizeJson({ a: 1 })

    expect(withUndefined).toBe(withoutUndefined)
    expect(withUndefined).toBe('{"a":1}')
  })

  test("canonicalizeJson rejects top-level undefined", () => {
    expect(() => canonicalizeJson(undefined)).toThrow("top-level undefined")
  })

  test("hashSchema is stable for key-reordered nested schemas", () => {
    const s1 = {
      type: "object",
      properties: {
        a: {
          type: "object",
          properties: {
            x: { type: "number" },
            y: { type: "string" }
          },
          required: ["x", "y"]
        }
      },
      required: ["a"]
    }

    const s2 = {
      required: ["a"],
      properties: {
        a: {
          required: ["x", "y"],
          properties: {
            y: { type: "string" },
            x: { type: "number" }
          },
          type: "object"
        }
      },
      type: "object"
    }

    expect(hashSchema(s1)).toBe(hashSchema(s2))
  })

  test("hashSchema changes when nested schema changes", () => {
    const s1 = {
      type: "object",
      properties: { a: { type: "number" } },
      required: ["a"]
    }
    const s2 = {
      type: "object",
      properties: { a: { type: "string" } },
      required: ["a"]
    }

    expect(hashSchema(s1)).not.toBe(hashSchema(s2))
  })
})
