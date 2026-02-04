/**
 * Browser Console Logger
 *
 * Provides Effect logging that outputs to the browser console.
 * Configurable log level based on environment.
 *
 * @since 1.0.0
 * @module services/BrowserLogger
 */

import { Layer, Logger, LogLevel } from "effect"

// =============================================================================
// Configuration
// =============================================================================

/**
 * Get log level from environment or default to Debug in dev, Info in prod
 */
const getLogLevel = (): LogLevel.LogLevel => {
  // Check for explicit log level override
  const explicitLevel = import.meta.env.VITE_LOG_LEVEL?.toLowerCase()

  switch (explicitLevel) {
    case "trace":
      return LogLevel.Trace
    case "debug":
      return LogLevel.Debug
    case "info":
      return LogLevel.Info
    case "warning":
      return LogLevel.Warning
    case "error":
      return LogLevel.Error
    case "fatal":
      return LogLevel.Fatal
    case "none":
      return LogLevel.None
    default:
      // Default: Debug in development, Info in production
      return import.meta.env.DEV ? LogLevel.Debug : LogLevel.Info
  }
}

// =============================================================================
// Logger Implementation
// =============================================================================

/**
 * Pretty console logger for browser
 *
 * Formats Effect logs as readable console output with:
 * - Timestamp
 * - Log level with color coding
 * - Message
 * - Annotations as JSON
 */
const prettyConsoleLogger = Logger.make(({ annotations, date, logLevel, message }) => {
  const timestamp = date.toISOString()
  const level = logLevel.label.toUpperCase().padEnd(5)

  // Color coding by level
  const colors: Record<string, string> = {
    TRACE: "color: gray",
    DEBUG: "color: cyan",
    INFO: "color: green",
    WARN: "color: orange",
    ERROR: "color: red",
    FATAL: "color: red; font-weight: bold"
  }

  const color = colors[level.trim()] || "color: inherit"

  // Format message - properly serialize objects in message array
  const formatPart = (part: unknown): string => {
    if (typeof part === "string") return part
    if (part === null) return "null"
    if (part === undefined) return "undefined"
    if (typeof part === "object") {
      try {
        return JSON.stringify(part)
      } catch {
        return String(part)
      }
    }
    return String(part)
  }

  const msgStr = typeof message === "string"
    ? message
    : Array.isArray(message)
    ? message.map(formatPart).join(" ")
    : formatPart(message)

  // Format annotations
  const annotationsObj = Object.fromEntries(annotations)
  const hasAnnotations = Object.keys(annotationsObj).length > 0

  if (hasAnnotations) {
    console.log(
      `%c[${timestamp}] [${level}] ${msgStr}`,
      color,
      annotationsObj
    )
  } else {
    console.log(`%c[${timestamp}] [${level}] ${msgStr}`, color)
  }
})

// =============================================================================
// Layers
// =============================================================================

/**
 * Browser logger layer with minimum level filtering
 *
 * Uses environment-aware log level:
 * - Development: Debug level (shows all logs)
 * - Production: Info level (hides debug/trace)
 * - Override: Set VITE_LOG_LEVEL env var
 */
export const BrowserLoggerLayer = Logger.replace(Logger.defaultLogger, prettyConsoleLogger).pipe(
  Layer.merge(Logger.minimumLogLevel(getLogLevel()))
)

/**
 * Debug logger layer - always shows all logs including trace
 * Useful for troubleshooting
 */
export const BrowserLoggerDebugLayer = Logger.replace(Logger.defaultLogger, prettyConsoleLogger).pipe(
  Layer.merge(Logger.minimumLogLevel(LogLevel.Trace))
)
