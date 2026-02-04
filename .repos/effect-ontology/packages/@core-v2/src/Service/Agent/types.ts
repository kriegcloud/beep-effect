/**
 * Service Layer Types: Agent Orchestration
 *
 * Service-level type definitions for multi-agent orchestration.
 * Extends the domain model with service-specific concerns like
 * task definitions, execution contexts, and feedback handling.
 *
 * @since 2.0.0
 * @module Service/Agent/types
 */

import { Data, Schema } from "effect"
import {
  type Agent,
  type AgentId as AgentIdType,
  type AgentType,
  CheckpointConfig,
  PipelineState,
  TerminationCondition
} from "../../Domain/Model/Agent.js"
import { KnowledgeGraph } from "../../Domain/Model/Entity.js"
import { OntologyContext, OntologyRef } from "../../Domain/Model/Ontology.js"
import { OntologyAgentConfig, ViolationExplanation } from "../../Domain/Model/OntologyAgent.js"
import { ShaclValidationReport } from "../Shacl.js"

// =============================================================================
// Agent Task Definition
// =============================================================================

/**
 * AgentTask - A unit of work to be processed by the pipeline
 *
 * Wraps raw input with metadata for tracking and routing.
 *
 * @since 2.0.0
 * @category Domain
 */
export class AgentTask extends Schema.Class<AgentTask>("AgentTask")({
  /**
   * Unique task identifier
   */
  taskId: Schema.String.annotations({
    title: "Task ID",
    description: "Unique identifier for this task"
  }),

  /**
   * Ontology ID for scoping (e.g., "seattle")
   */
  ontologyId: Schema.optional(Schema.String),

  /**
   * Source text to process (for extraction tasks)
   */
  text: Schema.optional(Schema.String),

  /**
   * Source URL to ingest (for ingestion tasks)
   */
  sourceUrl: Schema.optional(Schema.String),

  /**
   * Optional ontology agent config override (for extraction tasks)
   */
  agentConfig: Schema.optional(OntologyAgentConfig),

  /**
   * Ingestion options (implementation-specific)
   */
  ingestionOptions: Schema.optional(Schema.Unknown),

  /**
   * Ingestion result metadata (implementation-specific)
   */
  ingestionResult: Schema.optional(Schema.Unknown),

  /**
   * Input knowledge graph (legacy; prefer knowledgeGraph/rdfStore/turtle)
   */
  graph: Schema.optional(Schema.Unknown), // KnowledgeGraph or RdfStore

  /**
   * Extracted knowledge graph
   */
  knowledgeGraph: Schema.optional(KnowledgeGraph),

  /**
   * RDF store for validation/correction
   */
  rdfStore: Schema.optional(Schema.Unknown),

  /**
   * Serialized RDF graph (Turtle)
   */
  turtle: Schema.optional(Schema.String),

  /**
   * Ontology context used for extraction/correction
   */
  ontologyContext: Schema.optional(OntologyContext),

  /**
   * Ontology reference used for extraction
   */
  ontologyRef: Schema.optional(OntologyRef),

  /**
   * Validation report (for correction tasks)
   */
  validationReport: Schema.optional(ShaclValidationReport),

  /**
   * Human-readable validation explanations
   */
  validationExplanations: Schema.optional(Schema.Array(ViolationExplanation)),

  /**
   * Correction result metadata (implementation-specific)
   */
  correctionResult: Schema.optional(Schema.Unknown),

  /**
   * Source document ID for provenance
   */
  documentId: Schema.optional(Schema.String),

  /**
   * Additional context for agents
   */
  context: Schema.optional(Schema.Record({
    key: Schema.String,
    value: Schema.Unknown
  })),

  /**
   * Priority (lower = higher priority)
   */
  priority: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.nonNegative()))
}) {
  /**
   * Create a text extraction task
   */
  static forExtraction(
    taskId: string,
    text: string,
    documentId?: string,
    agentConfig?: OntologyAgentConfig
  ): AgentTask {
    return new AgentTask({ taskId, text, documentId, agentConfig, priority: 1 })
  }

  /**
   * Create a validation task
   */
  static forValidation(taskId: string, graph: unknown): AgentTask {
    return new AgentTask({ taskId, graph, priority: 2 })
  }

  /**
   * Create an ingestion task
   */
  static forIngestion(taskId: string, sourceUrl: string, ingestionOptions?: unknown): AgentTask {
    return new AgentTask({ taskId, sourceUrl, ingestionOptions, priority: 0 })
  }

  /**
   * Create a correction task
   */
  static forCorrection(taskId: string, graph: unknown, validationReport: ShaclValidationReport): AgentTask {
    return new AgentTask({ taskId, graph, validationReport, priority: 3 })
  }
}

// =============================================================================
// Pipeline Configuration
// =============================================================================

/**
 * PipelineConfig - Configuration for a multi-agent pipeline
 *
 * @since 2.0.0
 * @category Domain
 */
