import { $SchemaId } from "@beep/identity";
import { LiteralKit } from "./LiteralKit.ts";

const $I = $SchemaId.create("Logs");

/**
 * Supported log levels including global enable-all and disable-all sentinels.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
 */
export type LogLevel = typeof LogLevel.Type;

/**
 * Supported log severities emitted by the logger.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
 */
export type LogSeverity = typeof LogSeverity.Type;
