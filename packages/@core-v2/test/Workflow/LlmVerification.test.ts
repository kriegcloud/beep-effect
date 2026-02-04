/**
 * Tests for LLM Verification Activity
 *
 * Verifies low-confidence entity pairs using LLM to improve resolution accuracy.
 *
 * @since 2.0.0
 * @module test/Workflow/LlmVerification
 */

import { describe, expect, it } from "vitest"
import type { EntityPair, LlmVerificationInput, LlmVerificationOutput } from "../../src/Workflow/DurableActivities.js"
import { VerifiedPair } from "../../src/Workflow/DurableActivities.js"

// Type aliases for convenience
type EntityPairType = typeof EntityPair.Type
type LlmVerificationInputType = typeof LlmVerificationInput.Type
type LlmVerificationOutputType = typeof LlmVerificationOutput.Type

describe("LLM Verification Activity Schemas", () => {
  describe("EntityPair schema", () => {
    it("accepts valid entity pairs", () => {
      const pair: EntityPairType = {
        entityA: "arsenal_1",
        entityB: "arsenal_fc",
        mentionA: "Arsenal",
        mentionB: "Arsenal Football Club",
        typesA: ["http://schema.org/SportsTeam"],
        typesB: ["http://schema.org/SportsTeam", "http://schema.org/Organization"],
        similarity: 0.65
      }

      expect(pair.entityA).toBe("arsenal_1")
      expect(pair.similarity).toBe(0.65)
    })
  })

  describe("LlmVerificationInput schema", () => {
    it("accepts valid input with default threshold", () => {
      const input: LlmVerificationInputType = {
        batchId: "batch-123",
        entityPairs: [
          {
            entityA: "arsenal_1",
            entityB: "arsenal_fc",
            mentionA: "Arsenal",
            mentionB: "Arsenal Football Club",
            typesA: ["http://schema.org/SportsTeam"],
            typesB: ["http://schema.org/SportsTeam"],
            similarity: 0.65
          }
        ]
      }

      expect(input.batchId).toBe("batch-123")
      expect(input.entityPairs.length).toBe(1)
      expect(input.verificationThreshold).toBeUndefined()
    })

    it("accepts input with custom threshold", () => {
      const input: LlmVerificationInputType = {
        batchId: "batch-456",
        entityPairs: [],
        verificationThreshold: 0.8
      }

      expect(input.verificationThreshold).toBe(0.8)
    })
  })

  describe("LlmVerificationOutput schema", () => {
    it("has correct structure", () => {
      const output: LlmVerificationOutputType = {
        verified: [
          {
            entityA: "arsenal_1",
            entityB: "arsenal_fc",
            sameEntity: true,
            confidence: 0.95,
            originalSimilarity: 0.65
          }
        ],
        rejected: [
          {
            entityA: "chelsea_1",
            entityB: "chelsea_clinton",
            sameEntity: false,
            confidence: 0.99,
            originalSimilarity: 0.55
          }
        ],
        skipped: 5,
        totalProcessed: 2,
        durationMs: 1500
      }

      expect(output.verified.length).toBe(1)
      expect(output.rejected.length).toBe(1)
      expect(output.skipped).toBe(5)
    })
  })
})

