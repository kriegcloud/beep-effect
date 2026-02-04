/**
 * E2E Test Setup
 *
 * Golden dataset testing infrastructure for end-to-end pipeline validation.
 * Provides test mode hierarchy, dataset loading, and quality metrics.
 *
 * @module test/E2E/setup
 * @since 2.0.0
 */

import { ConfigProvider, Effect, Layer, Option, Schema } from "effect"
import * as fs from "node:fs"
import * as path from "node:path"
import type { Entity } from "../../src/Domain/Model/Entity.js"

// =============================================================================
// Test Mode Hierarchy
// =============================================================================

/**
 * Test execution modes for cost-effective LLM testing
 *
 * @since 2.0.0
 * @category Config
 */
export enum TestMode {
  /** No LLM calls - pure deterministic mocks */
  Pure = "pure",
  /** Replay recorded LLM responses (snapshot-like) */
  Cached = "cached",
  /** Real LLM with cheap model (haiku/gpt-4o-mini) */
  Cheap = "cheap",
  /** Real LLM with production model */
  Production = "production"
}

/**
 * Get test mode from environment
 *
 * @since 2.0.0
 * @category Config
 */
export const getTestMode = (): TestMode => {
  const mode = process.env.E2E_TEST_MODE || "pure"
  if (Object.values(TestMode).includes(mode as TestMode)) {
    return mode as TestMode
  }
  return TestMode.Pure
}

/**
 * Check if current mode allows real LLM calls
 *
 * @since 2.0.0
 * @category Config
 */
export const allowsRealLlm = (mode: TestMode): boolean => mode === TestMode.Cheap || mode === TestMode.Production

/**
 * Get cheap model for the current LLM provider
 *
 * @since 2.0.0
 * @category Config
 */
export const getCheapModel = (provider: string): string => {
  switch (provider) {
    case "anthropic":
      return "claude-haiku-4-5"
    case "openai":
      return "gpt-4o-mini"
    case "gemini":
      return "gemini-1.5-flash"
    default:
      return "claude-haiku-4-5"
  }
}

/**
 * Get production model for the current LLM provider
 *
 * @since 2.0.0
 * @category Config
 */
export const getProductionModel = (provider: string): string => {
  switch (provider) {
    case "anthropic":
      return "claude-haiku-4-5"
    case "openai":
      return "gpt-4o"
    case "gemini":
      return "gemini-1.5-pro"
    default:
      return "claude-haiku-4-5"
  }
}

/**
 * Create config provider for the given test mode
 *
 * @since 2.0.0
 * @category Config
 */
export const createE2EConfigProvider = (mode: TestMode): ConfigProvider.ConfigProvider => {
  const provider = process.env.LLM_PROVIDER || "anthropic"
  const model = mode === TestMode.Cheap
    ? getCheapModel(provider)
    : mode === TestMode.Production
    ? getProductionModel(provider)
    : "claude-haiku-4-5" // Pure/Cached don't need real model

  return ConfigProvider.fromMap(
    new Map([
      ["ONTOLOGY_PATH", "../../ontologies/football/ontology.ttl"],
      ["LLM_API_KEY", process.env.LLM_API_KEY || "test-key"],
      ["LLM_PROVIDER", provider],
      ["LLM_MODEL", model],
      ["STORAGE_TYPE", "memory"],
      ["RUNTIME_CONCURRENCY", "4"],
      ["RUNTIME_LLM_CONCURRENCY", "2"],
      ["RUNTIME_ENABLE_TRACING", process.env.ENABLE_TRACING || "false"],
      ["EMBEDDING_MODEL", "nomic-embed-text-v1.5"],
      ["EMBEDDING_DIMENSION", "768"]
    ]),
    { pathDelim: "_" }
  )
}

// =============================================================================
// Golden Test Case Schema
// =============================================================================

/**
 * Complexity level for test cases
 *
 * @since 2.0.0
 * @category Schema
 */
