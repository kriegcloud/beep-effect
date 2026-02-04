/**
 * Tests: ViolationExplainer Service
 *
 * @since 2.0.0
 */

import { LanguageModel } from "@effect/ai"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { TestConfigProvider } from "../../src/Runtime/TestRuntime.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import {
  BatchExplanationResult,
  ExplanationContext,
  ExplanationError,
  LlmViolationExplanation,
  ViolationExplainer
} from "../../src/Service/ViolationExplainer.js"

// =============================================================================
// Test Fixtures
// =============================================================================

const createTestViolation = (
  overrides?: Partial<{
    focusNode: string
    path: string
    message: string
    severity: "Violation" | "Warning" | "Info"
  }>
) => ({
  focusNode: overrides?.focusNode ?? "http://example.org/entity1",
  path: overrides?.path ?? "http://schema.org/name",
  message: overrides?.message ?? "minCount constraint violated",
  severity: overrides?.severity ?? ("Violation" as const)
})

// =============================================================================
// Mock Layers
// =============================================================================

const MockLanguageModel = Layer.succeed(LanguageModel.LanguageModel, {
  generateObject: () =>
    Effect.succeed({
      value: {
        explanation: "The entity is missing a required name property.",
        suggestion: "Add a name value to the entity.",
        affectedEntities: ["http://example.org/entity1"],
        confidence: 0.85
      },
      usage: { inputTokens: 100, outputTokens: 50, totalTokens: 150 }
    } as any),
  generateText: () =>
    Effect.succeed({
      text: "Explanation text",
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
    } as any),
  generateEmbeddings: () => Effect.succeed({ embeddings: [] } as any),
  stream: () => Effect.succeed({ stream: Effect.succeed([]) } as any),
  streamText: () => Effect.succeed({ stream: Effect.succeed([]) } as any)
} as unknown as LanguageModel.Service)

const TestLayer = ViolationExplainer.Default.pipe(
  Layer.provideMerge(MockLanguageModel),
  Layer.provideMerge(ConfigServiceDefault),
  Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
)

// =============================================================================
// Tests: Domain Models
// =============================================================================

describe("ViolationExplainer Domain Models", () => {
  describe("ExplanationContext", () => {
    it.effect("creates empty context", () =>
      Effect.gen(function*() {
        const context = ExplanationContext.empty()
        expect(context.neighborhoodTurtle).toBe("")
        expect(context.domainDescription).toBe("")
        expect(context.maxTokens).toBe(500)
      }))

    it.effect("creates context with neighborhood", () =>
      Effect.gen(function*() {
        const turtle = "@prefix ex: <http://example.org/> . ex:a ex:b ex:c ."
        const context = ExplanationContext.withNeighborhood(turtle)
        expect(context.neighborhoodTurtle).toContain("@prefix")
      }))
  })

  describe("LlmViolationExplanation", () => {
    it.effect("creates explanation with all fields", () =>
      Effect.gen(function*() {
        const explanation = new LlmViolationExplanation({
          focusNode: "http://example.org/entity1",
          path: "http://schema.org/name",
          explanation: "Missing required property",
          suggestion: "Add the name property",
          severity: "Violation",
          affectedEntities: ["http://example.org/entity1"],
          confidence: 0.9
        })

        expect(explanation.focusNode).toBe("http://example.org/entity1")
        expect(explanation.isCritical).toBe(true)
        expect(explanation.confidence).toBe(0.9)
      }))

    it.effect("isCritical is false for warnings", () =>
      Effect.gen(function*() {
        const explanation = new LlmViolationExplanation({
          focusNode: "http://example.org/entity1",
          explanation: "Minor issue",
          suggestion: "Consider updating",
          severity: "Warning",
          affectedEntities: []
        })

        expect(explanation.isCritical).toBe(false)
      }))
  })

  describe("BatchExplanationResult", () => {
    it.effect("calculates isComplete correctly", () =>
      Effect.gen(function*() {
        const complete = new BatchExplanationResult({
          explanations: [],
          totalViolations: 5,
          explainedCount: 5,
          durationMs: 100
        })
        expect(complete.isComplete).toBe(true)

        const incomplete = new BatchExplanationResult({
          explanations: [],
          totalViolations: 5,
          explainedCount: 3,
          durationMs: 100
        })
        expect(incomplete.isComplete).toBe(false)
      }))
  })
})