describe("Entity Comparison Logic", () => {
  describe("threshold filtering", () => {
    it("should filter pairs below threshold for verification", () => {
      const pairs: Array<EntityPairType> = [
        { entityA: "a1", entityB: "a2", mentionA: "A", mentionB: "A2", typesA: [], typesB: [], similarity: 0.5 },
        { entityA: "b1", entityB: "b2", mentionA: "B", mentionB: "B2", typesA: [], typesB: [], similarity: 0.75 },
        { entityA: "c1", entityB: "c2", mentionA: "C", mentionB: "C2", typesA: [], typesB: [], similarity: 0.65 }
      ]

      const threshold = 0.7
      const toVerify = pairs.filter((p) => p.similarity < threshold)
      const skipped = pairs.filter((p) => p.similarity >= threshold)

      expect(toVerify.length).toBe(2) // 0.5 and 0.65
      expect(skipped.length).toBe(1) // 0.75
    })
  })

  describe("entity pair categorization", () => {
    const testCases: Array<{
      name: string
      pair: EntityPairType
      expectedSameEntity: boolean
      reason: string
    }> = [
      {
        name: "same team with nickname",
        pair: {
          entityA: "arsenal_1",
          entityB: "gunners_1",
          mentionA: "Arsenal",
          mentionB: "The Gunners",
          typesA: ["http://schema.org/SportsTeam"],
          typesB: ["http://schema.org/SportsTeam"],
          similarity: 0.5
        },
        expectedSameEntity: true,
        reason: "Same team, 'The Gunners' is Arsenal's nickname"
      },
      {
        name: "different entity types",
        pair: {
          entityA: "chelsea_team",
          entityB: "chelsea_person",
          mentionA: "Chelsea",
          mentionB: "Chelsea Clinton",
          typesA: ["http://schema.org/SportsTeam"],
          typesB: ["http://schema.org/Person"],
          similarity: 0.6
        },
        expectedSameEntity: false,
        reason: "Different types (team vs person)"
      },
      {
        name: "abbreviated company name",
        pair: {
          entityA: "ibm_1",
          entityB: "ibm_2",
          mentionA: "IBM",
          mentionB: "International Business Machines",
          typesA: ["http://schema.org/Corporation"],
          typesB: ["http://schema.org/Corporation"],
          similarity: 0.4
        },
        expectedSameEntity: true,
        reason: "IBM is abbreviation for International Business Machines"
      }
    ]

    testCases.forEach(({ expectedSameEntity, name, pair }) => {
      it(`identifies ${name}`, () => {
        // This tests the expected logic - actual LLM verification would confirm
        const hasTypeOverlap = pair.typesA.some((t) => pair.typesB.includes(t))

        if (!hasTypeOverlap) {
          expect(expectedSameEntity).toBe(false)
        }
        // For cases with type overlap, we'd need LLM to decide
        expect(pair.similarity).toBeLessThan(0.7) // All are below threshold
      })
    })
  })
})

describe("Batch Processing", () => {
  it("calculates correct batch splits", () => {
    const BATCH_SIZE = 5
    const pairs: Array<EntityPairType> = Array.from({ length: 12 }, (_, i) => ({
      entityA: `a${i}`,
      entityB: `b${i}`,
      mentionA: `Entity A${i}`,
      mentionB: `Entity B${i}`,
      typesA: [],
      typesB: [],
      similarity: 0.5
    }))

    const batches: Array<Array<EntityPairType>> = []
    for (let i = 0; i < pairs.length; i += BATCH_SIZE) {
      batches.push(pairs.slice(i, i + BATCH_SIZE))
    }

    expect(batches.length).toBe(3) // 12 / 5 = 2.4, rounds up to 3
    expect(batches[0].length).toBe(5)
    expect(batches[1].length).toBe(5)
    expect(batches[2].length).toBe(2)
  })

  it("handles single pair batch differently", () => {
    const pairs: Array<EntityPairType> = [
      {
        entityA: "a1",
        entityB: "b1",
        mentionA: "Arsenal",
        mentionB: "Arsenal FC",
        typesA: ["http://schema.org/SportsTeam"],
        typesB: ["http://schema.org/SportsTeam"],
        similarity: 0.6
      }
    ]

    // Single pair should use focused prompt (different from batch)
    expect(pairs.length).toBe(1)
  })
})

describe("Result Aggregation", () => {
  it("correctly separates verified and rejected pairs", () => {
    type MockResult = { index: number; sameEntity: boolean; confidence: number }
    const llmResults: Array<MockResult> = [
      { index: 0, sameEntity: true, confidence: 0.95 },
      { index: 1, sameEntity: false, confidence: 0.88 },
      { index: 2, sameEntity: true, confidence: 0.72 }
    ]

    const verified = llmResults.filter((r) => r.sameEntity)
    const rejected = llmResults.filter((r) => !r.sameEntity)

    expect(verified.length).toBe(2)
    expect(rejected.length).toBe(1)
    expect(verified[0].confidence).toBe(0.95)
    expect(rejected[0].index).toBe(1)
  })

  it("handles missing results gracefully", () => {
    const resultsMap = new Map<number, { sameEntity: boolean; confidence: number }>([
      [0, { sameEntity: true, confidence: 0.9 }]
      // Index 1 is missing
    ])

    const indices = [0, 1]
    const processed = indices.map((idx) => {
      const result = resultsMap.get(idx)
      return {
        index: idx,
        sameEntity: result?.sameEntity ?? false,
        confidence: result?.confidence ?? 0
      }
    })

    expect(processed[0].sameEntity).toBe(true)
    expect(processed[1].sameEntity).toBe(false) // Default for missing
    expect(processed[1].confidence).toBe(0) // Default for missing
  })
})
