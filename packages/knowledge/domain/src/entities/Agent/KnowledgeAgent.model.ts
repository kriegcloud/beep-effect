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
 * @since 0.1.0
 * @module entities/Agent/Agent.model
 */

import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Confidence } from "@beep/knowledge-domain/value-objects";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import { thunkFalse, thunkTrue } from "@beep/utils";
import * as M from "@effect/sql/Model";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/KnowledgeAgent/KnowledgeAgent.model");

/**
 * Schema for agent types
 *
 * @since 0.1.0
 * @category Schemas
 */
export class AgentType extends BS.StringLiteralKit(
  "extractor",
  "validator",
  "resolver",
  "corrector",
  "reasoner",
  "ingestor"
).annotations(
  $I.annotations("AgentType", {
    description: "Agent type for multi-agent orchestration",
  })
) {}

export declare namespace AgentType {
  export type Type = S.Schema.Type<typeof AgentType>;
  export type Encoded = S.Schema.Encoded<typeof AgentType>;
}
// =============================================================================
// Agent Metadata
// =============================================================================

/**
 * AgentMetadata - Descriptive information about an agent
 *
 * Used for logging, debugging, and UI display.
 *
 * @since 0.1.0
 * @category Domain
 */
export class AgentMetadata extends S.Class<AgentMetadata>("AgentMetadata")({
  /**
   * Unique identifier for this agent
   */
  id: KnowledgeEntityIds.KnowledgeAgentId.annotations({
    description: "Unique identifier for this agent",
  }),

  /**
   * Human-readable name
   */
  name: S.String.annotations({
    title: "Name",
    description: "Human-readable agent name",
  }),
  /**
   * Description of what this agent does
   */
  description: S.String.annotations({
    title: "Description",
    description: "What this agent does",
  }),

  /**
   * Agent type category
   */
  type: AgentType,

  /**
   * Version of the agent implementation
   */
  version: S.optional(S.String).annotations({
    title: "Version",
    description: "Agent implementation version",
  }),
}) {
  readonly toJSON = () => ({
    _tag: "AgentMetadata" as const,
    id: this.id,
    name: this.name,
    description: this.description,
    type: this.type,
    version: this.version,
  });
}

export class Model extends M.Class<Model>($I`BatchExecutionModel`)(
  makeFields(KnowledgeEntityIds.KnowledgeAgentId, {
    metadata: AgentMetadata,
    organizationId: SharedEntityIds.OrganizationId,
  }),
  $I.annotations("BatchExecutionModel", {
    description: "Batch extraction execution record with status, progress tracking, and configuration.",
  })
) {
  static readonly utils = modelKit(Model);

  /**
   * Execute the agent's core logic
   *
   * @returns Effect yielding output or failing with typed error
   * @param fn
   */
  readonly execute = <Input, Output, Error, R = never>(fn: (input: Input) => Effect.Effect<Output, Error, R>) => {
    return Effect.fn(function* (input: Input) {
      yield* fn(input);
    });
  };

  /**
   * Optional input validation before execution
   *
   * If provided, the coordinator will call this before execute().
   * Validation failures short-circuit execution.
   *
   * @returns Effect yielding validation result
   * @param fn
   */
  readonly validate = <Input, Output, Error, R = never>(fn: (input: Input) => Effect.Effect<Output, Error, R>) => {
    return Effect.fn(function* (input: Input) {
      yield* fn(input);
    });
  };
}

// =============================================================================
// Validation Result
// =============================================================================

/**
 * ValidationResult - Outcome of input validation
 *
 * @since 0.1.0
 * @category Domain
 */
