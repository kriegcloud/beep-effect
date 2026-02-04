import { Schema } from "effect"

export class WorkflowError extends Schema.TaggedError<WorkflowError>()("WorkflowError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Unknown)
}) {}

export class WorkflowNotFoundError extends Schema.TaggedError<WorkflowNotFoundError>()("WorkflowNotFoundError", {
  message: Schema.String,
  executionId: Schema.String,
  cause: Schema.optional(Schema.Unknown)
}) {}

export class WorkflowSuspendedError extends Schema.TaggedError<WorkflowSuspendedError>()("WorkflowSuspendedError", {
  message: Schema.String,
  cause: Schema.optional(Schema.String),
  isResumable: Schema.Boolean
}) {}