export const ComplexitySchema = Schema.Literal("simple", "medium", "complex")
export type Complexity = Schema.Schema.Type<typeof ComplexitySchema>

/**
 * Domain category for test cases
 *
 * @since 2.0.0
 * @category Schema
 */
export const DomainSchema = Schema.Literal("sports", "medical", "news", "finance", "general")
export type Domain = Schema.Schema.Type<typeof DomainSchema>

/**
 * Quality thresholds for test validation
 *
 * @since 2.0.0
 * @category Schema
 */
export class QualityThresholds extends Schema.Class<QualityThresholds>("QualityThresholds")({
  /** Minimum precision (0-1) */
  minPrecision: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0), Schema.lessThanOrEqualTo(1)),
  /** Minimum recall (0-1) */
  minRecall: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0), Schema.lessThanOrEqualTo(1)),
  /** Maximum latency in milliseconds */
  maxLatencyMs: Schema.optional(Schema.Number.pipe(Schema.positive())),
  /** Maximum LLM cost in USD */
  maxCostUsd: Schema.optional(Schema.Number.pipe(Schema.positive()))
}) {}

/**
 * Expected output counts for validation
 *
 * @since 2.0.0
 * @category Schema
 */
export class ExpectedCounts extends Schema.Class<ExpectedCounts>("ExpectedCounts")({
  /** Expected number of entities */
  entities: Schema.Number.pipe(Schema.nonNegative()),
  /** Expected number of relations */
  relations: Schema.Number.pipe(Schema.nonNegative()),
  /** Expected number of entity clusters after resolution */
  clusters: Schema.optional(Schema.Number.pipe(Schema.nonNegative()))
}) {}

/**
 * Golden test case metadata
 *
 * @since 2.0.0
 * @category Schema
 */
export class GoldenTestCase extends Schema.Class<GoldenTestCase>("GoldenTestCase")({
  /** Unique identifier for the test case */
  id: Schema.String,
  /** Human-readable name */
  name: Schema.String,
  /** Description of what this test validates */
  description: Schema.String,
  /** Domain category */
  domain: DomainSchema,
  /** Complexity level */
  complexity: ComplexitySchema,
  /** Ontology IRI to use */
  ontologyIri: Schema.String,
  /** Expected output counts */
  expected: ExpectedCounts,
  /** Quality thresholds */
  thresholds: QualityThresholds,
  /** Known issues or edge cases */
  knownIssues: Schema.optional(Schema.Array(Schema.String)),
  /** Date test case was created */
  createdDate: Schema.String,
  /** Date test case was last validated */
  lastValidated: Schema.optional(Schema.String),
  /** Source of test data */
  source: Schema.optional(Schema.Literal("hand-curated", "extracted", "generated")),
  /** Creator */
  createdBy: Schema.optional(Schema.String)
}) {}

// =============================================================================
// Expected Entity Schema (for golden data)
// =============================================================================

/**
 * Expected entity in golden dataset (simplified for comparison)
 *
 * @since 2.0.0
 * @category Schema
 */
export class ExpectedEntity extends Schema.Class<ExpectedEntity>("ExpectedEntity")({
  /** Entity ID (snake_case) */
  id: Schema.String,
  /** Text mention */
  mention: Schema.String,
  /** Primary type (first type) */
  primaryType: Schema.String,
  /** All types */
  types: Schema.Array(Schema.String),
  /** Key attributes to verify (subset) */
  keyAttributes: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown }))
}) {}

/**
 * Expected relation in golden dataset
 *
 * @since 2.0.0
 * @category Schema
 */
export class ExpectedRelation extends Schema.Class<ExpectedRelation>("ExpectedRelation")({
  /** Subject entity ID */
  subject: Schema.String,
  /** Predicate IRI */
  predicate: Schema.String,
  /** Object entity ID */
  object: Schema.String
}) {}

// =============================================================================
// Golden Data Loader
// =============================================================================

