/**
 * Test: Namespace to IRI conversion
 *
 * Verifies that targetNamespace (simple identifier) is correctly converted
 * to a full baseNamespace (IRI) before being used in entity IRI construction.
 *
 * @since 2.0.0
 */

import { describe, expect, it } from "@effect/vitest"
import { Chunk, ConfigProvider, Effect, Layer } from "effect"
import { Entity } from "../../src/Domain/Model/Entity.js"
import { EntityId } from "../../src/Domain/Model/shared.js"
import { ConfigService, ConfigServiceDefault } from "../../src/Service/Config.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { buildIri } from "../../src/Utils/Rdf.js"

// Test config provider with known baseNamespace
const TestConfigProvider = ConfigProvider.fromMap(
  new Map([
    ["RDF.BASE_NAMESPACE", "http://example.org/kg/"],
    ["ONTOLOGY.PATH", "test.ttl"],
    ["LLM.API_KEY", "test-key"]
  ])
)

const TestLayer = RdfBuilder.Default.pipe(
  Layer.provideMerge(ConfigServiceDefault),
  Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
)

describe("Namespace to IRI conversion", () => {
  it.effect("should convert namespace identifier to full IRI when building entity IRIs", () =>
    Effect.gen(function*() {
      const config = yield* ConfigService
      const rdf = yield* RdfBuilder

      // Simulate what happens in OntologyAgent/RdfBuilder
      const targetNamespace = "seattle" // This is a Namespace identifier, not a full IRI

      // OLD BUGGY BEHAVIOR (just concatenate):
      // const baseNamespace = targetNamespace // "seattle"
      // buildIri(baseNamespace, "alex_pedersen") => "seattlealex_pedersen" ❌ INVALID IRI

      // FIXED BEHAVIOR (convert to full IRI):
      const match = config.rdf.baseNamespace.match(/^https?:\/\/[^/]+\//)
      const baseDomain = match ? match[0] : "http://example.org/"
      const baseNamespace = `${baseDomain}${targetNamespace}/`
      // "http://example.org/kg/" => extract "http://example.org/" + "seattle/" => "http://example.org/seattle/"

      // Now buildIri should work correctly
      const entityIri = buildIri(baseNamespace, "alex_pedersen")

      // Verify it's a valid IRI with proper structure
      expect(entityIri).toBe("http://example.org/seattle/alex_pedersen")

      // Verify it passes IRI schema validation (no throw)
      expect(() => buildIri(baseNamespace, "alex_pedersen")).not.toThrow()

      // Verify we can add entities to RDF store with this namespace
      const entity = new Entity({
        id: EntityId("alex_pedersen"),
        mention: "Alex Pedersen",
        types: ["http://schema.org/Person"],
        attributes: {}
      })

      const store = yield* rdf.createStore
      yield* rdf.addEntities(store, [entity], { targetNamespace })

      // Query to verify entity was added with correct IRI
      const quads = yield* rdf.queryStore(store, {})
      const quadsArray = Chunk.toReadonlyArray(quads)
      expect(quadsArray.length).toBeGreaterThan(0)

      // Verify at least one quad has the correct subject IRI
      const hasCorrectSubject = quadsArray.some((q) => q.subject === "http://example.org/seattle/alex_pedersen")
      expect(hasCorrectSubject).toBe(true)
    }).pipe(Effect.provide(TestLayer)))

  it.effect("should extract protocol and domain from baseNamespace", () =>
    Effect.gen(function*() {
      // Test that the regex correctly extracts protocol://domain/
      const testCases = [
        { input: "http://example.org/kg/", expected: "http://example.org/" },
        { input: "http://example.org/", expected: "http://example.org/" },
        { input: "https://api.example.com/v1/", expected: "https://api.example.com/" },
        { input: "http://example.org/foo/bar/baz/", expected: "http://example.org/" }
      ]

      for (const { expected, input } of testCases) {
        const match = input.match(/^https?:\/\/[^/]+\//)
        const result = match ? match[0] : ""
        expect(result).toBe(expected)
      }

      // Now test full namespace construction
      const baseNamespace = "http://example.org/kg/"
      const targetNamespace = "seattle"
      const match = baseNamespace.match(/^https?:\/\/[^/]+\//)
      const baseDomain = match ? match[0] : "http://example.org/"
      const fullIri = `${baseDomain}${targetNamespace}/`
      expect(fullIri).toBe("http://example.org/seattle/")
    }))

  it.effect("should build valid IRIs for entities when using targetNamespace", () =>
    Effect.gen(function*() {
      const config = yield* ConfigService

      const targetNamespace = "seattle"
      const match = config.rdf.baseNamespace.match(/^https?:\/\/[^/]+\//)
      const baseDomain = match ? match[0] : "http://example.org/"
      const baseNamespace = `${baseDomain}${targetNamespace}/`

      const testEntityIds = [
        "alex_pedersen",
        "seattle_city_council",
        "district_4",
        "mayor"
      ]

      for (const entityId of testEntityIds) {
        const iri = buildIri(baseNamespace, entityId)
        expect(iri).toMatch(/^http:\/\/example\.org\/seattle\/[a-z][a-z0-9_]*$/)
      }
    }).pipe(Effect.provide(TestLayer)))
})
