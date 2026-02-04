/**
 * Service: HealthChecker
 *
 * Effect service for verifying the health of deployed services.
 * Performs HTTP health checks with retry logic using Bun's native fetch.
 *
 * @since 1.0.0
 * @module Service/HealthChecker
 */

import { HttpClient, HttpClientRequest } from "@effect/platform"
import { Duration, Effect, Schedule } from "effect"
import { HealthCheckError } from "../Domain/Error.js"

// =============================================================================
// Types
// =============================================================================

/**
 * Result of a successful health check
 */
export interface HealthCheckResult {
  readonly url: string
  readonly status: number
  readonly latencyMs: number
}

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * HealthChecker - Verify deployed service health
 *
 * Provides:
 * - HTTP health check with configurable endpoint
 * - Retry logic with exponential backoff
 * - Latency measurement
 *
 * Uses @effect/platform HttpClient which, when combined with
 * FetchHttpClient.layer, uses Bun's native fetch.
 */
export class HealthChecker extends Effect.Service<HealthChecker>()(
  "@deploy/HealthChecker",
  {
    effect: Effect.gen(function*() {
      const http = yield* HttpClient.HttpClient

      /**
       * Perform a single health check
       */
      const check = (serviceUrl: string, path = "/health/live") =>
        Effect.gen(function*() {
          const url = `${serviceUrl}${path}`
          const startTime = Date.now()

          yield* Effect.logInfo(`Health check: ${url}`)

          const response = yield* http.execute(
            HttpClientRequest.get(url)
          ).pipe(
            Effect.timeout(Duration.seconds(30)),
            Effect.mapError((e) =>
              new HealthCheckError({
                message: `Health check request failed: ${String(e)}`,
                url,
                expectedStatus: 200
              })
            )
          )

          const latencyMs = Date.now() - startTime
          const status = response.status

          if (status !== 200) {
            return yield* Effect.fail(
              new HealthCheckError({
                message: `Health check returned ${status}`,
                url,
                expectedStatus: 200,
                actualStatus: status
              })
            )
          }

          yield* Effect.logInfo(`Health check passed`, { url, status, latencyMs })

          return {
            url,
            status,
            latencyMs
          } satisfies HealthCheckResult
        })

      /**
       * Perform health check with exponential backoff retry
       *
       * Retries up to 10 times with exponential backoff starting at 2 seconds.
       * Only retries on connection failures or 5xx errors.
       */
      const checkWithRetry = (serviceUrl: string, path?: string) =>
        check(serviceUrl, path).pipe(
          Effect.retry({
            schedule: Schedule.exponential(Duration.seconds(2)).pipe(
              Schedule.jittered,
              Schedule.intersect(Schedule.recurs(10))
            ),
            // Only retry on connection failures or 5xx errors
            while: (e: HealthCheckError) => e.actualStatus === undefined || e.actualStatus >= 500
          }),
          Effect.tapError((e: HealthCheckError) =>
            Effect.logError("Health check failed after retries", {
              url: e.url,
              actualStatus: e.actualStatus
            })
          )
        )

      /**
       * Wait for service to become healthy
       *
       * Polls the health endpoint until healthy or max attempts reached.
       * Useful immediately after deployment.
       */
      const waitForHealthy = (
        serviceUrl: string,
        path = "/health/live",
        maxAttempts = 15,
        intervalSeconds = 4
      ) =>
        Effect.gen(function*() {
          yield* Effect.logInfo(`Waiting for service to become healthy: ${serviceUrl}`)

          return yield* check(serviceUrl, path).pipe(
            Effect.retry({
              schedule: Schedule.spaced(Duration.seconds(intervalSeconds)).pipe(
                Schedule.intersect(Schedule.recurs(maxAttempts))
              ),
              // Retry on any failure while waiting
              while: () => true
            })
          )
        })

      return {
        check,
        checkWithRetry,
        waitForHealthy
      }
    }),
    accessors: true
  }
) {}