/**
 * Loaded golden test case with all data
 *
 * @since 2.0.0
 * @category Types
 */
export interface LoadedGoldenCase {
  /** Test case metadata */
  metadata: GoldenTestCase
  /** Input text */
  input: string
  /** Expected entities */
  expectedEntities: ReadonlyArray<ExpectedEntity>
  /** Expected relations */
  expectedRelations: ReadonlyArray<ExpectedRelation>
  /** Expected RDF graph (Turtle) */
  expectedGraph: Option.Option<string>
}

/**
 * Golden data loader for E2E tests
 *
 * @since 2.0.0
 * @category Service
 */
export class GoldenDataLoader {
  constructor(private readonly basePath: string) {}

  /**
   * Load a test case by ID
   */
  loadTestCase(caseId: string): Effect.Effect<LoadedGoldenCase, Error> {
    return Effect.gen(this, function*() {
      const casePath = path.join(this.basePath, "golden-set", caseId)

      // Load metadata
      const metadataPath = path.join(casePath, "metadata.json")
      const metadataJson = yield* Effect.try({
        try: () => fs.readFileSync(metadataPath, "utf-8"),
        catch: (e) => new Error(`Failed to read metadata: ${metadataPath} - ${e}`)
      })
      const metadata = yield* Schema.decodeUnknown(GoldenTestCase)(JSON.parse(metadataJson))

      // Load input text
      const inputPath = path.join(casePath, "input.txt")
      const input = yield* Effect.try({
        try: () => fs.readFileSync(inputPath, "utf-8"),
        catch: (e) => new Error(`Failed to read input: ${inputPath} - ${e}`)
      })

      // Load expected entities
      const entitiesPath = path.join(casePath, "expected-entities.json")
      const entitiesJson = yield* Effect.try({
        try: () => fs.readFileSync(entitiesPath, "utf-8"),
        catch: (e) => new Error(`Failed to read entities: ${entitiesPath} - ${e}`)
      })
      const expectedEntities = yield* Schema.decodeUnknown(Schema.Array(ExpectedEntity))(
        JSON.parse(entitiesJson)
      )

      // Load expected relations
      const relationsPath = path.join(casePath, "expected-relations.json")
      const expectedRelations = yield* Effect.try({
        try: () => {
          const content = fs.readFileSync(relationsPath, "utf-8")
          return JSON.parse(content)
        },
        catch: () => [] // Relations file is optional
      }).pipe(
        Effect.flatMap((data) => Schema.decodeUnknown(Schema.Array(ExpectedRelation))(data)),
        Effect.catchAll(() => Effect.succeed([] as ReadonlyArray<ExpectedRelation>))
      )

      // Load expected graph (optional)
      const graphPath = path.join(casePath, "expected-graph.ttl")
      const expectedGraph = fs.existsSync(graphPath)
        ? Option.some(fs.readFileSync(graphPath, "utf-8"))
        : Option.none<string>()

      return {
        metadata,
        input,
        expectedEntities,
        expectedRelations,
        expectedGraph
      }
    })
  }

  /**
   * List all available test case IDs
   */
  listTestCases(): Effect.Effect<ReadonlyArray<string>, Error> {
    return Effect.try({
      try: () => {
        const goldenSetPath = path.join(this.basePath, "golden-set")
        if (!fs.existsSync(goldenSetPath)) {
          return []
        }
        return fs.readdirSync(goldenSetPath).filter((name) => {
          const metadataPath = path.join(goldenSetPath, name, "metadata.json")
          return fs.existsSync(metadataPath)
        })
      },
      catch: (e) => new Error(`Failed to list test cases: ${e}`)
    })
  }
}

// =============================================================================
// Quality Metrics Calculation
// =============================================================================

/**
 * Test signals collected during E2E execution
 *
 * @since 2.0.0
 * @category Metrics
 */
