/**
 * Service: GcloudRunner
 *
 * Effect service for executing gcloud CLI commands.
 * Handles GCP project operations and Cloud Run management.
 *
 * @since 1.0.0
 * @module Service/GcloudRunner
 */

import { Command } from "@effect/platform"
import { Effect, Stream } from "effect"
import { GcloudError } from "../Domain/Error.js"

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
 * Convert any error to GcloudError
 */
const mapError = (command: string, description: string, e: unknown) =>
  new GcloudError({
    message: `${description} failed`,
    command,
    exitCode: -1,
    stderr: String(e)
  })

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * GcloudRunner - Execute gcloud CLI commands
 *
 * Provides:
 * - GCP project configuration
 * - Cloud Run service management
 * - Authentication helpers
 *
 * Note: Methods return Effects that require CommandExecutor context,
 * which is provided by BunContext.layer
 */
export class GcloudRunner extends Effect.Service<GcloudRunner>()(
  "@deploy/GcloudRunner",
  {
    effect: Effect.sync(() => {
      /**
       * Run gcloud command and capture output
       */
      const runAndCapture = (args: ReadonlyArray<string>, description: string) => {
        const cmdString = `gcloud ${args.join(" ")}`

        return Effect.gen(function*() {
          yield* Effect.logDebug(description, { command: cmdString })

          const cmd = Command.make("gcloud", ...args)

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
              new GcloudError({
                message: `${description} failed`,
                command: cmdString,
                exitCode,
                stderr
              })
            )
          }

          return stdout.trim()
        }).pipe(
          Effect.mapError((e) => e instanceof GcloudError ? e : mapError(cmdString, description, e))
        )
      }

      /**
       * Run gcloud command with inherited output (for interactive use)
       */
      const runInherited = (args: ReadonlyArray<string>, description: string) => {
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
              new GcloudError({
                message: `${description} failed`,
                command: cmdString,
                exitCode
              })
            )
          }
        }).pipe(
          Effect.mapError((e) => e instanceof GcloudError ? e : mapError(cmdString, description, e))
        )
      }

      return {
        getProject: () => runAndCapture(["config", "get-value", "project"], "Getting current GCP project"),

        getAccount: () => runAndCapture(["config", "get-value", "account"], "Getting current GCP account"),

        setProject: (projectId: string) =>
          runInherited(
            ["config", "set", "project", projectId],
            `Setting GCP project to ${projectId}`
          ),

        updateCloudRunImage: (serviceName: string, image: string, region: string) =>
          runInherited(
            ["run", "services", "update", serviceName, "--image", image, "--region", region],
            `Updating Cloud Run service ${serviceName} with image ${image}`
          ),

        getServiceUrl: (serviceName: string, region: string) =>
          runAndCapture(
            [
              "run",
              "services",
              "describe",
              serviceName,
              "--region",
              region,
              "--format",
              "value(status.url)"
            ],
            `Getting URL for Cloud Run service ${serviceName}`
          ),

        listServices: (region: string) =>
          runAndCapture(
            ["run", "services", "list", "--region", region, "--format", "table"],
            `Listing Cloud Run services in ${region}`
          ),

        getServiceStatus: (serviceName: string, region: string) =>
          runAndCapture(
            [
              "run",
              "services",
              "describe",
              serviceName,
              "--region",
              region,
              "--format",
              "yaml(status)"
            ],
            `Getting status for Cloud Run service ${serviceName}`
          ),

        checkAuth: () =>
          runAndCapture(
            ["auth", "list", "--filter=status:ACTIVE", "--format=value(account)"],
            "Checking gcloud authentication"
          ).pipe(
            Effect.map((account) => account.length > 0),
            Effect.orElseSucceed(() => false)
          ),

        activateServiceAccount: (keyFile: string) =>
          runInherited(
            ["auth", "activate-service-account", "--key-file", keyFile],
            "Activating service account"
          ),

        /**
         * Get Cloud Run logs
         * @param serviceName - Cloud Run service name
         * @param region - GCP region
         * @param limit - Number of log entries to fetch (default 100)
         */
        getLogs: (serviceName: string, region: string, limit = 100) =>
          runAndCapture(
            [
              "logging",
              "read",
              `resource.type="cloud_run_revision" AND resource.labels.service_name="${serviceName}" AND resource.labels.location="${region}"`,
              "--limit",
              String(limit),
              "--format",
              "value(textPayload)"
            ],
            `Getting logs for ${serviceName}`
          ),

        /**
         * Stream Cloud Run logs (follow mode with inherited output)
         * @param serviceName - Cloud Run service name
         * @param region - GCP region
         */
        streamLogs: (serviceName: string, region: string) =>
          runInherited(
            [
              "logging",
              "tail",
              `resource.type="cloud_run_revision" AND resource.labels.service_name="${serviceName}" AND resource.labels.location="${region}"`,
              "--format",
              "value(textPayload)"
            ],
            `Streaming logs for ${serviceName}`
          )
      }
    }),
    accessors: true
  }
) {}