export class ValidationResult extends S.Class<ValidationResult>($I`ValidationResult`)(
  {
    /**
     * Whether validation passed
     */
    valid: S.Boolean,

    /**
     * Validation errors (if any)
     */
    errors: S.optional(S.Array(S.String)).annotations({
      title: "Errors",
      description: "List of validation error messages",
    }),

    /**
     * Validation warnings (non-blocking)
     */
    warnings: S.optional(S.Array(S.String)).annotations({
      title: "Warnings",
      description: "List of validation warnings",
    }),
  },
  $I.annotations("ValidationResult", {
    description: "Outcome of input validation",
  })
) {
  /**
   * Create a passing validation result
   */
  static pass(): ValidationResult {
    return new ValidationResult({ valid: true });
  }

  /**
   * Create a failing validation result
   */
  static fail(errors: ReadonlyArray<string>): ValidationResult {
    return new ValidationResult({ valid: false, errors: [...errors] });
  }

  /**
   * Create a passing result with warnings
   */
  static warn(warnings: ReadonlyArray<string>): ValidationResult {
    return new ValidationResult({ valid: true, warnings: [...warnings] });
  }

  get errorCount(): number {
    return this.errors?.length ?? 0;
  }

  get warningCount(): number {
    return this.warnings?.length ?? 0;
  }

  toJSON() {
    return {
      _tag: "ValidationResult" as const,
      valid: this.valid,
      errors: this.errors,
      warnings: this.warnings,
    };
  }
}

// =============================================================================
// Agent Events
// =============================================================================

export class AgentEventTag extends BS.StringLiteralKit(
  "AgentStarted",
  "AgentProgress",
  "AgentCompleted",
  "AgentFailed"
).annotations(
  $I.annotations("AgentEventTag", {
    description: "Tag for agent events",
  })
) {}

const makeAgentEventKind = AgentEventTag.toTagged("_tag").composer({
  /**
   * ID of the agent that started
   */
  agentId: KnowledgeEntityIds.KnowledgeAgentId,
});

/**
 * AgentStarted - Emitted when an agent begins execution
 *
 * @since 0.1.0
 * @category Events
 */
export class AgentStarted extends S.Class<AgentStarted>($I`AgentStarted`)(
  makeAgentEventKind.AgentStarted({
    /**
     * Timestamp when agent started (DateTime.Utc)
     */
    startedAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "Timestamp when agent started (DateTime.Utc)",
    }),
    /**
     * Input provided to the agent (serializable subset)
     */
    inputSummary: S.optionalWith(S.String, { as: "Option" }).annotations({
      description: "Input provided to the agent (serializable subset)",
    }),
  }),
  $I.annotations("AgentStarted", {
    description: "Emitted when an agent begins execution",
  })
) {}

/**
 * AgentProgress - Emitted during agent execution for progress updates
 *
 * @since 2.0.0
 * @category Events
 */
export class AgentProgress extends S.Class<AgentProgress>($I`AgentProgress`)(
  makeAgentEventKind.AgentProgress({
    /**
     * Progress percentage (0-100)
     */
    progress: S.Int.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(100)).annotations({
      description: "Progress percentage (0-100)",
    }),

    /**
     * Optional status message
     */
    message: S.optionalWith(S.String, { as: "Option" }).annotations({
      description: "Optional status message",
    }),
    /**
     * Timestamp of this progress update (DateTime.Utc)
     */
    timestamp: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "Timestamp of this progress update (DateTime.Utc)",
    }),
  }),
  $I.annotations("AgentProgress", {
    description: "Emitted during agent execution for progress updates",
  })
) {}

/**
 * AgentCompleted - Emitted when an agent finishes successfully
 *
 * @since 2.0.0
 * @category Events
 */
export class AgentCompleted extends S.Class<AgentCompleted>($I`AgentCompleted`)(
  makeAgentEventKind.AgentCompleted({
    /**
     * Timestamp when agent completed (DateTime.Utc)
     */
    completedAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "Timestamp when agent completed (DateTime.Utc)",
    }),
    /**
     * Duration in milliseconds
     */
    durationMs: S.Int.pipe(S.greaterThanOrEqualTo(0)).annotations({
      description: "Duration in milliseconds",
    }),
    /**
     * Summary of the output (serializable subset)
     */
    outputSummary: S.optionalWith(S.String, { as: "Option" }).annotations({
      description: "Summary of the output (serializable subset)",
    }),
  }),
  $I.annotations("AgentCompleted", {
    description: "Emitted when an agent finishes successfully",
  })
) {}

