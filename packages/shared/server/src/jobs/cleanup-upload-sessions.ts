/**
 * @fileoverview Upload Session Cleanup Scheduled Job
 * @module @beep/shared-server/jobs/cleanup-upload-sessions
 * @since 1.0.0
 *
 * ## Overview
 * Provides a scheduled job for cleaning up expired upload sessions from the
 * database. This job runs periodically to prevent table bloat and ensure
 * that abandoned upload sessions are removed.
 *
 * ## Design Pattern
 * The cleanup job follows Effect's scheduling patterns:
 * - Uses `Schedule.fixed` for regular interval execution
 * - Wraps cleanup logic in an Effect for proper error handling
 * - Provides both one-shot and continuous execution modes
 *
 * ## Cleanup Strategy
 * - **Frequency**: Every 5 minutes (configurable via `cleanupSchedule`)
 * - **Query**: `DELETE FROM upload_sessions WHERE expires_at < NOW()`
 * - **Logging**: Reports number of deleted sessions for monitoring
 * - **Error Handling**: Logs errors but continues running (resilient)
 *
 * ## Dependencies
 * - `UploadSessionRepo` - Repository for upload session operations
 * - `effect/Schedule` - Scheduling primitives
 * - `effect/Effect` - Effect monad
 *
 * ## Usage Example
 * Register the cleanup service in server startup:
 *
 * // In server main.ts or runtime setup
 * import { cleanupService } from "@beep/shared-server/jobs/cleanup-upload-sessions";
 *
 * // Fork the cleanup service as a background fiber
 * const cleanupFiber = yield* Effect.fork(cleanupService);
 *
 * // Or run in managed scope for proper lifecycle
 * yield* Effect.forkScoped(cleanupService);
 *
 * @see uploadSession table for the database schema
 * @see UploadSessionRepo for the repository operations
 */

import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { UploadSessionRepo } from "../db";

// ============================================================================
// Configuration
// ============================================================================

/**
 * Default cleanup interval in minutes.
 *
 * @since 1.0.0
 * @category Constants
 *
 * @remarks
 * The cleanup job runs every 5 minutes by default. This interval provides
 * a good balance between:
 * - Timely cleanup of expired sessions
 * - Minimal database load
 * - Reduced table bloat
 *
 * For high-traffic systems, consider more frequent cleanup (1-2 minutes).
 * For low-traffic systems, less frequent cleanup (10-15 minutes) may suffice.
 */
export const DEFAULT_CLEANUP_INTERVAL_MINUTES = 5;

// ============================================================================
// Cleanup Effect
// ============================================================================

/**
 * Cleans up expired upload sessions from the database.
 *
 * @since 1.0.0
 * @category Effects
 *
 * @remarks
 * This is the core cleanup effect that performs a single cleanup pass.
 * It deletes all upload sessions where `expiresAt < NOW()` and logs
 * the number of deleted sessions.
 *
 * ## Error Handling
 * Database errors are caught and logged, but not propagated.
 * The cleanup job continues running even if individual cleanup
 * attempts fail.
 *
 * @example
 * // Run once for testing
 * const count = yield* cleanupUploadSessions;
 * console.log(`Deleted ${count} sessions`);
 *
 * @returns Effect that succeeds with the number of deleted sessions
 *
 * @see UploadSessionRepo.deleteExpired for the database query
 * @see cleanupService for continuous execution
 */
export const cleanupUploadSessions: Effect.Effect<number, never, UploadSessionRepo> = Effect.gen(function* () {
  yield* Effect.logDebug("Upload session cleanup job triggered");

  const repo = yield* UploadSessionRepo;

  // Delete expired sessions, catching any errors to prevent job failure
  const deletedCount = yield* repo.deleteExpired().pipe(
    Effect.catchAll((e) =>
      Effect.gen(function* () {
        yield* Effect.logError("Failed to cleanup upload sessions", { error: e });
        return 0;
      })
    )
  );

  // Log if any sessions were cleaned up
  if (deletedCount > 0) {
    yield* Effect.logInfo("Cleaned up expired upload sessions", { deletedCount });
  }

  return deletedCount;
}).pipe(
  Effect.withSpan("cleanup-upload-sessions", {
    attributes: {
      "job.type": "cleanup",
      "job.target": "upload_sessions",
    },
  })
);

// ============================================================================
// Schedule
// ============================================================================

