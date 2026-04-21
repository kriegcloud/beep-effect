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
import { makeStatusCauseError, StatusCauseFields, type StatusCauseInput, TaggedErrorClass } from "@beep/schema";
import { thunkTrue } from "@beep/utils";
import { Duration, Effect, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $RepoMemoryRuntimeId.create("internal/RepoRunServiceShared");
const isRunTerminalState = S.is(RunTerminalState);

/**
 * Composite driver shape used by the repo-memory runtime orchestration layer.
 *
 * @since 0.0.0
 * @category PortContract
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
 * @since 0.0.0
 * @category DomainModel
 */
export class RepoRunServiceError extends TaggedErrorClass<RepoRunServiceError>($I`RepoRunServiceError`)(
  "RepoRunServiceError",
  StatusCauseFields,
  $I.annote("RepoRunServiceError", {
    description: "Typed error for repo run service orchestration boundaries.",
  })
) {}

/**
 * Build a repo-run service error from message, status, and cause data.
 *
 * @since 0.0.0
 * @category DomainLogic
 */
export const toRunServiceError = makeStatusCauseError(RepoRunServiceError);

/**
 * Lift status/cause errors into the repo-run service error channel.
 *
 * @param effect - The effect whose status/cause error channel should be normalized.
 * @returns An effect that preserves success while lifting failures into RepoRunServiceError.
 * @since 0.0.0
 * @category DomainLogic
 */
export const mapStatusCauseError = <A, E extends RepoRunStatusCauseError>(effect: Effect.Effect<A, E>) =>
  effect.pipe(Effect.mapError((error) => toRunServiceError(error.message, error.status, error.cause)));

/**
 * Convert a typed repo-run service error into the durable stream failure model.
 *
 * @param error - The typed repo-run service error to expose on the streaming boundary.
 * @returns A durable stream failure payload carrying the same message and status code.
 * @since 0.0.0
 * @category DomainLogic
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
 * @since 0.0.0
 * @category DomainLogic
 */
export const isTerminalRun = (run: RepoRun): boolean => isRunTerminalState(run.status);

/**
 * Determine whether a replayable run-stream event is terminal.
 *
 * @param event - The replayable event to inspect.
 * @returns `true` when the event kind represents a terminal run transition.
 * @since 0.0.0
 * @category DomainLogic
 */
export const isTerminalRunEvent = (event: RunStreamEvent): boolean => isRunTerminalState(event.kind);

/**
 * Build a stable sequence predicate for cursor-based replay and live-tail filtering.
 *
 * @param cursor - The optional replay cursor that defines the last observed event sequence.
 * @returns A predicate that keeps only values whose `sequence` exceeds the cursor.
 * @since 0.0.0
 * @category DomainLogic
 */
/**
 * @since 0.0.0
 * @category DomainLogic
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
 * @since 0.0.0
 * @category Configuration
 */
export const workflowSuspensionPollInterval = Duration.millis(25);

/**
 * Maximum number of workflow suspension polls before failing the command.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const workflowSuspensionPollMaxAttempts = 200;