/**
 * AgentFailed - Emitted when an agent fails with an error
 *
 * @since 2.0.0
 * @category Events
 */
export class AgentFailed extends S.Class<AgentFailed>($I`AgentFailed`)(
  makeAgentEventKind.AgentFailed({
    /**
     * Timestamp when agent failed (DateTime.Utc)
     */
    failedAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      description: "Timestamp when agent failed (DateTime.Utc)",
    }),
    /**
     * Duration before failure in milliseconds
     */
    durationMs: S.Int.pipe(S.greaterThanOrEqualTo(0)).annotations({
      description: "Duration before failure in milliseconds",
    }),
    /**
     * Error message
     */
    error: S.String.annotations({
      description: "Error message",
    }),
    /**
     * Whether this error is retryable
     */
    retryable: S.Boolean.annotations({
      description: "Whether this error is retryable",
    }),
  }),
  $I.annotations("AgentFailed", {
    description: "Emitted when an agent fails with an error",
  })
) {}

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
export class AgentEvent extends S.Union(AgentStarted, AgentProgress, AgentCompleted, AgentFailed).annotations(
  $I.annotations("AgentEvent", {
    description: "Agent event",
  })
) {}

export declare namespace AgentEvent {
  export type Type = typeof AgentEvent.Type;
}

/**
 * IntermediateResult - Stored output from a completed agent
 *
 * @since 2.0.0
 * @category Domain
 */
export class IntermediateResult extends S.Class<IntermediateResult>($I`IntermediateResult`)(
  {
    /**
     * Agent ID that produced this result
     */
    agentId: KnowledgeEntityIds.KnowledgeAgentId,

    /**
     * Serialized output (JSON string for complex types)
     */
    output: S.Unknown,

    /**
     * Timestamp when result was produced
     */
    producedAt: BS.DateTimeUtcFromAllAcceptable.annotations({
      title: "Produced At",
      description: "DateTime.Utc when result was produced",
    }),

    /**
     * Execution duration in milliseconds
     */
    durationMs: S.DurationFromMillis.annotations({
      title: "Duration in ms",
      description: "Duration in milliseconds",
    }),
  },
  $I.annotations("IntermediateResult", {
    description: "Stored output from a completed agent",
  })
) {}

export class PipelineStateStatus extends BS.StringLiteralKit(
  "pending",
  "running",
  "paused",
  "completed",
  "failed"
).annotations(
  $I.annotations("PipelineStateStatus", {
    description: "Status of a pipeline state",
  })
) {}

export declare namespace PipelineStateStatus {
  export type Type = typeof PipelineStateStatus.Type;
}

const makePipelineStateKind = PipelineStateStatus.toTagged("status").composer({
  /**
   * Unique identifier for this pipeline execution
   */
  pipelineId: S.String.annotations({
    title: "Pipeline ID",
    description: "Unique execution identifier",
  }),
  /**
   * Currently executing agent (if any)
   */
  currentAgentId: S.optional(KnowledgeEntityIds.KnowledgeAgentId).annotations({
    title: "Current Agent ID",
    description: "Currently executing agent (if any)",
  }),
  /**
   * List of agents that have completed successfully
   */
  completedAgents: S.Array(KnowledgeEntityIds.KnowledgeAgentId).annotations({
    title: "Completed Agents",
    description: "Agent IDs that have completed",
  }),

  /**
   * Stored outputs from completed agents
   */
  intermediateResults: S.Array(IntermediateResult).annotations({
    title: "Intermediate Results",
    description: "Outputs from completed agents",
  }),
  /**
   * Pipeline start timestamp (DateTime.Utc)
   */
  startedAt: BS.DateTimeUtcFromAllAcceptable.annotations({
    title: "Started At",
    description: "DateTime.Utc when pipeline started",
  }),

  /**
   * Total iteration count (for looping pipelines)
   */
  iterationCount: S.optionalWith(S.NonNegativeInt, { as: "Option" }).annotations({
    title: "Iteration Count",
    description: "Total iteration count (for looping pipelines)",
  }),
});

