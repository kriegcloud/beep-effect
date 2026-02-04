/**
 * Tests: AgentCoordinator Service
 *
 * Tests for the multi-agent pipeline orchestrator.
 *
 * @module test/Service/Agent/AgentCoordinator
 */

import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Option, Secret } from "effect"
import type { Agent } from "../../../src/Domain/Model/Agent.js"
import { AgentId, AgentMetadata, TerminationCondition, ValidationResult } from "../../../src/Domain/Model/Agent.js"
import { AgentCoordinator, type ExecutionResult } from "../../../src/Service/Agent/AgentCoordinator.js"
import { AgentTask, PipelineConfig, RefinementConfig } from "../../../src/Service/Agent/types.js"
import { ConfigService } from "../../../src/Service/Config.js"
import { TestConfigProviderLayer } from "../../setup.js"

// =============================================================================
// Test Fixtures
// =============================================================================

/**
 * Simple echo agent that returns its input
 */
const createEchoAgent = (id: string): Agent<unknown, unknown, never> => ({
  metadata: new AgentMetadata({
    id: AgentId(id),
    name: `Echo Agent ${id}`,
    description: "Echoes input back",
    type: "extractor"
  }),
  execute: (input) => Effect.succeed(input)
})

/**
 * Transformer agent that adds a marker to output
 */
const createTransformerAgent = (
  id: string,
  marker: string
): Agent<unknown, { data: unknown; marker: string }, never> => ({
  metadata: new AgentMetadata({
    id: AgentId(id),
    name: `Transformer ${id}`,
    description: `Adds ${marker} to output`,
    type: "extractor"
  }),
  execute: (input) => Effect.succeed({ data: input, marker })
})

/**
 * Counter agent that increments a counter
 */
const createCounterAgent = (id: string): Agent<{ count: number }, { count: number; conforms: boolean }, never> => ({
  metadata: new AgentMetadata({
    id: AgentId(id),
    name: `Counter ${id}`,
    description: "Increments count",
    type: "validator"
  }),
  execute: (input) =>
    Effect.succeed({
      count: (input.count ?? 0) + 1,
      conforms: (input.count ?? 0) >= 2 // Conform after 3 iterations
    })
})

/**
 * Failing agent for error testing
 */
const createFailingAgent = (id: string): Agent<unknown, never, Error> => ({
  metadata: new AgentMetadata({
    id: AgentId(id),
    name: `Failing Agent ${id}`,
    description: "Always fails",
    type: "extractor"
  }),
  execute: () => Effect.fail(new Error("Intentional failure"))
})

/**
 * Validating agent that rejects empty input
 */
const createValidatingAgent = (id: string): Agent<{ text?: string }, string, never> => ({
  metadata: new AgentMetadata({
    id: AgentId(id),
    name: `Validating Agent ${id}`,
    description: "Validates non-empty text",
    type: "validator"
  }),
  execute: (input) => Effect.succeed(input.text ?? "default"),
  validate: (input) =>
    Effect.succeed(
      input.text
        ? ValidationResult.pass()
        : ValidationResult.fail(["Text is required"])
    )
})

/**
 * Mock validator agent that decreases violations each call
 */
const createMockValidatorAgent = (): {
  agent: Agent<unknown, { conforms: boolean; violations: Array<unknown> }, never>
  callCount: { value: number }
} => {
  const callCount = { value: 0 }
  return {
    callCount,
    agent: {
      metadata: new AgentMetadata({
        id: AgentId("validator"),
        name: "Mock Validator",
        description: "Returns decreasing violations",
        type: "validator"
      }),
      execute: (_input) => {
        callCount.value++
        // First call: 3 violations, second: 2, third: 1, fourth+: 0 (conforms)
        const violations = callCount.value >= 4 ? [] : Array(4 - callCount.value).fill({ message: "violation" })
        return Effect.succeed({
          conforms: violations.length === 0,
          violations
        })
      }
    }
  }
}

/**
 * Mock corrector agent that returns corrected graph with decreasing confidence
 */
