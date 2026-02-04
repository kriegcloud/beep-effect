/**
 * Service: TerraformRunner
 *
 * Effect service for executing Terraform CLI commands.
 * Uses @effect/platform Command APIs for subprocess execution.
 *
 * @since 1.0.0
 * @module Service/TerraformRunner
 */

import { Command } from "@effect/platform"
import { Effect, Schedule, Stream } from "effect"
import { TerraformError } from "../Domain/Error.js"
import { parseTfOutputsJson } from "../Domain/Schema/TfOutputs.js"

// =============================================================================
// Types
// =============================================================================

/**
 * Options for terraform commands
 */
export interface TerraformOptions {
  /** Working directory (typically the infra directory) */
  readonly cwd: string
  /** Additional environment variables */
  readonly env?: Record<string, string>
  /** Path to .tfvars file (relative to cwd) */
  readonly varFile?: string
  /** Individual variable overrides */
  readonly vars?: Record<string, string>
  /** Target specific resources */
  readonly target?: ReadonlyArray<string>
  /** Skip interactive approval */
  readonly autoApprove?: boolean
  /** Command timeout in milliseconds (default: 10 minutes) */
  readonly timeout?: number
}

/**
 * Result from terraform command
 */
export interface TerraformResult {
  readonly stdout: string
  readonly stderr: string
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Collect a Uint8Array stream into a string
 */
const streamToString = <E, R>(stream: Stream.Stream<Uint8Array, E, R>) =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runFold("", (acc, chunk) => acc + chunk)
  )

/**
 * Build additional terraform arguments from options
 */
const buildArgs = (opts: TerraformOptions, baseArgs: ReadonlyArray<string>) => {
  const args = [...baseArgs]

  if (opts.varFile) {
    args.push("-var-file", opts.varFile)
  }

  if (opts.vars) {
    for (const [k, v] of Object.entries(opts.vars)) {
      args.push("-var", `${k}=${v}`)
    }
  }

  if (opts.target) {
    for (const t of opts.target) {
      args.push("-target", t)
    }
  }

  return args
}

/**
 * Convert any error to TerraformError
 */
const mapPlatformError = (subcommand: string, args: string, e: unknown) =>
  new TerraformError({
    message: `terraform ${subcommand} failed: ${String(e)}`,
    command: `terraform ${subcommand} ${args}`,
    exitCode: -1,
    cause: e
  })

// =============================================================================
// Retry Policy
// =============================================================================

/**
 * Retry policy for transient terraform errors
 */
const terraformRetrySchedule = Schedule.exponential("2 seconds").pipe(
  Schedule.jittered,
  Schedule.intersect(Schedule.recurs(2))
)

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * TerraformRunner - Execute terraform CLI commands
 *
 * Provides type-safe terraform command execution with:
 * - Structured output capture
 * - Error handling with typed errors
 * - Automatic retry for transient failures
 * - Timeout support
 *
 * Note: Methods return Effects that require CommandExecutor context,
 * which is provided by BunContext.layer or NodeContext.layer
 */
