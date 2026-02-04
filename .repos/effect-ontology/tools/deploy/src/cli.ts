#!/usr/bin/env bun
/**
 * CLI: Effect-Ontology Deploy
 *
 * Effect-based CLI for deploying effect-ontology infrastructure.
 * Uses @effect/cli for command parsing and @effect/platform-bun for subprocess execution.
 *
 * @since 1.0.0
 * @module cli
 */

import { Command, Options } from "@effect/cli"
import { FetchHttpClient } from "@effect/platform"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Console, Effect, Layer } from "effect"
import { withErrorHandler } from "./Cli/ErrorHandler.js"
import { HealthCheckError } from "./Domain/Error.js"
import type { Environment } from "./Domain/Identity.js"
import { formatTfOutputs } from "./Domain/Schema/TfOutputs.js"
import { DockerRunner } from "./Service/DockerRunner.js"
import { GcloudRunner } from "./Service/GcloudRunner.js"
import { HealthChecker } from "./Service/HealthChecker.js"
import { PrereqChecker } from "./Service/PrereqChecker.js"
import { TerraformRunner } from "./Service/TerraformRunner.js"

// =============================================================================
// Global Options
// =============================================================================

const envOption = Options.choice("env", ["dev", "prod"] as const).pipe(
  Options.withAlias("e"),
  Options.withDefault("dev" as const),
  Options.withDescription("Target environment (dev or prod)")
)

const autoApproveOption = Options.boolean("auto-approve").pipe(
  Options.withAlias("y"),
  Options.withDefault(false),
  Options.withDescription("Skip interactive approval prompts")
)

const verboseOption = Options.boolean("verbose").pipe(
  Options.withAlias("v"),
  Options.withDefault(false),
  Options.withDescription("Show full command output (verbose mode)")
)

const skipVerifyOption = Options.boolean("skip-verify").pipe(
  Options.withDefault(false),
  Options.withDescription("Skip post-deploy health verification")
)

// =============================================================================
// Subcommands
// =============================================================================

/**
 * init - Initialize Terraform working directory
 */
const initCommand = Command.make(
  "init",
  { env: envOption },
  ({ env }) =>
    Effect.gen(function*() {
      // Check prerequisites first
      yield* Console.log("Checking prerequisites...")
      const prereqs = yield* PrereqChecker
      yield* prereqs.checkAll

      yield* Console.log(`\nInitializing Terraform for ${env} environment...`)

      const configLoader = yield* ConfigLoader
      const config = yield* configLoader.load(env as Environment)
      const tf = yield* TerraformRunner

      yield* tf.init({ cwd: config.infraDir })
      yield* tf.workspaceEnsure({ cwd: config.infraDir }, env)

      yield* Console.log(`✓ Terraform initialized for ${env}`)
    }).pipe(withErrorHandler)
).pipe(Command.withDescription("Initialize Terraform working directory"))

/**
 * validate - Validate Terraform configuration
 */
const validateCommand = Command.make(
  "validate",
  { env: envOption },
  ({ env }) =>
    Effect.gen(function*() {
      yield* Console.log(`Validating Terraform configuration for ${env}...`)

      const configLoader = yield* ConfigLoader
      const config = yield* configLoader.load(env as Environment)
      const tf = yield* TerraformRunner

      yield* tf.init({ cwd: config.infraDir })
      yield* tf.workspaceEnsure({ cwd: config.infraDir }, env)
      yield* tf.validate({ cwd: config.infraDir })

      yield* Console.log(`✓ Terraform configuration is valid`)
    }).pipe(withErrorHandler)
).pipe(Command.withDescription("Validate Terraform configuration"))

/**
 * plan - Generate Terraform execution plan
 */
