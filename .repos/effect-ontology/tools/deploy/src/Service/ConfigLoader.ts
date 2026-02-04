/**
 * Service: ConfigLoader
 *
 * Effect service for loading and validating deployment configuration.
 * Loads tfvars files and runtime configuration from environment.
 *
 * @since 1.0.0
 * @module Service/ConfigLoader
 */

import { FileSystem, Path } from "@effect/platform"
import { Config, Effect } from "effect"
import { ConfigValidationError, TfVarsParseError } from "../Domain/Error.js"
import type { Environment, ProjectId, Region } from "../Domain/Identity.js"
import { parseTfVars, type TfVars } from "../Domain/Schema/TfVars.js"

// =============================================================================
// Runtime Config
// =============================================================================

/**
 * Runtime configuration from environment variables
 */
const DeployConfig = Config.all({
  /** Override path to the infra directory */
  infraDir: Config.option(Config.string("INFRA_DIR")),

  /** Override GCP project from environment */
  gcpProject: Config.option(Config.string("GCP_PROJECT")),

  /** Terraform binary path (default: terraform) */
  terraformBin: Config.string("TERRAFORM_BIN").pipe(Config.withDefault("terraform")),

  /** Dry run mode - show what would be done */
  dryRun: Config.boolean("DRY_RUN").pipe(Config.withDefault(false)),

  /** Auto-approve mode - skip interactive confirmation */
  autoApprove: Config.boolean("AUTO_APPROVE").pipe(Config.withDefault(false))
})

// =============================================================================
// Loaded Config Type
// =============================================================================

/**
 * Fully loaded and validated configuration
 */
export interface LoadedConfig {
  /** Parsed and validated tfvars */
  readonly tfVars: TfVars
  /** Target environment */
  readonly environment: Environment
  /** GCP Project ID */
  readonly projectId: ProjectId
  /** GCP Region */
  readonly region: Region
  /** Absolute path to infra directory */
  readonly infraDir: string
  /** Path to terraform binary */
  readonly terraformBin: string
  /** Whether to run in dry-run mode */
  readonly dryRun: boolean
  /** Whether to auto-approve changes */
  readonly autoApprove: boolean
  /** Path to the tfvars file (relative to infraDir) */
  readonly varsFilePath: string
}

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * ConfigLoader - Load and validate deployment configuration
 *
 * Provides:
 * - Loading tfvars files for environments
 * - Runtime configuration from environment
 * - Secret retrieval from environment or GCP Secret Manager
 */
export class ConfigLoader extends Effect.Service<ConfigLoader>()(
  "@deploy/ConfigLoader",
  {
    effect: Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const pathSvc = yield* Path.Path
      const runtimeConfig = yield* DeployConfig

      // Compute project root from this file's location
      // This file is at: tools/deploy/src/Service/ConfigLoader.ts
      // Project root is 4 directories up
      const thisDir = pathSvc.dirname(import.meta.path)
      const projectRoot = pathSvc.resolve(thisDir, "..", "..", "..", "..")

      // Resolve infraDir - use env override or default to <project_root>/infra
      const infraDir = runtimeConfig.infraDir._tag === "Some"
        ? pathSvc.resolve(runtimeConfig.infraDir.value)
        : pathSvc.join(projectRoot, "infra")

      return {
        /**
         * Load configuration for an environment
         *
         * Reads the .tfvars file, parses it, and combines with runtime config.
         */
        load: (env: Environment) =>
          Effect.gen(function*() {
            const varsFilePath = `environments/${env}.tfvars`
            const fullPath = pathSvc.join(infraDir, varsFilePath)

            // Read the tfvars file
            const content = yield* fs.readFileString(fullPath).pipe(
              Effect.mapError(
                (e) =>
                  new TfVarsParseError({
                    message: `Failed to read ${fullPath}: ${e.message}`,
                    filePath: fullPath,
                    cause: e
                  })
              )
            )

            // Parse and validate
            const tfVars = yield* parseTfVars(content, fullPath)

            // Validate environment matches
            if (tfVars.environment !== env) {
              return yield* Effect.fail(
                new ConfigValidationError({
                  message: `Environment mismatch: file says "${tfVars.environment}" but loading for "${env}"`,
                  field: "environment",
                  expected: env,
                  received: tfVars.environment
                })
              )
            }

            return {
              tfVars,
              environment: env,
              projectId: tfVars.project_id,
              region: tfVars.region,
              infraDir,
              terraformBin: runtimeConfig.terraformBin,
              dryRun: runtimeConfig.dryRun,
              autoApprove: runtimeConfig.autoApprove,
              varsFilePath
            } satisfies LoadedConfig
          }),

        /**
         * Get a secret value from environment
         *
         * Looks up SECRET_NAME in environment.
         * In production, could be extended to use GCP Secret Manager.
         */
        getSecret: (secretId: string) =>
          Effect.gen(function*() {
            const envKey = secretId.toUpperCase().replace(/-/g, "_")
            return yield* Config.string(envKey).pipe(
              Effect.mapError(
                () =>
                  new ConfigValidationError({
                    message: `Missing secret: ${secretId} (env: ${envKey})`,
                    field: secretId,
                    expected: "string value"
                  })
              )
            )
          }),

        /**
         * Get infrastructure directory path (absolute)
         */
        getInfraDir: () => infraDir,

        /**
         * Get project root path (absolute)
         */
        getProjectRoot: () => projectRoot,

        /**
         * Check if running in dry-run mode
         */
        isDryRun: () => runtimeConfig.dryRun,

        /**
         * Check if auto-approve is enabled
         */
        isAutoApprove: () => runtimeConfig.autoApprove
      }
    }),
    accessors: true
  }
) {}
