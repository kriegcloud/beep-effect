/**
 * Shared repo run service helpers for error mapping and stream filtering.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoMemoryRuntimeId } from "@beep/identity/packages";
import {
  type RepoRun,
  type RunCursor,
  type RunStreamEvent,
  RunStreamFailure,
  RunTerminalState,
} from "@beep/repo-memory-model";
import type {
  RepoRegistryStoreShape,
  RepoRunStoreShape,
  RepoSemanticStoreShape,
  RepoSnapshotStoreShape,
  RepoSymbolStoreShape,
} from "@beep/repo-memory-store";
import { type StatusCauseInput, StatusCauseTaggedErrorClass } from "@beep/schema";
import { thunkTrue } from "@beep/utils";
import { Duration, Effect, pipe } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $RepoMemoryRuntimeId.create("internal/RepoRunServiceShared");
const isRunTerminalState = S.is(RunTerminalState);

/**
 * Composite driver shape used by the repo-memory runtime orchestration layer.
 *
 * @example
 * ```ts
 * import type { RepoRuntimeStoreShape } from "../../src/internal/RepoRunServiceShared.js"
 *
 * const methods = [
 *   "getRepo",
 *   "getRun",
 *   "searchSymbols"
 * ] satisfies ReadonlyArray<keyof RepoRuntimeStoreShape>
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export type RepoRuntimeStoreShape = RepoRegistryStoreShape &
  RepoRunStoreShape &
  RepoSemanticStoreShape &
  RepoSnapshotStoreShape &
  RepoSymbolStoreShape;

type RepoRunStatusCauseError = StatusCauseInput;

/**
 * Typed orchestration error emitted by the repo run service.
 *
 * @example
 * ```ts
 * import { RepoRunServiceError } from "../../src/internal/RepoRunServiceShared.js"
 *
 * const error = RepoRunServiceError.noCause("Run not found.", 404)
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export class RepoRunServiceError extends StatusCauseTaggedErrorClass<RepoRunServiceError>($I`RepoRunServiceError`)(
  "RepoRunServiceError",
  $I.annote("RepoRunServiceError", {
    description: "Typed error for repo run service orchestration boundaries.",
  })
) {}

/**
 * Build a repo-run service error from message, status, and cause data.
 *
 * @example
 * ```ts
 * import { toRunServiceError } from "../../src/internal/RepoRunServiceShared.js"
 *
 * const error = toRunServiceError("sqlite", "Store failed.", 500)
 * ```
 *
 * @since 0.0.0
 * @category domain logic
 */
export const toRunServiceError: {
  (cause: unknown, message: string, status: number): RepoRunServiceError;
  (message: string, status: number): (cause: unknown) => RepoRunServiceError;
} = dual(
  3,
  (cause: unknown, message: string, status: number): RepoRunServiceError =>
    RepoRunServiceError.new(cause, message, status)
);

/**
 * Lift status/cause errors into the repo-run service error channel.
 *
 * @param effect - The effect whose status/cause error channel should be normalized.
 * @returns An effect that preserves success while lifting failures into RepoRunServiceError.
 * @example
 * ```ts
 * import { mapStatusCauseError, RepoRunServiceError } from "../../src/internal/RepoRunServiceShared.js"
 * import { Effect } from "effect"
 *
 * const program = mapStatusCauseError(Effect.fail(RepoRunServiceError.noCause("Missing run.", 404)))
 * ```
 *
 * @since 0.0.0
 * @category domain logic
 */
export const mapStatusCauseError = <A, E extends RepoRunStatusCauseError>(effect: Effect.Effect<A, E>) =>
  effect.pipe(Effect.mapError((error) => RepoRunServiceError.new(error.cause, error.message, error.status)));

/**
 * Convert a typed repo-run service error into the durable stream failure model.
 *
 * @param error - The typed repo-run service error to expose on the streaming boundary.
 * @returns A durable stream failure payload carrying the same message and status code.
 * @example
 * ```ts
 * import { RepoRunServiceError, toRunStreamFailure } from "../../src/internal/RepoRunServiceShared.js"
 *
 * const failure = toRunStreamFailure(RepoRunServiceError.noCause("Missing run.", 404))
 * ```
 *
 * @since 0.0.0
 * @category domain logic
 */
export const toRunStreamFailure = (error: RepoRunServiceError): RunStreamFailure =>
  new RunStreamFailure({
    message: error.message,
    status: error.status,
  });

/**
 * Determine whether a persisted run is already terminal.
 *
 * @param run - The persisted run snapshot to inspect.
 * @returns `true` when the run status is a terminal repo-memory state.
 * @example
 * ```ts
 * import { isTerminalRun } from "../../src/internal/RepoRunServiceShared.js"
 *
 * const predicate = isTerminalRun
 * ```
 *
 * @since 0.0.0
 * @category domain logic
 */
export const isTerminalRun = (run: RepoRun): boolean => isRunTerminalState(run.status);

/**
 * Determine whether a replayable run-stream event is terminal.
 *
 * @param event - The replayable event to inspect.
 * @returns `true` when the event kind represents a terminal run transition.
 * @example
 * ```ts
 * import { isTerminalRunEvent } from "../../src/internal/RepoRunServiceShared.js"
 *
 * const predicate = isTerminalRunEvent
 * ```
 *
 * @since 0.0.0
 * @category domain logic
 */
export const isTerminalRunEvent = (event: RunStreamEvent): boolean => isRunTerminalState(event.kind);

/**
 * Build a stable sequence predicate for cursor-based replay and live-tail filtering.
 *
 * @param cursor - The optional replay cursor that defines the last observed event sequence.
 * @returns A predicate that keeps only values whose `sequence` exceeds the cursor.
 * @example
 * ```ts
 * import { isSequenceAfterCursor } from "../../src/internal/RepoRunServiceShared.js"
 * import * as O from "effect/Option"
 *
 * const isAfterCursor = isSequenceAfterCursor(O.none())
 * ```
 *
 * @since 0.0.0
 * @category domain logic
 */
export function isSequenceAfterCursor<A extends { readonly sequence: number }>(cursor: O.Option<RunCursor>) {
  return (value: A): boolean =>
    pipe(
      cursor,
      O.match({
        onNone: thunkTrue,
        onSome: (currentCursor) => value.sequence > currentCursor,
      })
    );
}

/**
 * Poll interval used while waiting for workflow suspension after interruption.
 *
 * @example
 * ```ts
 * import { workflowSuspensionPollInterval } from "../../src/internal/RepoRunServiceShared.js"
 *
 * const interval = workflowSuspensionPollInterval
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const workflowSuspensionPollInterval = Duration.millis(25);

/**
 * Maximum number of workflow suspension polls before failing the command.
 *
 * @example
 * ```ts
 * import { workflowSuspensionPollMaxAttempts } from "../../src/internal/RepoRunServiceShared.js"
 *
 * const maxAttempts = workflowSuspensionPollMaxAttempts
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const workflowSuspensionPollMaxAttempts = 200;
