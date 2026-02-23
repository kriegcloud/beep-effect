/**
 * @file Agents-Usage-Report Error Types
 *
 * Defines tagged error types for the agents-usage-report command.
 *
 * @module agents-usage-report/errors
 * @since 0.1.0
 */

import * as S from "effect/Schema";

/**
 * Error when telemetry file cannot be read.
 *
 * @since 0.1.0
 * @category errors
 */
export class TelemetryReadError extends S.TaggedError<TelemetryReadError>()("TelemetryReadError", {
  message: S.String,
  path: S.String,
}) {}

/**
 * Error when telemetry file has no events.
 *
 * @since 0.1.0
 * @category errors
 */
export class NoTelemetryDataError extends S.TaggedError<NoTelemetryDataError>()("NoTelemetryDataError", {
  message: S.String,
}) {}

/**
 * Error when date filter is invalid.
 *
 * @since 0.1.0
 * @category errors
 */
export class InvalidDateFilterError extends S.TaggedError<InvalidDateFilterError>()("InvalidDateFilterError", {
  value: S.String,
  reason: S.String,
}) {}

/**
 * Union of all agents-usage-report errors.
 *
 * @since 0.1.0
 * @category errors
 */
export type AgentsUsageReportError = TelemetryReadError | NoTelemetryDataError | InvalidDateFilterError;
