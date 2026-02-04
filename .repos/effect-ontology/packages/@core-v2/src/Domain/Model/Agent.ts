/**
 * Domain Model: Agent Types for Multi-Agent Orchestration
 *
 * Core abstractions for the multi-agent pipeline framework.
 * Defines the Agent interface, event types, and pipeline state.
 *
 * ## Agent Types
 * - **ExtractorAgent**: Entity/relation extraction from text
 * - **ValidatorAgent**: SHACL validation of RDF graphs
 * - **ResolverAgent**: Entity deduplication and conflict resolution
 * - **CorrectorAgent**: LLM-based violation correction
 * - **ReasonerAgent**: RDFS inference and rule application
 * - **IngestorAgent**: Document ingestion and enrichment
 *
 * ## Usage
 * ```typescript
 * // Define a typed agent
 * const extractorAgent: Agent<ExtractorInput, ExtractionResult, ExtractionError> = {
 *   name: "extractor",
 *   description: "Extracts entities and relations from text",
 *   execute: (input) => Effect.gen(function*() {
 *     // extraction logic
 *   })
 * }
 *
 * // Subscribe to agent events
 * Stream.forEach(agentEvents, (event) =>
 *   Match.type<AgentEvent>().pipe(
 *     Match.tag("Started", ({ agent }) => console.log(`${agent} started`)),
 *     Match.tag("Completed", ({ agent, output }) => console.log(`${agent} done`)),
 *     Match.orElse(() => {})
 *   )(event)
 * )
 * ```
 *
 * @since 2.0.0
 * @module Domain/Model/Agent
 */

import { Data, type Effect, Schema } from "effect"

// =============================================================================
// Agent Identifier
// =============================================================================

/**
 * Schema for agent identifiers
 *
 * Agent IDs must be lowercase alphanumeric with optional hyphens/underscores.
 *
 * @example "extractor", "validator", "corrector-v2"
 *
 * @since 2.0.0
 * @category Schemas
 */
export const AgentIdSchema = Schema.String.pipe(
  Schema.pattern(/^[a-z][a-z0-9_-]*$/),
  Schema.brand("AgentId"),
  Schema.annotations({
    title: "Agent ID",
    description: "Unique identifier for an agent"
  })
)

/**
 * Branded AgentId type for compile-time safety
 *
 * @since 2.0.0
 * @category Types
 */
export type AgentId = typeof AgentIdSchema.Type

/**
 * Create a branded AgentId from a string (unsafe - no validation)
 *
 * @since 2.0.0
 * @category Constructors
 */
export const AgentId = (id: string): AgentId => id as AgentId

// =============================================================================
// Agent Type Enum
// =============================================================================

/**
 * Enumeration of known agent types in the pipeline
 *
 * @since 2.0.0
 * @category Types
 */
export type AgentType =
  | "extractor"
  | "validator"
  | "resolver"
  | "corrector"
  | "reasoner"
  | "ingestor"

/**
 * Schema for agent types
 *
 * @since 2.0.0
 * @category Schemas
 */
export const AgentTypeSchema = Schema.Literal(
  "extractor",
  "validator",
  "resolver",
  "corrector",
  "reasoner",
  "ingestor"
).annotations({
  title: "Agent Type",
  description: "Type of agent in the pipeline"
})

// =============================================================================
// Agent Metadata
// =============================================================================

/**
 * AgentMetadata - Descriptive information about an agent
 *
 * Used for logging, debugging, and UI display.
 *
 * @since 2.0.0
 * @category Domain
 */
export class AgentMetadata extends Schema.Class<AgentMetadata>("AgentMetadata")({
  /**
   * Unique identifier for this agent
   */
  id: AgentIdSchema,

  /**
   * Human-readable name
   */
  name: Schema.String.annotations({
    title: "Name",
    description: "Human-readable agent name"
  }),

  /**
   * Description of what this agent does
   */
  description: Schema.String.annotations({
    title: "Description",
    description: "What this agent does"
  }),

  /**
   * Agent type category
   */
  type: AgentTypeSchema,

  /**
   * Version of the agent implementation
   */
  version: Schema.optional(Schema.String).annotations({
    title: "Version",
    description: "Agent implementation version"
  })
}) {
  toJSON() {
    return {
      _tag: "AgentMetadata" as const,
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      version: this.version
    }
  }
}

// =============================================================================
// Agent Interface
// =============================================================================