const planCommand = Command.make(
  "plan",
  { env: envOption, verbose: verboseOption },
  ({ env, verbose }) =>
    Effect.gen(function*() {
      yield* Console.log(`Creating Terraform plan for ${env} environment...`)

      const configLoader = yield* ConfigLoader
      const config = yield* configLoader.load(env as Environment)
      const tf = yield* TerraformRunner

      yield* tf.init({ cwd: config.infraDir })
      yield* tf.workspaceEnsure({ cwd: config.infraDir }, env)

      if (verbose) {
        // Show full terraform output in real-time
        yield* tf.planInteractive({
          cwd: config.infraDir,
          varFile: config.varsFilePath
        })
      } else {
        // Capture and summarize
        const result = yield* tf.plan({
          cwd: config.infraDir,
          varFile: config.varsFilePath
        })

        // Extract plan summary
        const hasChanges = result.stdout.includes("Plan:")
        const noChanges = result.stdout.includes("No changes")

        if (noChanges) {
          yield* Console.log("  No changes. Infrastructure is up-to-date.")
        } else if (hasChanges) {
          // Extract the plan summary line
          const match = result.stdout.match(/Plan: (\d+) to add, (\d+) to change, (\d+) to destroy/)
          if (match) {
            yield* Console.log(`  Plan: ${match[1]} to add, ${match[2]} to change, ${match[3]} to destroy`)
          }
        }
      }

      yield* Console.log(`✓ Plan created for ${env}`)
    }).pipe(withErrorHandler)
).pipe(Command.withDescription("Generate Terraform execution plan"))

/**
 * apply - Apply Terraform changes
 */
const applyCommand = Command.make(
  "apply",
  { env: envOption, autoApprove: autoApproveOption, verbose: verboseOption },
  ({ autoApprove, env, verbose }) =>
    Effect.gen(function*() {
      yield* Console.log(`Applying Terraform changes for ${env} environment...`)

      const configLoader = yield* ConfigLoader
      const config = yield* configLoader.load(env as Environment)
      const tf = yield* TerraformRunner

      // Initialize and select workspace
      yield* tf.init({ cwd: config.infraDir })
      yield* tf.workspaceEnsure({ cwd: config.infraDir }, env)

      // Plan (verbose shows full output)
      if (verbose) {
        yield* tf.planInteractive({
          cwd: config.infraDir,
          varFile: config.varsFilePath
        })
      } else {
        yield* tf.plan({
          cwd: config.infraDir,
          varFile: config.varsFilePath
        })
      }

      // Apply
      if (autoApprove) {
        yield* tf.apply({ cwd: config.infraDir, autoApprove: true })
      } else {
        yield* tf.applyInteractive({ cwd: config.infraDir, autoApprove: false })
      }

      // Get outputs
      const outputs = yield* tf.output({ cwd: config.infraDir })

      yield* Console.log("\n✓ Apply complete!")
      yield* Console.log("\nOutputs:")
      yield* Console.log(formatTfOutputs(outputs))
    }).pipe(withErrorHandler)
).pipe(Command.withDescription("Apply Terraform changes"))

/**
 * output - Show Terraform outputs
 */
const outputCommand = Command.make(
  "output",
  { env: envOption },
  ({ env }) =>
    Effect.gen(function*() {
      const configLoader = yield* ConfigLoader
      const config = yield* configLoader.load(env as Environment)
      const tf = yield* TerraformRunner

      yield* tf.workspaceEnsure({ cwd: config.infraDir }, env)
      const outputs = yield* tf.output({ cwd: config.infraDir })

      yield* Console.log(JSON.stringify(outputs, null, 2))
    }).pipe(withErrorHandler)
).pipe(Command.withDescription("Show Terraform outputs"))

/**
 * destroy - Destroy Terraform-managed infrastructure
 */
const destroyCommand = Command.make(
  "destroy",
  { env: envOption, autoApprove: autoApproveOption },
  ({ autoApprove, env }) =>
    Effect.gen(function*() {
      // Safety check for production
      if (env === "prod" && !autoApprove) {
        yield* Console.error(
          "⚠️  WARNING: Destroying production infrastructure requires --auto-approve flag"
        )
        yield* Console.error(
          "   This is a safety measure to prevent accidental destruction."
        )
        const { SafetyError } = yield* Effect.promise(() => import("./Domain/Error.js"))
        return yield* Effect.fail(
          new SafetyError({
            message: "Refusing to destroy production without explicit approval",
            operation: "destroy",
            environment: env
          })
        )
      }

      yield* Console.log(`Destroying infrastructure for ${env} environment...`)

      const configLoader = yield* ConfigLoader
      const config = yield* configLoader.load(env as Environment)
      const tf = yield* TerraformRunner

      yield* tf.init({ cwd: config.infraDir })
      yield* tf.workspaceEnsure({ cwd: config.infraDir }, env)

      if (autoApprove) {
        yield* tf.destroy({
          cwd: config.infraDir,
          varFile: config.varsFilePath,
          autoApprove: true
        })
      } else {
        yield* tf.destroyInteractive({
          cwd: config.infraDir,
          varFile: config.varsFilePath,
          autoApprove: false
        })
      }

      yield* Console.log(`✓ Infrastructure destroyed for ${env}`)
    }).pipe(withErrorHandler)
).pipe(Command.withDescription("Destroy Terraform-managed infrastructure"))