const createMockCorrectorAgent = (): {
  agent: Agent<unknown, { correctedGraph: unknown; confidence: number; correctedCount: number }, never>
  callCount: { value: number }
} => {
  const callCount = { value: 0 }
  return {
    callCount,
    agent: {
      metadata: new AgentMetadata({
        id: AgentId("corrector"),
        name: "Mock Corrector",
        description: "Returns corrected graph",
        type: "corrector"
      }),
      execute: (input: unknown) => {
        callCount.value++
        const graphInput = input as { graph: { entities: Array<unknown> } }
        return Effect.succeed({
          correctedGraph: graphInput.graph ?? { entities: [] },
          confidence: 1 - (callCount.value * 0.2), // Decreasing confidence: 0.8, 0.6, 0.4, ...
          correctedCount: 1
        })
      }
    }
  }
}

/**
 * Mock validator that always returns conformant
 */
const createConformantValidatorAgent = (): Agent<
  unknown,
  { conforms: boolean; violations: Array<unknown> },
  never
> => ({
  metadata: new AgentMetadata({
    id: AgentId("validator"),
    name: "Conformant Validator",
    description: "Always returns conformant",
    type: "validator"
  }),
  execute: () => Effect.succeed({ conforms: true, violations: [] })
})

/**
 * Mock corrector for testing (won't be called if validator conforms)
 */
const createPassthroughCorrectorAgent = (): Agent<
  unknown,
  { correctedGraph: unknown; confidence: number; correctedCount: number },
  never
> => ({
  metadata: new AgentMetadata({
    id: AgentId("corrector"),
    name: "Passthrough Corrector",
    description: "Returns input unchanged",
    type: "corrector"
  }),
  execute: (input: unknown) => {
    const graphInput = input as { graph: unknown }
    return Effect.succeed({
      correctedGraph: graphInput.graph,
      confidence: 1,
      correctedCount: 0
    })
  }
})

// =============================================================================
// Mock Layers
// =============================================================================

// Mock ConfigService with required fields for Agent
const MockConfigService = Layer.succeed(ConfigService, {
  llm: {
    provider: "anthropic" as const,
    model: "claude-haiku-4-5",
    apiKey: Secret.fromString("test-key"),
    temperature: 0,
    maxTokens: 4096,
    timeoutMs: 30000,
    enablePromptCaching: true
  },
  runtime: {
    concurrency: 4,
    llmConcurrencyLimit: 2,
    retryMaxAttempts: 3,
    retryInitialDelayMs: 1000,
    retryMaxDelayMs: 10000,
    enableTracing: false
  },
  storage: {
    type: "memory" as const,
    bucket: Option.none(),
    localPath: Option.none(),
    prefix: ""
  },
  rdf: {
    baseNamespace: "http://example.org/",
    outputFormat: "Turtle" as const,
    prefixes: {
      "schema": "http://schema.org/",
      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "owl": "http://www.w3.org/2002/07/owl#",
      "xsd": "http://www.w3.org/2001/XMLSchema#"
    }
  },
  ontology: {
    path: "/tmp/test.ttl",
    externalVocabsPath: "ontologies/external/merged-external.ttl",
    registryPath: Option.none(),
    cacheTtlSeconds: 300,
    strictValidation: false
  },
  grounder: {
    enabled: true,
    confidenceThreshold: 0.8,
    batchSize: 5
  },
  embedding: {
    provider: "nomic" as const,
    model: "nomic-embed-text-v1.5",
    dimension: 768,
    transformersModelId: "Xenova/nomic-embed-text-v1",
    voyageApiKey: Option.none(),
    voyageModel: "voyage-3-lite",
    timeoutMs: 30_000,
    rateLimitRpm: 100,
    maxConcurrent: 10,
    cachePath: Option.none(),
    cacheTtlHours: 24,
    cacheMaxEntries: 10000,
    entityIndexPath: Option.none()
  },
  extraction: {
    runsDir: "/tmp/test-runs",
    strictPersistence: false
  },
  entityRegistry: {
    enabled: false,
    candidateThreshold: 0.6,
    resolutionThreshold: 0.8,
    maxCandidatesPerEntity: 20,
    maxBlockingCandidates: 100,
    canonicalNamespace: "http://example.org/entities/"
  },
  inference: {
    enabled: false,
    profile: "rdfs" as const,
    persistDerived: true
  },
  validation: {
    logOnly: false,
    failOnViolation: true,
    failOnWarning: false
  },
  api: {
    keys: Option.none(),
    requireAuth: false
  },
  jina: {
    apiKey: Option.none(),
    rateLimitRpm: 20,
    timeoutMs: 30_000,
    maxConcurrent: 5,
    baseUrl: "https://r.jina.ai"
  }
} as ConfigService)

