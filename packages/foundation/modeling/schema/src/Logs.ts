/**
 * Log level and log severity literal kits.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import { LiteralKit } from "./LiteralKit/index.ts";

const $I = $SchemaId.create("Logs");

/**
 * Supported log levels including global enable-all and disable-all sentinels.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { LogLevel } from "@beep/schema/Logs"
 *
 * const level = S.decodeUnknownSync(LogLevel)("Info")
 * void level
 *
 * LogLevel.Enum.Info  // "Info"
 * LogLevel.is.Debug("Debug") // true
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const LogLevel = LiteralKit(["All", "Fatal", "Error", "Warn", "Info", "Debug", "Trace", "None"]).annotate(
  $I.annote("LogLevel", {
    description: "Log levels supported",
  })
);

/**
 * Runtime type for `LogLevel`.
 *
 * @since 0.0.0
 * @category models
 */
export type LogLevel = typeof LogLevel.Type;

/**
 * Supported log severities emitted by the logger (excludes `All` and `None`).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { LogSeverity } from "@beep/schema/Logs"
 *
 * const severity = S.decodeUnknownSync(LogSeverity)("Error")
 * void severity
 *
 * LogSeverity.Enum.Warn  // "Warn"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const LogSeverity = LiteralKit(["Fatal", "Error", "Warn", "Info", "Debug", "Trace"]).annotate(
  $I.annote("LogSeverity", {
    description: "Log severities supported",
  })
);

/**
 * Runtime type for `LogSeverity`.
 *
 * @since 0.0.0
 * @category models
 */
export type LogSeverity = typeof LogSeverity.Type;
