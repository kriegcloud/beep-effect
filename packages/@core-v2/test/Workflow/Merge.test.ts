/**
 * Tests for Graph Merge Utilities
 *
 * Tests Relation deduplication using structural equality and hashing.
 *
 * @module test/Workflow/Merge
 */

import { Equal, Hash, HashSet } from "effect"
import { describe, expect, it } from "vitest"
import { Entity, KnowledgeGraph, Relation } from "../../src/Domain/Model/Entity.js"
import { EntityId } from "../../src/Domain/Model/shared.js"
import { mergeGraphs, mergeGraphsWithConflicts } from "../../src/Workflow/Merge.js"

describe("Relation Structural Equality", () => {
  describe("Equal.equals", () => {
    it("should return true for identical Relation instances", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })

      expect(Equal.equals(r1, r2)).toBe(true)
    })

    it("should return false for Relations with different subjectId", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
      const r2 = new Relation({
        subjectId: "entity_c",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })

      expect(Equal.equals(r1, r2)).toBe(false)
    })

    it("should return false for Relations with different predicate", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/knows",
        object: "entity_b"
      })

      expect(Equal.equals(r1, r2)).toBe(false)
    })

    it("should return false for Relations with different object", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_c"
      })

      expect(Equal.equals(r1, r2)).toBe(false)
    })

    it("should handle string literal objects", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/birthDate",
        object: "1985-02-05"
      })
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/birthDate",
        object: "1985-02-05"
      })
      const r3 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/birthDate",
        object: "1986-02-05"
      })

      expect(Equal.equals(r1, r2)).toBe(true)
      expect(Equal.equals(r1, r3)).toBe(false)
    })

    it("should handle number literal objects", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/age",
        object: 39
      })
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/age",
        object: 39
      })
      const r3 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/age",
        object: 40
      })

      expect(Equal.equals(r1, r2)).toBe(true)
      expect(Equal.equals(r1, r3)).toBe(false)
    })

    it("should handle boolean literal objects", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/active",
        object: true
      })
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/active",
        object: true
      })
      const r3 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/active",
        object: false
      })

      expect(Equal.equals(r1, r2)).toBe(true)
      expect(Equal.equals(r1, r3)).toBe(false)
    })

    it("should distinguish between entity reference and string literal", () => {
      // Entity reference (snake_case)
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
      // String literal (not snake_case)
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "Entity B"
      })

      expect(Equal.equals(r1, r2)).toBe(false)
    })
  })

  describe("Hash consistency", () => {
    it("should produce same hash for identical Relation instances", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })

      expect(Hash.hash(r1)).toBe(Hash.hash(r2))
    })

    it("should produce different hashes for different Relations", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
      const r2 = new Relation({
        subjectId: "entity_c",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
      const r3 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/knows",
        object: "entity_b"
      })
      const r4 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_d"
      })

      expect(Hash.hash(r1)).not.toBe(Hash.hash(r2))
      expect(Hash.hash(r1)).not.toBe(Hash.hash(r3))
      expect(Hash.hash(r1)).not.toBe(Hash.hash(r4))
    })

    it("should handle different object types in hash", () => {
      const r1 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/value",
        object: "string"
      })
      const r2 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/value",
        object: 42
      })
      const r3 = new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/value",
        object: true
      })

      expect(Hash.hash(r1)).not.toBe(Hash.hash(r2))
      expect(Hash.hash(r1)).not.toBe(Hash.hash(r3))
      expect(Hash.hash(r2)).not.toBe(Hash.hash(r3))
    })
  })
})

describe("HashSet Deduplication", () => {
  it("should deduplicate identical Relation instances from different chunks", () => {
    const r1 = new Relation({
      subjectId: "entity_a",
      predicate: "http://schema.org/memberOf",
      object: "entity_b"
    })
    const r2 = new Relation({
      subjectId: "entity_a",
      predicate: "http://schema.org/memberOf",
      object: "entity_b"
    })

    const set = HashSet.fromIterable([r1, r2])
    const values = HashSet.toValues(set)

    expect(values.length).toBe(1)
    expect(Equal.equals(values[0]!, r1)).toBe(true)
  })

  it("should preserve distinct Relations in HashSet", () => {
    const relations = [
      new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      }),
      new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/knows",
        object: "entity_b"
      }),
      new Relation({
        subjectId: "entity_c",
        predicate: "http://schema.org/memberOf",
        object: "entity_b"
      })
    ]

    const set = HashSet.fromIterable(relations)
    const values = HashSet.toValues(set)

    expect(values.length).toBe(3)
  })

  it("should deduplicate Relations with string, number, and boolean objects", () => {
    const relations = [
      new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/birthDate",
        object: "1985-02-05"
      }),
      new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/birthDate",
        object: "1985-02-05" // Duplicate
      }),
      new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/age",
        object: 39
      }),
      new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/age",
        object: 39 // Duplicate
      }),
      new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/active",
        object: true
      }),
      new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/active",
        object: true // Duplicate
      })
    ]

    const set = HashSet.fromIterable(relations)
    const values = HashSet.toValues(set)

    expect(values.length).toBe(3)
  })
})