/**
 * Schedule for periodic cleanup execution.
 *
 * @since 1.0.0
 * @category Schedules
 *
 * @remarks
 * Defines a fixed-interval schedule for running the cleanup job.
 * The default interval is 5 minutes, which provides timely cleanup
 * without excessive database load.
 *
 * ## Customization
 * To use a different interval, create a custom schedule:
 * ```typescript
 * const customSchedule = Schedule.fixed("2 minutes");
 * const customService = cleanupUploadSessions.pipe(
 *   Effect.repeat(customSchedule)
 * );
 * ```
 *
 * ## Schedule Behavior
 * - Runs immediately on start, then every 5 minutes
 * - Continues indefinitely (no maximum iterations)
 * - Does not drift - maintains fixed interval regardless of execution time
 *
 * @example
 * // Use with Effect.repeat for continuous execution
 * const service = cleanupUploadSessions.pipe(
 *   Effect.repeat(cleanupSchedule)
 * );
 *
 * @see Schedule.fixed for the underlying schedule type
 */
export const cleanupSchedule: Schedule.Schedule<number, unknown, never> = Schedule.fixed(
  `${DEFAULT_CLEANUP_INTERVAL_MINUTES} minutes`
);

// ============================================================================
// Service
// ============================================================================

/**
 * Long-running cleanup service for continuous execution.
 *
 * @since 1.0.0
 * @category Services
 *
 * @remarks
 * This is the main service to run for continuous cleanup. It combines
 * the cleanup effect with the schedule for repeated execution.
 *
 * ## Lifecycle Management
 * This service runs indefinitely until interrupted. Use Effect's fiber
 * management for proper lifecycle control:
 *
 * ```typescript
 * // Fork as background fiber
 * const fiber = yield* Effect.fork(cleanupService);
 *
 * // Later, interrupt when shutting down
 * yield* Fiber.interrupt(fiber);
 * ```
 *
 * @example
 * // In server runtime setup
 * import { cleanupService } from "@beep/shared-server/jobs/cleanup-upload-sessions";
 *
 * // Start as managed background service
 * yield* Effect.forkScoped(cleanupService);
 *
 * @see cleanupUploadSessions for the cleanup logic
 * @see cleanupSchedule for the execution schedule
 */
export const cleanupService: Effect.Effect<never, never, UploadSessionRepo> = Effect.gen(function* () {
  yield* Effect.logInfo("Starting upload session cleanup service", {
    interval: `${DEFAULT_CLEANUP_INTERVAL_MINUTES} minutes`,
  });

  // Run cleanup on schedule forever
  yield* cleanupUploadSessions.pipe(
    Effect.repeat(cleanupSchedule),
    Effect.onInterrupt(() => Effect.logInfo("Upload session cleanup service interrupted"))
  );

  // This never returns (runs forever until interrupted)
  return yield* Effect.never;
});

// ============================================================================
// One-Shot Cleanup
// ============================================================================

/**
 * Runs a single cleanup pass and returns the result.
 *
 * @since 1.0.0
 * @category Effects
 *
 * @remarks
 * Use this function for manual cleanup or testing. Unlike `cleanupService`,
 * this runs once and completes.
 *
 * @example
 * // In a CLI command or test
 * const count = yield* runCleanupOnce;
 * console.log(`Cleaned up ${count} sessions`);
 *
 * @returns Effect that succeeds with the number of deleted sessions
 */
export const runCleanupOnce: Effect.Effect<number, never, UploadSessionRepo> = cleanupUploadSessions.pipe(
  Effect.tap((count) => Effect.logInfo("Manual cleanup completed", { deletedCount: count }))
);

// ============================================================================
// Startup Cleanup
// ============================================================================

/**
 * Runs cleanup on startup with delay to allow database connection.
 *
 * @since 1.0.0
 * @category Effects
 *
 * @remarks
 * This effect runs a cleanup pass after a short delay, suitable for
 * server startup to clean any sessions that expired while the server
 * was down.
 *
 * @example
 * // In server startup
 * yield* startupCleanup;
 * yield* Effect.fork(cleanupService);
 *
 * @returns Effect that succeeds with the number of deleted sessions
 */
export const startupCleanup: Effect.Effect<number, never, UploadSessionRepo> = Effect.gen(function* () {
  yield* Effect.logInfo("Scheduling startup cleanup after delay");

  // Wait for database to be ready
  yield* Effect.sleep("10 seconds");

  yield* Effect.logInfo("Running startup cleanup");
  const count = yield* cleanupUploadSessions;

  if (count > 0) {
    yield* Effect.logInfo("Startup cleanup completed", { deletedCount: count });
  }

  return count;
}).pipe(Effect.withSpan("startup-cleanup-upload-sessions"));
