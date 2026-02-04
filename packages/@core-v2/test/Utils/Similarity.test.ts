/**
 * Tests for Entity Similarity Functions
 *
 * @since 2.0.0
 * @module test/Utils/Similarity
 */

import { describe, expect, it } from "vitest"

import { Entity, Relation } from "../../src/Domain/Model/Entity.js"
import { defaultEntityResolutionConfig } from "../../src/Domain/Model/EntityResolution.js"
import { EntityId } from "../../src/Domain/Model/shared.js"
import { computeEntitySimilarity, getNeighbors } from "../../src/Utils/Similarity.js"

// =============================================================================
// Test Fixtures
// =============================================================================

const createEntity = (id: string, mention: string, types: Array<string>): Entity =>
  new Entity({
    id: EntityId(id),
    mention,
    types,
    attributes: {}
  })

const createRelation = (subjectId: string, predicate: string, objectId: string): Relation =>
  new Relation({
    subjectId,
    predicate,
    object: objectId
  })

// Helper to flatten neighbors for testing
const getNeighborIds = (id: string, relations: Array<Relation>) => {
  const { incoming, outgoing } = getNeighbors(id, relations)
  return [...incoming, ...outgoing]
}

// =============================================================================
// getNeighbors Tests
// =============================================================================

describe("getNeighbors", () => {
  it("should return empty array when no relations", () => {
    const result = getNeighborIds("entity_a", [])
    expect(result).toEqual([])
  })

  it("should find neighbors as subject", () => {
    const relations = [
      createRelation("entity_a", "http://schema.org/knows", "entity_b"),
      createRelation("entity_a", "http://schema.org/worksFor", "entity_c")
    ]

    const result = getNeighborIds("entity_a", relations)
    expect(result).toContain("entity_b")
    expect(result).toContain("entity_c")
    expect(result).toHaveLength(2)
  })

  it("should find neighbors as object", () => {
    const relations = [
      createRelation("entity_x", "http://schema.org/knows", "entity_a"),
      createRelation("entity_y", "http://schema.org/memberOf", "entity_a")
    ]

    const result = getNeighborIds("entity_a", relations)
    expect(result).toContain("entity_x")
    expect(result).toContain("entity_y")
    expect(result).toHaveLength(2)
  })

  it("should find neighbors from both directions", () => {
    const relations = [
      createRelation("entity_a", "http://schema.org/knows", "entity_b"),
      createRelation("entity_c", "http://schema.org/follows", "entity_a")
    ]

    const result = getNeighborIds("entity_a", relations)
    expect(result).toContain("entity_b")
    expect(result).toContain("entity_c")
    expect(result).toHaveLength(2)
  })

  it("should ignore literal objects", () => {
    const relations: Array<Relation> = [
      new Relation({
        subjectId: "entity_a",
        predicate: "http://schema.org/name",
        object: "Some Name" // Literal, not entity reference
      }),
      createRelation("entity_a", "http://schema.org/knows", "entity_b")
    ]

    const result = getNeighborIds("entity_a", relations)
    // Should only include entity_b, not the literal "Some Name"
    expect(result).toEqual(["entity_b"])
  })

  it("should not include self-references", () => {
    const relations = [
      createRelation("entity_a", "http://schema.org/relatedTo", "entity_a") // Self-reference
    ]

    const result = getNeighborIds("entity_a", relations)
    // Self-references should not be included
    expect(result).toEqual([])
  })
})

// =============================================================================
// computeEntitySimilarity Tests
// =============================================================================