/**
 * Agent - Core abstraction for pipeline participants
 *
 * An agent is a stateless processing unit that:
 * - Has a unique identifier and descriptive metadata
 * - Accepts typed input and produces typed output
 * - May fail with typed errors
 * - Optionally validates input before execution
 *
 * Agents are orchestrated by an AgentCoordinator which manages:
 * - Sequential, parallel, and iterative execution patterns
 * - Event streaming for progress monitoring
 * - Checkpointing for resume/recovery
 *
 * @typeParam Input - The input type this agent accepts
 * @typeParam Output - The output type this agent produces
 * @typeParam Error - The error type this agent may fail with
 * @typeParam R - Effect requirements (dependencies)
 *
 * @example
 * ```typescript
 * const myAgent: Agent<string, number, ParseError> = {
 *   metadata: new AgentMetadata({
 *     id: AgentId("parser"),
 *     name: "Number Parser",
 *     description: "Parses strings to numbers",
 *     type: "extractor"
 *   }),
 *   execute: (input) =>
 *     Effect.try({
 *       try: () => parseInt(input, 10),
 *       catch: (e) => new ParseError({ message: String(e) })
 *     })
 * }
 * ```
 *
 * @since 2.0.0
 * @category Core
 */
export interface Agent<Input, Output, Error, R = never> {
  /**
   * Agent metadata (id, name, description, type)
   */
  readonly metadata: AgentMetadata

  /**
   * Execute the agent's core logic
   *
   * @param input - Typed input for this agent
   * @returns Effect yielding output or failing with typed error
   */
  readonly execute: (input: Input) => Effect.Effect<Output, Error, R>

  /**
   * Optional input validation before execution
   *
   * If provided, the coordinator will call this before execute().
   * Validation failures short-circuit execution.
   *
   * @param input - Input to validate
   * @returns Effect yielding validation result
   */
  readonly validate?: (input: Input) => Effect.Effect<ValidationResult, never, R>
}

// =============================================================================
// Validation Result
// =============================================================================

/**
 * ValidationResult - Outcome of input validation
 *
 * @since 2.0.0
 * @category Domain
 */
export class ValidationResult extends Schema.Class<ValidationResult>("ValidationResult")({
  /**
   * Whether validation passed
   */
  valid: Schema.Boolean,

  /**
   * Validation errors (if any)
   */
  errors: Schema.optional(Schema.Array(Schema.String)).annotations({
    title: "Errors",
    description: "List of validation error messages"
  }),

  /**
   * Validation warnings (non-blocking)
   */
  warnings: Schema.optional(Schema.Array(Schema.String)).annotations({
    title: "Warnings",
    description: "List of validation warnings"
  })
}) {
  /**
   * Create a passing validation result
   */
  static pass(): ValidationResult {
    return new ValidationResult({ valid: true })
  }

  /**
   * Create a failing validation result
   */
  static fail(errors: ReadonlyArray<string>): ValidationResult {
    return new ValidationResult({ valid: false, errors: [...errors] })
  }

  /**
   * Create a passing result with warnings
   */
  static warn(warnings: ReadonlyArray<string>): ValidationResult {
    return new ValidationResult({ valid: true, warnings: [...warnings] })
  }

  get errorCount(): number {
    return this.errors?.length ?? 0
  }

  get warningCount(): number {
    return this.warnings?.length ?? 0
  }

  toJSON() {
    return {
      _tag: "ValidationResult" as const,
      valid: this.valid,
      errors: this.errors,
      warnings: this.warnings
    }
  }
}

// =============================================================================
// Agent Events
// =============================================================================

/**
 * AgentStarted - Emitted when an agent begins execution
 *
 * @since 2.0.0
 * @category Events
 */
export class AgentStarted extends Data.TaggedClass("AgentStarted")<{
  /**
   * ID of the agent that started
   */
  readonly agentId: AgentId

  /**
   * Timestamp when agent started (epoch ms)
   */
  readonly startedAt: number

  /**
   * Input provided to the agent (serializable subset)
   */
  readonly inputSummary?: string
}> {}

/**
 * AgentProgress - Emitted during agent execution for progress updates
 *
 * @since 2.0.0
 * @category Events
 */
export class AgentProgress extends Data.TaggedClass("AgentProgress")<{
  /**
   * ID of the agent reporting progress
   */
  readonly agentId: AgentId

  /**
   * Progress percentage (0-100)
   */
  readonly progress: number

  /**
   * Optional status message
   */
  readonly message?: string

  /**
   * Timestamp of this progress update (epoch ms)
   */
  readonly timestamp: number
}> {}

/**
 * AgentCompleted - Emitted when an agent finishes successfully
 *
 * @since 2.0.0
 * @category Events
 */
