import { $RepoMemoryRuntimeId } from "@beep/identity/packages";
import type {
  RepoRegistryStoreShape,
  RepoRunStoreShape,
  RepoSemanticStoreShape,
  RepoSnapshotStoreShape,
  RepoSymbolStoreShape,
} from "@beep/repo-memory-store";
import { makeStatusCauseError, StatusCauseFields, type StatusCauseInput, TaggedErrorClass } from "@beep/schema";
import { Duration, Effect } from "effect";

const $I = $RepoMemoryRuntimeId.create("internal/RepoRunServiceShared");

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
 * @since 0.0.0
 * @category DomainLogic
 */
export const mapStatusCauseError = <A, E extends RepoRunStatusCauseError>(effect: Effect.Effect<A, E>) =>
  effect.pipe(Effect.mapError((error) => toRunServiceError(error.message, error.status, error.cause)));

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
