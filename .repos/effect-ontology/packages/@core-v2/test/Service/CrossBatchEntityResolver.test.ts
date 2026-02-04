/**
 * CrossBatchEntityResolver Service Tests
 *
 * Tests cross-batch entity resolution configuration and schema validation.
 * Full integration tests require PostgreSQL with pgvector.
 *
 * @module test/Service/CrossBatchEntityResolver.test
 */

import { describe, expect, it } from "@effect/vitest"
import { Effect, Schema } from "effect"
import { CrossBatchResolverConfig } from "../../src/Service/CrossBatchEntityResolver.js"

// =============================================================================
// Tests
// =============================================================================

describe("CrossBatchEntityResolver", () => {
  describe("CrossBatchResolverConfig", () => {
    it("creates config with defaults", () => {
      const config = new CrossBatchResolverConfig({})

      expect(config.candidateThreshold).toBe(0.6)
      expect(config.resolutionThreshold).toBe(0.8)
      expect(config.maxCandidatesPerEntity).toBe(20)
      expect(config.maxBlockingCandidates).toBe(100)
      expect(config.canonicalNamespace).toBe("http://example.org/entities/")
    })

    it("accepts custom thresholds", () => {
      const config = new CrossBatchResolverConfig({
        candidateThreshold: 0.5,
        resolutionThreshold: 0.9,
        maxCandidatesPerEntity: 50
      })

      expect(config.candidateThreshold).toBe(0.5)
      expect(config.resolutionThreshold).toBe(0.9)
      expect(config.maxCandidatesPerEntity).toBe(50)
    })

    it("validates threshold bounds", () => {
      // Schema validation should reject values outside 0-1
      const decodeEffect = Schema.decodeUnknown(CrossBatchResolverConfig)({
        candidateThreshold: 1.5 // Invalid - over 1
      })

      const result = Effect.runSyncExit(decodeEffect)
      expect(result._tag).toBe("Failure")
    })

    it("validates positive integers", () => {
      const decodeEffect = Schema.decodeUnknown(CrossBatchResolverConfig)({
        maxCandidatesPerEntity: -5 // Invalid - negative
      })

      const result = Effect.runSyncExit(decodeEffect)
      expect(result._tag).toBe("Failure")
    })

    it("accepts custom namespace", () => {
      const config = new CrossBatchResolverConfig({
        canonicalNamespace: "http://my-domain.org/entities/"
      })

      expect(config.canonicalNamespace).toBe("http://my-domain.org/entities/")
    })
  })
})
