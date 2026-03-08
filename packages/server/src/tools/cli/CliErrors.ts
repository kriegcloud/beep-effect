import { Schema } from "effect"

export class CliValidationError extends Schema.ErrorClass<CliValidationError>("CliValidationError")({
  _tag: Schema.tag("CliValidationError"),
  reason: Schema.String
}) {}

export class CliRuntimeUnavailable extends Schema.ErrorClass<CliRuntimeUnavailable>("CliRuntimeUnavailable")({
  _tag: Schema.tag("CliRuntimeUnavailable"),
  reason: Schema.String
}) {}

export class CliSpawnFailed extends Schema.ErrorClass<CliSpawnFailed>("CliSpawnFailed")({
  _tag: Schema.tag("CliSpawnFailed"),
  reason: Schema.String
}) {}

export class CliTimeout extends Schema.ErrorClass<CliTimeout>("CliTimeout")({
  _tag: Schema.tag("CliTimeout"),
  timeoutMs: Schema.Number
}) {}

export class CliIdleTimeout extends Schema.ErrorClass<CliIdleTimeout>("CliIdleTimeout")({
  _tag: Schema.tag("CliIdleTimeout"),
  idleTimeoutMs: Schema.Number
}) {}

export class CliExecutionFailed extends Schema.ErrorClass<CliExecutionFailed>("CliExecutionFailed")({
  _tag: Schema.tag("CliExecutionFailed"),
  reason: Schema.String
}) {}

export type CliRuntimeError =
  | CliValidationError
  | CliRuntimeUnavailable
  | CliSpawnFailed
  | CliTimeout
  | CliIdleTimeout
  | CliExecutionFailed