export class AgentCompleted extends Data.TaggedClass("AgentCompleted")<{
  /**
   * ID of the agent that completed
   */
  readonly agentId: AgentId

  /**
   * Timestamp when agent completed (epoch ms)
   */
  readonly completedAt: number

  /**
   * Duration in milliseconds
   */
  readonly durationMs: number

  /**
   * Summary of the output (serializable subset)
   */
  readonly outputSummary?: string
}> {}

/**
 * AgentFailed - Emitted when an agent fails with an error
 *
 * @since 2.0.0
 * @category Events
 */
export class AgentFailed extends Data.TaggedClass("AgentFailed")<{
  /**
   * ID of the agent that failed
   */
  readonly agentId: AgentId

  /**
   * Timestamp when agent failed (epoch ms)
   */
  readonly failedAt: number

  /**
   * Duration before failure in milliseconds
   */
  readonly durationMs: number

  /**
   * Error message
   */
  readonly error: string

  /**
   * Whether this error is retryable
   */
  readonly retryable: boolean
}> {}

/**
 * PipelineCheckpoint - Emitted when pipeline state is checkpointed
 *
 * @since 2.0.0
 * @category Events
 */
export class PipelineCheckpoint extends Data.TaggedClass("PipelineCheckpoint")<{
  /**
   * Current pipeline state snapshot
   */
  readonly state: PipelineState

  /**
   * Checkpoint reason
   */
  readonly reason: "scheduled" | "agent-completed" | "manual" | "error-recovery"

  /**
   * Timestamp of checkpoint (epoch ms)
   */
  readonly timestamp: number
}> {}

/**
 * AgentEvent - Union of all agent-related events
 *
 * Use this type for event streaming in agent orchestration.
 *
 * @example
 * ```typescript
 * const handler = (event: AgentEvent) => {
 *   if (event._tag === "AgentCompleted") {
 *     console.log(`${event.agentId} completed in ${event.durationMs}ms`)
 *   }
 * }
 * ```
 *
 * @since 2.0.0
 * @category Events
 */
export type AgentEvent =
  | AgentStarted
  | AgentProgress
  | AgentCompleted
  | AgentFailed
  | PipelineCheckpoint

// =============================================================================
// Pipeline State
// =============================================================================

/**
 * IntermediateResult - Stored output from a completed agent
 *
 * @since 2.0.0
 * @category Domain
 */
export class IntermediateResult extends Schema.Class<IntermediateResult>("IntermediateResult")({
  /**
   * Agent ID that produced this result
   */
  agentId: AgentIdSchema,

  /**
   * Serialized output (JSON string for complex types)
   */
  output: Schema.Unknown,

  /**
   * Timestamp when result was produced
   */
  producedAt: Schema.Number.annotations({
    title: "Produced At",
    description: "Epoch milliseconds when result was produced"
  }),

  /**
   * Execution duration in milliseconds
   */
  durationMs: Schema.Number.pipe(Schema.nonNegative())
}) {}

/**
 * PipelineState - Current state of a multi-agent pipeline execution
 *
 * Used for checkpointing, resume, and progress tracking.
 *
 * @example
 * ```typescript
 * const state = new PipelineState({
 *   pipelineId: "pipeline-123",
 *   currentAgentId: AgentId("validator"),
 *   completedAgents: [AgentId("extractor")],
 *   intermediateResults: [
 *     new IntermediateResult({
 *       agentId: AgentId("extractor"),
 *       output: { entities: [...], relations: [...] },
 *       producedAt: Date.now(),
 *       durationMs: 1500
 *     })
 *   ],
 *   startedAt: Date.now() - 2000,
 *   status: "running"
 * })
 * ```
 *
 * @since 2.0.0
 * @category Domain
 */
