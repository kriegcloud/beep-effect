/**
 * Tests for Entity Resolution Domain Model
 *
 * @since 2.0.0
 * @module test/Domain/EntityResolution
 */

import { Effect, Schema } from "effect"
import { describe, expect, it } from "vitest"

import {
  EREdge,
  ERNode,
  MentionRecord,
  RelationEdge,
  ResolutionEdge,
  ResolvedEntity
} from "../../src/Domain/Model/EntityResolution.js"
import { EntityId } from "../../src/Domain/Model/shared.js"

describe("MentionRecord", () => {
  it("should create a valid MentionRecord", () =>
    Effect.gen(function*() {
      const record = new MentionRecord({
        _tag: "MentionRecord",
        id: EntityId("cristiano_ronaldo"),
        mention: "Cristiano Ronaldo",
        types: ["http://schema.org/Person", "http://schema.org/Athlete"],
        attributes: {
          "http://schema.org/birthDate": "1985-02-05",
          "http://schema.org/nationality": "Portuguese"
        },
        chunkIndex: 0,
        confidence: 0.95
      })

      expect(record._tag).toBe("MentionRecord")
      expect(record.id).toBe("cristiano_ronaldo")
      expect(record.mention).toBe("Cristiano Ronaldo")
      expect(record.types).toEqual(["http://schema.org/Person", "http://schema.org/Athlete"])
      expect(record.chunkIndex).toBe(0)
      expect(record.confidence).toBe(0.95)
    }).pipe(Effect.runPromise))

  it("should preserve chunkIndex provenance", () =>
    Effect.gen(function*() {
      const chunk0 = new MentionRecord({
        _tag: "MentionRecord",
        id: EntityId("arsenal_1"),
        mention: "Arsenal",
        types: ["http://schema.org/SportsTeam"],
        attributes: {},
        chunkIndex: 0
      })

      const chunk2 = new MentionRecord({
        _tag: "MentionRecord",
        id: EntityId("arsenal_2"),
        mention: "The Gunners",
        types: ["http://schema.org/SportsTeam"],
        attributes: {},
        chunkIndex: 2
      })

      expect(chunk0.chunkIndex).toBe(0)
      expect(chunk2.chunkIndex).toBe(2)
    }).pipe(Effect.runPromise))

  it("should serialize and deserialize correctly", () =>
    Effect.gen(function*() {
      const original = new MentionRecord({
        _tag: "MentionRecord",
        id: EntityId("test_entity"),
        mention: "Test Entity",
        types: ["http://example.org/Type"],
        attributes: { "http://example.org/prop": "value" },
        chunkIndex: 5,
        confidence: 0.8
      })

      // Round-trip through JSON
      const encoded = yield* Schema.encode(MentionRecord)(original)
      const decoded = yield* Schema.decode(MentionRecord)(encoded)

      expect(decoded.id).toBe(original.id)
      expect(decoded.mention).toBe(original.mention)
      expect(decoded.types).toEqual(original.types)
      expect(decoded.chunkIndex).toBe(original.chunkIndex)
      expect(decoded.confidence).toBe(original.confidence)
    }).pipe(Effect.runPromise))

  it("should allow optional confidence", () =>
    Effect.gen(function*() {
      const record = new MentionRecord({
        _tag: "MentionRecord",
        id: EntityId("entity_without_confidence"),
        mention: "Entity",
        types: ["http://example.org/Type"],
        attributes: {},
        chunkIndex: 0
      })

      expect(record.confidence).toBeUndefined()
    }).pipe(Effect.runPromise))
})

describe("ResolvedEntity", () => {
  it("should create a valid ResolvedEntity", () =>
    Effect.gen(function*() {
      const entity = new ResolvedEntity({
        _tag: "ResolvedEntity",
        canonicalId: EntityId("arsenal_fc"),
        mention: "Arsenal Football Club",
        types: ["http://schema.org/SportsTeam"],
        attributes: {
          "http://schema.org/foundingDate": "1886"
        },
        externalIds: {
          wikidata: "Q9617",
          dbpedia: "Arsenal_F.C."
        }
      })

      expect(entity._tag).toBe("ResolvedEntity")
      expect(entity.canonicalId).toBe("arsenal_fc")
      expect(entity.mention).toBe("Arsenal Football Club")
      expect(entity.types).toEqual(["http://schema.org/SportsTeam"])
      expect(entity.externalIds).toEqual({
        wikidata: "Q9617",
        dbpedia: "Arsenal_F.C."
      })
    }).pipe(Effect.runPromise))

  it("should have optional externalIds field", () =>
    Effect.gen(function*() {
      const entity = new ResolvedEntity({
        _tag: "ResolvedEntity",
        canonicalId: EntityId("local_entity"),
        mention: "Local Entity",
        types: ["http://example.org/Type"],
        attributes: {}
      })

      expect(entity.externalIds).toBeUndefined()
    }).pipe(Effect.runPromise))

  it("should serialize and deserialize correctly", () =>
    Effect.gen(function*() {
      const original = new ResolvedEntity({
        _tag: "ResolvedEntity",
        canonicalId: EntityId("canonical_test"),
        mention: "Canonical Test",
        types: ["http://example.org/TypeA", "http://example.org/TypeB"],
        attributes: { "http://example.org/attr": 42 },
        externalIds: { wikidata: "Q12345" }
      })

      // Round-trip
      const encoded = yield* Schema.encode(ResolvedEntity)(original)
      const decoded = yield* Schema.decode(ResolvedEntity)(encoded)

      expect(decoded.canonicalId).toBe(original.canonicalId)
      expect(decoded.mention).toBe(original.mention)
      expect(decoded.types).toEqual(original.types)
      expect(decoded.externalIds).toEqual(original.externalIds)
    }).pipe(Effect.runPromise))
})

