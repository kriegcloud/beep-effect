/**
 * SPARQL Service Tests
 *
 * Tests for SPARQL query execution using Oxigraph.
 *
 * @module test/Service/Sparql
 */

import { BunContext } from "@effect/platform-bun"
import { describe, expect, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer } from "effect"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { SparqlService } from "../../src/Service/Sparql.js"

// -----------------------------------------------------------------------------
// Test Configuration
// -----------------------------------------------------------------------------

const TestConfigProvider = ConfigProvider.fromMap(
  new Map([
    ["ONTOLOGY_PATH", "/tmp/test-ontology.ttl"],
    ["LLM_API_KEY", "test-key-for-testing"],
    ["LLM_PROVIDER", "anthropic"],
    ["LLM_MODEL", "claude-haiku-4-5"],
    ["STORAGE_TYPE", "memory"],
    ["RDF_BASE_NAMESPACE", "http://test.example.org/"]
  ]),
  { pathDelim: "_" }
)

const TestLayers = Layer.mergeAll(
  SparqlService.Default,
  RdfBuilder.Default
).pipe(
  Layer.provideMerge(ConfigServiceDefault),
  Layer.provideMerge(BunContext.layer),
  Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
)

// -----------------------------------------------------------------------------
// Test RDF Data
// -----------------------------------------------------------------------------

