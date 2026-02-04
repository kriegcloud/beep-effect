/**
 * Tests for Domain Model - Agent Types
 *
 * Tests the core Agent interface, events, and pipeline state types.
 *
 * @module test/Domain/Model/Agent
 */

import { Effect, Schema } from "effect"
import { describe, expect, it } from "vitest"
import {
  type Agent,
  AgentCompleted,
  type AgentEvent,
  AgentFailed,
  AgentId,
  AgentIdSchema,
  AgentMetadata,
  AgentProgress,
  AgentStarted,
  AgentTypeSchema,
  CheckpointConfig,
  IntermediateResult,
  PipelineCheckpoint,
  PipelineState,
  TerminationCondition,
  ValidationResult
} from "../../../src/Domain/Model/Agent.js"

describe("Agent Domain Model", () => {
  describe("AgentId", () => {
    it("should create a branded AgentId", () => {
      const id = AgentId("extractor")
      expect(id).toBe("extractor")
    })

    it("should validate valid agent IDs via schema", async () => {
      const validIds = ["extractor", "validator-v2", "my_agent", "a1"]

      for (const id of validIds) {
        const result = await Schema.decodeUnknown(AgentIdSchema)(id).pipe(
          Effect.either,
          Effect.runPromise
        )
        expect(result._tag).toBe("Right")
      }
    })

    it("should reject invalid agent IDs via schema", async () => {
      const invalidIds = [
        "Extractor", // Uppercase
        "123agent", // Starts with number
        "_private", // Starts with underscore
        "has space", // Contains space
        "" // Empty
      ]

      for (const id of invalidIds) {
        const result = await Schema.decodeUnknown(AgentIdSchema)(id).pipe(
          Effect.either,
          Effect.runPromise
        )
        expect(result._tag).toBe("Left")
      }
    })
  })

  describe("AgentType", () => {
    it("should validate known agent types", async () => {
      const validTypes = ["extractor", "validator", "resolver", "corrector", "reasoner"]

      for (const type of validTypes) {
        const result = await Schema.decodeUnknown(AgentTypeSchema)(type).pipe(
          Effect.either,
          Effect.runPromise
        )
        expect(result._tag).toBe("Right")
      }
    })

    it("should reject unknown agent types", async () => {
      const result = await Schema.decodeUnknown(AgentTypeSchema)("unknown").pipe(
        Effect.either,
        Effect.runPromise
      )
      expect(result._tag).toBe("Left")
    })
  })

  describe("AgentMetadata", () => {
    it("should create metadata with required fields", () => {
      const metadata = new AgentMetadata({
        id: AgentId("extractor"),
        name: "Entity Extractor",
        description: "Extracts entities and relations from text",
        type: "extractor"
      })

      expect(metadata.id).toBe("extractor")
      expect(metadata.name).toBe("Entity Extractor")
      expect(metadata.description).toContain("Extracts")
      expect(metadata.type).toBe("extractor")
      expect(metadata.version).toBeUndefined()
    })

    it("should include optional version", () => {
      const metadata = new AgentMetadata({
        id: AgentId("validator"),
        name: "SHACL Validator",
        description: "Validates RDF against SHACL shapes",
        type: "validator",
        version: "1.2.0"
      })

      expect(metadata.version).toBe("1.2.0")
    })

    it("should serialize to JSON", () => {
      const metadata = new AgentMetadata({
        id: AgentId("corrector"),
        name: "Corrector",
        description: "Corrects violations",
        type: "corrector"
      })

      const json = metadata.toJSON()
      expect(json._tag).toBe("AgentMetadata")
      expect(json.id).toBe("corrector")
    })
  })

  describe("ValidationResult", () => {
    it("should create passing result", () => {
      const result = ValidationResult.pass()
      expect(result.valid).toBe(true)
      expect(result.errorCount).toBe(0)
      expect(result.warningCount).toBe(0)
    })

    it("should create failing result with errors", () => {
      const result = ValidationResult.fail(["Error 1", "Error 2"])
      expect(result.valid).toBe(false)
      expect(result.errorCount).toBe(2)
      expect(result.errors).toContain("Error 1")
    })

    it("should create passing result with warnings", () => {
      const result = ValidationResult.warn(["Warning 1"])
      expect(result.valid).toBe(true)
      expect(result.warningCount).toBe(1)
      expect(result.errorCount).toBe(0)
    })
  })

  describe("Agent Interface", () => {
    it("should allow defining typed agents", () => {
      interface ParseError {
        message: string
      }

      const numberParser: Agent<string, number, ParseError> = {
        metadata: new AgentMetadata({
          id: AgentId("parser"),
          name: "Number Parser",
          description: "Parses strings to numbers",
          type: "extractor"
        }),
        execute: (input) =>
          Effect.try({
            try: () => {
              const n = parseInt(input, 10)
              if (isNaN(n)) throw new Error("Not a number")
              return n
            },
            catch: (e) => ({ message: String(e) })
          })
      }

      expect(numberParser.metadata.id).toBe("parser")
      expect(numberParser.validate).toBeUndefined()
    })

    it("should allow optional validate method", () => {
      const validatingAgent: Agent<string, string, never> = {
        metadata: new AgentMetadata({
          id: AgentId("echo"),
          name: "Echo",
          description: "Echoes input",
          type: "extractor"
        }),
        execute: (input) => Effect.succeed(input),
        validate: (input) =>
          Effect.succeed(
            input.length > 0
              ? ValidationResult.pass()
              : ValidationResult.fail(["Empty input"])
          )
      }

      expect(validatingAgent.validate).toBeDefined()
    })
  })

  describe("Agent Events", () => {
    const agentId = AgentId("test-agent")
    const now = Date.now()

    it("should create AgentStarted event", () => {
      const event = new AgentStarted({
        agentId,
        startedAt: now,
        inputSummary: "Processing document..."
      })

      expect(event._tag).toBe("AgentStarted")
      expect(event.agentId).toBe("test-agent")
      expect(event.startedAt).toBe(now)
    })

    it("should create AgentProgress event", () => {
      const event = new AgentProgress({
        agentId,
        progress: 50,
        message: "Halfway done",
        timestamp: now
      })

      expect(event._tag).toBe("AgentProgress")
      expect(event.progress).toBe(50)
      expect(event.message).toBe("Halfway done")
    })

    it("should create AgentCompleted event", () => {
      const event = new AgentCompleted({
        agentId,
        completedAt: now,
        durationMs: 1500,
        outputSummary: "Extracted 10 entities"
      })

      expect(event._tag).toBe("AgentCompleted")
      expect(event.durationMs).toBe(1500)
    })

    it("should create AgentFailed event", () => {
      const event = new AgentFailed({
        agentId,
        failedAt: now,
        durationMs: 500,
        error: "Connection timeout",
        retryable: true
      })

      expect(event._tag).toBe("AgentFailed")
      expect(event.error).toContain("timeout")
      expect(event.retryable).toBe(true)
    })

    it("should allow type-safe event handling", () => {
      const events: Array<AgentEvent> = [
        new AgentStarted({ agentId, startedAt: now }),
        new AgentProgress({ agentId, progress: 100, timestamp: now }),
        new AgentCompleted({ agentId, completedAt: now, durationMs: 1000 })
      ]

      const tags = events.map((e) => e._tag)
      expect(tags).toEqual(["AgentStarted", "AgentProgress", "AgentCompleted"])
    })
  })

  describe("PipelineState", () => {
    const pipelineId = "pipeline-123"
    const now = Date.now()

    it("should create initial pipeline state", () => {
      const state = new PipelineState({
        pipelineId,
        completedAgents: [],
        intermediateResults: [],
        startedAt: now,
        status: "pending"
      })

      expect(state.pipelineId).toBe(pipelineId)
      expect(state.status).toBe("pending")
      expect(state.isTerminal).toBe(false)
    })

    it("should track current agent", () => {
      const state = new PipelineState({
        pipelineId,
        currentAgentId: AgentId("extractor"),
        completedAgents: [],
        intermediateResults: [],
        startedAt: now,
        status: "running"
      })

      expect(state.currentAgentId).toBe("extractor")
    })

    it("should check if agent has completed", () => {
      const state = new PipelineState({
        pipelineId,
        completedAgents: [AgentId("extractor"), AgentId("validator")],
        intermediateResults: [],
        startedAt: now,
        status: "running"
      })

      expect(state.hasCompleted(AgentId("extractor"))).toBe(true)
      expect(state.hasCompleted(AgentId("corrector"))).toBe(false)
    })

    it("should store and retrieve intermediate results", () => {
      const result = new IntermediateResult({
        agentId: AgentId("extractor"),
        output: { entities: 10, relations: 5 },
        producedAt: now,
        durationMs: 1500
      })

      const state = new PipelineState({
        pipelineId,
        completedAgents: [AgentId("extractor")],
        intermediateResults: [result],
        startedAt: now,
        status: "running"
      })

      const retrieved = state.getResult(AgentId("extractor"))
      expect(retrieved).toBeDefined()
      expect(retrieved?.output).toEqual({ entities: 10, relations: 5 })
    })

    it("should track terminal states", () => {
      const completed = new PipelineState({
        pipelineId,
        completedAgents: [],
        intermediateResults: [],
        startedAt: now,
        completedAt: now + 5000,
        status: "completed"
      })

      const failed = new PipelineState({
        pipelineId,
        completedAgents: [],
        intermediateResults: [],
        startedAt: now,
        status: "failed",
        error: "Something went wrong"
      })

      expect(completed.isTerminal).toBe(true)
      expect(failed.isTerminal).toBe(true)
    })

    it("should calculate elapsed time", () => {
      const started = now - 5000 // 5 seconds ago
      const state = new PipelineState({
        pipelineId,
        completedAgents: [],
        intermediateResults: [],
        startedAt: started,
        status: "running"
      })

      expect(state.getElapsedMs(now)).toBeGreaterThanOrEqual(5000)
    })

    it("should serialize to JSON", () => {
      const state = new PipelineState({
        pipelineId,
        currentAgentId: AgentId("validator"),
        completedAgents: [AgentId("extractor")],
        intermediateResults: [],
        startedAt: now,
        status: "running",
        iterationCount: 2
      })

      const json = state.toJSON()
      expect(json._tag).toBe("PipelineState")
      expect(json.pipelineId).toBe(pipelineId)
      expect(json.currentAgentId).toBe("validator")
      expect(json.iterationCount).toBe(2)
    })
  })

  describe("PipelineCheckpoint", () => {
    it("should create checkpoint event", () => {
      const state = new PipelineState({
        pipelineId: "pipeline-123",
        completedAgents: [AgentId("extractor")],
        intermediateResults: [],
        startedAt: Date.now(),
        status: "running"
      })

      const checkpoint = new PipelineCheckpoint({
        state,
        reason: "agent-completed",
        timestamp: Date.now()
      })

      expect(checkpoint._tag).toBe("PipelineCheckpoint")
      expect(checkpoint.reason).toBe("agent-completed")
      expect(checkpoint.state.completedAgents).toContain("extractor")
    })
  })

  describe("TerminationCondition", () => {
    it("should create with maxIterations", () => {
      const condition = new TerminationCondition({
        maxIterations: 10
      })

      expect(condition.maxIterations).toBe(10)
    })

    it("should create default condition", () => {
      const condition = TerminationCondition.default()

      expect(condition.maxIterations).toBe(5)
      expect(condition.stopOnConformance).toBe(true)
    })

    it("should support optional thresholds", () => {
      const condition = new TerminationCondition({
        maxIterations: 3,
        stopOnConformance: true,
        minConfidence: 0.8,
        timeoutMs: 30000
      })

      expect(condition.minConfidence).toBe(0.8)
      expect(condition.timeoutMs).toBe(30000)
    })
  })

  describe("CheckpointConfig", () => {
    it("should create default config", () => {
      const config = CheckpointConfig.default()
      expect(config.afterAgents).toBeUndefined()
      expect(config.requireApproval).toBeUndefined()
    })

    it("should configure checkpoint triggers", () => {
      const config = new CheckpointConfig({
        afterAgents: [AgentId("extractor"), AgentId("validator")],
        everyNIterations: 2,
        requireApproval: true,
        approvalTimeoutMs: 60000
      })

      expect(config.afterAgents).toHaveLength(2)
      expect(config.everyNIterations).toBe(2)
      expect(config.requireApproval).toBe(true)
    })
  })
})