export class PipelineStatePending extends S.Class<PipelineStatePending>($I`PipelineStatePending`)(
  makePipelineStateKind.pending({
    completedAt: S.optionalWith(S.Option(BS.DateTimeUtcFromAllAcceptable), {
      default: O.none<DateTime.Utc>,
    }).annotations({
      title: "Completed At",
      description: "DateTime.Utc when pipeline completed (if complete)",
    }),
    error: S.optionalWith(S.Option(S.String), { default: O.none<string> }),
  }),
  $I.annotations("PipelineStatePending", {
    description: "Pipeline state when it is pending",
  })
) {}

export class PipelineStateRunning extends S.Class<PipelineStateRunning>($I`PipelineStateRunning`)(
  makePipelineStateKind.running({
    completedAt: S.optionalWith(S.Option(BS.DateTimeUtcFromAllAcceptable), {
      default: O.none<DateTime.Utc>,
    }).annotations({
      title: "Completed At",
      description: "DateTime.Utc when pipeline completed (if complete)",
    }),
    error: S.optionalWith(S.Option(S.String), { default: O.none<string> }),
  }),
  $I.annotations("PipelineStateRunning", {
    description: "Pipeline state when it is running",
  })
) {}

export class PipelineStatePaused extends S.Class<PipelineStatePaused>($I`PipelineStatePaused`)(
  makePipelineStateKind.paused({
    completedAt: S.optionalWith(S.Option(BS.DateTimeUtcFromAllAcceptable), {
      default: O.none<DateTime.Utc>,
    }).annotations({
      title: "Completed At",
      description: "DateTime.Utc when pipeline completed (if complete)",
    }),
    error: S.optionalWith(S.Option(S.String), { default: O.none<string> }),
  }),
  $I.annotations("PipelineStatePaused", {
    description: "Pipeline state when it is paused",
  })
) {}

export class PipelineStateCompleted extends S.Class<PipelineStateCompleted>($I`PipelineStateCompleted`)(
  makePipelineStateKind.completed({
    /**
     * Pipeline completion timestamp (DateTime.Utc, if complete)
     */
    completedAt: S.Option(BS.DateTimeUtcFromAllAcceptable).annotations({
      title: "Completed At",
      description: "DateTime.Utc when pipeline completed (if complete)",
    }),
    error: S.optionalWith(S.Option(S.String), { default: O.none<string> }),
  }),
  $I.annotations("PipelineStateCompleted", {
    description: "Pipeline state when it has completed successfully",
  })
) {}

export class PipelineStateFailed extends S.Class<PipelineStateFailed>($I`PipelineStateFailed`)(
  makePipelineStateKind.failed({
    /**
     * Error message if status is "failed"
     */
    error: S.optionalWith(S.String, { as: "Option" }),
    completedAt: S.Option(BS.DateTimeUtcFromAllAcceptable).annotations({
      title: "Completed At",
      description: "DateTime.Utc when pipeline completed (if complete)",
    }),
  }),
  $I.annotations("PipelineStateFailed", {
    description: "Pipeline state when it has failed",
  })
) {}

export class AnyPipelineState extends S.Union(
  PipelineStatePending,
  PipelineStateRunning,
  PipelineStatePaused,
  PipelineStateCompleted,
  PipelineStateFailed
).annotations(
  $I.annotations("AnyPipelineState", {
    description: "Union of all pipeline states",
  })
) {}

export declare namespace AnyPipelineState {
  export type Type = typeof AnyPipelineState.Type;
}