/**
 * deploy - Full deployment: build, push, and apply
 */
const fullDeployCommand = Command.make(
  "full-deploy",
  { env: envOption, autoApprove: autoApproveOption, verbose: verboseOption, skipVerify: skipVerifyOption },
  ({ autoApprove, env, skipVerify, verbose }) =>
    Effect.gen(function*() {
      yield* Console.log(`Starting full deployment for ${env} environment...`)
      yield* Console.log("─".repeat(50))

      const configLoader = yield* ConfigLoader
      const config = yield* configLoader.load(env as Environment)
      const docker = yield* DockerRunner
      const tf = yield* TerraformRunner

      // Step 1: Configure Docker for GCR
      yield* Console.log("\n📦 Step 1: Configure Docker for GCR")
      yield* docker.configureGcr()

      // Step 2: Build Docker image
      yield* Console.log("\n🔨 Step 2: Build Docker image")
      yield* docker.build({
        tag: config.tfVars.image,
        dockerfile: "packages/@core-v2/Dockerfile",
        context: ".",
        platform: "linux/amd64"
      })

      // Step 3: Push Docker image
      yield* Console.log("\n🚀 Step 3: Push Docker image")
      yield* docker.push(config.tfVars.image)

      // Step 4: Initialize Terraform and select workspace
      yield* Console.log("\n🔧 Step 4: Initialize Terraform")
      yield* tf.init({ cwd: config.infraDir })
      yield* tf.workspaceEnsure({ cwd: config.infraDir }, env)

      // Step 5: Plan Terraform changes
      yield* Console.log("\n📋 Step 5: Plan Terraform changes")
      if (verbose) {
        yield* tf.planInteractive({
          cwd: config.infraDir,
          varFile: config.varsFilePath
        })
      } else {
        yield* tf.plan({
          cwd: config.infraDir,
          varFile: config.varsFilePath
        })
      }

      // Step 6: Apply Terraform changes
      yield* Console.log("\n⚡ Step 6: Apply Terraform changes")
      if (autoApprove) {
        yield* tf.apply({ cwd: config.infraDir, autoApprove: true })
      } else {
        yield* tf.applyInteractive({ cwd: config.infraDir, autoApprove: false })
      }

      // Step 7: Get and display outputs
      yield* Console.log("\n📊 Step 7: Deployment outputs")
      const outputs = yield* tf.output({ cwd: config.infraDir })

      // Step 8: Health verification
      if (!skipVerify && outputs.service_url) {
        yield* Console.log("\n🏥 Step 8: Health verification")
        const health = yield* HealthChecker
        yield* health.waitForHealthy(outputs.service_url, "/health/live")
        yield* Console.log(`✓ Service healthy at ${outputs.service_url}`)
      } else if (skipVerify) {
        yield* Console.log("\n⏭️  Skipping health verification (--skip-verify)")
      }

      yield* Console.log("─".repeat(50))
      yield* Console.log("\n✓ Deployment complete!")
      yield* Console.log("\nOutputs:")
      yield* Console.log(formatTfOutputs(outputs))
    }).pipe(withErrorHandler)
).pipe(Command.withDescription("Full deployment: build, push, and apply Terraform"))

/**
 * fmt - Format Terraform files
 */
const fmtCommand = Command.make("fmt", {}, () =>
  Effect.gen(function*() {
    yield* Console.log("Formatting Terraform files...")

    const configLoader = yield* ConfigLoader
    const infraDir = configLoader.getInfraDir()
    const tf = yield* TerraformRunner

    yield* tf.fmt({ cwd: infraDir })

    yield* Console.log("✓ Terraform files formatted")
  }).pipe(withErrorHandler)).pipe(Command.withDescription("Format Terraform files"))