export class PipelineConfig extends Schema.Class<PipelineConfig>("PipelineConfig")({
  /**
   * Unique pipeline identifier
   */
  pipelineId: Schema.String,

  /**
   * Execution mode (sequential, loop, parallel, graph)
   */
  mode: Schema.Literal("sequential", "loop", "parallel", "graph"),

  /**
   * Ordered list of agents to execute (for sequential/loop modes)
   */
  agentSequence: Schema.optional(Schema.Array(Schema.String)),

  /**
   * Termination condition (for loop mode)
   */
  termination: Schema.optional(TerminationCondition),

  /**
   * Checkpoint configuration
   */
  checkpoint: Schema.optional(CheckpointConfig),

  /**
   * Maximum concurrency (for parallel mode)
   */
  concurrency: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),

  /**
   * Enable detailed tracing
   */
  tracing: Schema.optional(Schema.Boolean)
}) {
  /**
   * Create a simple sequential pipeline
   */
  static sequential(pipelineId: string, agents: ReadonlyArray<string>): PipelineConfig {
    return new PipelineConfig({
      pipelineId,
      mode: "sequential",
      agentSequence: [...agents]
    })
  }

  /**
   * Create an extraction-validation-correction loop
   */
  static refinementLoop(
    pipelineId: string,
    maxIterations: number = 5
  ): PipelineConfig {
    return new PipelineConfig({
      pipelineId,
      mode: "loop",
      agentSequence: ["extractor", "validator", "corrector"],
      termination: new TerminationCondition({
        maxIterations,
        stopOnConformance: true
      })
    })
  }
}

// =============================================================================
// Human Feedback Types
// =============================================================================

/**
 * HumanFeedback - Feedback from human review at checkpoints
 *
 * @since 2.0.0
 * @category Events
 */
export type HumanFeedback =
  | HumanApprove
  | HumanReject
  | HumanModify
  | HumanSkip

/**
 * HumanApprove - Human approves the current state
 *
 * @since 2.0.0
 * @category Events
 */
export class HumanApprove extends Data.TaggedClass("HumanApprove")<{
  readonly reviewerId?: string
  readonly comment?: string
}> {}

/**
 * HumanReject - Human rejects the current state
 *
 * @since 2.0.0
 * @category Events
 */
export class HumanReject extends Data.TaggedClass("HumanReject")<{
  readonly reason: string
  readonly reviewerId?: string
}> {}

/**
 * HumanModify - Human provides modifications to the state
 *
 * @since 2.0.0
 * @category Events
 */
export class HumanModify extends Data.TaggedClass("HumanModify")<{
  /**
   * Changes to apply (agent-specific)
   */
  readonly changes: unknown
  readonly reviewerId?: string
  readonly comment?: string
}> {}

/**
 * HumanSkip - Human skips a specific agent
 *
 * @since 2.0.0
 * @category Events
 */
export class HumanSkip extends Data.TaggedClass("HumanSkip")<{
  readonly agentId: AgentIdType
  readonly reason?: string
  readonly reviewerId?: string
}> {}

// =============================================================================
// Refinement Configuration
// =============================================================================

/**
 * RefinementConfig - Configuration for the validation-correction loop
 *
 * Controls how the refinement loop executes and when it terminates.
 *
 * @since 2.0.0
 * @category Domain
 */
export class RefinementConfig extends Schema.Class<RefinementConfig>("RefinementConfig")({
  /**
   * Maximum number of correction iterations
   */
  maxIterations: Schema.Number.pipe(Schema.int(), Schema.positive()).annotations({
    default: 5
  }),

  /**
   * Stop when validation report conforms
   */
  stopOnConformance: Schema.Boolean.annotations({
    default: true
  }),

  /**
   * Minimum confidence threshold - stop if correction confidence drops below this
   */
  minConfidence: Schema.optional(Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(0),
    Schema.lessThanOrEqualTo(1)
  )),

  /**
   * Emit checkpoint every N iterations
   */
  checkpointInterval: Schema.optional(Schema.Number.pipe(Schema.int(), Schema.positive())),

  /**
   * Timeout for the entire refinement loop in milliseconds
   */
  timeoutMs: Schema.optional(Schema.Number.pipe(Schema.positive())),

  /**
   * Whether to save intermediate states for resume
   */
  enableResume: Schema.optional(Schema.Boolean),

  /**
   * Agent ID for the validator
   */
  validatorId: Schema.optional(Schema.String),

  /**
   * Agent ID for the corrector
   */
  correctorId: Schema.optional(Schema.String)
}) {
  /**
   * Create a default refinement config
   */
  static default(maxIterations: number = 5): RefinementConfig {
    return new RefinementConfig({
      maxIterations,
      stopOnConformance: true
    })
  }

  /**
   * Create a strict refinement config with low confidence threshold
   */
  static strict(maxIterations: number = 10, minConfidence: number = 0.8): RefinementConfig {
    return new RefinementConfig({
      maxIterations,
      stopOnConformance: true,
      minConfidence,
      checkpointInterval: 2
    })
  }

  /**
   * Convert to TerminationCondition
   */
  toTerminationCondition(): TerminationCondition {
    return new TerminationCondition({
      maxIterations: this.maxIterations,
      stopOnConformance: this.stopOnConformance,
      timeoutMs: this.timeoutMs
    })
  }
}