// =============================================================================
// Tests: Service
// =============================================================================

describe("ViolationExplainer Service", () => {
  describe("explain", () => {
    it.effect("generates LLM explanation for violation", () =>
      Effect.gen(function*() {
        const explainer = yield* ViolationExplainer
        const violation = createTestViolation()

        const explanation = yield* explainer.explain(
          violation,
          ExplanationContext.empty()
        )

        expect(explanation.focusNode).toBe("http://example.org/entity1")
        expect(explanation.explanation).toContain("missing")
        expect(explanation.suggestion).toContain("Add")
        expect(explanation.confidence).toBeGreaterThan(0)
      }).pipe(Effect.provide(TestLayer)))

    it.effect("includes context in explanation", () =>
      Effect.gen(function*() {
        const explainer = yield* ViolationExplainer
        const violation = createTestViolation()

        const context = ExplanationContext.withNeighborhood(
          "@prefix ex: <http://example.org/> . ex:entity1 a ex:Person ."
        )

        const explanation = yield* explainer.explain(violation, context)

        expect(explanation).toBeDefined()
        expect(explanation.severity).toBe("Violation")
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("explainQuick", () => {
    it.effect("generates rule-based explanation for minCount", () =>
      Effect.gen(function*() {
        const explainer = yield* ViolationExplainer

        const violation = createTestViolation({
          message: "minCount constraint violated"
        })

        const explanation = explainer.explainQuick(violation)

        expect(explanation.explanation).toContain("missing")
        expect(explanation.suggestion).toContain("Add")
        expect(explanation.confidence).toBe(0.6) // Lower for rule-based
      }).pipe(Effect.provide(TestLayer)))

    it.effect("generates rule-based explanation for maxCount", () =>
      Effect.gen(function*() {
        const explainer = yield* ViolationExplainer

        const violation = createTestViolation({
          message: "maxCount constraint violated"
        })

        const explanation = explainer.explainQuick(violation)

        expect(explanation.explanation).toContain("too many")
        expect(explanation.suggestion).toContain("Remove")
      }).pipe(Effect.provide(TestLayer)))

    it.effect("generates rule-based explanation for datatype", () =>
      Effect.gen(function*() {
        const explainer = yield* ViolationExplainer

        const violation = createTestViolation({
          message: "expected datatype xsd:integer"
        })

        const explanation = explainer.explainQuick(violation)

        expect(explanation.explanation).toContain("data type")
      }).pipe(Effect.provide(TestLayer)))

    it.effect("generates fallback for unknown violations", () =>
      Effect.gen(function*() {
        const explainer = yield* ViolationExplainer

        const violation = createTestViolation({
          message: "some unknown constraint"
        })

        const explanation = explainer.explainQuick(violation)

        expect(explanation.explanation).toContain("Validation failed")
        expect(explanation.suggestion).toContain("Review")
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("explainBatch", () => {
    it.effect("explains multiple violations", () =>
      Effect.gen(function*() {
        const explainer = yield* ViolationExplainer

        const violations = [
          createTestViolation({ focusNode: "http://example.org/entity1" }),
          createTestViolation({ focusNode: "http://example.org/entity2" }),
          createTestViolation({ focusNode: "http://example.org/entity3" })
        ]

        const result = yield* explainer.explainBatch(
          violations,
          ExplanationContext.empty()
        )

        expect(result.totalViolations).toBe(3)
        expect(result.explainedCount).toBe(3)
        expect(result.isComplete).toBe(true)
        expect(result.explanations.length).toBe(3)
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("explainWithFallback", () => {
    it.effect("returns LLM explanation when successful", () =>
      Effect.gen(function*() {
        const explainer = yield* ViolationExplainer
        const violation = createTestViolation()

        const explanation = yield* explainer.explainWithFallback(
          violation,
          ExplanationContext.empty()
        )

        expect(explanation.confidence).toBeGreaterThan(0.6) // LLM has higher confidence
      }).pipe(Effect.provide(TestLayer)))
  })
})