export class TerraformRunner extends Effect.Service<TerraformRunner>()(
  "@deploy/TerraformRunner",
  {
    effect: Effect.sync(() => {
      /**
       * Execute a terraform command and capture output
       */
      const runCommand = (
        subcommand: string,
        args: ReadonlyArray<string>,
        opts: TerraformOptions
      ) => {
        const fullArgs = [subcommand, ...args]
        const cmdString = `terraform ${fullArgs.join(" ")}`

        return Effect.gen(function*() {
          yield* Effect.logInfo(`Running: ${cmdString}`)

          // Build the command
          let cmd = Command.make("terraform", ...fullArgs)
          cmd = Command.workingDirectory(cmd, opts.cwd)

          if (opts.env && Object.keys(opts.env).length > 0) {
            cmd = Command.env(cmd, opts.env)
          }

          // Execute and capture output
          const result = yield* Effect.scoped(
            Command.start(cmd).pipe(
              Effect.flatMap((process) =>
                Effect.all(
                  [
                    process.exitCode,
                    streamToString(process.stdout),
                    streamToString(process.stderr)
                  ] as const,
                  { concurrency: 3 }
                )
              )
            )
          )

          const [exitCode, stdout, stderr] = result

          if (exitCode !== 0) {
            return yield* Effect.fail(
              new TerraformError({
                message: `terraform ${subcommand} failed with exit code ${exitCode}`,
                command: cmdString,
                exitCode,
                stderr
              })
            )
          }

          return { stdout, stderr }
        }).pipe(
          Effect.timeout(opts.timeout ?? 600_000), // 10 min default
          Effect.retry({
            schedule: terraformRetrySchedule,
            while: (error: unknown) => {
              if (!(error instanceof TerraformError)) return false
              const stderr = error.stderr ?? ""
              return (
                error.exitCode !== 0 &&
                (stderr.includes("Error acquiring the state lock") ||
                  stderr.includes("connection refused") ||
                  stderr.includes("timeout") ||
                  stderr.includes("UNAVAILABLE"))
              )
            }
          }),
          Effect.mapError((e) =>
            e instanceof TerraformError
              ? e
              : mapPlatformError(subcommand, args.join(" "), e)
          )
        )
      }

      /**
       * Execute terraform command with inherited stdout/stderr (for interactive use)
       */
      const runCommandInherited = (
        subcommand: string,
        args: ReadonlyArray<string>,
        opts: TerraformOptions
      ) => {
        const fullArgs = [subcommand, ...args]
        const cmdString = `terraform ${fullArgs.join(" ")}`

        return Effect.gen(function*() {
          yield* Effect.logInfo(`Running: ${cmdString}`)

          let cmd = Command.make("terraform", ...fullArgs)
          cmd = Command.workingDirectory(cmd, opts.cwd)
          cmd = Command.stdout(cmd, "inherit")
          cmd = Command.stderr(cmd, "inherit")

          if (opts.env && Object.keys(opts.env).length > 0) {
            cmd = Command.env(cmd, opts.env)
          }

          const exitCode = yield* Command.exitCode(cmd)

          if (exitCode !== 0) {
            return yield* Effect.fail(
              new TerraformError({
                message: `terraform ${subcommand} failed with exit code ${exitCode}`,
                command: cmdString,
                exitCode
              })
            )
          }
        }).pipe(
          Effect.mapError((e) =>
            e instanceof TerraformError
              ? e
              : mapPlatformError(subcommand, args.join(" "), e)
          )
        )
      }

      // Return service methods
      return {
        init: (opts: TerraformOptions) =>
          runCommand("init", ["-input=false"], opts).pipe(
            Effect.tap(() => Effect.logInfo("Terraform initialized"))
          ),

        validate: (opts: TerraformOptions) =>
          runCommand("validate", [], opts).pipe(
            Effect.tap(() => Effect.logInfo("Terraform configuration valid"))
          ),

        plan: (opts: TerraformOptions) => {
          const args = buildArgs(opts, ["-input=false", "-out=tfplan"])
          return runCommand("plan", args, opts).pipe(
            Effect.tap(({ stdout }) =>
              Effect.logInfo("Plan created", {
                hasChanges: stdout.includes("Plan:")
              })
            )
          )
        },

        /**
         * Run terraform plan with inherited stdout/stderr for verbose output
         */
        planInteractive: (opts: TerraformOptions) => {
          const args = buildArgs(opts, ["-input=false", "-out=tfplan"])
          return runCommandInherited("plan", args, opts)
        },

        apply: (opts: TerraformOptions) => {
          const args = opts.autoApprove ? ["-auto-approve", "tfplan"] : ["tfplan"]
          return runCommand("apply", args, opts).pipe(
            Effect.tap(() => Effect.logInfo("Apply complete"))
          )
        },

        applyInteractive: (opts: TerraformOptions) => {
          const args = opts.autoApprove ? ["-auto-approve", "tfplan"] : ["tfplan"]
          return runCommandInherited("apply", args, opts)
        },

        destroy: (opts: TerraformOptions) => {
          const args = buildArgs(opts, opts.autoApprove ? ["-auto-approve"] : [])
          return runCommand("destroy", args, opts)
        },

        destroyInteractive: (opts: TerraformOptions) => {
          const args = buildArgs(opts, opts.autoApprove ? ["-auto-approve"] : [])
          return runCommandInherited("destroy", args, opts)
        },

        output: (opts: TerraformOptions) =>
          runCommand("output", ["-json"], opts).pipe(
            Effect.flatMap(({ stdout }) => parseTfOutputsJson(stdout))
          ),

        showState: (opts: TerraformOptions) => runCommand("show", ["-json"], opts),

        fmt: (opts: TerraformOptions) => runCommand("fmt", ["-recursive"], opts),

        // Workspace management
        workspaceList: (opts: TerraformOptions) =>
          runCommand("workspace", ["list"], opts).pipe(
            Effect.map(({ stdout }) =>
              stdout
                .split("\n")
                .map((line) => line.replace(/^\*?\s*/, "").trim())
                .filter((name) => name.length > 0)
            )
          ),

        workspaceSelect: (opts: TerraformOptions, workspace: string) =>
          runCommand("workspace", ["select", workspace], opts).pipe(
            Effect.tap(() => Effect.logInfo(`Selected workspace: ${workspace}`))
          ),

        workspaceNew: (opts: TerraformOptions, workspace: string) =>
          runCommand("workspace", ["new", workspace], opts).pipe(
            Effect.tap(() => Effect.logInfo(`Created workspace: ${workspace}`))
          ),

        workspaceShow: (opts: TerraformOptions) =>
          runCommand("workspace", ["show"], opts).pipe(
            Effect.map(({ stdout }) => stdout.trim())
          ),

        /**
         * Ensure workspace exists and select it
         */
        workspaceEnsure: (opts: TerraformOptions, workspace: string) =>
          Effect.gen(function*() {
            const workspaces = yield* runCommand("workspace", ["list"], opts).pipe(
              Effect.map(({ stdout }) =>
                stdout
                  .split("\n")
                  .map((line) => line.replace(/^\*?\s*/, "").trim())
                  .filter((name) => name.length > 0)
              )
            )

            if (workspaces.includes(workspace)) {
              yield* runCommand("workspace", ["select", workspace], opts)
              yield* Effect.logInfo(`Selected existing workspace: ${workspace}`)
            } else {
              yield* runCommand("workspace", ["new", workspace], opts)
              yield* Effect.logInfo(`Created and selected workspace: ${workspace}`)
            }
          }),

        raw: runCommand
      }
    }),
    accessors: true
  }
) {}
