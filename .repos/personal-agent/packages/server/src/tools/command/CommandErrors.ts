import { Schema } from "effect"
import { SandboxViolation } from "@template/domain/errors"

export class CommandValidationError extends Schema.ErrorClass<CommandValidationError>("CommandValidationError")({
  _tag: Schema.tag("CommandValidationError"),
  reason: Schema.String
}) {}

export class CommandWorkspaceViolation extends Schema.ErrorClass<CommandWorkspaceViolation>("CommandWorkspaceViolation")({
  _tag: Schema.tag("CommandWorkspaceViolation"),
  reason: Schema.String,
  requestedPath: Schema.Union([Schema.String, Schema.Null]),
  resolvedPath: Schema.Union([Schema.String, Schema.Null])
}) {}

export class CommandHookError extends Schema.ErrorClass<CommandHookError>("CommandHookError")({
  _tag: Schema.tag("CommandHookError"),
  reason: Schema.String
}) {}

export class CommandHookRejected extends Schema.ErrorClass<CommandHookRejected>("CommandHookRejected")({
  _tag: Schema.tag("CommandHookRejected"),
  hookId: Schema.String,
  reason: Schema.String
}) {}

export class CommandBackendUnavailable extends Schema.ErrorClass<CommandBackendUnavailable>("CommandBackendUnavailable")({
  _tag: Schema.tag("CommandBackendUnavailable"),
  reason: Schema.String
}) {}

export class CommandSpawnFailed extends Schema.ErrorClass<CommandSpawnFailed>("CommandSpawnFailed")({
  _tag: Schema.tag("CommandSpawnFailed"),
  reason: Schema.String
}) {}

export class CommandTimeout extends Schema.ErrorClass<CommandTimeout>("CommandTimeout")({
  _tag: Schema.tag("CommandTimeout"),
  timeoutMs: Schema.Number
}) {}

export class CommandExecutionFailed extends Schema.ErrorClass<CommandExecutionFailed>("CommandExecutionFailed")({
  _tag: Schema.tag("CommandExecutionFailed"),
  reason: Schema.String
}) {}

export type CommandExecutionError =
  | CommandValidationError
  | CommandWorkspaceViolation
  | CommandHookRejected
  | CommandBackendUnavailable
  | CommandSpawnFailed
  | CommandTimeout
  | CommandExecutionFailed
  | SandboxViolation

export const toCommandHookReason = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "reason" in error) {
    const reason = (error as { readonly reason?: unknown }).reason
    if (typeof reason === "string" && reason.length > 0) {
      return reason
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}
