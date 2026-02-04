/**
 * Service: PrereqChecker
 *
 * Checks if required tools and environment variables are present.
 *
 * @since 1.0.0
 * @module Service/PrereqChecker
 */

import { Command } from "@effect/platform"
import { Effect } from "effect"
import { DockerRunner } from "./DockerRunner.js"
import { GcloudRunner } from "./GcloudRunner.js"

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * PrereqChecker - Verify deployment prerequisites
 *
 * Checks for:
 * - terraform
 * - gcloud
 * - docker
 * - bun
 */
export class PrereqChecker extends Effect.Service<PrereqChecker>()(
  "@deploy/PrereqChecker",
  {
    effect: Effect.gen(function*() {
      const gcloud = yield* GcloudRunner
      const docker = yield* DockerRunner

      /**
       * Check if a command is available in the path
       */
      const checkCommand = (cmd: string) =>
        Effect.gen(function*() {
          yield* Effect.logDebug(`Checking for ${cmd}...`)

          const exitCode = yield* Command.make("which", cmd).pipe(
            Command.exitCode
          )

          if (exitCode !== 0) {
            return yield* Effect.fail(
              new Error(`Missing required command: ${cmd}`)
            )
          }

          yield* Effect.logDebug(`✓ Found ${cmd}`)
        })

      /**
       * Check gcloud authentication
       */
      const checkGcloudAuth = Effect.gen(function*() {
        yield* Effect.logDebug("Checking gcloud authentication...")
        const isAuthenticated = yield* gcloud.checkAuth()

        if (!isAuthenticated) {
          return yield* Effect.fail(
            new Error("Gcloud not authenticated. Run 'gcloud auth login'")
          )
        }
        yield* Effect.logDebug("✓ Gcloud authenticated")
      })

      /**
       * Check Docker daemon
       */
      const checkDockerDaemon = Effect.gen(function*() {
        yield* Effect.logDebug("Checking Docker daemon...")
        const isRunning = yield* docker.ping()

        if (!isRunning) {
          return yield* Effect.fail(
            new Error("Docker daemon is not running")
          )
        }
        yield* Effect.logDebug("✓ Docker daemon running")
      })

      /**
       * Check all prerequisites
       */
      const checkAll = Effect.all([
        checkCommand("terraform"),
        checkCommand("gcloud"),
        checkCommand("docker"),
        checkCommand("bun")
      ], { concurrency: 4 }).pipe(
        Effect.andThen(checkGcloudAuth),
        Effect.andThen(checkDockerDaemon)
      )

      return {
        checkCommand,
        checkAll
      }
    }),
    dependencies: [GcloudRunner.Default, DockerRunner.Default],
    accessors: true
  }
) {}