describe("computeEntitySimilarity", () => {
  const config = defaultEntityResolutionConfig

  it("should return 1.0 for identical entities (no neighbors)", () => {
    const entity = createEntity("arsenal", "Arsenal", ["http://schema.org/SportsTeam"])

    const score = computeEntitySimilarity(entity, entity, [], config)
    // 0.5*1.0 (mention) + 0.3*1.0 (type) + 0.2*1.0 (identical empty neighbors) = 1.0
    expect(score).toBe(1.0)
  })

  it("should return high score for similar mentions with same types", () => {
    const entityA = createEntity("arsenal", "Arsenal", ["http://schema.org/SportsTeam"])
    const entityB = createEntity("arsenal_fc", "Arsenal FC", ["http://schema.org/SportsTeam"])

    const score = computeEntitySimilarity(entityA, entityB, [], config)
    // High mention similarity + full type overlap + identical neighbors (empty) = high
    expect(score).toBeGreaterThan(0.9)
  })

  it("should return lower score for different types", () => {
    const entityA = createEntity("arsenal", "Arsenal", ["http://schema.org/SportsTeam"])
    const entityB = createEntity("arsenal_corp", "Arsenal Corp", ["http://schema.org/Corporation"])

    const score = computeEntitySimilarity(entityA, entityB, [], config)
    // Similar mentions but no type overlap. Neighbors identical (empty) = 1.0 * 0.2 = 0.2.
    // Mention sim ~0.7 * 0.5 = 0.35. Total ~0.55.
    expect(score).toBeLessThan(0.8)
  })

  it("should incorporate neighbor similarity", () => {
    const entityA = createEntity("ronaldo", "Ronaldo", ["http://schema.org/Person"])
    const entityB = createEntity("cr7", "CR7", ["http://schema.org/Person"])
    const entityC = createEntity("al_nassr", "Al-Nassr", ["http://schema.org/SportsTeam"])

    // Both entities have relations to same team
    const relations = [
      createRelation("ronaldo", "http://schema.org/memberOf", "al_nassr"),
      createRelation("cr7", "http://schema.org/memberOf", "al_nassr")
    ]

    const scoreWithNeighbors = computeEntitySimilarity(entityA, entityB, relations, config)

    // With neighbors: Mention=High, Type=1.0, Neighbor=1.0 (shared). Score ~ High.

    // Remove neighbors from comparison for baseline
    // But "no neighbors" also gives Neighbor=1.0 (empty==empty).
    // So scoreWithNeighbors and scoreWithoutNeighbors might be Equal.

    // To test "incorporate neighbor similarity", we need a case where neighbors DIFFER vs neighbors SAME.
    // Or compare against disjoint neighbors case.

    const relationsDisjoint = [
      createRelation("ronaldo", "http://schema.org/memberOf", "team_x"),
      createRelation("cr7", "http://schema.org/memberOf", "team_y")
    ]
    const scoreDisjoint = computeEntitySimilarity(entityA, entityB, relationsDisjoint, config)

    // Shared (1.0) > Disjoint (0.0)
    expect(scoreWithNeighbors).toBeGreaterThan(scoreDisjoint)
  })

  it("should handle entities with no neighbors", () => {
    const entityA = createEntity("player_a", "Player A", ["http://schema.org/Person"])
    const entityB = createEntity("player_b", "Player B", ["http://schema.org/Person"])

    // No relations → neighbor similarity is 1.0 (empty==empty)
    const score = computeEntitySimilarity(entityA, entityB, [], config)

    // Mention sim is 1.0 (edit distance 1, len 8? No, "Player A" vs "Player B", diff 1 char. Sim 7/8 = 0.875)
    // Type 1.0.
    // Neighbor 1.0.
    // Score > 0.9.
    expect(score).toBeGreaterThan(0.9)
  })

  it("should handle entities with disjoint neighbors", () => {
    const entityA = createEntity("player_a", "Player A", ["http://schema.org/Person"])
    const entityB = createEntity("player_b", "Player B", ["http://schema.org/Person"])

    // Completely different neighbors
    const relations = [
      createRelation("player_a", "http://schema.org/memberOf", "team_x"),
      createRelation("player_b", "http://schema.org/memberOf", "team_y")
    ]

    const scoreWithDisjointNeighbors = computeEntitySimilarity(entityA, entityB, relations, config)
    const scoreWithoutNeighbors = computeEntitySimilarity(entityA, entityB, [], config)

    // Disjoint neighbors (0.0) < Empty neighbors (1.0)
    expect(scoreWithDisjointNeighbors).toBeLessThan(scoreWithoutNeighbors)
  })

  it("should respect weight configuration", () => {
    const entityA = createEntity("test", "Test Entity", ["http://example.org/Type"])
    const entityB = createEntity("test_copy", "Test Entity", ["http://example.org/Type"])

    // Custom config with all weight on mentions
    const mentionOnlyConfig = {
      ...config,
      mentionWeight: 1.0,
      typeWeight: 0.0,
      neighborWeight: 0.0
    }

    const scoreMentionOnly = computeEntitySimilarity(entityA, entityB, [], mentionOnlyConfig)

    // Identical mentions → should be 1.0
    expect(scoreMentionOnly).toBe(1.0)
  })

  it("should handle containment cases (short name contained in long)", () => {
    const entityA = createEntity("eze", "Eze", ["http://schema.org/Person"])
    const entityB = createEntity("eberechi_eze", "Eberechi Eze", ["http://schema.org/Person"])

    const score = computeEntitySimilarity(entityA, entityB, [], config)

    // "Eze" is contained in "Eberechi Eze" → high similarity
    // combinedSimilarity returns 1.0 for containment
    // types overlap = 1.0
    // no neighbors = 1.0 (empty==empty)
    expect(score).toBeGreaterThanOrEqual(0.99)
  })

  it("should compute weighted sum correctly", () => {
    // Setup entities with known similarity values
    const entityA = createEntity("test_a", "Test", ["http://example.org/TypeA"])
    const entityB = createEntity("test_b", "Test", ["http://example.org/TypeA"])

    // Same type, same mention → mentionSim=1.0, typeOverlap=1.0
    // No relations → neighborSim=1.0
    const score = computeEntitySimilarity(entityA, entityB, [], config)

    // Expected: 0.5*1.0 + 0.3*1.0 + 0.2*1.0 = 1.0
    expect(score).toBeCloseTo(1.0, 2)
  })
})