/**
 * workspace - List and show workspace info
 */
const workspaceCommand = Command.make(
  "workspace",
  { env: envOption },
  ({ env }) =>
    Effect.gen(function*() {
      const configLoader = yield* ConfigLoader
      const infraDir = configLoader.getInfraDir()
      const tf = yield* TerraformRunner

      yield* tf.init({ cwd: infraDir })

      const currentWorkspace = yield* tf.workspaceShow({ cwd: infraDir })
      const workspaces = yield* tf.workspaceList({ cwd: infraDir })

      yield* Console.log("\nTerraform Workspaces:")
      yield* Console.log("─".repeat(30))
      for (const ws of workspaces) {
        const marker = ws === currentWorkspace ? " *" : "  "
        yield* Console.log(`${marker} ${ws}`)
      }
      yield* Console.log("─".repeat(30))
      yield* Console.log(`\nCurrent: ${currentWorkspace}`)
      yield* Console.log(`Target (--env): ${env}`)

      if (currentWorkspace !== env) {
        yield* Console.log(`\n⚠️  Note: Current workspace doesn't match --env`)
        yield* Console.log(`   Run any command with --env ${env} to switch`)
      }
    }).pipe(withErrorHandler)
).pipe(Command.withDescription("List Terraform workspaces and current state"))

/**
 * status - Show current infrastructure status
 */
const statusCommand = Command.make(
  "status",
  { env: envOption },
  ({ env }) =>
    Effect.gen(function*() {
      yield* Console.log(`Checking infrastructure status for ${env}...`)

      const configLoader = yield* ConfigLoader
      const config = yield* configLoader.load(env as Environment)
      const gcloud = yield* GcloudRunner

      // Get current GCP project
      const currentProject = yield* gcloud.getProject().pipe(
        Effect.orElseSucceed(() => "<not set>")
      )
      yield* Console.log(`\nGCP Project: ${currentProject}`)

      // Check if authenticated
      const isAuth = yield* gcloud.checkAuth()
      yield* Console.log(`Authenticated: ${isAuth ? "Yes" : "No"}`)

      // Get Cloud Run services
      yield* Console.log(`\nCloud Run services in ${config.region}:`)
      const services = yield* gcloud.listServices(config.region).pipe(
        Effect.orElseSucceed(() => "  <none or error fetching>")
      )
      yield* Console.log(services)
    }).pipe(withErrorHandler)
).pipe(Command.withDescription("Show current infrastructure status"))

/**
 * verify - Verify deployment health
 */
const verifyCommand = Command.make(
  "verify",
  { env: envOption },
  ({ env }) =>
    Effect.gen(function*() {
      yield* Console.log(`Verifying deployment health for ${env} environment...`)

      const configLoader = yield* ConfigLoader
      const config = yield* configLoader.load(env as Environment)
      const tf = yield* TerraformRunner
      const health = yield* HealthChecker

      // Get service URL from terraform outputs
      yield* tf.workspaceEnsure({ cwd: config.infraDir }, env)
      const outputs = yield* tf.output({ cwd: config.infraDir })

      if (!outputs.service_url) {
        return yield* Effect.fail(
          new HealthCheckError({
            message: "No service URL found in terraform outputs",
            url: "unknown",
            expectedStatus: 200
          })
        )
      }

      yield* Console.log(`\nService URL: ${outputs.service_url}`)
      yield* Console.log("\nChecking health endpoints...")

      // Check liveness
      yield* Console.log("  /health/live ... ")
      const liveResult = yield* health.check(outputs.service_url, "/health/live")
      yield* Console.log(`  ✓ Live (${liveResult.latencyMs}ms)`)

      // Check readiness
      yield* Console.log("  /health/ready ... ")
      const readyResult = yield* health.check(outputs.service_url, "/health/ready").pipe(
        Effect.orElseSucceed(() => ({ url: outputs.service_url!, status: -1, latencyMs: 0 }))
      )
      if (readyResult.status === 200) {
        yield* Console.log(`  ✓ Ready (${readyResult.latencyMs}ms)`)
      } else {
        yield* Console.log(`  ⚠️  Ready endpoint not available`)
      }

      yield* Console.log(`\n✓ Service at ${outputs.service_url} is healthy`)
    }).pipe(withErrorHandler)
).pipe(Command.withDescription("Verify deployment health"))

