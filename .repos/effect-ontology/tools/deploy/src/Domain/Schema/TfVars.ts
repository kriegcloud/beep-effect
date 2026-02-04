/**
 * Schema: TfVars
 *
 * Schema for parsing and validating Terraform variable files (.tfvars).
 * Matches the structure defined in infra/variables.tf.
 *
 * @since 1.0.0
 * @module Domain/Schema/TfVars
 */

import { Effect, Schema } from "effect"
import { TfVarsParseError } from "../Error.js"
import { Environment, ProjectId, Region } from "../Identity.js"

// =============================================================================
// TfVars Schema
// =============================================================================

/**
 * TfVars - Terraform variables schema
 *
 * Matches the structure defined in infra/variables.tf:
 * - project_id: GCP Project ID
 * - region: GCP Region (default: us-central1)
 * - environment: dev or prod
 * - image: Docker image to deploy
 * - allow_unauthenticated: Allow public access (default: false)
 * - enable_postgres: Enable PostgreSQL (default: false)
 */
export class TfVars extends Schema.Class<TfVars>("TfVars")({
  project_id: ProjectId,
  region: Region,
  environment: Environment,
  image: Schema.String, // Using String to allow various image formats
  allow_unauthenticated: Schema.optionalWith(Schema.Boolean, { default: () => false }),
  enable_postgres: Schema.optionalWith(Schema.Boolean, { default: () => false })
}) {}

// =============================================================================
// Parser
// =============================================================================

/**
 * Parse HCL-style .tfvars content into TfVars
 *
 * Handles key = value and key = "value" formats.
 *
 * @param content - Raw .tfvars file content
 * @param filePath - Path to the file (for error reporting)
 * @returns Effect yielding validated TfVars
 */
export const parseTfVars = (
  content: string,
  filePath: string
): Effect.Effect<TfVars, TfVarsParseError> =>
  Effect.gen(function*() {
    const parsed: Record<string, unknown> = {}

    for (const line of content.split("\n")) {
      const trimmed = line.trim()

      // Skip comments and empty lines
      if (trimmed.startsWith("#") || trimmed.startsWith("//") || trimmed === "") {
        continue
      }

      // Match: key = value or key = "value"
      const match = trimmed.match(/^(\w+)\s*=\s*(.+)$/)
      if (match) {
        const [, key, rawValue] = match
        let value: unknown = rawValue.trim()

        // Remove surrounding quotes if present
        if (typeof value === "string") {
          if (value.startsWith("\"") && value.endsWith("\"")) {
            value = value.slice(1, -1)
          }
          // Convert boolean strings
          if (value === "true") value = true
          else if (value === "false") value = false
        }

        parsed[key] = value
      }
    }

    return yield* Schema.decodeUnknown(TfVars)(parsed).pipe(
      Effect.mapError((e) =>
        new TfVarsParseError({
          message: `Failed to parse tfvars: ${e.message}`,
          filePath,
          cause: e
        })
      )
    )
  })

// =============================================================================
// Encoder
// =============================================================================

/**
 * Encode TfVars to HCL-style .tfvars content
 */
export const encodeTfVars = (tfVars: TfVars): string => {
  const lines: Array<string> = []

  lines.push(`project_id  = "${tfVars.project_id}"`)
  lines.push(`region      = "${tfVars.region}"`)
  lines.push(`environment = "${tfVars.environment}"`)
  lines.push(`image       = "${tfVars.image}"`)
  lines.push(`allow_unauthenticated = ${tfVars.allow_unauthenticated}`)
  if (tfVars.enable_postgres) {
    lines.push(`enable_postgres = ${tfVars.enable_postgres}`)
  }

  return lines.join("\n") + "\n"
}
