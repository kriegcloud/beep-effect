/**
 * Tests for RdfBuilder.addSameAsLinks
 *
 * @since 2.0.0
 * @module test/Service/Rdf.sameas
 */

import { Chunk, Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"
import { OWL } from "../../src/Domain/Rdf/Constants.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { TestConfigProvider } from "../setup.js"

describe("RdfBuilder.addSameAsLinks", () => {
  const TestLayer = RdfBuilder.Default.pipe(
    Layer.provideMerge(ConfigServiceDefault),
    Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
  )

  it("generates owl:sameAs triples for canonical map", async () => {
    const result = await Effect.gen(function*() {
      const rdf = yield* RdfBuilder
      const store = yield* rdf.createStore

      const canonicalMap = {
        "mention-1": "canonical-1",
        "mention-2": "canonical-1",
        "mention-3": "canonical-2"
      }

      yield* rdf.addSameAsLinks(store, canonicalMap)

      const sameAsQuads = yield* rdf.queryStore(store, { predicate: OWL.sameAs })
      return {
        count: Chunk.size(sameAsQuads),
        quads: Chunk.toArray(sameAsQuads)
      }
    }).pipe(
      Effect.provide(TestLayer),
      Effect.runPromise
    )

    expect(result.count).toBe(3)
    // Check that all subjects are mention IRIs
    const subjects = result.quads.map((q) => q.subject)
    expect(subjects.some((s) => s.includes("mention-1"))).toBe(true)
    expect(subjects.some((s) => s.includes("mention-2"))).toBe(true)
    expect(subjects.some((s) => s.includes("mention-3"))).toBe(true)
  })

  it("skips self-referential links", async () => {
    const result = await Effect.gen(function*() {
      const rdf = yield* RdfBuilder
      const store = yield* rdf.createStore

      // canonical-1 maps to itself (should be skipped)
      const canonicalMap = {
        "canonical-1": "canonical-1",
        "mention-1": "canonical-1"
      }

      yield* rdf.addSameAsLinks(store, canonicalMap)

      const sameAsQuads = yield* rdf.queryStore(store, { predicate: OWL.sameAs })
      return Chunk.size(sameAsQuads)
    }).pipe(
      Effect.provide(TestLayer),
      Effect.runPromise
    )

    // Only mention-1 -> canonical-1, not canonical-1 -> canonical-1
    expect(result).toBe(1)
  })

  it("handles empty canonical map", async () => {
    const result = await Effect.gen(function*() {
      const rdf = yield* RdfBuilder
      const store = yield* rdf.createStore

      yield* rdf.addSameAsLinks(store, {})

      const sameAsQuads = yield* rdf.queryStore(store, { predicate: OWL.sameAs })
      return Chunk.size(sameAsQuads)
    }).pipe(
      Effect.provide(TestLayer),
      Effect.runPromise
    )

    expect(result).toBe(0)
  })

  it("handles full IRIs in canonical map", async () => {
    const result = await Effect.gen(function*() {
      const rdf = yield* RdfBuilder
      const store = yield* rdf.createStore

      const canonicalMap = {
        "http://example.org/mention-1": "http://example.org/canonical-1"
      }

      yield* rdf.addSameAsLinks(store, canonicalMap)

      const sameAsQuads = yield* rdf.queryStore(store, { predicate: OWL.sameAs })
      const quad = Chunk.get(sameAsQuads, 0)

      return {
        count: Chunk.size(sameAsQuads),
        subject: quad._tag === "Some" ? quad.value.subject : null,
        object: quad._tag === "Some" ? quad.value.object : null
      }
    }).pipe(
      Effect.provide(TestLayer),
      Effect.runPromise
    )

    expect(result.count).toBe(1)
    expect(result.subject).toBe("http://example.org/mention-1")
    expect(result.object).toBe("http://example.org/canonical-1")
  })

  it("serializes owl:sameAs triples to Turtle", async () => {
    const result = await Effect.gen(function*() {
      const rdf = yield* RdfBuilder
      const store = yield* rdf.createStore

      const canonicalMap = {
        "mention-1": "canonical-1",
        "mention-2": "canonical-1"
      }

      yield* rdf.addSameAsLinks(store, canonicalMap)
      const turtle = yield* rdf.toTurtle(store)

      return turtle
    }).pipe(
      Effect.provide(TestLayer),
      Effect.runPromise
    )

    // Check that owl:sameAs appears in output
    expect(result).toContain("owl:sameAs")
    expect(result).toContain("mention-1")
    expect(result).toContain("mention-2")
    expect(result).toContain("canonical-1")
  })
})
