/**
 * Service: DockerRunner
 *
 * Effect service for executing Docker CLI commands.
 * Handles building and pushing container images.
 *
 * @since 1.0.0
 * @module Service/DockerRunner
 */

import { Command } from "@effect/platform"
import { Effect } from "effect"
import { DockerError } from "../Domain/Error.js"

// =============================================================================
// Types
// =============================================================================

/**
 * Options for Docker build command
 */
export interface DockerBuildOptions {
  /** Docker image tag (e.g., gcr.io/project/image:tag) */
  readonly tag: string
  /** Path to Dockerfile */
  readonly dockerfile: string
  /** Build context directory */
  readonly context: string
  /** Target platform (default: linux/amd64) */
  readonly platform?: string
  /** Build arguments */
  readonly buildArgs?: Record<string, string>
  /** Disable build cache */
  readonly noCache?: boolean
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Convert any error to DockerError
 */
const mapError = (command: string, description: string, e: unknown) =>
  new DockerError({
    message: `Docker command failed: ${description}`,
    command,
    exitCode: -1,
    stderr: String(e)
  })

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * DockerRunner - Execute Docker CLI commands
 *
 * Provides:
 * - Building Docker images
 * - Pushing to container registries
 * - Configuring Docker for GCR authentication
 *
 * Note: Methods return Effects that require CommandExecutor context,
 * which is provided by BunContext.layer
 */
export class DockerRunner extends Effect.Service<DockerRunner>()(
  "@deploy/DockerRunner",
  {
    effect: Effect.sync(() => {
      /**
       * Run a docker command with inherited stdout/stderr
       */
      const run = (args: ReadonlyArray<string>, description: string) => {
        const cmdString = `docker ${args.join(" ")}`

        return Effect.gen(function*() {
          yield* Effect.logInfo(description, { command: cmdString })

          const cmd = Command.make("docker", ...args).pipe(
            Command.stdout("inherit"),
            Command.stderr("inherit")
          )

          const exitCode = yield* Command.exitCode(cmd)

          if (exitCode !== 0) {
            return yield* Effect.fail(
              new DockerError({
                message: `Docker command failed: ${description}`,
                command: cmdString,
                exitCode
              })
            )
          }
        }).pipe(
          Effect.mapError((e) => e instanceof DockerError ? e : mapError(cmdString, description, e))
        )
      }

      /**
       * Run a gcloud command for Docker configuration
       */
      const runGcloud = (args: ReadonlyArray<string>, description: string) => {
        const cmdString = `gcloud ${args.join(" ")}`

        return Effect.gen(function*() {
          yield* Effect.logInfo(description, { command: cmdString })

          const cmd = Command.make("gcloud", ...args).pipe(
            Command.stdout("inherit"),
            Command.stderr("inherit")
          )

          const exitCode = yield* Command.exitCode(cmd)

          if (exitCode !== 0) {
            return yield* Effect.fail(
              new DockerError({
                message: `Failed: ${description}`,
                command: cmdString,
                exitCode
              })
            )
          }
        }).pipe(
          Effect.mapError((e) => e instanceof DockerError ? e : mapError(cmdString, description, e))
        )
      }

      return {
        build: (opts: DockerBuildOptions) => {
          const args: Array<string> = [
            "build",
            "--platform",
            opts.platform ?? "linux/amd64",
            "-t",
            opts.tag,
            "-f",
            opts.dockerfile
          ]

          if (opts.noCache) {
            args.push("--no-cache")
          }

          if (opts.buildArgs) {
            for (const [key, value] of Object.entries(opts.buildArgs)) {
              args.push("--build-arg", `${key}=${value}`)
            }
          }

          args.push(opts.context)

          return run(args, `Building image ${opts.tag}`)
        },

        push: (image: string) =>
          run(
            ["push", image],
            `Pushing Docker image ${image}`
          ),

        /**
         * Check if Docker daemon is running
         */
        ping: () =>
          run(
            ["info", "--format", "{{.ServerVersion}}"],
            "Checking Docker daemon"
          ).pipe(
            Effect.as(true),
            Effect.catchAll(() => Effect.succeed(false))
          ),

        configureGcr: () =>
          runGcloud(
            ["auth", "configure-docker", "--quiet"],
            "Configuring Docker for GCR"
          ).pipe(Effect.tap(() => Effect.logInfo("Docker configured for GCR"))),

        configureArtifactRegistry: (region: string) => {
          const registry = `${region}-docker.pkg.dev`
          return runGcloud(
            ["auth", "configure-docker", registry, "--quiet"],
            `Configuring Docker for Artifact Registry: ${registry}`
          ).pipe(Effect.tap(() => Effect.logInfo(`Docker configured for ${registry}`)))
        },

        tag: (sourceTag: string, targetTag: string) =>
          run(["tag", sourceTag, targetTag], `Tagging ${sourceTag} as ${targetTag}`),

        checkDaemon: () =>
          Effect.gen(function*() {
            const cmd = Command.make("docker", "info").pipe(
              Command.stdout("pipe"),
              Command.stderr("pipe")
            )

            const exitCode = yield* Command.exitCode(cmd)
            return exitCode === 0
          }).pipe(Effect.mapError((e) => mapError("docker info", "Check Docker daemon", e)))
      }
    }),
    accessors: true
  }
) {}
