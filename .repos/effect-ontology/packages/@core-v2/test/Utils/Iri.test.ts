/**
 * Tests: IRI Utilities
 *
 * Tests for IRI manipulation and local name collision detection.
 *
 * @since 2.0.0
 */

import { describe, expect, it } from "@effect/vitest"
import * as fc from "fast-check"
import type { IRI } from "../../src/Domain/Rdf/Types.js"
import {
  buildCaseInsensitiveIriMap,
  buildLocalNameToIriMap,
  buildLocalNameToIriMapSafe,
  expandLocalNameToIri,
  expandTypesToIris,
  extractLocalNameFromIri,
  iriExistsCaseInsensitive,
  normalizeIri
} from "../../src/Utils/Iri.js"

describe("IRI Utilities", () => {
  describe("extractLocalNameFromIri", () => {
    it("extracts local name from slash-separated IRI", () => {
      const iri = "http://xmlns.com/foaf/0.1/Person"
      expect(extractLocalNameFromIri(iri)).toBe("Person")
    })

    it("extracts local name from hash-separated IRI", () => {
      const iri = "http://www.w3.org/2001/XMLSchema#string"
      expect(extractLocalNameFromIri(iri)).toBe("string")
    })

    it("handles IRIs with both slash and hash (uses rightmost)", () => {
      const iri = "http://example.org/vocab#Thing"
      expect(extractLocalNameFromIri(iri)).toBe("Thing")
    })
  })

  describe("buildLocalNameToIriMapSafe", () => {
    it("builds map without collisions", () => {
      const iris: Array<IRI> = [
        "http://xmlns.com/foaf/0.1/Person" as IRI,
        "http://www.w3.org/ns/org#Organization" as IRI,
        "http://schema.org/Place" as IRI
      ]

      const result = buildLocalNameToIriMapSafe(iris)

      expect(result.hasCollisions).toBe(false)
      expect(result.collisions.size).toBe(0)
      expect(result.map.get("person")).toBe("http://xmlns.com/foaf/0.1/Person")
      expect(result.map.get("organization")).toBe("http://www.w3.org/ns/org#Organization")
      expect(result.map.get("place")).toBe("http://schema.org/Place")
    })

    it("detects local name collisions", () => {
      const iris: Array<IRI> = [
        "http://xmlns.com/foaf/0.1/member" as IRI,
        "http://www.w3.org/ns/org#member" as IRI,
        "http://schema.org/Person" as IRI
      ]

      const result = buildLocalNameToIriMapSafe(iris)

      expect(result.hasCollisions).toBe(true)
      expect(result.collisions.size).toBe(1)
      expect(result.collisions.has("member")).toBe(true)

      const memberCollisions = result.collisions.get("member")
      expect(memberCollisions).toHaveLength(2)
      expect(memberCollisions).toContain("http://xmlns.com/foaf/0.1/member")
      expect(memberCollisions).toContain("http://www.w3.org/ns/org#member")
    })

    it("last IRI wins for collisions", () => {
      const iris: Array<IRI> = [
        "http://xmlns.com/foaf/0.1/member" as IRI,
        "http://www.w3.org/ns/org#member" as IRI
      ]

      const result = buildLocalNameToIriMapSafe(iris)

      // Last one wins
      expect(result.map.get("member")).toBe("http://www.w3.org/ns/org#member")
    })

    it("detects multiple collisions", () => {
      const iris: Array<IRI> = [
        "http://xmlns.com/foaf/0.1/name" as IRI,
        "http://schema.org/name" as IRI,
        "http://xmlns.com/foaf/0.1/Person" as IRI,
        "http://schema.org/Person" as IRI
      ]

      const result = buildLocalNameToIriMapSafe(iris)

      expect(result.hasCollisions).toBe(true)
      expect(result.collisions.size).toBe(2)
      expect(result.collisions.has("name")).toBe(true)
      expect(result.collisions.has("person")).toBe(true)
    })

    it("handles empty input", () => {
      const result = buildLocalNameToIriMapSafe([])

      expect(result.hasCollisions).toBe(false)
      expect(result.collisions.size).toBe(0)
      expect(result.map.size).toBe(0)
    })
  })

  describe("buildLocalNameToIriMap (deprecated)", () => {
    it("returns map only (backwards compatibility)", () => {
      const iris: Array<IRI> = [
        "http://xmlns.com/foaf/0.1/Person" as IRI,
        "http://www.w3.org/ns/org#Organization" as IRI
      ]

      const map = buildLocalNameToIriMap(iris)

      expect(map instanceof Map).toBe(true)
      expect(map.get("person")).toBe("http://xmlns.com/foaf/0.1/Person")
    })
  })

  describe("expandLocalNameToIri", () => {
    it("expands local name to full IRI", () => {
      const iris: Array<IRI> = ["http://xmlns.com/foaf/0.1/Person" as IRI]
      const map = buildLocalNameToIriMap(iris)

      expect(expandLocalNameToIri("Person", map)).toBe("http://xmlns.com/foaf/0.1/Person")
      expect(expandLocalNameToIri("person", map)).toBe("http://xmlns.com/foaf/0.1/Person")
      expect(expandLocalNameToIri("PERSON", map)).toBe("http://xmlns.com/foaf/0.1/Person")
    })

    it("returns undefined for unknown local names", () => {
      const iris: Array<IRI> = ["http://xmlns.com/foaf/0.1/Person" as IRI]
      const map = buildLocalNameToIriMap(iris)

      expect(expandLocalNameToIri("Unknown", map)).toBeUndefined()
    })
  })

  describe("expandTypesToIris", () => {
    it("expands array of local names to IRIs", () => {
      const iris: Array<IRI> = [
        "http://xmlns.com/foaf/0.1/Person" as IRI,
        "http://www.w3.org/ns/org#Organization" as IRI
      ]
      const map = buildLocalNameToIriMap(iris)

      const result = expandTypesToIris(["Person", "Organization"], map)

      expect(result).toHaveLength(2)
      expect(result).toContain("http://xmlns.com/foaf/0.1/Person")
      expect(result).toContain("http://www.w3.org/ns/org#Organization")
    })

    it("filters out unknown local names", () => {
      const iris: Array<IRI> = ["http://xmlns.com/foaf/0.1/Person" as IRI]
      const map = buildLocalNameToIriMap(iris)

      const result = expandTypesToIris(["Person", "Unknown", "AlsoUnknown"], map)

      expect(result).toHaveLength(1)
      expect(result).toContain("http://xmlns.com/foaf/0.1/Person")
    })
  })
})

