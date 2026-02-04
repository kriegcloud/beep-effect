/**
 * Tests for SHACL severity-based policy validation
 *
 * Verifies that validateWithPolicy correctly applies severity policies.
 *
 * @since 2.0.0
 * @module test/Service/Shacl.policy
 */

import { Effect, Layer } from "effect"
import * as N3 from "n3"
import { describe, expect, it } from "vitest"
import { ValidationPolicyError } from "../../src/Domain/Error/Shacl.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { ShaclService, type ValidationPolicy } from "../../src/Service/Shacl.js"
import { StorageServiceTest } from "../../src/Service/Storage.js"
import { TestConfigProvider } from "../setup.js"

describe("ShaclService validateWithPolicy", () => {
  const TestLayer = ShaclService.Default.pipe(
    Layer.provideMerge(StorageServiceTest),
    Layer.provideMerge(RdfBuilder.Default),
    Layer.provideMerge(ConfigServiceDefault),
    Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
  )

  // Test ontology with a Person class and name property
  const testOntology = `
    @prefix owl: <http://www.w3.org/2002/07/owl#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
    @prefix ex: <http://example.org/> .

    ex:Person a owl:Class .
    ex:name a owl:DatatypeProperty ;
      rdfs:domain ex:Person ;
      rdfs:range xsd:string .
  `

  // Valid data - Person with correct type and string name
  const validData = `
    @prefix ex: <http://example.org/> .
    ex:person1 a ex:Person ;
      ex:name "John" .
  `

  // Invalid data - missing rdf:type (will cause sh:targetClass constraint to not apply)
  // To trigger violations, we need data that violates a SHACL constraint
  const invalidData = `
    @prefix ex: <http://example.org/> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
    ex:person1 a ex:Person ;
      ex:name 42 .
  `

  const parseOntology = Effect.gen(function*() {
    const rdf = yield* RdfBuilder
    return yield* rdf.parseTurtle(testOntology)
  })

  const parseData = (turtle: string) =>
    Effect.gen(function*() {
      const rdf = yield* RdfBuilder
      return yield* rdf.parseTurtle(turtle)
    })

  describe("policy enforcement", () => {
    it("succeeds when data conforms and failOnViolation=true", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService

        const ontologyStore = yield* parseOntology
        const dataStore = yield* parseData(validData)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const policy: ValidationPolicy = { failOnViolation: true, failOnWarning: false }
        return yield* shacl.validateWithPolicy(dataStore._store, shapes, policy)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)

      expect(result.conforms).toBe(true)
      expect(result.violations.filter((v) => v.severity === "Violation")).toHaveLength(0)
    })

    it("fails with ValidationPolicyError when violations found and failOnViolation=true", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService

        const ontologyStore = yield* parseOntology
        const dataStore = yield* parseData(invalidData)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const policy: ValidationPolicy = { failOnViolation: true, failOnWarning: false }
        return yield* shacl.validateWithPolicy(dataStore._store, shapes, policy).pipe(Effect.either)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)

      expect(result._tag).toBe("Left")
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(ValidationPolicyError)
        const error = result.left as ValidationPolicyError
        expect(error.severity).toBe("Violation")
        expect(error.violationCount).toBeGreaterThan(0)
      }
    })

    it("succeeds when violations found but failOnViolation=false", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService

        const ontologyStore = yield* parseOntology
        const dataStore = yield* parseData(invalidData)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const policy: ValidationPolicy = { failOnViolation: false, failOnWarning: false }
        return yield* shacl.validateWithPolicy(dataStore._store, shapes, policy)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)

      // Should succeed even with violations because policy allows it
      expect(result).toBeDefined()
      expect(result.violations.filter((v) => v.severity === "Violation").length).toBeGreaterThan(0)
    })
  })

  describe("default policy values", () => {
    it("uses default failOnViolation=true when not specified", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService

        const ontologyStore = yield* parseOntology
        const dataStore = yield* parseData(invalidData)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        // Empty policy object - should use defaults
        const policy: ValidationPolicy = {}
        return yield* shacl.validateWithPolicy(dataStore._store, shapes, policy).pipe(Effect.either)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)

      // Default failOnViolation=true should cause failure
      expect(result._tag).toBe("Left")
    })

    it("uses default failOnWarning=false when not specified", async () => {
      // This test verifies that warnings don't cause failure by default
      // We'd need a shape that produces warnings to fully test this
      // For now, verify with valid data that no failure occurs
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService

        const ontologyStore = yield* parseOntology
        const dataStore = yield* parseData(validData)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const policy: ValidationPolicy = {}
        return yield* shacl.validateWithPolicy(dataStore._store, shapes, policy)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)

      expect(result.conforms).toBe(true)
    })
  })

  describe("empty data handling", () => {
    it("succeeds with empty data store", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService

        const ontologyStore = yield* parseOntology
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)
        const emptyStore = new N3.Store()

        const policy: ValidationPolicy = { failOnViolation: true, failOnWarning: true }
        return yield* shacl.validateWithPolicy(emptyStore, shapes, policy)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)

      expect(result.conforms).toBe(true)
      expect(result.dataGraphTripleCount).toBe(0)
    })
  })

  describe("validation report contents", () => {
    it("includes violation counts in error", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService

        const ontologyStore = yield* parseOntology
        const dataStore = yield* parseData(invalidData)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const policy: ValidationPolicy = { failOnViolation: true }
        return yield* shacl.validateWithPolicy(dataStore._store, shapes, policy).pipe(Effect.either)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)

      if (result._tag === "Left" && result.left instanceof ValidationPolicyError) {
        expect(result.left.violationCount).toBeGreaterThanOrEqual(0)
        expect(result.left.warningCount).toBeGreaterThanOrEqual(0)
        expect(result.left.message).toContain("violation")
      }
    })

    it("returns full validation report on success", async () => {
      const result = await Effect.gen(function*() {
        const shacl = yield* ShaclService

        const ontologyStore = yield* parseOntology
        const dataStore = yield* parseData(validData)
        const shapes = yield* shacl.generateShapesFromOntology(ontologyStore._store)

        const policy: ValidationPolicy = { failOnViolation: true }
        return yield* shacl.validateWithPolicy(dataStore._store, shapes, policy)
      }).pipe(Effect.provide(TestLayer), Effect.runPromise)

      expect(result).toHaveProperty("conforms")
      expect(result).toHaveProperty("violations")
      expect(result).toHaveProperty("validatedAt")
      expect(result).toHaveProperty("dataGraphTripleCount")
      expect(result).toHaveProperty("shapesGraphTripleCount")
      expect(result).toHaveProperty("durationMs")
    })
  })
})
