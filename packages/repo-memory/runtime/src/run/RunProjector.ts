import { $RepoMemoryRuntimeId } from "@beep/identity/packages";
import {
  IndexRun,
  QueryRun,
  type RepoRun,
  RunStreamEvent,
} from "@beep/repo-memory-model";
import { makeStatusCauseError, StatusCauseFields, TaggedErrorClass } from "@beep/schema";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $RepoMemoryRuntimeId.create("run/RunProjector");

/**
 * Typed projection error emitted while materializing run events.
 *
 * @since 0.0.0
 * @category Errors
 */
export class RunProjectorError extends TaggedErrorClass<RunProjectorError>($I`RunProjectorError`)(
  "RunProjectorError",
  StatusCauseFields,
  $I.annote("RunProjectorError", {
    description: "Typed projection error emitted while materializing run events.",
  })
) {}

const toRunProjectorError = makeStatusCauseError(RunProjectorError);

const requireCurrentRun = (currentRun: O.Option<RepoRun>, event: RunStreamEvent): Effect.Effect<RepoRun, RunProjectorError> =>
  O.match(currentRun, {
    onNone: () =>
      Effect.fail(
        toRunProjectorError(`Run "${event.runId}" must exist before projecting "${event.kind}".`, 404)
      ),
    onSome: Effect.succeed,
  });

const requireCurrentQueryRun = (
  currentRun: O.Option<RepoRun>,
  event: Extract<RunStreamEvent, { readonly kind: "retrieval-packet" | "answer" }>
): Effect.Effect<QueryRun, RunProjectorError> =>
  requireCurrentRun(currentRun, event).pipe(
    Effect.flatMap((run) =>
      run.kind === "query"
        ? Effect.succeed(run)
        : Effect.fail(
            toRunProjectorError(`Run "${event.runId}" must be a query run before projecting "${event.kind}".`, 409)
          )
    )
  );

/**
 * Project one durable run event into the current run read model.
 *
 * @since 0.0.0
 * @category Projections
 */
export const projectRunEvent = Effect.fn("RunProjector.projectRunEvent")(function* (
  currentRun: O.Option<RepoRun>,
  event: RunStreamEvent
): Effect.fn.Return<RepoRun, RunProjectorError> {
  if (
    event.kind === "accepted" ||
    event.kind === "started" ||
    event.kind === "completed" ||
    event.kind === "failed" ||
    event.kind === "interrupted" ||
    event.kind === "resumed"
  ) {
    return event.run;
  }

  if (event.kind === "progress") {
    const run = yield* requireCurrentRun(currentRun, event);

    return run.kind === "index"
      ? new IndexRun({
          ...run,
          status: "running",
          lastEventSequence: event.sequence,
        })
      : new QueryRun({
          ...run,
          status: "running",
          lastEventSequence: event.sequence,
        });
  }

  if (event.kind === "retrieval-packet") {
    const run = yield* requireCurrentQueryRun(currentRun, event);

    return new QueryRun({
      ...run,
      status: "running",
      retrievalPacket: O.some(event.packet),
      lastEventSequence: event.sequence,
    });
  }

  const run = yield* requireCurrentQueryRun(currentRun, event);

  return new QueryRun({
    ...run,
    status: "running",
    answer: O.some(event.answer),
    citations: event.citations,
    lastEventSequence: event.sequence,
  });
});