export class PipelineState extends Schema.Class<PipelineState>("PipelineState")({
  /**
   * Unique identifier for this pipeline execution
   */
  pipelineId: Schema.String.annotations({
    title: "Pipeline ID",
    description: "Unique execution identifier"
  }),

  /**
   * Currently executing agent (if any)
   */
  currentAgentId: Schema.optional(AgentIdSchema),

  /**
   * List of agents that have completed successfully
   */
  completedAgents: Schema.Array(AgentIdSchema).annotations({
    title: "Completed Agents",
    description: "Agent IDs that have completed"
  }),

  /**
   * Stored outputs from completed agents
   */
  intermediateResults: Schema.Array(IntermediateResult).annotations({
    title: "Intermediate Results",
    description: "Outputs from completed agents"
  }),

  /**
   * Pipeline start timestamp (epoch ms)
   */
  startedAt: Schema.Number.annotations({
    title: "Started At",
    description: "Pipeline start time (epoch ms)"
  }),

  /**
   * Pipeline completion timestamp (epoch ms, if complete)
   */
  completedAt: Schema.optional(Schema.Number),

  /**
   * Current pipeline status
   */
  status: Schema.Literal("pending", "running", "paused", "completed", "failed").annotations({
    title: "Status",
    description: "Current pipeline execution status"
  }),

  /**
   * Error message if status is "failed"
   */
  error: Schema.optional(Schema.String),

  /**
   * Total iteration count (for looping pipelines)
   */
  iterationCount: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.nonNegative()))
}) {
  /**
   * Get result from a specific agent
   */
  getResult(agentId: AgentId): IntermediateResult | undefined {
    return this.intermediateResults.find((r) => r.agentId === agentId)
  }

  /**
   * Check if an agent has completed
   */
  hasCompleted(agentId: AgentId): boolean {
    return this.completedAgents.includes(agentId)
  }

  /**
   * Get total duration so far
   *
   * @param now - Current time (epoch ms)
   */
  getElapsedMs(now: number): number {
    const end = this.completedAt ?? now
    return end - this.startedAt
  }

  /**
   * Check if pipeline is terminal (completed or failed)
   */
  get isTerminal(): boolean {
    return this.status === "completed" || this.status === "failed"
  }

  toJSON() {
    return {
      _tag: "PipelineState" as const,
      pipelineId: this.pipelineId,
      currentAgentId: this.currentAgentId,
      completedAgents: this.completedAgents,
      intermediateResultCount: this.intermediateResults.length,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      status: this.status,
      error: this.error,
      iterationCount: this.iterationCount,
      elapsedMs: this.completedAt ? this.getElapsedMs(this.completedAt) : undefined
    }
  }
}

// =============================================================================
// Pipeline Configuration
// =============================================================================

/**
 * PipelineMode - Execution pattern for the pipeline
 *
 * @since 2.0.0
 * @category Types
 */
export type PipelineMode =
  | "sequential" // A → B → C (linear)
  | "loop" // A → B → C → (repeat until condition)
  | "parallel" // A, B, C concurrently
  | "graph" // Arbitrary DAG based on dependencies

/**
 * Schema for pipeline execution modes
 *
 * @since 2.0.0
 * @category Schemas
 */
export const PipelineModeSchema = Schema.Literal(
  "sequential",
  "loop",
  "parallel",
  "graph"
).annotations({
  title: "Pipeline Mode",
  description: "Execution pattern for agent orchestration"
})

/**
 * TerminationCondition - When to stop a looping pipeline
 *
 * @since 2.0.0
 * @category Domain
 */
export class TerminationCondition extends Schema.Class<TerminationCondition>("TerminationCondition")({
  /**
   * Maximum iterations before forced stop
   */
  maxIterations: Schema.Number.pipe(Schema.int(), Schema.positive()).annotations({
    title: "Max Iterations",
    description: "Stop after this many iterations"
  }),

  /**
   * Stop when all validations pass
   */
  stopOnConformance: Schema.optional(Schema.Boolean).annotations({
    title: "Stop on Conformance",
    description: "Stop when validation passes"
  }),

  /**
   * Stop if confidence drops below threshold
   */
  minConfidence: Schema.optional(Schema.Number.pipe(Schema.between(0, 1))).annotations({
    title: "Min Confidence",
    description: "Stop if confidence falls below this"
  }),

  /**
   * Timeout in milliseconds
   */
  timeoutMs: Schema.optional(Schema.Number.pipe(Schema.positive())).annotations({
    title: "Timeout",
    description: "Stop after this duration"
  })
}) {
  static default(): TerminationCondition {
    return new TerminationCondition({
      maxIterations: 5,
      stopOnConformance: true
    })
  }
}

/**
 * CheckpointConfig - When and how to checkpoint pipeline state
 *
 * @since 2.0.0
 * @category Domain
 */
export class CheckpointConfig extends Schema.Class<CheckpointConfig>("CheckpointConfig")({
  /**
   * Checkpoint after these agents complete
   */
  afterAgents: Schema.optional(Schema.Array(AgentIdSchema)),

  /**
   * Checkpoint every N iterations (for loop mode)
   */
  everyNIterations: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),

  /**
   * Require human approval at checkpoints
   */
  requireApproval: Schema.optional(Schema.Boolean),

  /**
   * Auto-continue timeout if approval not received
   */
  approvalTimeoutMs: Schema.optional(Schema.Number.pipe(Schema.positive()))
}) {
  static default(): CheckpointConfig {
    return new CheckpointConfig({})
  }
}
