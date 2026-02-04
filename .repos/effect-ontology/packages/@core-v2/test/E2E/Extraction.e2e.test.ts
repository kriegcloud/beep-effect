/**
 * E2E Test: Extraction Pipeline
 *
 * End-to-end tests for the complete extraction pipeline using golden datasets.
 * Tests entity extraction quality against expected outputs with precision/recall metrics.
 *
 * Test Modes:
 * - Pure: Mocked LLM (default) - fast, deterministic, no API cost
 * - Cached: Replayed LLM responses - deterministic, no API cost
 * - Cheap: Real LLM with cheap model - validates real behavior
 * - Production: Real LLM with production model - final validation
 *
 * @since 2.0.0
 * @module test/E2E/Extraction
 */

import { it } from "@effect/vitest"
import { Effect, Layer, Option, pipe } from "effect"
import * as path from "node:path"
import { describe, expect } from "vitest"
import { Entity } from "../../src/Domain/Model/Entity.js"
import { EntityId } from "../../src/Domain/Model/shared.js"
import { TestLayers } from "../../src/Runtime/TestRuntime.js"
import {
  calculateMetrics,
  E2EConfigProviderLayer,
  getTestMode,
  GoldenDataLoader,
  type LoadedGoldenCase,
  TestMode
} from "./setup.js"

// =============================================================================
// Test Configuration
// =============================================================================

const testMode = getTestMode()
const goldenDataPath = path.resolve(import.meta.dirname, "../../../../ontologies/football/test-data")
const loader = new GoldenDataLoader(goldenDataPath)

// Skip real LLM tests unless explicitly enabled
const skipRealLlm = testMode === TestMode.Pure || testMode === TestMode.Cached

// =============================================================================
// Golden Data Loading Tests
// =============================================================================

describe("E2E: Golden Data Loading", () => {
  it.effect("lists available test cases", () =>
    Effect.gen(function*() {
      const cases = yield* loader.listTestCases()
      expect(cases.length).toBeGreaterThanOrEqual(3)
      expect(cases).toContain("001-arsenal-tottenham")
      expect(cases).toContain("002-player-transfer")
      expect(cases).toContain("003-match-simple")
    }))

  it.effect("loads test case metadata and input", () =>
    Effect.gen(function*() {
      const testCase = yield* loader.loadTestCase("001-arsenal-tottenham")

      // Metadata
      expect(testCase.metadata.id).toBe("001-arsenal-tottenham")
      expect(testCase.metadata.domain).toBe("sports")
      expect(testCase.metadata.complexity).toBe("medium")
      expect(testCase.metadata.thresholds.minPrecision).toBe(0.85)
      expect(testCase.metadata.thresholds.minRecall).toBe(0.80)

      // Expected counts
      expect(testCase.metadata.expected.entities).toBe(12)
      expect(testCase.metadata.expected.relations).toBe(8)

      // Input text
      expect(testCase.input).toContain("Arsenal")
      expect(testCase.input).toContain("Tottenham")
      expect(testCase.input).toContain("Bukayo Saka")

      // Expected entities
      expect(testCase.expectedEntities.length).toBe(12)
      const arsenalEntity = testCase.expectedEntities.find((e) => e.id === "arsenal")
      expect(arsenalEntity).toBeDefined()
      expect(arsenalEntity!.primaryType).toBe("http://visualdataweb.org/newOntology/Team")

      // Expected relations
      expect(testCase.expectedRelations.length).toBe(8)
    }))

  it.effect("loads all test cases without errors", () =>
    Effect.gen(function*() {
      const caseIds = yield* loader.listTestCases()

      for (const caseId of caseIds) {
        const testCase = yield* loader.loadTestCase(caseId)
        expect(testCase.metadata.id).toBe(caseId)
        expect(testCase.input.length).toBeGreaterThan(0)
        expect(testCase.expectedEntities.length).toBeGreaterThan(0)
      }
    }))
})

// =============================================================================
// Quality Metrics Tests
// =============================================================================

