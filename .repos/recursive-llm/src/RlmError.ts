import { Schema } from "effect"

export class BudgetExhaustedError extends Schema.TaggedError<BudgetExhaustedError>()(
  "BudgetExhaustedError",
  {
    resource: Schema.Literal("iterations", "llmCalls", "tokens", "time"),
    callId: Schema.String,
    remaining: Schema.Number
  }
) {}

export class NoFinalAnswerError extends Schema.TaggedError<NoFinalAnswerError>()(
  "NoFinalAnswerError",
  {
    callId: Schema.String,
    maxIterations: Schema.Number
  }
) {}

export class CallStateMissingError extends Schema.TaggedError<CallStateMissingError>()(
  "CallStateMissingError",
  {
    callId: Schema.String
  }
) {}

export class SandboxError extends Schema.TaggedError<SandboxError>()(
  "SandboxError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect)
  }
) {}

export class SchedulerQueueError extends Schema.TaggedError<SchedulerQueueError>()(
  "SchedulerQueueError",
  {
    callId: Schema.String,
    commandTag: Schema.Literal(
      "StartCall",
      "GenerateStep",
      "ExecuteCode",
      "CodeExecuted",
      "HandleBridgeCall",
      "Finalize",
      "FailCall"
    ),
    reason: Schema.Literal("closed", "overloaded")
  }
) {}

export class UnknownRlmError extends Schema.TaggedError<UnknownRlmError>()(
  "UnknownRlmError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Defect)
  }
) {}

export class ModelCallError extends Schema.TaggedError<ModelCallError>()(
  "ModelCallError",
  {
    provider: Schema.Literal("anthropic", "openai", "google", "unknown"),
    model: Schema.String,
    operation: Schema.Literal("generateText"),
    retryable: Schema.Boolean,
    message: Schema.String,
    cause: Schema.optional(Schema.Defect)
  }
) {}

export class OutputValidationError extends Schema.TaggedError<OutputValidationError>()(
  "OutputValidationError",
  {
    message: Schema.String,
    raw: Schema.String
  }
) {}

export type RlmError =
  | BudgetExhaustedError
  | NoFinalAnswerError
  | CallStateMissingError
  | SandboxError
  | SchedulerQueueError
  | ModelCallError
  | UnknownRlmError
  | OutputValidationError
