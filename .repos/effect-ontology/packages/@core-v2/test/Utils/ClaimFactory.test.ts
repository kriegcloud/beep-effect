/**
 * ClaimFactory Tests
 *
 * Tests for converting Entity/Relation to Claims
 *
 * @since 2.0.0
 */

import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { Entity, Relation } from "../../src/Domain/Model/Entity.js"
import { EntityId } from "../../src/Domain/Model/shared.js"
import {
  checkIriCollisions,
  claimDataToQuads,
  type ClaimFactoryOptions,
  detectIriCollisions,
  entityToClaims,
  generateClaimId,
  knowledgeGraphToClaims,
  relationToClaim
} from "../../src/Utils/ClaimFactory.js"

describe("ClaimFactory", () => {
  const baseOptions: ClaimFactoryOptions = {
    baseNamespace: "http://example.org/",
    documentId: "doc-123abc",
    ontologyId: "test-ontology",
    defaultConfidence: 0.85
  }

  describe("generateClaimId", () => {
    it("generates deterministic IDs", () => {
      const id1 = generateClaimId(
        "http://example.org/person/alice",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        "http://schema.org/Person",
        "doc-123"
      )
      const id2 = generateClaimId(
        "http://example.org/person/alice",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        "http://schema.org/Person",
        "doc-123"
      )
      expect(id1).toBe(id2)
    })

    it("generates different IDs for different content", () => {
      const id1 = generateClaimId(
        "http://example.org/person/alice",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        "http://schema.org/Person",
        "doc-123"
      )
      const id2 = generateClaimId(
        "http://example.org/person/bob",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
        "http://schema.org/Person",
        "doc-123"
      )
      expect(id1).not.toBe(id2)
    })

    it("produces valid ClaimId format", () => {
      const id = generateClaimId("subject", "predicate", "object", "doc")
      expect(id).toMatch(/^claim-[a-f0-9]{12}$/)
    })
  })

  describe("entityToClaims", () => {
    it("creates type claims for each entity type", () => {
      const entity = new Entity({
        id: EntityId("alice"),
        mention: "Alice",
        types: ["http://schema.org/Person", "http://schema.org/Employee"],
        attributes: {}
      })

      const claims = entityToClaims(entity, baseOptions)

      const typeClaims = claims.filter(
        (c) => c.predicateIri === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
      )
      expect(typeClaims).toHaveLength(2)
      expect(typeClaims[0].subjectIri).toBe("http://example.org/alice")
      expect(typeClaims[0].objectValue).toBe("http://schema.org/Person")
      expect(typeClaims[0].objectType).toBe("iri")
      expect(typeClaims[1].objectValue).toBe("http://schema.org/Employee")
    })

    it("creates attribute claims", () => {
      const entity = new Entity({
        id: EntityId("alice"),
        mention: "Alice",
        types: ["http://schema.org/Person"],
        attributes: {
          "http://schema.org/name": "Alice Smith",
          "http://schema.org/age": 30
        }
      })

      const claims = entityToClaims(entity, baseOptions)

      const nameClaim = claims.find((c) => c.predicateIri === "http://schema.org/name")
      expect(nameClaim).toBeDefined()
      expect(nameClaim!.objectValue).toBe("Alice Smith")
      expect(nameClaim!.objectType).toBe("literal")

      const ageClaim = claims.find((c) => c.predicateIri === "http://schema.org/age")
      expect(ageClaim).toBeDefined()
      expect(ageClaim!.objectValue).toBe("30")
    })

    it("uses evidence from entity mentions", () => {
      const entity = new Entity({
        id: EntityId("alice"),
        mention: "Alice",
        types: ["http://schema.org/Person"],
        attributes: {},
        mentions: [
          { text: "Alice Smith", startChar: 10, endChar: 21, confidence: 0.95 }
        ]
      })

      const claims = entityToClaims(entity, baseOptions)

      expect(claims[0].evidence).toBeDefined()
      expect(claims[0].evidence!.text).toBe("Alice Smith")
      expect(claims[0].evidence!.startOffset).toBe(10)
      expect(claims[0].evidence!.endOffset).toBe(21)
      expect(claims[0].confidence).toBe(0.95)
    })

    it("sets articleId correctly", () => {
      const entity = new Entity({
        id: EntityId("alice"),
        mention: "Alice",
        types: ["http://schema.org/Person"],
        attributes: {}
      })

      const claims = entityToClaims(entity, baseOptions)

      expect(claims[0].articleId).toBe("doc-123abc")
    })
  })

  describe("relationToClaim", () => {
    it("creates claim for entity reference relation", () => {
      const relation = new Relation({
        subjectId: "alice",
        predicate: "http://schema.org/knows",
        object: "bob"
      })

      const claim = relationToClaim(relation, baseOptions)

      expect(claim.subjectIri).toBe("http://example.org/alice")
      expect(claim.predicateIri).toBe("http://schema.org/knows")
      expect(claim.objectValue).toBe("http://example.org/bob")
      expect(claim.objectType).toBe("iri")
    })

    it("creates claim for literal relation", () => {
      const relation = new Relation({
        subjectId: "alice",
        predicate: "http://schema.org/birthDate",
        object: "1990-01-01"
      })

      const claim = relationToClaim(relation, baseOptions)

      expect(claim.objectValue).toBe("1990-01-01")
      expect(claim.objectType).toBe("literal")
    })

    it("uses evidence from relation", () => {
      const relation = new Relation({
        subjectId: "alice",
        predicate: "http://schema.org/knows",
        object: "bob",
        evidence: { text: "Alice knows Bob", startChar: 50, endChar: 65, confidence: 0.9 }
      })

      const claim = relationToClaim(relation, baseOptions)

      expect(claim.evidence).toBeDefined()
      expect(claim.evidence!.text).toBe("Alice knows Bob")
      expect(claim.confidence).toBe(0.9)
    })
  })

  describe("knowledgeGraphToClaims", () => {
    it("creates claims from both entities and relations", () => {
      const entities = [
        new Entity({
          id: EntityId("alice"),
          mention: "Alice",
          types: ["http://schema.org/Person"],
          attributes: {}
        }),
        new Entity({
          id: EntityId("bob"),
          mention: "Bob",
          types: ["http://schema.org/Person"],
          attributes: {}
        })
      ]

      const relations = [
        new Relation({
          subjectId: "alice",
          predicate: "http://schema.org/knows",
          object: "bob"
        })
      ]

      const claims = knowledgeGraphToClaims(entities, relations, baseOptions)

      // 2 entities × 1 type each = 2 type claims + 1 relation claim = 3 total
      expect(claims).toHaveLength(3)

      const typeClaims = claims.filter(
        (c) => c.predicateIri === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
      )
      expect(typeClaims).toHaveLength(2)

      const relationClaims = claims.filter(
        (c) => c.predicateIri === "http://schema.org/knows"
      )
      expect(relationClaims).toHaveLength(1)
    })
  })

  describe("claimDataToQuads", () => {
    it("generates reified RDF quads", () => {
      const entity = new Entity({
        id: EntityId("alice"),
        mention: "Alice",
        types: ["http://schema.org/Person"],
        attributes: {}
      })

      const claims = entityToClaims(entity, baseOptions)
      const quads = claimDataToQuads(claims[0], "http://example.org/graph")

      // Should have quads for: type, subject, predicate, object, rank, confidence, statedIn
      expect(quads.length).toBeGreaterThanOrEqual(7)

      // Check claim type
      const typeQuad = quads.find(
        (q) => q.predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
      )
      expect(typeQuad).toBeDefined()

      // Check rdf:subject
      const subjectQuad = quads.find(
        (q) => q.predicate === "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject"
      )
      expect(subjectQuad).toBeDefined()
      expect(subjectQuad!.object).toBe("http://example.org/alice")
    })

    it("includes graph URI in all quads", () => {
      const entity = new Entity({
        id: EntityId("alice"),
        mention: "Alice",
        types: ["http://schema.org/Person"],
        attributes: {}
      })

      const claims = entityToClaims(entity, baseOptions)
      const quads = claimDataToQuads(claims[0], "http://example.org/graph")

      for (const quad of quads) {
        expect(quad.graph).toBe("http://example.org/graph")
      }
    })

    it("includes evidence quads when present", () => {
      const entity = new Entity({
        id: EntityId("alice"),
        mention: "Alice",
        types: ["http://schema.org/Person"],
        attributes: {},
        mentions: [{ text: "Alice", startChar: 0, endChar: 5 }]
      })

      const claims = entityToClaims(entity, baseOptions)
      const quads = claimDataToQuads(claims[0])

      // Should have evidence-related quads
      const evidenceQuads = quads.filter(
        (q) => String(q.subject).includes("/evidence") || String(q.object).includes("/evidence")
      )
      expect(evidenceQuads.length).toBeGreaterThan(0)
    })
  })

  describe("detectIriCollisions", () => {
    it("returns no collisions for unique entities", () => {
      const entities = [
        new Entity({
          id: EntityId("alice"),
          mention: "Alice",
          types: ["http://schema.org/Person"],
          attributes: {}
        }),
        new Entity({
          id: EntityId("bob"),
          mention: "Bob",
          types: ["http://schema.org/Person"],
          attributes: {}
        })
      ]

      const report = detectIriCollisions(entities, "http://example.org/")

      expect(report.hasCollisions).toBe(false)
      expect(report.collisions).toHaveLength(0)
      expect(report.totalEntities).toBe(2)
      expect(report.uniqueEntities).toBe(2)
    })

    it("detects collision when same ID has different mentions", () => {
      const entities = [
        new Entity({
          id: EntityId("john_smith"),
          mention: "John Smith",
          types: ["http://schema.org/Person"],
          attributes: {},
          documentId: "doc-1"
        }),
        new Entity({
          id: EntityId("john_smith"),
          mention: "J. Smith", // Different mention
          types: ["http://schema.org/Person"],
          attributes: {},
          documentId: "doc-2"
        })
      ]

      const report = detectIriCollisions(entities, "http://example.org/")

      expect(report.hasCollisions).toBe(true)
      expect(report.collisions).toHaveLength(1)
      expect(report.collisions[0].entityId).toBe("john_smith")
      expect(report.collisions[0].iri).toBe("http://example.org/john_smith")
      expect(report.collisions[0].entities).toHaveLength(2)
      expect(report.collisions[0].entities[0].mention).toBe("John Smith")
      expect(report.collisions[0].entities[1].mention).toBe("J. Smith")
    })

    it("detects collision when same ID has different types", () => {
      const entities = [
        new Entity({
          id: EntityId("apple"),
          mention: "Apple",
          types: ["http://schema.org/Organization"],
          attributes: {}
        }),
        new Entity({
          id: EntityId("apple"),
          mention: "Apple",
          types: ["http://schema.org/Product"], // Different type
          attributes: {}
        })
      ]

      const report = detectIriCollisions(entities, "http://example.org/")

      expect(report.hasCollisions).toBe(true)
      expect(report.collisions).toHaveLength(1)
      expect(report.collisions[0].entityId).toBe("apple")
    })

    it("ignores duplicate entities with identical content", () => {
      // Same ID with same content should NOT be flagged as collision
      const entities = [
        new Entity({
          id: EntityId("alice"),
          mention: "Alice",
          types: ["http://schema.org/Person"],
          attributes: {}
        }),
        new Entity({
          id: EntityId("alice"),
          mention: "Alice", // Same mention
          types: ["http://schema.org/Person"], // Same types
          attributes: {}
        })
      ]

      const report = detectIriCollisions(entities, "http://example.org/")

      expect(report.hasCollisions).toBe(false)
      expect(report.totalEntities).toBe(2)
      expect(report.uniqueEntities).toBe(1)
    })

    it("handles multiple collisions in batch", () => {
      const entities = [
        new Entity({
          id: EntityId("john_smith"),
          mention: "John Smith",
          types: ["http://schema.org/Person"],
          attributes: {}
        }),
        new Entity({
          id: EntityId("john_smith"),
          mention: "Dr. John Smith",
          types: ["http://schema.org/Person"],
          attributes: {}
        }),
        new Entity({
          id: EntityId("washington"),
          mention: "Washington",
          types: ["http://schema.org/City"],
          attributes: {}
        }),
        new Entity({
          id: EntityId("washington"),
          mention: "Washington",
          types: ["http://schema.org/Person"], // George Washington
          attributes: {}
        })
      ]

      const report = detectIriCollisions(entities, "http://example.org/")

      expect(report.hasCollisions).toBe(true)
      expect(report.collisions).toHaveLength(2)
      expect(report.uniqueEntities).toBe(2)
    })
  })

  describe("checkIriCollisions", () => {
    it.effect("logs warnings for collisions but returns entities", () =>
      Effect.gen(function*() {
        const entities = [
          new Entity({
            id: EntityId("john_smith"),
            mention: "John Smith",
            types: ["http://schema.org/Person"],
            attributes: {}
          }),
          new Entity({
            id: EntityId("john_smith"),
            mention: "J. Smith",
            types: ["http://schema.org/Person"],
            attributes: {}
          })
        ]

        const result = yield* checkIriCollisions(entities, "http://example.org/")

        // Should return all entities despite collision
        expect(result).toHaveLength(2)
      }))

    it.effect("returns entities unchanged when no collisions", () =>
      Effect.gen(function*() {
        const entities = [
          new Entity({
            id: EntityId("alice"),
            mention: "Alice",
            types: ["http://schema.org/Person"],
            attributes: {}
          })
        ]

        const result = yield* checkIriCollisions(entities, "http://example.org/")

        expect(result).toHaveLength(1)
        expect(result[0].id).toBe("alice")
      }))
  })
})