export class PipelineState extends S.Class<PipelineState>($I`PipelineState`)(
  {
    state: AnyPipelineState,
  },
  $I.annotations("PipelineState", {
    description: "Pipeline state",
  })
) {
  /**
   * Get result from a specific agent
   */
  getResult(agentId: KnowledgeEntityIds.KnowledgeAgentId.Type): O.Option<IntermediateResult> {
    return A.findFirst(this.state.intermediateResults, (r) => r.agentId === agentId);
  }

  /**
   * Check if an agent has completed
   */
  hasCompleted(agentId: KnowledgeEntityIds.KnowledgeAgentId.Type): boolean {
    return A.contains(this.state.completedAgents, agentId);
  }

  /**
   * Get total duration so far
   *
   * @param now - Current time (epoch ms)
   */
  readonly getElapsedMs = (now: number) => {
    const state = this.state;

    return Effect.gen(function* () {
      const end = yield* Match.value(state).pipe(
        Match.discriminator("status")("completed", ({ completedAt }) => completedAt),
        Match.orElse(() => DateTime.make(now))
      );
      return DateTime.subtract(end, DateTime.toParts(state.startedAt)).pipe(DateTime.toEpochMillis);
    });
  };

  get isTerminal(): boolean {
    return Match.value(this.state).pipe(
      Match.whenOr({ status: "completed" }, { status: "failed" }, thunkTrue),
      Match.orElse(thunkFalse)
    );
  }

  toJSON() {
    const { state } = S.encodeSync(PipelineState)(this);
    const elapsedMs = F.pipe(
      state,
      O.liftPredicate(S.is(PipelineStateCompleted)),
      O.flatMap(({ completedAt }) => completedAt),
      O.map(DateTime.toEpochMillis),
      O.getOrUndefined
    );
    return {
      state: {
        _tag: "PipelineState" as const,
        pipelineId: state.pipelineId,
        currentAgentId: state.currentAgentId,
        completedAgents: state.completedAgents,
        intermediateResultCount: state.intermediateResults.length,
        startedAt: state.startedAt,
        completedAt: state.completedAt,
        status: state.status,
        error: state.error,
        iterationCount: state.iterationCount,
        elapsedMs,
      },
    };
  }
}

export class PipelineCheckpointReason extends BS.StringLiteralKit(
  "scheduled",
  "agent-completed",
  "manual",
  "error-recovery"
).annotations(
  $I.annotations("PipelineCheckpointReason", {
    description: "Reason for pipeline checkpoint",
  })
) {}

export declare namespace PipelineCheckpointReason {
  export type Type = typeof PipelineCheckpointReason.Type;
}

export const makePipelineCheckpointKind = PipelineCheckpointReason.toTagged("_tag").composer({
  /**
   * Current pipeline state snapshot
   */
  state: PipelineState.annotations({
    description: "Current pipeline state snapshot",
  }),
  /**
   * Timestamp of checkpoint (DateTime.Utc)
   */
  timestamp: BS.DateTimeUtcFromAllAcceptable.annotations({
    description: "Timestamp of checkpoint (DateTime.Utc)",
  }),
});

export class AgentCompletedPipelineCheckpoint extends S.Class<AgentCompletedPipelineCheckpoint>(
  $I`AgentCompletedPipelineCheckpoint`
)(
  makePipelineCheckpointKind["agent-completed"]({}),
  $I.annotations("AgentCompletedPipelineCheckpoint", {
    description: "Pipeline checkpoint due to agent completion",
  })
) {}

export class ManualPipelineCheckpoint extends S.Class<ManualPipelineCheckpoint>($I`ManualPipelineCheckpoint`)(
  makePipelineCheckpointKind.manual({}),
  $I.annotations("ManualPipelineCheckpoint", {
    description: "Manual pipeline checkpoint",
  })
) {}

export class ErrorRecoveryPipelineCheckpoint extends S.Class<ErrorRecoveryPipelineCheckpoint>(
  $I`ErrorRecoveryPipelineCheckpoint`
)(
  makePipelineCheckpointKind["error-recovery"]({}),
  $I.annotations("ErrorRecoveryPipelineCheckpoint", {
    description: "Pipeline checkpoint due to error recovery",
  })
) {}

