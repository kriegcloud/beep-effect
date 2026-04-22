/**
 * Runtime adapter for shared repo run projection.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import {
  projectRunEvent as projectSharedRunEvent,
  type RepoRun,
  type RunProjectorError,
  type RunStreamEvent,
} from "@beep/repo-memory-model";
import { Effect } from "effect";
import type * as O from "effect/Option";

/**
 * Runtime adapter over the shared repo-memory run projector.
 *
 * The pure projection logic lives in `@beep/repo-memory-model` so the server
 * and desktop can materialize identical run state from the same durable event
 * stream. The runtime package keeps this adapter as its stable local seam.
 *
 * @example
 * ```ts
 * import { projectRunEvent } from "@beep/repo-memory-runtime/run/RunProjector"
 *
 * const projector = projectRunEvent
 * ```
 *
 * @since 0.0.0
 * @category domain logic
 */
export const projectRunEvent = Effect.fn("RepoMemoryRuntime.RunProjector.projectRunEvent")(function* (
  currentRun: O.Option<RepoRun>,
  event: RunStreamEvent
): Effect.fn.Return<RepoRun, RunProjectorError> {
  return yield* projectSharedRunEvent(currentRun, event);
});

export { RunProjectorError } from "@beep/repo-memory-model";