// =============================================================================
// Property Tests - Critical invariants for rock-solid IRI handling
// =============================================================================

describe("Property Tests", () => {
  // Generators for valid IRI components
  const arbLocalName = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9]*$/).filter((s) => s.length > 0 && s.length < 50)
  const arbNamespace = fc.constantFrom(
    "http://xmlns.com/foaf/0.1/",
    "http://www.w3.org/ns/org#",
    "http://schema.org/",
    "http://example.org/",
    "http://www.w3.org/2001/XMLSchema#"
  )

  const arbIri: fc.Arbitrary<IRI> = fc.tuple(arbNamespace, arbLocalName).map(([ns, local]) => `${ns}${local}` as IRI)

  describe("extractLocalNameFromIri", () => {
    it("always returns non-empty string for valid IRIs", () => {
      fc.assert(
        fc.property(arbIri, (iri) => {
          const localName = extractLocalNameFromIri(iri)
          expect(localName.length).toBeGreaterThan(0)
        }),
        { numRuns: 500 }
      )
    })

    it("is deterministic", () => {
      fc.assert(
        fc.property(arbIri, (iri) => {
          const result1 = extractLocalNameFromIri(iri)
          const result2 = extractLocalNameFromIri(iri)
          expect(result1).toBe(result2)
        }),
        { numRuns: 500 }
      )
    })
  })

  describe("buildLocalNameToIriMapSafe", () => {
    it("is deterministic - same input gives same output", () => {
      fc.assert(
        fc.property(fc.array(arbIri, { minLength: 0, maxLength: 20 }), (iris) => {
          const result1 = buildLocalNameToIriMapSafe(iris)
          const result2 = buildLocalNameToIriMapSafe(iris)

          expect(result1.hasCollisions).toBe(result2.hasCollisions)
          expect(result1.collisions.size).toBe(result2.collisions.size)
          expect(result1.map.size).toBe(result2.map.size)
        }),
        { numRuns: 200 }
      )
    })

    it("hasCollisions iff collisions.size > 0", () => {
      fc.assert(
        fc.property(fc.array(arbIri, { minLength: 0, maxLength: 20 }), (iris) => {
          const result = buildLocalNameToIriMapSafe(iris)

          if (result.hasCollisions) {
            expect(result.collisions.size).toBeGreaterThan(0)
          } else {
            expect(result.collisions.size).toBe(0)
          }
        }),
        { numRuns: 200 }
      )
    })

    it("all collision entries have at least 2 IRIs", () => {
      fc.assert(
        fc.property(fc.array(arbIri, { minLength: 0, maxLength: 20 }), (iris) => {
          const result = buildLocalNameToIriMapSafe(iris)

          for (const [, collidingIris] of result.collisions) {
            expect(collidingIris.length).toBeGreaterThanOrEqual(2)
          }
        }),
        { numRuns: 200 }
      )
    })

    it("map size equals unique local names count", () => {
      fc.assert(
        fc.property(fc.array(arbIri, { minLength: 0, maxLength: 20 }), (iris) => {
          const result = buildLocalNameToIriMapSafe(iris)
          const uniqueLocalNames = new Set(iris.map((iri) => extractLocalNameFromIri(iri).toLowerCase()))

          expect(result.map.size).toBe(uniqueLocalNames.size)
        }),
        { numRuns: 200 }
      )
    })
  })

  describe("case insensitivity", () => {
    it("normalizeIri is case-insensitive", () => {
      fc.assert(
        fc.property(arbIri, (iri) => {
          const map = buildCaseInsensitiveIriMap([iri])

          // Lower, upper, and mixed case lookups should all work
          const lower = normalizeIri(iri.toLowerCase(), map)
          const upper = normalizeIri(iri.toUpperCase(), map)

          expect(lower).toBe(iri)
          expect(upper).toBe(iri)
        }),
        { numRuns: 300 }
      )
    })

    it("iriExistsCaseInsensitive works regardless of case", () => {
      fc.assert(
        fc.property(arbIri, (iri) => {
          const map = buildCaseInsensitiveIriMap([iri])

          expect(iriExistsCaseInsensitive(iri.toLowerCase(), map)).toBe(true)
          expect(iriExistsCaseInsensitive(iri.toUpperCase(), map)).toBe(true)
          expect(iriExistsCaseInsensitive(iri, map)).toBe(true)
        }),
        { numRuns: 300 }
      )
    })

    it("expandLocalNameToIri is case-insensitive", () => {
      fc.assert(
        fc.property(arbIri, (iri) => {
          const map = buildLocalNameToIriMap([iri])
          const localName = extractLocalNameFromIri(iri)

          const lower = expandLocalNameToIri(localName.toLowerCase(), map)
          const upper = expandLocalNameToIri(localName.toUpperCase(), map)

          expect(lower).toBe(iri)
          expect(upper).toBe(iri)
        }),
        { numRuns: 300 }
      )
    })
  })

  describe("roundtrip properties", () => {
    it("extract then expand returns original IRI (no collisions)", () => {
      // Use distinct local names to avoid collisions
      const distinctIris = fc
        .array(arbLocalName, { minLength: 1, maxLength: 10 })
        .map((names) => [...new Set(names)]) // Remove duplicates
        .map((names) => names.map((name) => `http://example.org/${name}` as IRI))

      fc.assert(
        fc.property(distinctIris, (iris) => {
          const result = buildLocalNameToIriMapSafe(iris)

          // Only test if no collisions
          if (!result.hasCollisions) {
            for (const iri of iris) {
              const localName = extractLocalNameFromIri(iri)
              const expanded = expandLocalNameToIri(localName, result.map)
              expect(expanded).toBe(iri)
            }
          }
        }),
        { numRuns: 200 }
      )
    })
  })

  describe("expandTypesToIris", () => {
    it("never returns more items than input", () => {
      fc.assert(
        fc.property(
          fc.array(arbIri, { minLength: 0, maxLength: 10 }),
          fc.array(arbLocalName, { minLength: 0, maxLength: 20 }),
          (iris, localNames) => {
            const map = buildLocalNameToIriMap(iris)
            const result = expandTypesToIris(localNames, map)

            expect(result.length).toBeLessThanOrEqual(localNames.length)
          }
        ),
        { numRuns: 200 }
      )
    })

    it("all expanded IRIs are valid (exist in original set or were added)", () => {
      fc.assert(
        fc.property(fc.array(arbIri, { minLength: 1, maxLength: 10 }), (iris) => {
          const map = buildLocalNameToIriMap(iris)
          const localNames = iris.map((iri) => extractLocalNameFromIri(iri))
          const result = expandTypesToIris(localNames, map)

          // All results should be in our original iris
          for (const expanded of result) {
            expect(iris).toContain(expanded)
          }
        }),
        { numRuns: 200 }
      )
    })
  })
})
