/**
 * Schema: TfOutputs
 *
 * Schema for parsing and validating Terraform output JSON.
 * Matches the structure defined in infra/outputs.tf.
 *
 * @since 1.0.0
 * @module Domain/Schema/TfOutputs
 */

import { Effect, Schema } from "effect"
import { TerraformError } from "../Error.js"

// =============================================================================
// TfOutputs Schema
// =============================================================================

/**
 * TfOutputs - Terraform outputs schema
 *
 * Matches the structure defined in infra/outputs.tf:
 * - service_url: Cloud Run service URL
 * - bucket_name: GCS bucket name
 * - postgres_connection_string: PostgreSQL connection (optional, sensitive)
 * - postgres_internal_ip: Internal IP of PostgreSQL (optional)
 * - vpc_connector_name: VPC connector name (optional)
 */
export class TfOutputs extends Schema.Class<TfOutputs>("TfOutputs")({
  service_url: Schema.optional(Schema.String),
  bucket_name: Schema.optional(Schema.String),
  postgres_connection_string: Schema.optional(Schema.NullOr(Schema.String)),
  postgres_internal_ip: Schema.optional(Schema.NullOr(Schema.String)),
  vpc_connector_name: Schema.optional(Schema.NullOr(Schema.String))
}) {}

// =============================================================================
// Parser
// =============================================================================

/**
 * Parse terraform output -json result into TfOutputs
 *
 * Terraform outputs JSON as:
 * {
 *   "output_name": {
 *     "value": <actual_value>,
 *     "type": <type_info>,
 *     "sensitive": <bool>
 *   }
 * }
 *
 * This function extracts just the values.
 *
 * @param json - Raw JSON string from terraform output -json
 * @returns Effect yielding validated TfOutputs
 */
export const parseTfOutputsJson = (
  json: string
): Effect.Effect<TfOutputs, TerraformError> =>
  Effect.gen(function*() {
    // Parse raw JSON
    const raw = yield* Effect.try({
      try: () => JSON.parse(json) as Record<string, { value: unknown }>,
      catch: (e) =>
        new TerraformError({
          message: "Failed to parse terraform output JSON",
          command: "terraform output -json",
          exitCode: 0,
          cause: e
        })
    })

    // Flatten to just the values
    const flattened = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, v.value])
    )

    // Decode into TfOutputs schema
    return yield* Schema.decodeUnknown(TfOutputs)(flattened).pipe(
      Effect.mapError((e) =>
        new TerraformError({
          message: `Failed to validate terraform outputs: ${e.message}`,
          command: "terraform output -json",
          exitCode: 0,
          cause: e
        })
      )
    )
  })

// =============================================================================
// Display Helpers
// =============================================================================

/**
 * Format TfOutputs for human-readable display
 */
export const formatTfOutputs = (outputs: TfOutputs): string => {
  const lines: Array<string> = [
    `Service URL: ${outputs.service_url}`,
    `Bucket Name: ${outputs.bucket_name}`
  ]

  if (outputs.postgres_connection_string) {
    lines.push(`PostgreSQL: <sensitive>`)
  }
  if (outputs.postgres_internal_ip) {
    lines.push(`PostgreSQL Internal IP: ${outputs.postgres_internal_ip}`)
  }
  if (outputs.vpc_connector_name) {
    lines.push(`VPC Connector: ${outputs.vpc_connector_name}`)
  }

  return lines.join("\n")
}
