/**
 * Error Display Module
 *
 * Formats deploy errors for human-readable CLI output using Effect's Cause module.
 * Provides consistent, structured error display across all commands.
 *
 * @since 1.0.0
 * @module Errors/Display
 */

import { Cause, FiberId, Match } from "effect"
import type {
  ConfigValidationError,
  DeployError,
  DockerError,
  GcloudError,
  TerraformError,
  TfVarsParseError
} from "../Domain/Error.js"

export type { DeployError }

// =============================================================================
// Helpers
// =============================================================================

/**
 * Truncate a string with ellipsis
 */
const truncate = (str: string, maxLen: number): string => str.length > maxLen ? `${str.slice(0, maxLen)}...` : str

/**
 * Clean up stderr output for display - remove ANSI codes and excess whitespace
 */
const cleanStderr = (stderr: string | undefined): string | undefined => {
  if (!stderr) return undefined
  // Remove ANSI escape codes and excessive whitespace

  // eslint-disable-next-line no-control-regex
  return stderr
    .replace(/\x1b\[[0-9;]*m/g, "")
    .replace(/\n+/g, "\n")
    .trim()
}

/**
 * Extract helpful context from stderr
 */
const extractContext = (stderr: string | undefined): string | undefined => {
  if (!stderr) return undefined

  // Common error patterns with helpful context
  const patterns: Array<[RegExp, string]> = [
    [
      /Error acquiring the state lock/i,
      "Another terraform process may be running. Wait or run: terraform force-unlock"
    ],
    [/failed to start and listen on.*PORT/i, "Container failed to start. Check Cloud Run logs for startup errors."],
    [/connection refused/i, "Network connection refused. Check VPC and firewall settings."],
    [/permission denied/i, "Permission denied. Check IAM roles and service account permissions."],
    [/quota exceeded/i, "Resource quota exceeded. Request quota increase or clean up resources."],
    [/UNAUTHENTICATED/i, "Authentication failed. Run: gcloud auth login"],
    [/resource.*already exists/i, "Resource already exists. Check for naming conflicts."],
    [/timeout/i, "Operation timed out. Retry or increase timeout."]
  ]

  for (const [pattern, context] of patterns) {
    if (pattern.test(stderr)) {
      return context
    }
  }

  return undefined
}

// =============================================================================
// Tagged Error Formatters
// =============================================================================

/**
 * Format TerraformError for display
 */
const formatTerraformError = (e: TerraformError): string => {
  const lines: Array<string> = []

  lines.push(`✗ Terraform failed: ${e.message}`)
  lines.push(`  Command: ${e.command}`)
  lines.push(`  Exit code: ${e.exitCode}`)

  const cleaned = cleanStderr(e.stderr)
  if (cleaned) {
    lines.push(`  Output:`)
    // Indent and truncate stderr
    const stderrLines = truncate(cleaned, 800).split("\n")
    for (const line of stderrLines) {
      lines.push(`    ${line}`)
    }
  }

  const context = extractContext(e.stderr)
  if (context) {
    lines.push(`  💡 ${context}`)
  }

  return lines.join("\n")
}

/**
 * Format DockerError for display
 */
const formatDockerError = (e: DockerError): string => {
  const lines: Array<string> = []

  lines.push(`✗ Docker failed: ${e.message}`)
  lines.push(`  Command: ${e.command}`)
  lines.push(`  Exit code: ${e.exitCode}`)

  if (e.stderr) {
    lines.push(`  Output: ${truncate(e.stderr, 300)}`)
  }

  return lines.join("\n")
}

/**
 * Format GcloudError for display
 */
const formatGcloudError = (e: GcloudError): string => {
  const lines: Array<string> = []

  lines.push(`✗ GCloud failed: ${e.message}`)
  lines.push(`  Command: ${e.command}`)
  lines.push(`  Exit code: ${e.exitCode}`)

  if (e.stderr) {
    lines.push(`  Output: ${truncate(e.stderr, 300)}`)
  }

  const context = extractContext(e.stderr)
  if (context) {
    lines.push(`  💡 ${context}`)
  }

  return lines.join("\n")
}

/**
 * Format ConfigValidationError for display
 */
const formatConfigValidationError = (e: ConfigValidationError): string => {
  const lines: Array<string> = []

  lines.push(`✗ Configuration error: ${e.message}`)
  lines.push(`  Field: ${e.field}`)
  if (e.expected) lines.push(`  Expected: ${e.expected}`)
  if (e.received) lines.push(`  Received: ${e.received}`)

  return lines.join("\n")
}

/**
 * Format TfVarsParseError for display
 */
const formatTfVarsParseError = (e: TfVarsParseError): string => {
  const lines: Array<string> = []

  lines.push(`✗ Failed to parse tfvars: ${e.message}`)
  lines.push(`  File: ${e.filePath}`)

  return lines.join("\n")
}

// =============================================================================
// Main Formatter
// =============================================================================

/**
 * Format a tagged error for CLI display
 */
export const formatTaggedError = (error: DeployError): string =>
  Match.value(error).pipe(
    Match.when({ _tag: "TerraformError" }, formatTerraformError),
    Match.when({ _tag: "DockerError" }, formatDockerError),
    Match.when({ _tag: "GcloudError" }, formatGcloudError),
    Match.when({ _tag: "ConfigValidationError" }, formatConfigValidationError),
    Match.when({ _tag: "TfVarsParseError" }, formatTfVarsParseError),
    Match.orElse((e) => `✗ Error: ${JSON.stringify(e)}`)
  )

/**
 * Format a Cause for CLI display
 *
 * Handles all cause types: Fail, Die, Interrupt, Sequential, Parallel
 */
export const formatCause = <E extends DeployError>(cause: Cause.Cause<E>): string =>
  Cause.match(cause, {
    onEmpty: "",
    onFail: (error) => formatTaggedError(error),
    onDie: (defect) => {
      const msg = defect instanceof Error ? defect.message : String(defect)
      return `✗ Unexpected error: ${msg}`
    },
    onInterrupt: (fiberId) => `⚠ Operation interrupted (fiber: ${FiberId.threadName(fiberId)})`,
    onSequential: (left, right) => [left, right].filter(Boolean).join("\n\n"),
    onParallel: (left, right) => [left, right].filter(Boolean).join("\n\n")
  })

/**
 * Get exit code from a Cause
 */
export const getExitCode = <E extends DeployError>(cause: Cause.Cause<E>): number =>
  Cause.match(cause, {
    onEmpty: 0,
    onFail: (error) => {
      // Use exit code from command errors, default to 1
      if ("exitCode" in error && typeof error.exitCode === "number" && error.exitCode !== 0) {
        return error.exitCode
      }
      return 1
    },
    onDie: () => 2, // Unexpected errors
    onInterrupt: () => 130, // Standard SIGINT exit code
    onSequential: (left, right) => Math.max(left, right),
    onParallel: (left, right) => Math.max(left, right)
  })