export interface TestSignals {
  /** Number of LLM API calls */
  llmCallCount: number
  /** Token usage */
  llmTokensUsed: { input: number; output: number }
  /** LLM call latencies in ms */
  llmLatencies: ReadonlyArray<number>
  /** Number of entities extracted */
  entitiesExtracted: number
  /** Number of relations extracted */
  relationsExtracted: number
  /** Average confidence score */
  averageConfidence: number
  /** SHACL violations count */
  shaclViolations: number
  /** Whether graph conforms to SHACL */
  conforms: boolean
  /** Total execution time in ms */
  totalDurationMs: number
  /** Per-stage durations */
  stageDurations: Record<string, number>
}

/**
 * Quality metrics computed from extraction results
 *
 * @since 2.0.0
 * @category Metrics
 */
export interface QualityMetrics {
  /** Precision: correct / extracted */
  precision: number
  /** Recall: correct / expected */
  recall: number
  /** F1 score: harmonic mean of precision and recall */
  f1Score: number
  /** True positives: correctly extracted entities */
  truePositives: number
  /** False positives: incorrectly extracted entities */
  falsePositives: number
  /** False negatives: missed entities */
  falseNegatives: number
}

/**
 * Calculate precision given extracted and expected entities
 *
 * Uses entity ID matching with fuzzy fallback on mention similarity.
 *
 * @since 2.0.0
 * @category Metrics
 */
export const calculateMetrics = (
  extracted: ReadonlyArray<Entity>,
  expected: ReadonlyArray<ExpectedEntity>
): QualityMetrics => {
  const extractedIds = new Set(extracted.map((e) => e.id.toLowerCase()))
  const expectedIds = new Set(expected.map((e) => e.id.toLowerCase()))

  // True positives: extracted entities that match expected
  const truePositives = [...extractedIds].filter((id) => expectedIds.has(id)).length

  // Also check by mention similarity for fuzzy matching
  const extractedMentions = new Map(extracted.map((e) => [e.mention.toLowerCase(), e]))
  const expectedMentions = new Map(expected.map((e) => [e.mention.toLowerCase(), e]))

  // Additional matches by mention (not already counted by ID)
  const mentionMatches = [...extractedMentions.keys()].filter(
    (mention) => expectedMentions.has(mention) && !extractedIds.has(expectedMentions.get(mention)!.id.toLowerCase())
  ).length

  const totalTruePositives = truePositives + mentionMatches
  const falsePositives = extracted.length - totalTruePositives
  const falseNegatives = expected.length - totalTruePositives

  const precision = extracted.length > 0 ? totalTruePositives / extracted.length : 0
  const recall = expected.length > 0 ? totalTruePositives / expected.length : 0
  const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0

  return {
    precision,
    recall,
    f1Score,
    truePositives: totalTruePositives,
    falsePositives,
    falseNegatives
  }
}

/**
 * Create empty test signals
 *
 * @since 2.0.0
 * @category Metrics
 */
export const emptyTestSignals = (): TestSignals => ({
  llmCallCount: 0,
  llmTokensUsed: { input: 0, output: 0 },
  llmLatencies: [],
  entitiesExtracted: 0,
  relationsExtracted: 0,
  averageConfidence: 0,
  shaclViolations: 0,
  conforms: false,
  totalDurationMs: 0,
  stageDurations: {}
})

// =============================================================================
// Metrics Persistence
// =============================================================================

/**
 * E2E test result combining metrics and signals
 *
 * @since 2.0.0
 * @category Metrics
 */
export interface E2ETestResult {
  /** Test case identifier */
  caseId: string
  /** Test mode used */
  mode: string
  /** Quality metrics */
  metrics: QualityMetrics
  /** Test signals */
  signals: TestSignals
  /** Timestamp of the run */
  timestamp: string
  /** Git commit hash (if available) */
  commitHash?: string
}

/**
 * Record test signals to JSON file
 *
 * Persists metrics for later regression analysis.
 *
 * @since 2.0.0
 * @category Metrics
 */