const sampleTurtle = `
@prefix ex: <http://example.org/> .
@prefix schema: <http://schema.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:john a schema:Person ;
    schema:name "John Doe" ;
    schema:age "30"^^xsd:integer ;
    schema:worksFor ex:acme .

ex:jane a schema:Person ;
    schema:name "Jane Smith" ;
    schema:age "28"^^xsd:integer ;
    schema:worksFor ex:acme .

ex:acme a schema:Organization ;
    schema:name "Acme Corp" ;
    schema:founder ex:john .
`

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("SparqlService", () => {
  describe("execute", () => {
    it.effect("executes SELECT query and returns bindings", () =>
      Effect.gen(function*() {
        const sparql = yield* SparqlService
        const rdf = yield* RdfBuilder

        const store = yield* rdf.parseTurtle(sampleTurtle)

        const result = yield* sparql.execute(
          store,
          `SELECT ?name WHERE { ?s <http://schema.org/name> ?name }`
        )

        expect(result._tag).toBe("SelectResult")
        if (result._tag === "SelectResult") {
          expect(result.bindings.length).toBe(3) // john, jane, acme
          expect(result.variables).toContain("name")

          const names = result.bindings.map((b) => b.get("name")?.value)
          expect(names).toContain("John Doe")
          expect(names).toContain("Jane Smith")
          expect(names).toContain("Acme Corp")
        }
      }).pipe(Effect.provide(TestLayers)))

    it.effect("executes SELECT with FILTER", () =>
      Effect.gen(function*() {
        const sparql = yield* SparqlService
        const rdf = yield* RdfBuilder

        const store = yield* rdf.parseTurtle(sampleTurtle)

        const result = yield* sparql.execute(
          store,
          `
          PREFIX schema: <http://schema.org/>
          SELECT ?name ?age WHERE {
            ?s a schema:Person ;
               schema:name ?name ;
               schema:age ?age .
            FILTER (?age > 29)
          }
          `
        )

        expect(result._tag).toBe("SelectResult")
        if (result._tag === "SelectResult") {
          expect(result.bindings.length).toBe(1) // only john is > 29
          expect(result.bindings[0].get("name")?.value).toBe("John Doe")
        }
      }).pipe(Effect.provide(TestLayers)))

    it.effect("executes ASK query", () =>
      Effect.gen(function*() {
        const sparql = yield* SparqlService
        const rdf = yield* RdfBuilder

        const store = yield* rdf.parseTurtle(sampleTurtle)

        // Should return true - john exists
        const resultTrue = yield* sparql.execute(
          store,
          `ASK { <http://example.org/john> a <http://schema.org/Person> }`
        )

        expect(resultTrue._tag).toBe("AskResult")
        if (resultTrue._tag === "AskResult") {
          expect(resultTrue.value).toBe(true)
        }

        // Should return false - bob doesn't exist
        const resultFalse = yield* sparql.execute(
          store,
          `ASK { <http://example.org/bob> a <http://schema.org/Person> }`
        )

        expect(resultFalse._tag).toBe("AskResult")
        if (resultFalse._tag === "AskResult") {
          expect(resultFalse.value).toBe(false)
        }
      }).pipe(Effect.provide(TestLayers)))

    it.effect("executes CONSTRUCT query", () =>
      Effect.gen(function*() {
        const sparql = yield* SparqlService
        const rdf = yield* RdfBuilder

        const store = yield* rdf.parseTurtle(sampleTurtle)

        const result = yield* sparql.execute(
          store,
          `
          PREFIX schema: <http://schema.org/>
          CONSTRUCT {
            ?person schema:name ?name .
          } WHERE {
            ?person a schema:Person ;
                    schema:name ?name .
          }
          `
        )

        expect(result._tag).toBe("ConstructResult")
        if (result._tag === "ConstructResult") {
          expect(result.quads.length).toBe(2) // john and jane
          expect(result.quads.every((q) => q.predicate === "http://schema.org/name")).toBe(true)
        }
      }).pipe(Effect.provide(TestLayers)))

    it.effect("returns empty results for no matches", () =>
      Effect.gen(function*() {
        const sparql = yield* SparqlService
        const rdf = yield* RdfBuilder

        const store = yield* rdf.parseTurtle(sampleTurtle)

        const result = yield* sparql.execute(
          store,
          `SELECT ?x WHERE { ?x a <http://example.org/NonExistent> }`
        )

        expect(result._tag).toBe("SelectResult")
        if (result._tag === "SelectResult") {
          expect(result.bindings.length).toBe(0)
        }
      }).pipe(Effect.provide(TestLayers)))

    it.effect("handles complex queries with OPTIONAL", () =>
      Effect.gen(function*() {
        const sparql = yield* SparqlService
        const rdf = yield* RdfBuilder

        const store = yield* rdf.parseTurtle(sampleTurtle)

        const result = yield* sparql.execute(
          store,
          `
          PREFIX schema: <http://schema.org/>
          SELECT ?name ?founder WHERE {
            ?org a schema:Organization ;
                 schema:name ?name .
            OPTIONAL { ?org schema:founder ?founder }
          }
          `
        )

        expect(result._tag).toBe("SelectResult")
        if (result._tag === "SelectResult") {
          expect(result.bindings.length).toBe(1)
          expect(result.bindings[0].get("name")?.value).toBe("Acme Corp")
          expect(result.bindings[0].get("founder")?.value).toBe("http://example.org/john")
        }
      }).pipe(Effect.provide(TestLayers)))
  })

  describe("executeSelect", () => {
    it.effect("extracts specific variables as strings", () =>
      Effect.gen(function*() {
        const sparql = yield* SparqlService
        const rdf = yield* RdfBuilder

        const store = yield* rdf.parseTurtle(sampleTurtle)

        const results = yield* sparql.executeSelect(
          store,
          `SELECT ?name WHERE { ?s <http://schema.org/name> ?name }`,
          ["name"]
        )

        expect(results.length).toBe(3)
        expect(results.map((r) => r.get("name"))).toContain("John Doe")
        expect(results.map((r) => r.get("name"))).toContain("Jane Smith")
        expect(results.map((r) => r.get("name"))).toContain("Acme Corp")
      }).pipe(Effect.provide(TestLayers)))
  })

  describe("executeAsk", () => {
    it.effect("returns boolean directly", () =>
      Effect.gen(function*() {
        const sparql = yield* SparqlService
        const rdf = yield* RdfBuilder

        const store = yield* rdf.parseTurtle(sampleTurtle)

        const exists = yield* sparql.executeAsk(
          store,
          `ASK { <http://example.org/john> a <http://schema.org/Person> }`
        )

        expect(exists).toBe(true)
      }).pipe(Effect.provide(TestLayers)))
  })

  describe("error handling", () => {
    it.effect("fails on invalid SPARQL syntax", () =>
      Effect.gen(function*() {
        const sparql = yield* SparqlService
        const rdf = yield* RdfBuilder

        const store = yield* rdf.parseTurtle(sampleTurtle)

        const result = yield* sparql.execute(
          store,
          `SELEKT ?x WERE { ?x ?y ?z }` // Invalid syntax
        ).pipe(Effect.flip) // Expect failure

        expect(result._tag).toBe("SparqlExecutionError")
      }).pipe(Effect.provide(TestLayers)))
  })
})