/**
 * logs - Stream logs for the service
 */
const logsCommand = Command.make(
  "logs",
  {
    env: envOption,
    lines: Options.integer("lines").pipe(Options.withDefault(100)),
    follow: Options.boolean("follow").pipe(Options.withDefault(false))
  },
  ({ env, follow, lines }) =>
    Effect.gen(function*() {
      yield* Console.log(`Fetching logs for ${env} environment...`)

      const configLoader = yield* ConfigLoader
      const config = yield* configLoader.load(env as Environment)
      const gcloud = yield* GcloudRunner

      // Get service name from terraform outputs (or assume standard naming)
      // Usually output by terraform but can be derived from env
      const serviceName = `effect-ontology-core-${env}`

      yield* Console.log(`Service: ${serviceName} (Region: ${config.region})`)
      yield* Console.log("─".repeat(50))

      if (follow) {
        yield* gcloud.streamLogs(serviceName, config.region)
      } else {
        const logs = yield* gcloud.getLogs(serviceName, config.region, lines)
        yield* Console.log(logs)
      }
    }).pipe(withErrorHandler)
).pipe(Command.withDescription("View or stream Cloud Run logs"))

/**
 * prereqs - Check prerequisites
 */
const prereqsCommand = Command.make("prereqs", {}, () =>
  Effect.gen(function*() {
    yield* Console.log("Checking prerequisites...")
    const prereqs = yield* PrereqChecker
    yield* prereqs.checkAll
    yield* Console.log("✓ All prerequisites met!")
  }).pipe(withErrorHandler)).pipe(Command.withDescription("Check if required tools are installed"))

/**
 * migrate - Run database migrations
 */
const migrateCommand = Command.make(
  "migrate",
  { env: envOption },
  ({ env }) =>
    Effect.gen(function*() {
      yield* Console.log(`Running database migrations for ${env} environment...`)

      const configLoader = yield* ConfigLoader
      const config = yield* configLoader.load(env as Environment)

      const instanceName = `workflow-postgres-${env}`
      const zone = "us-central1-a"

      // Check current version via SSH + docker exec
      yield* Console.log("\nChecking current migration version...")

      const checkCmd =
        `sudo docker exec $(sudo docker ps -q --filter ancestor=pgvector/pgvector:pg15) psql -U workflow -d workflow -t -c "SELECT COALESCE(MAX(version), 0) FROM schema_migrations;"`

      const versionResult = yield* Effect.tryPromise({
        try: async () => {
          const proc = Bun.spawn([
            "gcloud",
            "compute",
            "ssh",
            instanceName,
            `--zone=${zone}`,
            `--project=${config.projectId}`,
            "--tunnel-through-iap",
            "--quiet",
            `--command=${checkCmd}`
          ])
          const output = await new Response(proc.stdout).text()
          await proc.exited
          return parseInt(output.trim(), 10) || 0
        },
        catch: (e) => new Error(`Failed to check version: ${e}`)
      })

      yield* Console.log(`  Current version: ${versionResult}`)

      // Get migrations from MigrationRunner (embedded SQL)
      const { AllMigrations } = yield* Effect.promise(() =>
        import("@effect-ontology/core-v2/Runtime").then((m) => m.Persistence)
      )

      const pending = AllMigrations.filter((m: { version: number }) => m.version > versionResult)

      if (pending.length === 0) {
        yield* Console.log("  No pending migrations")
        return
      }

      yield* Console.log(`  Pending migrations: ${pending.length}`)

      // Apply each migration
      for (const migration of pending) {
        yield* Console.log(`\n  Applying ${migration.version}: ${migration.name}...`)

        const migrateCmd =
          `sudo docker exec -i $(sudo docker ps -q --filter ancestor=pgvector/pgvector:pg15) psql -U workflow -d workflow`

        yield* Effect.tryPromise({
          try: async () => {
            const proc = Bun.spawn([
              "gcloud",
              "compute",
              "ssh",
              instanceName,
              `--zone=${zone}`,
              `--project=${config.projectId}`,
              "--tunnel-through-iap",
              "--quiet",
              `--command=${migrateCmd}`
            ], {
              stdin: new TextEncoder().encode(migration.sql)
            })
            await new Response(proc.stdout).text()
            const exitCode = await proc.exited
            if (exitCode !== 0) {
              throw new Error(`Migration failed with exit code ${exitCode}`)
            }
          },
          catch: (e) => new Error(`Migration ${migration.version} failed: ${e}`)
        })

        yield* Console.log(`  ✓ Migration ${migration.version} applied`)
      }

      yield* Console.log(`\n✓ All migrations applied for ${env}`)
    }).pipe(withErrorHandler)
).pipe(Command.withDescription("Run database migrations on Postgres VM"))