export const recordSignals = (
  result: E2ETestResult,
  outputDir: string = path.join(goldenDataPath, "..", "regression-baselines")
): Effect.Effect<void, Error> =>
  Effect.try({
    try: () => {
      // Ensure directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const filename = `${result.caseId}-${timestamp}.json`
      const filepath = path.join(outputDir, filename)

      // Write result
      fs.writeFileSync(filepath, JSON.stringify(result, null, 2))
    },
    catch: (e) => new Error(`Failed to record signals: ${e}`)
  })

/**
 * Load baseline metrics for a test case
 *
 * Finds the most recent baseline file for the given case.
 *
 * @since 2.0.0
 * @category Metrics
 */
export const loadBaseline = (
  caseId: string,
  baselineDir: string = path.join(goldenDataPath, "..", "regression-baselines")
): Effect.Effect<E2ETestResult | null, Error> =>
  Effect.try({
    try: () => {
      if (!fs.existsSync(baselineDir)) {
        return null
      }

      // Find most recent baseline for this case
      const files = fs.readdirSync(baselineDir)
        .filter((f) => f.startsWith(caseId) && f.endsWith(".json"))
        .sort()
        .reverse()

      if (files.length === 0) {
        return null
      }

      const filepath = path.join(baselineDir, files[0])
      const content = fs.readFileSync(filepath, "utf-8")
      return JSON.parse(content) as E2ETestResult
    },
    catch: (e) => new Error(`Failed to load baseline: ${e}`)
  })

/**
 * Generate E2E report summary
 *
 * @since 2.0.0
 * @category Metrics
 */
export interface E2EReportSummary {
  /** Total test cases run */
  totalCases: number
  /** Passing test cases */
  passingCases: number
  /** Failing test cases */
  failingCases: number
  /** Aggregate metrics */
  aggregateMetrics: {
    meanPrecision: number
    meanRecall: number
    meanF1: number
  }
  /** Regression status */
  regressions: Array<RegressionResult>
  /** Run timestamp */
  timestamp: string
}

/**
 * Generate E2E report from multiple test results
 *
 * @since 2.0.0
 * @category Metrics
 */
export const generateReport = (results: ReadonlyArray<E2ETestResult>): E2EReportSummary => {
  const passingCases = results.filter((r) => r.metrics.precision >= 0.7 && r.metrics.recall >= 0.7).length

  const meanPrecision = results.length > 0
    ? results.reduce((sum, r) => sum + r.metrics.precision, 0) / results.length
    : 0

  const meanRecall = results.length > 0
    ? results.reduce((sum, r) => sum + r.metrics.recall, 0) / results.length
    : 0

  const meanF1 = results.length > 0
    ? results.reduce((sum, r) => sum + r.metrics.f1Score, 0) / results.length
    : 0

  return {
    totalCases: results.length,
    passingCases,
    failingCases: results.length - passingCases,
    aggregateMetrics: {
      meanPrecision,
      meanRecall,
      meanF1
    },
    regressions: [],
    timestamp: new Date().toISOString()
  }
}

// =============================================================================
// Test Config Provider for E2E
// =============================================================================

/**
 * E2E test config provider
 *
 * @since 2.0.0
 * @category Config
 */
export const E2EConfigProvider = ConfigProvider.fromMap(
  new Map([
    ["ONTOLOGY_PATH", "../../ontologies/football/ontology.ttl"],
    ["LLM_API_KEY", process.env.LLM_API_KEY || "test-key"],
    ["LLM_PROVIDER", process.env.LLM_PROVIDER || "anthropic"],
    ["LLM_MODEL", process.env.LLM_MODEL || "claude-haiku-4-5"],
    ["STORAGE_TYPE", "memory"],
    ["RUNTIME_CONCURRENCY", "4"],
    ["RUNTIME_LLM_CONCURRENCY", "2"],
    ["RUNTIME_ENABLE_TRACING", process.env.ENABLE_TRACING || "false"],
    ["EMBEDDING_MODEL", "nomic-embed-text-v1.5"],
    ["EMBEDDING_DIMENSION", "768"]
  ]),
  { pathDelim: "_" }
)