// =============================================================================
// Pipeline Result Types
// =============================================================================

/**
 * RefinementStatus - Outcome of a refinement loop
 *
 * @since 2.0.0
 * @category Types
 */
export type RefinementStatus =
  | "conformant" // All validations pass
  | "max-iterations" // Hit iteration limit
  | "timeout" // Hit time limit
  | "confidence-threshold" // Confidence dropped too low
  | "human-rejected" // Human rejected at checkpoint
  | "error" // Pipeline error

/**
 * RefinementResult - Result of a validation-correction loop
 *
 * @since 2.0.0
 * @category Domain
 */
export class RefinementResult extends Schema.Class<RefinementResult>("RefinementResult")({
  /**
   * Final knowledge graph
   */
  graph: Schema.Unknown, // KnowledgeGraph

  /**
   * Number of refinement iterations
   */
  iterations: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * How the loop terminated
   */
  status: Schema.Literal(
    "conformant",
    "max-iterations",
    "timeout",
    "confidence-threshold",
    "human-rejected",
    "error"
  ),

  /**
   * Final validation report
   */
  validationReport: Schema.optional(Schema.Unknown), // ShaclValidationReport

  /**
   * Total duration in milliseconds
   */
  durationMs: Schema.Number.pipe(Schema.nonNegative()),

  /**
   * Error message if status is "error"
   */
  error: Schema.optional(Schema.String),

  /**
   * Violations fixed per iteration
   */
  violationsFixed: Schema.optional(Schema.Array(Schema.Number))
}) {
  /**
   * Whether refinement produced a conformant graph
   */
  get isConformant(): boolean {
    return this.status === "conformant"
  }

  /**
   * Average violations fixed per iteration
   */
  get avgViolationsFixed(): number {
    if (!this.violationsFixed || this.violationsFixed.length === 0) return 0
    const sum = this.violationsFixed.reduce((a, b) => a + b, 0)
    return sum / this.violationsFixed.length
  }
}

// =============================================================================
// Agent Registry Types
// =============================================================================

/**
 * RegisteredAgent - An agent registered with the coordinator
 *
 * Wraps the Agent interface with registration metadata.
 *
 * @since 2.0.0
 * @category Domain
 */
export interface RegisteredAgent<I = unknown, O = unknown, E = unknown, R = never> {
  /**
   * The agent implementation
   */
  readonly agent: Agent<I, O, E, R>

  /**
   * Registration timestamp
   */
  readonly registeredAt: number

  /**
   * Agent type for routing
   */
  readonly agentType: AgentType

  /**
   * Whether this agent is currently enabled
   */
  readonly enabled: boolean
}

/**
 * AgentRegistry - Type for the agent registry map
 *
 * @since 2.0.0
 * @category Types
 */
export type AgentRegistry = ReadonlyMap<AgentIdType, RegisteredAgent>

// =============================================================================
// Execution Context
// =============================================================================

/**
 * ExecutionContext - Runtime context for agent execution
 *
 * Provides access to shared state and utilities during execution.
 *
 * @since 2.0.0
 * @category Domain
 */
export class ExecutionContext extends Schema.Class<ExecutionContext>("ExecutionContext")({
  /**
   * Current pipeline state
   */
  pipelineState: PipelineState,

  /**
   * Current iteration (for loop mode)
   */
  iteration: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),

  /**
   * Whether tracing is enabled
   */
  tracingEnabled: Schema.Boolean,

  /**
   * Parent span ID for distributed tracing
   */
  parentSpanId: Schema.optional(Schema.String),

  /**
   * Correlation ID for request tracking
   */
  correlationId: Schema.optional(Schema.String)
}) {}

// =============================================================================
// Error Types
// =============================================================================

/**
 * AgentExecutionError - Error during agent execution
 *
 * @since 2.0.0
 * @category Errors
 */
export class AgentExecutionError extends Data.TaggedError("AgentExecutionError")<{
  readonly agentId: AgentIdType
  readonly message: string
  readonly cause?: unknown
  readonly retryable: boolean
}> {}

/**
 * PipelineExecutionError - Error during pipeline execution
 *
 * @since 2.0.0
 * @category Errors
 */
export class PipelineExecutionError extends Data.TaggedError("PipelineExecutionError")<{
  readonly pipelineId: string
  readonly message: string
  readonly failedAgentId?: AgentIdType
  readonly state: PipelineState
  readonly cause?: unknown
}> {}

/**
 * AgentNotFoundError - Requested agent not registered
 *
 * @since 2.0.0
 * @category Errors
 */
export class AgentNotFoundError extends Data.TaggedError("AgentNotFoundError")<{
  readonly agentId: AgentIdType
  readonly registeredAgents: ReadonlyArray<AgentIdType>
}> {}

/**
 * CheckpointTimeoutError - Human approval not received in time
 *
 * @since 2.0.0
 * @category Errors
 */
export class CheckpointTimeoutError extends Data.TaggedError("CheckpointTimeoutError")<{
  readonly pipelineId: string
  readonly checkpointId: string
  readonly timeoutMs: number
}> {}