describe("mergeGraphs", () => {
  it("should deduplicate identical relations from different chunks", () => {
    const relation1 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/memberOf",
      object: "al_nassr_fc"
    })
    const relation2 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/memberOf",
      object: "al_nassr_fc"
    })

    const graph1 = new KnowledgeGraph({
      entities: [],
      relations: [relation1]
    })

    const graph2 = new KnowledgeGraph({
      entities: [],
      relations: [relation2]
    })

    const merged = mergeGraphs(graph1, graph2)

    expect(merged.relations.length).toBe(1)
    expect(Equal.equals(merged.relations[0]!, relation1)).toBe(true)
  })

  it("should preserve distinct relations from different chunks", () => {
    const relation1 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/memberOf",
      object: "al_nassr_fc"
    })
    const relation2 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/knows",
      object: "messi"
    })

    const graph1 = new KnowledgeGraph({
      entities: [],
      relations: [relation1]
    })

    const graph2 = new KnowledgeGraph({
      entities: [],
      relations: [relation2]
    })

    const merged = mergeGraphs(graph1, graph2)

    expect(merged.relations.length).toBe(2)
  })

  it("should handle complex real-world scenario with overlapping relations", () => {
    // Create entities
    const entity1 = new Entity({
      id: EntityId("cristiano_ronaldo"),
      mention: "Cristiano Ronaldo",
      types: ["http://schema.org/Person"],
      attributes: {}
    })
    const entity2 = new Entity({
      id: EntityId("al_nassr_fc"),
      mention: "Al-Nassr FC",
      types: ["http://schema.org/Organization"],
      attributes: {}
    })

    // Create relations - some duplicates across chunks
    const relation1 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/memberOf",
      object: "al_nassr_fc"
    })
    const relation2 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/memberOf",
      object: "al_nassr_fc" // Duplicate from different chunk
    })
    const relation3 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/birthDate",
      object: "1985-02-05"
    })
    const relation4 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/birthDate",
      object: "1985-02-05" // Duplicate from different chunk
    })
    const relation5 = new Relation({
      subjectId: "cristiano_ronaldo",
      predicate: "http://schema.org/age",
      object: 39
    })

    const graph1 = new KnowledgeGraph({
      entities: [entity1, entity2],
      relations: [relation1, relation3, relation5]
    })

    const graph2 = new KnowledgeGraph({
      entities: [entity1, entity2], // Same entities
      relations: [relation2, relation4] // Duplicates of relation1 and relation3
    })

    const merged = mergeGraphs(graph1, graph2)

    // Should have 3 unique relations (relation1/2 are same, relation3/4 are same)
    expect(merged.relations.length).toBe(3)

    // Verify all relations are present
    const hasMemberOf = merged.relations.some(
      (r) =>
        r.subjectId === "cristiano_ronaldo" &&
        r.predicate === "http://schema.org/memberOf" &&
        r.object === "al_nassr_fc"
    )
    const hasBirthDate = merged.relations.some(
      (r) =>
        r.subjectId === "cristiano_ronaldo" &&
        r.predicate === "http://schema.org/birthDate" &&
        r.object === "1985-02-05"
    )
    const hasAge = merged.relations.some(
      (r) =>
        r.subjectId === "cristiano_ronaldo" &&
        r.predicate === "http://schema.org/age" &&
        r.object === 39
    )

    expect(hasMemberOf).toBe(true)
    expect(hasBirthDate).toBe(true)
    expect(hasAge).toBe(true)
  })

  it("should produce deterministically sorted relations", () => {
    const relations = [
      new Relation({
        subjectId: "zebra",
        predicate: "http://schema.org/type",
        object: "animal"
      }),
      new Relation({
        subjectId: "apple",
        predicate: "http://schema.org/type",
        object: "fruit"
      }),
      new Relation({
        subjectId: "apple",
        predicate: "http://schema.org/color",
        object: "red"
      })
    ]

    const graph1 = new KnowledgeGraph({
      entities: [],
      relations: [relations[0]!, relations[1]!]
    })

    const graph2 = new KnowledgeGraph({
      entities: [],
      relations: [relations[2]!]
    })

    const merged1 = mergeGraphs(graph1, graph2)
    const merged2 = mergeGraphs(graph2, graph1) // Reverse order

    // Should produce same sorted order regardless of merge order
    expect(merged1.relations.length).toBe(3)
    expect(merged2.relations.length).toBe(3)

    // Relations should be sorted by (subjectId, predicate, object)
    expect(merged1.relations[0]!.subjectId).toBe("apple")
    expect(merged1.relations[1]!.subjectId).toBe("apple")
    expect(merged1.relations[2]!.subjectId).toBe("zebra")

    // Both merges should produce same order
    expect(merged1.relations.map((r) => r.subjectId)).toEqual(
      merged2.relations.map((r) => r.subjectId)
    )
  })
})

describe("mergeGraphsWithConflicts", () => {
  it("should deduplicate relations while detecting entity conflicts", () => {
    const entity1 = new Entity({
      id: EntityId("test_entity"),
      mention: "Test",
      types: ["http://schema.org/Thing"],
      attributes: { "http://schema.org/name": "Value1" }
    })
    const entity2 = new Entity({
      id: EntityId("test_entity"),
      mention: "Test",
      types: ["http://schema.org/Thing"],
      attributes: { "http://schema.org/name": "Value2" }
    })

    const relation1 = new Relation({
      subjectId: "test_entity",
      predicate: "http://schema.org/type",
      object: "thing"
    })
    const relation2 = new Relation({
      subjectId: "test_entity",
      predicate: "http://schema.org/type",
      object: "thing" // Duplicate
    })

    const graph1 = new KnowledgeGraph({
      entities: [entity1],
      relations: [relation1]
    })

    const graph2 = new KnowledgeGraph({
      entities: [entity2],
      relations: [relation2]
    })

    const [merged, conflicts] = mergeGraphsWithConflicts(graph1, graph2)

    // Should detect entity attribute conflict
    expect(conflicts.length).toBeGreaterThan(0)

    // Should deduplicate relations
    expect(merged.relations.length).toBe(1)
  })
})