describe("E2E: Quality Metrics Calculation", () => {
  it("calculates perfect precision and recall", () => {
    const extracted = [
      new Entity({ id: EntityId("arsenal"), mention: "Arsenal", types: ["Team"], attributes: {} }),
      new Entity({ id: EntityId("chelsea"), mention: "Chelsea", types: ["Team"], attributes: {} })
    ]
    const expected = [
      { id: "arsenal", mention: "Arsenal", primaryType: "Team", types: ["Team"] },
      { id: "chelsea", mention: "Chelsea", primaryType: "Team", types: ["Team"] }
    ]

    const metrics = calculateMetrics(extracted, expected)
    expect(metrics.precision).toBe(1.0)
    expect(metrics.recall).toBe(1.0)
    expect(metrics.f1Score).toBe(1.0)
    expect(metrics.truePositives).toBe(2)
    expect(metrics.falsePositives).toBe(0)
    expect(metrics.falseNegatives).toBe(0)
  })

  it("calculates partial precision (false positives)", () => {
    const extracted = [
      new Entity({ id: EntityId("arsenal"), mention: "Arsenal", types: ["Team"], attributes: {} }),
      new Entity({ id: EntityId("chelsea"), mention: "Chelsea", types: ["Team"], attributes: {} }),
      new Entity({ id: EntityId("liverpool"), mention: "Liverpool", types: ["Team"], attributes: {} })
    ]
    const expected = [
      { id: "arsenal", mention: "Arsenal", primaryType: "Team", types: ["Team"] },
      { id: "chelsea", mention: "Chelsea", primaryType: "Team", types: ["Team"] }
    ]

    const metrics = calculateMetrics(extracted, expected)
    expect(metrics.precision).toBeCloseTo(2 / 3, 2)
    expect(metrics.recall).toBe(1.0)
    expect(metrics.truePositives).toBe(2)
    expect(metrics.falsePositives).toBe(1)
    expect(metrics.falseNegatives).toBe(0)
  })

  it("calculates partial recall (false negatives)", () => {
    const extracted = [
      new Entity({ id: EntityId("arsenal"), mention: "Arsenal", types: ["Team"], attributes: {} })
    ]
    const expected = [
      { id: "arsenal", mention: "Arsenal", primaryType: "Team", types: ["Team"] },
      { id: "chelsea", mention: "Chelsea", primaryType: "Team", types: ["Team"] }
    ]

    const metrics = calculateMetrics(extracted, expected)
    expect(metrics.precision).toBe(1.0)
    expect(metrics.recall).toBe(0.5)
    expect(metrics.truePositives).toBe(1)
    expect(metrics.falsePositives).toBe(0)
    expect(metrics.falseNegatives).toBe(1)
  })

  it("handles fuzzy matching by mention", () => {
    // IDs differ but mentions match
    const extracted = [
      new Entity({ id: EntityId("arsenal_fc"), mention: "Arsenal", types: ["Team"], attributes: {} })
    ]
    const expected = [
      { id: "arsenal", mention: "Arsenal", primaryType: "Team", types: ["Team"] }
    ]

    const metrics = calculateMetrics(extracted, expected)
    expect(metrics.precision).toBe(1.0)
    expect(metrics.recall).toBe(1.0)
  })

  it("handles empty results", () => {
    const extracted: Array<Entity> = []
    const expected = [
      { id: "arsenal", mention: "Arsenal", primaryType: "Team", types: ["Team"] }
    ]

    const metrics = calculateMetrics(extracted, expected)
    expect(metrics.precision).toBe(0)
    expect(metrics.recall).toBe(0)
    expect(metrics.f1Score).toBe(0)
  })
})

// =============================================================================
// Extraction Tests (Pure Mode - Mocked LLM)
// =============================================================================

describe("E2E: Extraction Pipeline (Pure Mode)", () => {
  it.effect("validates test layer composition", () =>
    Effect.gen(function*() {
      // This test validates that TestLayers compose correctly
      // The mocked extractors return empty results by design
      yield* Effect.succeed(true)
    }).pipe(Effect.provide(TestLayers)))

  // Future: Add extraction tests here when wiring is complete
  // These will run with mocked LLM in CI and real LLM on schedule
})

// =============================================================================
// Test Case Validation
// =============================================================================

describe("E2E: Test Case Schema Validation", () => {
  it.effect("validates 001-arsenal-tottenham structure", () =>
    Effect.gen(function*() {
      const testCase = yield* loader.loadTestCase("001-arsenal-tottenham")

      // Validate entity structure
      for (const entity of testCase.expectedEntities) {
        expect(entity.id).toBeDefined()
        expect(entity.mention).toBeDefined()
        expect(entity.primaryType).toBeDefined()
        expect(entity.types.length).toBeGreaterThan(0)
      }

      // Validate relation structure
      for (const relation of testCase.expectedRelations) {
        expect(relation.subject).toBeDefined()
        expect(relation.predicate).toBeDefined()
        expect(relation.object).toBeDefined()

        // Subject and object should reference valid entities
        const entityIds = new Set(testCase.expectedEntities.map((e) => e.id))
        expect(entityIds.has(relation.subject)).toBe(true)
        expect(entityIds.has(relation.object)).toBe(true)
      }
    }))

  it.effect("validates threshold consistency across test cases", () =>
    Effect.gen(function*() {
      const caseIds = yield* loader.listTestCases()

      for (const caseId of caseIds) {
        const testCase = yield* loader.loadTestCase(caseId)

        // Thresholds should be reasonable
        expect(testCase.metadata.thresholds.minPrecision).toBeGreaterThanOrEqual(0.7)
        expect(testCase.metadata.thresholds.minPrecision).toBeLessThanOrEqual(1.0)
        expect(testCase.metadata.thresholds.minRecall).toBeGreaterThanOrEqual(0.7)
        expect(testCase.metadata.thresholds.minRecall).toBeLessThanOrEqual(1.0)

        // Expected counts should match actual expected entities/relations
        expect(testCase.expectedEntities.length).toBe(testCase.metadata.expected.entities)
        expect(testCase.expectedRelations.length).toBe(testCase.metadata.expected.relations)
      }
    }))
})

// =============================================================================
// Regression Baseline Tests
// =============================================================================

describe("E2E: Regression Detection", () => {
  it("detects precision degradation", async () => {
    const { checkRegression } = await import("./setup.js")

    const baseline = {
      precision: 0.90,
      recall: 0.85,
      f1Score: 0.87,
      truePositives: 10,
      falsePositives: 1,
      falseNegatives: 2
    }
    const current = {
      precision: 0.85,
      recall: 0.85,
      f1Score: 0.85,
      truePositives: 9,
      falsePositives: 2,
      falseNegatives: 2
    }

    const result = checkRegression(current, baseline)
    expect(result.status).toBe("warn")
    expect(result.alarms.length).toBeGreaterThan(0)
    expect(result.alarms[0]).toContain("Precision degraded")
  })

  it("passes when metrics improve", async () => {
    const { checkRegression } = await import("./setup.js")

    const baseline = {
      precision: 0.85,
      recall: 0.80,
      f1Score: 0.82,
      truePositives: 8,
      falsePositives: 2,
      falseNegatives: 2
    }
    const current = {
      precision: 0.90,
      recall: 0.85,
      f1Score: 0.87,
      truePositives: 9,
      falsePositives: 1,
      falseNegatives: 1
    }

    const result = checkRegression(current, baseline)
    expect(result.status).toBe("pass")
    expect(result.alarms).toHaveLength(0)
  })
})