/**
 * sync-ontology - Sync local ontology files to GCS
 */
const syncOntologyCommand = Command.make(
  "sync-ontology",
  { env: envOption },
  ({ env }) =>
    Effect.gen(function*() {
      yield* Console.log(`Syncing ontology files to GCS for ${env} environment...`)

      const bucketName = `effect-ontology-${env}`

      // Sync Seattle ontology
      yield* Console.log("\n  Syncing Seattle ontology...")
      yield* Effect.tryPromise({
        try: async () => {
          const proc = Bun.spawn([
            "gsutil",
            "-m",
            "cp",
            "-r",
            "ontologies/seattle/seattle.ttl",
            `gs://${bucketName}/canonical/seattle/ontology.ttl`
          ])
          await proc.exited
        },
        catch: (e) => new Error(`Failed to sync seattle ontology: ${e}`)
      })

      // Sync external vocabularies
      yield* Console.log("  Syncing external vocabularies...")
      yield* Effect.tryPromise({
        try: async () => {
          const proc = Bun.spawn([
            "gsutil",
            "-m",
            "cp",
            "ontologies/external/merged-external.ttl",
            `gs://${bucketName}/canonical/external/merged.ttl`
          ])
          await proc.exited
        },
        catch: (e) => new Error(`Failed to sync external vocabs: ${e}`)
      })

      // Sync registry
      yield* Console.log("  Syncing registry.json...")
      yield* Effect.tryPromise({
        try: async () => {
          const proc = Bun.spawn([
            "gsutil",
            "cp",
            "packages/@core-v2/registry.json",
            `gs://${bucketName}/registry.json`
          ])
          await proc.exited
        },
        catch: (e) => new Error(`Failed to sync registry: ${e}`)
      })

      yield* Console.log(`\n✓ Ontology files synced to gs://${bucketName}/`)
    }).pipe(withErrorHandler)
).pipe(Command.withDescription("Sync ontology files to GCS bucket"))

// =============================================================================
// Root Command
// =============================================================================

const rootCommand = Command.make("effect-deploy").pipe(
  Command.withSubcommands([
    initCommand,
    validateCommand,
    planCommand,
    applyCommand,
    outputCommand,
    destroyCommand,
    fullDeployCommand,
    fmtCommand,
    workspaceCommand,
    statusCommand,
    verifyCommand,
    logsCommand,
    prereqsCommand,
    migrateCommand,
    syncOntologyCommand
  ]),
  Command.withDescription(
    "Effect-based Terraform deploy CLI for effect-ontology infrastructure"
  )
)

// =============================================================================
// Layer Composition
// =============================================================================
/**
 * Live layer providing all required services
 * BunContext provides CommandExecutor, FileSystem, Path, Terminal
 * FetchHttpClient provides HttpClient using Bun's native fetch
 * DeployLive provides ConfigLoader, TerraformRunner, DockerRunner, GcloudRunner, HealthChecker
 */
const BaseServices = Layer.mergeAll(
  ConfigLoader.Default,
  TerraformRunner.Default,
  DockerRunner.Default,
  GcloudRunner.Default,
  FetchHttpClient.layer
)

const DependentServices = Layer.mergeAll(
  HealthChecker.Default,
  PrereqChecker.Default
)

const DeployLive = DependentServices.pipe(
  Layer.provide(BaseServices),
  Layer.merge(BaseServices),
  Layer.provideMerge(BunContext.layer)
)

// =============================================================================
// Main
// =============================================================================

const cli = Command.run(rootCommand, {
  name: "effect-deploy",
  version: "0.1.0"
})

cli(Bun.argv).pipe(Effect.provide(DeployLive), BunRuntime.runMain)