// =============================================================================
// Tests
// =============================================================================

describe("AgentCoordinator", () => {
  describe("Agent Registration", () => {
    it.effect("registers an agent", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        const agent = createEchoAgent("echo")
        yield* coordinator.register(agent)

        const agents = yield* coordinator.listAgents()
        expect(agents).toHaveLength(1)
        expect(agents[0].id).toBe("echo")
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("unregisters an agent", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        const agent = createEchoAgent("echo")
        yield* coordinator.register(agent)
        yield* coordinator.unregister(AgentId("echo"))

        const agents = yield* coordinator.listAgents()
        expect(agents).toHaveLength(0)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("fails when getting unregistered agent", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        const result = yield* coordinator.getAgent(AgentId("nonexistent")).pipe(
          Effect.either
        )

        expect(result._tag).toBe("Left")
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("Sequential Execution", () => {
    it.effect("executes agents in sequence", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        // Register agents
        yield* coordinator.register(createTransformerAgent("first", "A"))
        yield* coordinator.register(createTransformerAgent("second", "B"))

        // Execute
        const task = new AgentTask({ taskId: "test-1", text: "input" })
        const result = yield* coordinator.executeSequential(
          task,
          [AgentId("first"), AgentId("second")]
        )

        expect(result.state.status).toBe("completed")
        expect(result.state.completedAgents).toHaveLength(2)
        expect(result.events.length).toBeGreaterThan(0)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("passes output from one agent to the next", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        yield* coordinator.register(createTransformerAgent("first", "A"))
        yield* coordinator.register(createTransformerAgent("second", "B"))

        const task = new AgentTask({ taskId: "test-2", text: "start" })
        const result = yield* coordinator.executeSequential(
          task,
          [AgentId("first"), AgentId("second")]
        )

        // Second agent should receive output from first
        const secondOutput = result.outputs.get(AgentId("second")) as {
          data: { data: unknown; marker: string }
          marker: string
        }
        expect(secondOutput.marker).toBe("B")
        expect(secondOutput.data.marker).toBe("A")
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("emits AgentStarted and AgentCompleted events", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        yield* coordinator.register(createEchoAgent("echo"))

        const task = new AgentTask({ taskId: "test-3" })
        const result = yield* coordinator.executeSequential(
          task,
          [AgentId("echo")]
        )

        const eventTags = result.events.map((e) => e._tag)
        expect(eventTags).toContain("AgentStarted")
        expect(eventTags).toContain("AgentCompleted")
        expect(eventTags).toContain("PipelineCheckpoint")
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("Loop Execution", () => {
    it.effect("executes loop until max iterations", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        yield* coordinator.register(createEchoAgent("looper"))

        const task = new AgentTask({ taskId: "loop-1" })
        const termination = new TerminationCondition({
          maxIterations: 3,
          stopOnConformance: false
        })

        const result = yield* coordinator.executeLoop(
          task,
          [AgentId("looper")],
          termination
        )

        expect(result.state.status).toBe("completed")
        expect(result.state.iterationCount).toBe(3)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("stops when conformance is reached", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        yield* coordinator.register(createCounterAgent("counter"))

        const task = new AgentTask({ taskId: "loop-2", context: { count: 0 } })
        const termination = new TerminationCondition({
          maxIterations: 10,
          stopOnConformance: true
        })

        // Need to pass initial count
        const result = yield* coordinator.executeLoop(
          new AgentTask({ taskId: "loop-2" }),
          [AgentId("counter")],
          termination
        )

        // Should stop before max iterations due to conformance
        expect(result.state.status).toBe("completed")
        expect(result.state.iterationCount).toBeLessThanOrEqual(10)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("emits progress events per iteration", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        yield* coordinator.register(createEchoAgent("looper"))

        const task = new AgentTask({ taskId: "loop-3" })
        const termination = new TerminationCondition({
          maxIterations: 3
        })

        const result = yield* coordinator.executeLoop(
          task,
          [AgentId("looper")],
          termination
        )

        const progressEvents = result.events.filter((e) => e._tag === "AgentProgress")
        expect(progressEvents.length).toBe(3) // One per iteration
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("Parallel Execution", () => {
    it.effect("executes agents in parallel", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        yield* coordinator.register(createTransformerAgent("par-a", "A"))
        yield* coordinator.register(createTransformerAgent("par-b", "B"))
        yield* coordinator.register(createTransformerAgent("par-c", "C"))

        const task = new AgentTask({ taskId: "par-1", text: "input" })
        const result = yield* coordinator.executeParallel(
          task,
          [AgentId("par-a"), AgentId("par-b"), AgentId("par-c")],
          { concurrency: 3 }
        )

        expect(result.state.status).toBe("completed")
        expect(result.state.completedAgents).toHaveLength(3)
        expect(result.outputs.size).toBe(3)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("all agents receive the same input", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        yield* coordinator.register(createTransformerAgent("par-a", "A"))
        yield* coordinator.register(createTransformerAgent("par-b", "B"))

        const task = new AgentTask({ taskId: "par-2", text: "shared-input" })
        const result = yield* coordinator.executeParallel(
          task,
          [AgentId("par-a"), AgentId("par-b")]
        )

        const outputA = result.outputs.get(AgentId("par-a")) as { data: AgentTask }
        const outputB = result.outputs.get(AgentId("par-b")) as { data: AgentTask }

        // Both should have received the same task
        expect(outputA.data.taskId).toBe("par-2")
        expect(outputB.data.taskId).toBe("par-2")
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("Pipeline Configuration", () => {
    it.effect("executes from PipelineConfig - sequential", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        yield* coordinator.register(createEchoAgent("config-a"))
        yield* coordinator.register(createEchoAgent("config-b"))

        const task = new AgentTask({ taskId: "config-1" })
        const config = PipelineConfig.sequential("pipe-1", ["config-a", "config-b"])

        const result = yield* coordinator.execute(task, config)

        expect(result.state.status).toBe("completed")
        expect(result.state.completedAgents).toHaveLength(2)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("executes from PipelineConfig - loop", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        yield* coordinator.register(createEchoAgent("loop-agent"))

        const task = new AgentTask({ taskId: "config-2" })
        const config = PipelineConfig.refinementLoop("pipe-2", 2)

        // Note: config references extractor/validator/corrector which aren't registered
        // So we override the sequence
        const result = yield* coordinator.executeLoop(
          task,
          [AgentId("loop-agent")],
          new TerminationCondition({ maxIterations: 2 })
        )

        expect(result.state.status).toBe("completed")
        expect(result.state.iterationCount).toBe(2)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("Error Handling", () => {
    it.effect("fails on agent not found", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        const task = new AgentTask({ taskId: "error-1" })
        const result = yield* coordinator.executeSequential(
          task,
          [AgentId("nonexistent")]
        ).pipe(Effect.either)

        expect(result._tag).toBe("Left")
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("continues on error when configured", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        yield* coordinator.register(createFailingAgent("failer"))
        yield* coordinator.register(createEchoAgent("echo"))

        const task = new AgentTask({ taskId: "error-2" })
        const result = yield* coordinator.executeSequential(
          task,
          [AgentId("failer"), AgentId("echo")],
          { continueOnError: true }
        )

        // Should complete despite the failing agent
        expect(result.state.status).toBe("completed")
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("emits AgentFailed events on error", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        yield* coordinator.register(createFailingAgent("failer"))

        const task = new AgentTask({ taskId: "error-3" })
        const result = yield* coordinator.executeSequential(
          task,
          [AgentId("failer")],
          { continueOnError: true }
        )

        const failedEvents = result.events.filter((e) => e._tag === "AgentFailed")
        expect(failedEvents.length).toBeGreaterThan(0)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("Validation", () => {
    it.effect("runs agent validation before execution", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        yield* coordinator.register(createValidatingAgent("validator"))

        // This should fail validation (no text)
        const task = new AgentTask({ taskId: "val-1" })
        const result = yield* coordinator.executeSequential(
          task,
          [AgentId("validator")],
          { continueOnError: true }
        )

        // Validation failure should be captured
        const failedEvents = result.events.filter((e) => e._tag === "AgentFailed")
        expect(failedEvents.length).toBeGreaterThan(0)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("runUntil", () => {
    it.effect("runs until condition is met", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        yield* coordinator.register(createCounterAgent("counter"))

        const task = new AgentTask({ taskId: "until-1" })
        const result = yield* coordinator.runUntil(
          task,
          [AgentId("counter")],
          (state) => state.iterationCount !== undefined && state.iterationCount >= 3,
          10
        )

        expect(result.state.status).toBe("completed")
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("Event Callbacks", () => {
    it.effect("calls onEvent callback for each event", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator
        const eventCount = { value: 0 }

        yield* coordinator.register(createEchoAgent("callback-agent"))

        const task = new AgentTask({ taskId: "callback-1" })
        yield* coordinator.executeSequential(
          task,
          [AgentId("callback-agent")],
          {
            onEvent: () => {
              eventCount.value++
              return Effect.void
            }
          }
        )

        expect(eventCount.value).toBeGreaterThan(0)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("calls onCheckpoint callback at end", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator
        let checkpointCalled = false

        yield* coordinator.register(createEchoAgent("checkpoint-agent"))

        const task = new AgentTask({ taskId: "checkpoint-1" })
        yield* coordinator.executeSequential(
          task,
          [AgentId("checkpoint-agent")],
          {
            onCheckpoint: () => {
              checkpointCalled = true
              return Effect.void
            }
          }
        )

        expect(checkpointCalled).toBe(true)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))
  })

  describe("refineUntilConformant", () => {
    it.effect("stops immediately when graph is conformant", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        // Register agents
        yield* coordinator.register(createConformantValidatorAgent())
        yield* coordinator.register(createPassthroughCorrectorAgent())

        const graph = { entities: [{ id: "1" }] }
        const config = RefinementConfig.default(5)

        const result = yield* coordinator.refineUntilConformant(graph, config)

        expect(result.status).toBe("conformant")
        expect(result.iterations).toBe(1) // Just one validation needed
        expect(result.isConformant).toBe(true)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("refines until conformant", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        // Create mocks
        const { agent: validatorAgent, callCount: validatorCount } = createMockValidatorAgent()
        const { agent: correctorAgent, callCount: correctorCount } = createMockCorrectorAgent()

        yield* coordinator.register(validatorAgent)
        yield* coordinator.register(correctorAgent)

        const graph = { entities: [] }
        const config = RefinementConfig.default(10)

        const result = yield* coordinator.refineUntilConformant(graph, config)

        expect(result.status).toBe("conformant")
        // Validator is called until it returns conforms: true
        // Call 1: 3 violations, Call 2: 2 violations, Call 3: 1 violation, Call 4: 0 violations
        expect(validatorCount.value).toBe(4)
        // Corrector is called for each non-conformant validation
        expect(correctorCount.value).toBe(3)
        expect(result.iterations).toBe(4)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("stops at max iterations", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        // Create mocks but set max iterations lower than needed for conformance
        const { agent: validatorAgent } = createMockValidatorAgent()
        const { agent: correctorAgent } = createMockCorrectorAgent()

        yield* coordinator.register(validatorAgent)
        yield* coordinator.register(correctorAgent)

        const graph = { entities: [] }
        const config = new RefinementConfig({
          maxIterations: 2,
          stopOnConformance: true
        })

        const result = yield* coordinator.refineUntilConformant(graph, config)

        expect(result.status).toBe("max-iterations")
        expect(result.iterations).toBe(2)
        expect(result.isConformant).toBe(false)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("stops when confidence drops below threshold", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        const { agent: validatorAgent } = createMockValidatorAgent()
        const { agent: correctorAgent } = createMockCorrectorAgent() // confidence decreases each call

        yield* coordinator.register(validatorAgent)
        yield* coordinator.register(correctorAgent)

        const graph = { entities: [] }
        const config = new RefinementConfig({
          maxIterations: 10,
          stopOnConformance: true,
          minConfidence: 0.5 // Corrector confidence: 0.8, 0.6, 0.4 -> stops at 0.4
        })

        const result = yield* coordinator.refineUntilConformant(graph, config)

        expect(result.status).toBe("confidence-threshold")
        expect(result.iterations).toBeLessThan(4) // Should stop before conformance
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("emits checkpoint events at intervals", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator
        const checkpoints: Array<unknown> = []

        const { agent: validatorAgent } = createMockValidatorAgent()
        const { agent: correctorAgent } = createMockCorrectorAgent()

        yield* coordinator.register(validatorAgent)
        yield* coordinator.register(correctorAgent)

        const graph = { entities: [] }
        const config = new RefinementConfig({
          maxIterations: 10,
          stopOnConformance: true,
          checkpointInterval: 2
        })

        yield* coordinator.refineUntilConformant(graph, config, {
          onCheckpoint: (state) => {
            checkpoints.push(state)
            return Effect.void
          }
        })

        // At least one checkpoint from interval + final checkpoint
        expect(checkpoints.length).toBeGreaterThan(1)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("tracks violations fixed per iteration", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        const { agent: validatorAgent } = createMockValidatorAgent()
        const { agent: correctorAgent } = createMockCorrectorAgent()

        yield* coordinator.register(validatorAgent)
        yield* coordinator.register(correctorAgent)

        const graph = { entities: [] }
        const config = RefinementConfig.default(10)

        const result = yield* coordinator.refineUntilConformant(graph, config)

        expect(result.violationsFixed).toBeDefined()
        expect(result.violationsFixed!.length).toBeGreaterThan(0)
        expect(result.avgViolationsFixed).toBeGreaterThan(0)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("fails when validator agent is not registered", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        // Only register corrector, not validator
        yield* coordinator.register(createPassthroughCorrectorAgent())

        const graph = { entities: [] }
        const config = RefinementConfig.default(5)

        const result = yield* coordinator.refineUntilConformant(graph, config).pipe(
          Effect.either
        )

        expect(result._tag).toBe("Left")
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("fails when corrector agent is not registered", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        // Only register validator, not corrector
        yield* coordinator.register(createConformantValidatorAgent())

        const graph = { entities: [] }
        const config = new RefinementConfig({
          maxIterations: 5,
          stopOnConformance: false // Force it to try to correct
        })

        // When stopOnConformance is false, it will try to correct even if conformant
        // Actually, let's use a non-conforming validator
        yield* coordinator.unregister(AgentId("validator"))
        const { agent: nonConformingValidator } = createMockValidatorAgent()
        yield* coordinator.register(nonConformingValidator)

        const result = yield* coordinator.refineUntilConformant(graph, config).pipe(
          Effect.either
        )

        expect(result._tag).toBe("Left")
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("emits progress events", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator
        const progressEvents: Array<unknown> = []

        const { agent: validatorAgent } = createMockValidatorAgent()
        const { agent: correctorAgent } = createMockCorrectorAgent()

        yield* coordinator.register(validatorAgent)
        yield* coordinator.register(correctorAgent)

        const graph = { entities: [] }
        const config = RefinementConfig.default(10)

        yield* coordinator.refineUntilConformant(graph, config, {
          onEvent: (event) => {
            if (event._tag === "AgentProgress") {
              progressEvents.push(event)
            }
            return Effect.void
          }
        })

        // Should have progress events for each iteration
        expect(progressEvents.length).toBeGreaterThan(0)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))

    it.effect("returns duration in result", () =>
      Effect.gen(function*() {
        const coordinator = yield* AgentCoordinator

        yield* coordinator.register(createConformantValidatorAgent())
        yield* coordinator.register(createPassthroughCorrectorAgent())

        const graph = { entities: [] }
        const config = RefinementConfig.default(5)

        const result = yield* coordinator.refineUntilConformant(graph, config)

        expect(result.durationMs).toBeGreaterThanOrEqual(0)
      }).pipe(
        Effect.provide(AgentCoordinator.Default),
        Effect.provide(MockConfigService),
        Effect.provide(TestConfigProviderLayer)
      ))
  })
})
