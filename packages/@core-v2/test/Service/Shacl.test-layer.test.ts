/**
 * Tests for ShaclService.Test layer
 *
 * @since 2.0.0
 * @module test/Service/Shacl.test-layer
 */

import { Effect, Exit } from "effect"
import * as N3 from "n3"
import { describe, expect, it } from "vitest"
import { ValidationPolicyError } from "../../src/Domain/Error/Shacl.js"
import { ShaclService } from "../../src/Service/Shacl.js"

describe("ShaclService.Test", () => {
  const makeEmptyStore = () => new N3.Store()

  describe("default configuration", () => {
    it("returns conforming validation report by default", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService
        return yield* shacl.validate(makeEmptyStore(), makeEmptyStore())
      }).pipe(
        Effect.provide(ShaclService.Test()),
        Effect.runPromise
      )

      expect(result.conforms).toBe(true)
      expect(result.violations).toHaveLength(0)
      expect(result.durationMs).toBe(0)
    })

    it("loadShapes returns empty store", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService
        return yield* shacl.loadShapes("<http://example.org/> a <http://www.w3.org/ns/shacl#NodeShape> .")
      }).pipe(
        Effect.provide(ShaclService.Test()),
        Effect.runPromise
      )

      expect(result).toBeInstanceOf(N3.Store)
      expect(result.size).toBe(0)
    })

    it("loadShapesFromUri returns empty store", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService
        return yield* shacl.loadShapesFromUri("gs://bucket/shapes.ttl")
      }).pipe(
        Effect.provide(ShaclService.Test()),
        Effect.runPromise
      )

      expect(result).toBeInstanceOf(N3.Store)
      expect(result.size).toBe(0)
    })

    it("generateShapesFromOntology returns empty store and tracks cache", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService
        const ontology = makeEmptyStore()

        // Generate shapes
        const shapes = yield* shacl.generateShapesFromOntology(ontology)

        // Check cache stats
        const stats = yield* shacl.getShapesCacheStats()

        return { shapes, stats }
      }).pipe(
        Effect.provide(ShaclService.Test()),
        Effect.runPromise
      )

      expect(result.shapes).toBeInstanceOf(N3.Store)
      expect(result.stats.size).toBe(1)
    })

    it("clearShapesCache clears the cache", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService

        // Generate some shapes to populate cache
        yield* shacl.generateShapesFromOntology(makeEmptyStore())

        const beforeClear = yield* shacl.getShapesCacheStats()

        // Clear cache
        yield* shacl.clearShapesCache()

        const afterClear = yield* shacl.getShapesCacheStats()

        return { beforeClear, afterClear }
      }).pipe(
        Effect.provide(ShaclService.Test()),
        Effect.runPromise
      )

      expect(result.beforeClear.size).toBe(1)
      expect(result.afterClear.size).toBe(0)
    })

    it("validateWithPolicy succeeds when no violations", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService
        return yield* shacl.validateWithPolicy(
          makeEmptyStore(),
          makeEmptyStore(),
          { failOnViolation: true, failOnWarning: true }
        )
      }).pipe(
        Effect.provide(ShaclService.Test()),
        Effect.runPromise
      )

      expect(result.conforms).toBe(true)
    })
  })

  describe("custom configuration with violations", () => {
    const testViolation = {
      focusNode: "http://example.org/entity1",
      message: "Missing required property",
      severity: "Violation" as const
    }

    const testWarning = {
      focusNode: "http://example.org/entity2",
      message: "Property value format issue",
      severity: "Warning" as const
    }

    it("returns configured violations", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService
        return yield* shacl.validate(makeEmptyStore(), makeEmptyStore())
      }).pipe(
        Effect.provide(ShaclService.Test({
          conforms: false,
          violations: [testViolation]
        })),
        Effect.runPromise
      )

      expect(result.conforms).toBe(false)
      expect(result.violations).toHaveLength(1)
      expect(result.violations[0].focusNode).toBe("http://example.org/entity1")
      expect(result.violations[0].severity).toBe("Violation")
    })

    it("validateWithPolicy fails on violation when policy requires", async () => {
      const exit = await Effect.gen(function*() {
        const shacl = yield* ShaclService
        return yield* shacl.validateWithPolicy(
          makeEmptyStore(),
          makeEmptyStore(),
          { failOnViolation: true }
        )
      }).pipe(
        Effect.provide(ShaclService.Test({
          conforms: false,
          violations: [testViolation]
        })),
        Effect.runPromiseExit
      )

      expect(Exit.isFailure(exit)).toBe(true)
      if (Exit.isFailure(exit)) {
        const error = exit.cause._tag === "Fail" ? exit.cause.error : null
        expect(error).toBeInstanceOf(ValidationPolicyError)
        expect((error as ValidationPolicyError).violationCount).toBe(1)
      }
    })

    it("validateWithPolicy succeeds with violations when policy allows", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService
        return yield* shacl.validateWithPolicy(
          makeEmptyStore(),
          makeEmptyStore(),
          { failOnViolation: false }
        )
      }).pipe(
        Effect.provide(ShaclService.Test({
          conforms: false,
          violations: [testViolation]
        })),
        Effect.runPromise
      )

      expect(result.conforms).toBe(false)
      expect(result.violations).toHaveLength(1)
    })

    it("validateWithPolicy fails on warning when policy requires", async () => {
      const exit = await Effect.gen(function*() {
        const shacl = yield* ShaclService
        return yield* shacl.validateWithPolicy(
          makeEmptyStore(),
          makeEmptyStore(),
          { failOnWarning: true }
        )
      }).pipe(
        Effect.provide(ShaclService.Test({
          conforms: true,
          violations: [testWarning]
        })),
        Effect.runPromiseExit
      )

      expect(Exit.isFailure(exit)).toBe(true)
      if (Exit.isFailure(exit)) {
        const error = exit.cause._tag === "Fail" ? exit.cause.error : null
        expect(error).toBeInstanceOf(ValidationPolicyError)
        expect((error as ValidationPolicyError).warningCount).toBe(1)
        expect((error as ValidationPolicyError).severity).toBe("Warning")
      }
    })

    it("handles mixed violations and warnings", async () => {
      const exit = await Effect.gen(function*() {
        const shacl = yield* ShaclService
        return yield* shacl.validateWithPolicy(
          makeEmptyStore(),
          makeEmptyStore(),
          { failOnViolation: true, failOnWarning: false }
        )
      }).pipe(
        Effect.provide(ShaclService.Test({
          conforms: false,
          violations: [testViolation, testWarning]
        })),
        Effect.runPromiseExit
      )

      // Should fail on violation, ignoring warning
      expect(Exit.isFailure(exit)).toBe(true)
      if (Exit.isFailure(exit)) {
        const error = exit.cause._tag === "Fail" ? exit.cause.error : null
        expect((error as ValidationPolicyError).severity).toBe("Violation")
      }
    })
  })

  describe("report metrics", () => {
    it("reports data and shapes graph sizes", async () => {
      const dataStore = new N3.Store()
      const shapesStore = new N3.Store()

      // Add some quads to data store
      const { namedNode, quad } = N3.DataFactory
      dataStore.addQuad(quad(
        namedNode("http://example.org/subject"),
        namedNode("http://example.org/predicate"),
        namedNode("http://example.org/object")
      ))
      dataStore.addQuad(quad(
        namedNode("http://example.org/subject2"),
        namedNode("http://example.org/predicate"),
        namedNode("http://example.org/object2")
      ))

      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService
        return yield* shacl.validate(dataStore, shapesStore)
      }).pipe(
        Effect.provide(ShaclService.Test()),
        Effect.runPromise
      )

      expect(result.dataGraphTripleCount).toBe(2)
      expect(result.shapesGraphTripleCount).toBe(0)
    })
  })
})
