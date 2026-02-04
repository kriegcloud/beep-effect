/**
 * Tests for JobSchema
 *
 * @since 2.0.0
 * @module Test/Domain/Schema/JobSchema
 */

import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import {
  BlockingTokenJob,
  EmbeddingJob,
  PromptCacheJob,
  SimilarityRecomputeJob,
  WebhookJob
} from "../../../src/Domain/Schema/JobSchema.js"

describe("JobSchema", () => {
  const now = 1734800000000 // Fixed timestamp for purity testing

  describe("EmbeddingJob", () => {
    it.effect("makeId is pure and uses provided timestamp", () =>
      Effect.gen(function*() {
        const id = EmbeddingJob.makeId("ontology-1", "entity-1", now)
        expect(id).toBe(`embed:ontology-1:entity-1:${now}`)
      }))
  })

  describe("PromptCacheJob", () => {
    it.effect("makeId is pure and uses provided timestamp", () =>
      Effect.gen(function*() {
        const id = PromptCacheJob.makeId("ontology-1", "example-1", now)
        expect(id).toBe(`cache:ontology-1:example-1:${now}`)
      }))
  })

  describe("SimilarityRecomputeJob", () => {
    it.effect("makeId is pure and uses provided timestamp", () =>
      Effect.gen(function*() {
        const id = SimilarityRecomputeJob.makeId("ontology-1", "entity-1", now)
        expect(id).toBe(`similarity:ontology-1:entity-1:${now}`)
      }))
  })

  describe("BlockingTokenJob", () => {
    it.effect("makeId is pure and uses provided timestamp", () =>
      Effect.gen(function*() {
        const id = BlockingTokenJob.makeId("ontology-1", "entity-1", now)
        expect(id).toBe(`blocking:ontology-1:entity-1:${now}`)
      }))
  })

  describe("WebhookJob", () => {
    it.effect("makeId is pure and uses provided timestamp", () =>
      Effect.gen(function*() {
        const id = WebhookJob.makeId("event-1", now)
        expect(id).toBe(`webhook:event-1:${now}`)
      }))
  })
})