/**
 * Layer that sets E2E config provider
 *
 * @since 2.0.0
 * @category Config
 */
export const E2EConfigProviderLayer = Layer.setConfigProvider(E2EConfigProvider)

/**
 * Create mode-aware config provider layer
 *
 * @since 2.0.0
 * @category Config
 */
export const createE2EConfigProviderLayer = (mode: TestMode): Layer.Layer<never> =>
  Layer.setConfigProvider(createE2EConfigProvider(mode))

// =============================================================================
// Mode-Aware Test Layers
// =============================================================================

/**
 * Re-export TestLayers for Pure mode E2E testing
 *
 * Uses mock LLM and deterministic extractors for fast, no-cost testing.
 *
 * @since 2.0.0
 * @category Layers
 */
export { TestLayers as PureModeLayers } from "../../src/Runtime/TestRuntime.js"

/**
 * Check if LLM API key is available
 *
 * @since 2.0.0
 * @category Config
 */
export const hasLlmApiKey = (): boolean => {
  const key = process.env.LLM_API_KEY
  return Boolean(key && key !== "test-key" && key.length > 10)
}

/**
 * Skip test if real LLM is required but not available
 *
 * Use in tests that require real LLM calls (Cheap/Production modes).
 *
 * @since 2.0.0
 * @category Testing
 */
export const skipIfNoLlm = (mode: TestMode): boolean => {
  if (allowsRealLlm(mode) && !hasLlmApiKey()) {
    console.log(`Skipping test: ${mode} mode requires LLM_API_KEY`)
    return true
  }
  return false
}

/**
 * Get test mode description for logging
 *
 * @since 2.0.0
 * @category Testing
 */
export const getTestModeDescription = (mode: TestMode): string => {
  switch (mode) {
    case TestMode.Pure:
      return "Pure (mock LLM, deterministic)"
    case TestMode.Cached:
      return "Cached (replayed responses)"
    case TestMode.Cheap:
      return "Cheap (real LLM, cheap model)"
    case TestMode.Production:
      return "Production (real LLM, full model)"
  }
}

// =============================================================================
// Regression Detection
// =============================================================================

/**
 * Regression check result
 *
 * @since 2.0.0
 * @category Regression
 */
export interface RegressionResult {
  status: "pass" | "warn" | "fail"
  alarms: ReadonlyArray<string>
  precisionDelta: number
  recallDelta: number
  f1Delta: number
}

/**
 * Check for quality regression against baseline
 *
 * @since 2.0.0
 * @category Regression
 */
export const checkRegression = (
  current: QualityMetrics,
  baseline: QualityMetrics,
  thresholds = { precision: 0.03, recall: 0.03, f1: 0.05 }
): RegressionResult => {
  const alarms: Array<string> = []

  const precisionDelta = current.precision - baseline.precision
  const recallDelta = current.recall - baseline.recall
  const f1Delta = current.f1Score - baseline.f1Score

  if (precisionDelta < -thresholds.precision) {
    alarms.push(`Precision degraded by ${Math.abs(precisionDelta * 100).toFixed(1)}%`)
  }

  if (recallDelta < -thresholds.recall) {
    alarms.push(`Recall degraded by ${Math.abs(recallDelta * 100).toFixed(1)}%`)
  }

  if (f1Delta < -thresholds.f1) {
    alarms.push(`F1 score degraded by ${Math.abs(f1Delta * 100).toFixed(1)}%`)
  }

  return {
    status: alarms.length === 0 ? "pass" : alarms.length < 2 ? "warn" : "fail",
    alarms,
    precisionDelta,
    recallDelta,
    f1Delta
  }
}

// =============================================================================
// Exports
// =============================================================================

export const goldenDataPath = path.resolve(
  import.meta.dirname,
  "../../../../ontologies/football/test-data"
)