export class ScheduledPipelineCheckpoint extends S.Class<ScheduledPipelineCheckpoint>($I`ScheduledPipelineCheckpoint`)(
  makePipelineCheckpointKind.scheduled({}),
  $I.annotations("ScheduledPipelineCheckpoint", {
    description: "Pipeline checkpoint scheduled",
  })
) {}

export class PipelineCheckpoint extends S.Union(
  AgentCompletedPipelineCheckpoint,
  ManualPipelineCheckpoint,
  ErrorRecoveryPipelineCheckpoint,
  ScheduledPipelineCheckpoint
).annotations(
  $I.annotations("PipelineCheckpoint", {
    description: "Union of all pipeline checkpoints",
  })
) {}

export declare namespace PipelineCheckpoint {
  export type Type = typeof PipelineCheckpoint.Type;
  export type Encoded = typeof PipelineCheckpoint.Encoded;
}

/**
 * PipelineMode - Execution pattern for the pipeline
 *
 * @since 2.0.0
 * @category Types
 */
export class PipelineMode extends BS.StringLiteralKit(
  "sequential", // A → B → C (linear)
  "loop", // A → B → C → (repeat until condition)
  "parallel", // A, B, C concurrently
  "graph" // Arbitrary DAG based on dependencies
).annotations(
  $I.annotations("PipelineMode", {
    description: "Execution pattern for the pipeline",
  })
) {}

export declare namespace PipelineMode {
  export type Type = typeof PipelineMode.Type;
}

/**
 * TerminationCondition - When to stop a looping pipeline
 *
 * @since 2.0.0
 * @category Domain
 */
export class TerminationCondition extends S.Class<TerminationCondition>("TerminationCondition")({
  /**
   * Maximum iterations before forced stop
   */
  maxIterations: S.optionalWith(BS.PosInt, {
    default: () => 5,
  }).annotations({
    title: "Max Iterations",
    description: "Stop after this many iterations",
  }),

  /**
   * Stop when all validations pass
   */
  stopOnConformance: S.optionalWith(S.Boolean, {
    default: thunkTrue,
  }).annotations({
    title: "Stop on Conformance",
    description: "Stop when validation passes",
  }),

  /**
   * Stop if confidence drops below threshold
   */
  minConfidence: S.optionalWith(Confidence, { as: "Option" }).annotations({
    title: "Min Confidence",
    description: "Stop if confidence falls below this",
  }),

  /**
   * Timeout in milliseconds
   */
  timeoutMs: S.optionalWith(S.DurationFromMillis, { as: "Option" }).annotations({
    title: "Timeout",
    description: "Stop after this duration",
  }),
}) {
  static readonly default = (): TerminationCondition =>
    new TerminationCondition({
      maxIterations: 5,
      stopOnConformance: true,
      timeoutMs: O.none<Duration.Duration>(),
      minConfidence: O.none<Confidence.Type>(),
    });
}

/**
 * CheckpointConfig - When and how to checkpoint pipeline state
 *
 * @since 2.0.0
 * @category Domain
 */
export class CheckpointConfig extends S.Class<CheckpointConfig>("CheckpointConfig")({
  /**
   * Checkpoint after these agents complete
   */
  afterAgents: S.optionalWith(S.Array(KnowledgeEntityIds.KnowledgeAgentId), { as: "Option" }),

  /**
   * Checkpoint every N iterations (for loop mode)
   */
  everyNIterations: S.optionalWith(BS.PosInt, { as: "Option" }),

  /**
   * Require human approval at checkpoints
   */
  requireApproval: S.optionalWith(S.Boolean, { as: "Option" }),

  /**
   * Auto-continue timeout if approval not received
   */
  approvalTimeoutMs: S.optionalWith(S.Positive, { as: "Option" }),
}) {
  static readonly default = (): CheckpointConfig =>
    new CheckpointConfig({
      afterAgents: O.none(),
      everyNIterations: O.none(),
      requireApproval: O.none(),
      approvalTimeoutMs: O.none(),
    });
}
