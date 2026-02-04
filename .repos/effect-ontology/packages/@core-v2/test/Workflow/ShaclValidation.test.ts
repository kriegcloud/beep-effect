import { describe, expect, it } from "@effect/vitest"
import { Effect, Exit, Layer, Option } from "effect"
import { ValidationPolicyError } from "../../src/Domain/Error/Shacl.js"
import type { BatchId, GcsUri } from "../../src/Domain/Identity.js"
import type { ValidationActivityInput } from "../../src/Domain/Schema/Batch.js"
import { TestConfigProvider } from "../../src/Runtime/TestRuntime.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { ShaclService } from "../../src/Service/Shacl.js"
import { StorageService, StorageServiceTest } from "../../src/Service/Storage.js"
import { makeValidationActivity } from "../../src/Workflow/Activities.js"

// Layer ordering: Config first, then RdfBuilder (depends on Config), then ShaclService (depends on RdfBuilder + Storage)
const testLayer = ShaclService.Default.pipe(
  Layer.provideMerge(RdfBuilder.Default),
  Layer.provideMerge(StorageServiceTest),
  Layer.provideMerge(ConfigServiceDefault),
  Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
)

const runWithLayer = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.runPromise(Effect.provide(testLayer)(effect as any) as any)

const runWithLayerExit = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.runPromiseExit(Effect.provide(testLayer)(effect as any) as any)

// Conforming data - has required schema:name
const conformingDataGraph = `
  @prefix ex: <http://example.org/> .
  @prefix schema: <http://schema.org/> .

  ex:alice a schema:Person ;
    schema:name "Alice" .
`

// Non-conforming data - missing required schema:name
const nonConformingDataGraph = `
  @prefix ex: <http://example.org/> .
  @prefix schema: <http://schema.org/> .

  ex:bob a schema:Person .
`

const shapesGraph = `
  @prefix sh: <http://www.w3.org/ns/shacl#> .
  @prefix schema: <http://schema.org/> .

  schema:PersonShape a sh:NodeShape ;
    sh:targetClass schema:Person ;
    sh:property [
      sh:path schema:name ;
      sh:minCount 1 ;
    ] .
`

// Legacy alias for existing test
const dataGraph = conformingDataGraph

describe("ShaclValidationActivity", () => {
  it("validates a conforming graph and writes report", () =>
    runWithLayer(Effect.gen(function*() {
      const input: typeof ValidationActivityInput.Type = {
        batchId: "test-batch" as BatchId,
        resolvedGraphUri: "gs://test-bucket/batches/test-batch/resolved.ttl" as GcsUri,
        ontologyUri: "gs://test-bucket/ontologies/person.ttl" as GcsUri,
        shaclUri: "gs://test-bucket/shapes/person.ttl" as GcsUri
      }

      const storage = yield* StorageService

      yield* storage.set("batches/test-batch/resolved.ttl", dataGraph)
      yield* storage.set("shapes/person.ttl", shapesGraph)

      const activity = makeValidationActivity(input)
      const output = yield* activity.execute

      const reportJson = yield* storage.get("batches/test-batch/validation/report.json").pipe(
        Effect.flatMap((opt) =>
          Option.match(opt, {
            onNone: () => Effect.fail("report not written"),
            onSome: Effect.succeed
          })
        )
      )

      expect(output.conforms).toBe(true)
      expect(output.violations).toBe(0)
      expect(output.reportUri).toContain("report.json")

      const parsedReport = JSON.parse(reportJson) as { conforms: boolean; violations?: Array<unknown> }
      expect(parsedReport.conforms).toBe(true)
    })))

  it("detects violations in non-conforming data using real SHACL engine", () =>
    runWithLayer(Effect.gen(function*() {
      const shacl = yield* ShaclService
      const rdf = yield* RdfBuilder

      // Parse non-conforming data (missing schema:name)
      const dataStore = yield* rdf.parseTurtle(nonConformingDataGraph)

      // Parse shapes
      const shapesStore = yield* shacl.loadShapes(shapesGraph)

      // Validate - should detect violation
      const report = yield* shacl.validate(dataStore._store, shapesStore)

      expect(report.conforms).toBe(false)
      expect(report.violations.length).toBeGreaterThan(0)

      // The violation should be about missing schema:name
      const violation = report.violations[0]
      expect(violation.focusNode).toContain("bob")
      expect(violation.severity).toBe("Violation")
    })))

  it("fails with ValidationPolicyError when policy requires", () =>
    runWithLayerExit(Effect.gen(function*() {
      const shacl = yield* ShaclService
      const rdf = yield* RdfBuilder

      // Parse non-conforming data
      const dataStore = yield* rdf.parseTurtle(nonConformingDataGraph)
      const shapesStore = yield* shacl.loadShapes(shapesGraph)

      // Validate with policy that fails on violations
      return yield* shacl.validateWithPolicy(dataStore._store, shapesStore, {
        failOnViolation: true,
        failOnWarning: false
      })
    })).then((exit) => {
      expect(Exit.isFailure(exit)).toBe(true)
      if (Exit.isFailure(exit)) {
        const error = exit.cause._tag === "Fail" ? exit.cause.error : null
        expect(error).toBeInstanceOf(ValidationPolicyError)
        expect((error as ValidationPolicyError).violationCount).toBeGreaterThan(0)
      }
    }))

  it("succeeds when policy allows violations", () =>
    runWithLayer(Effect.gen(function*() {
      const shacl = yield* ShaclService
      const rdf = yield* RdfBuilder

      // Parse non-conforming data
      const dataStore = yield* rdf.parseTurtle(nonConformingDataGraph)
      const shapesStore = yield* shacl.loadShapes(shapesGraph)

      // Validate with policy that allows violations
      const report = yield* shacl.validateWithPolicy(dataStore._store, shapesStore, {
        failOnViolation: false,
        failOnWarning: false
      })

      // Should succeed but report violations
      expect(report.conforms).toBe(false)
      expect(report.violations.length).toBeGreaterThan(0)
    })))
})
