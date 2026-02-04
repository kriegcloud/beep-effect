import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { TestConfigProvider } from "../../src/Runtime/TestRuntime.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { ShaclService } from "../../src/Service/Shacl.js"
import { StorageServiceTest } from "../../src/Service/Storage.js"

const TestLayer = ShaclService.Default.pipe(
  Layer.provideMerge(RdfBuilder.Default),
  Layer.provideMerge(StorageServiceTest),
  Layer.provideMerge(ConfigServiceDefault),
  Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
)

const runWithLayer = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.runPromise(Effect.provide(TestLayer)(effect as any))

describe("ShaclService", () => {
  it("returns conforms=true for valid data", () =>
    runWithLayer(Effect.gen(function*() {
      const shacl = yield* ShaclService
      const rdf = yield* RdfBuilder

      const dataStore = yield* rdf.parseTurtle(`
        @prefix ex: <http://example.org/> .
        @prefix schema: <http://schema.org/> .

        ex:alice a schema:Person ;
          schema:name "Alice" .
      `)

      const shapesStore = yield* shacl.loadShapes(`
        @prefix sh: <http://www.w3.org/ns/shacl#> .
        @prefix schema: <http://schema.org/> .

        schema:PersonShape a sh:NodeShape ;
          sh:targetClass schema:Person ;
          sh:property [
            sh:path schema:name ;
            sh:minCount 1 ;
          ] .
      `)

      const report = yield* shacl.validate(dataStore._store, shapesStore)

      expect(report.conforms).toBe(true)
      expect(report.violations).toHaveLength(0)
    })))

  it("detects missing required property", () =>
    runWithLayer(Effect.gen(function*() {
      const shacl = yield* ShaclService
      const rdf = yield* RdfBuilder

      const dataStore = yield* rdf.parseTurtle(`
        @prefix ex: <http://example.org/> .
        @prefix schema: <http://schema.org/> .

        ex:bob a schema:Person .
      `)

      const shapesStore = yield* shacl.loadShapes(`
        @prefix sh: <http://www.w3.org/ns/shacl#> .
        @prefix schema: <http://schema.org/> .

        schema:PersonShape a sh:NodeShape ;
          sh:targetClass schema:Person ;
          sh:property [
            sh:path schema:name ;
            sh:minCount 1 ;
          ] .
      `)

      const report = yield* shacl.validate(dataStore._store, shapesStore)

      expect(report.conforms).toBe(false)
      expect(report.violations.length).toBeGreaterThan(0)
    })))
})