describe("ERNode union", () => {
  it("should discriminate on _tag", () =>
    Effect.gen(function*() {
      const mention = new MentionRecord({
        _tag: "MentionRecord",
        id: EntityId("m1"),
        mention: "Test",
        types: ["http://example.org/Type"],
        attributes: {},
        chunkIndex: 0
      })

      const resolved = new ResolvedEntity({
        _tag: "ResolvedEntity",
        canonicalId: EntityId("c1"),
        mention: "Test",
        types: ["http://example.org/Type"],
        attributes: {}
      })

      // Type discrimination
      const isMention = (node: typeof ERNode.Type): node is MentionRecord => node._tag === "MentionRecord"

      expect(isMention(mention)).toBe(true)
      expect(isMention(resolved)).toBe(false)
    }).pipe(Effect.runPromise))

  it("should decode both node types via union schema", () =>
    Effect.gen(function*() {
      const mentionData = {
        _tag: "MentionRecord" as const,
        id: "m1",
        mention: "Mention",
        types: ["http://example.org/Type"],
        attributes: {},
        chunkIndex: 1
      }

      const resolvedData = {
        _tag: "ResolvedEntity" as const,
        canonicalId: "r1",
        mention: "Resolved",
        types: ["http://example.org/Type"],
        attributes: {}
      }

      const decodedMention = yield* Schema.decode(ERNode)(mentionData)
      const decodedResolved = yield* Schema.decode(ERNode)(resolvedData)

      expect(decodedMention._tag).toBe("MentionRecord")
      expect(decodedResolved._tag).toBe("ResolvedEntity")
    }).pipe(Effect.runPromise))
})

describe("ResolutionEdge", () => {
  it("should create a valid ResolutionEdge", () =>
    Effect.gen(function*() {
      const edge = new ResolutionEdge({
        _tag: "ResolutionEdge",
        confidence: 0.95,
        method: "similarity"
      })

      expect(edge._tag).toBe("ResolutionEdge")
      expect(edge.confidence).toBe(0.95)
      expect(edge.method).toBe("similarity")
    }).pipe(Effect.runPromise))

  it("should constrain confidence to [0, 1]", () =>
    Effect.gen(function*() {
      // Valid edge at boundary
      const edge = new ResolutionEdge({
        _tag: "ResolutionEdge",
        confidence: 1.0,
        method: "exact"
      })
      expect(edge.confidence).toBe(1.0)

      // Invalid confidence should fail decode
      const invalidResult = yield* Schema.decode(ResolutionEdge)({
        _tag: "ResolutionEdge",
        confidence: 1.5, // Invalid
        method: "similarity"
      }).pipe(Effect.either)

      expect(invalidResult._tag).toBe("Left")
    }).pipe(Effect.runPromise))

  it("should validate method literals", () =>
    Effect.gen(function*() {
      const methods = ["exact", "similarity", "containment", "neighbor"] as const

      for (const method of methods) {
        const edge = new ResolutionEdge({
          _tag: "ResolutionEdge",
          confidence: 0.8,
          method
        })
        expect(edge.method).toBe(method)
      }
    }).pipe(Effect.runPromise))
})

describe("RelationEdge", () => {
  it("should create a valid RelationEdge", () =>
    Effect.gen(function*() {
      const edge = new RelationEdge({
        _tag: "RelationEdge",
        predicate: "http://schema.org/memberOf",
        grounded: true,
        confidence: 0.9
      })

      expect(edge._tag).toBe("RelationEdge")
      expect(edge.predicate).toBe("http://schema.org/memberOf")
      expect(edge.grounded).toBe(true)
      expect(edge.confidence).toBe(0.9)
    }).pipe(Effect.runPromise))

  it("should have optional confidence", () =>
    Effect.gen(function*() {
      const edge = new RelationEdge({
        _tag: "RelationEdge",
        predicate: "http://schema.org/knows",
        grounded: false
      })

      expect(edge.confidence).toBeUndefined()
    }).pipe(Effect.runPromise))
})

describe("EREdge union", () => {
  it("should discriminate edge types on _tag", () =>
    Effect.gen(function*() {
      const resolution = new ResolutionEdge({
        _tag: "ResolutionEdge",
        confidence: 1.0,
        method: "exact"
      })

      const relation = new RelationEdge({
        _tag: "RelationEdge",
        predicate: "http://schema.org/knows",
        grounded: false
      })

      const isResolution = (edge: typeof EREdge.Type): edge is ResolutionEdge => edge._tag === "ResolutionEdge"

      expect(isResolution(resolution)).toBe(true)
      expect(isResolution(relation)).toBe(false)
    }).pipe(Effect.runPromise))

  it("should decode both edge types via union schema", () =>
    Effect.gen(function*() {
      const resolutionData = {
        _tag: "ResolutionEdge" as const,
        confidence: 0.85,
        method: "similarity" as const
      }

      const relationData = {
        _tag: "RelationEdge" as const,
        predicate: "http://example.org/relatedTo",
        grounded: true
      }

      const decodedResolution = yield* Schema.decode(EREdge)(resolutionData)
      const decodedRelation = yield* Schema.decode(EREdge)(relationData)

      expect(decodedResolution._tag).toBe("ResolutionEdge")
      expect(decodedRelation._tag).toBe("RelationEdge")
    }).pipe(Effect.runPromise))
})
