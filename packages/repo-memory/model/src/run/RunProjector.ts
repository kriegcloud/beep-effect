import { $RepoMemoryModelId } from "@beep/identity/packages";
import { makeStatusCauseError, NonNegativeInt, StatusCauseFields, TaggedErrorClass } from "@beep/schema";
import { type DateTime, Effect, Match, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { RunEventSequence, type RunEventSequence as RunEventSequenceValue } from "../internal/domain.js";
import { IndexRun, QueryRun, type RepoRun, type RunStreamEvent } from "../internal/protocolModels.js";

const $I = $RepoMemoryModelId.create("run/RunProjector");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodeRunEventSequence = S.decodeUnknownSync(RunEventSequence);

const nextSequence = (event: RunStreamEvent) => decodeRunEventSequence(event.sequence);

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
    description: "Typed projection error emitted while materializing repo-memory run events.",
  })
) {}

const toRunProjectorError = makeStatusCauseError(RunProjectorError);

const requireCurrentRun = (
  currentRun: O.Option<RepoRun>,
  event: RunStreamEvent
): Effect.Effect<RepoRun, RunProjectorError> =>
  O.match(currentRun, {
    onNone: () =>
      Effect.fail(toRunProjectorError(`Run "${event.runId}" must exist before projecting "${event.kind}".`, 404)),
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

const acceptedRunFromEvent = (event: Extract<RunStreamEvent, { readonly kind: "accepted" }>) =>
  Match.value(event.runKind).pipe(
    Match.when("index", () =>
      Effect.succeed(
        new IndexRun({
          kind: "index",
          id: event.runId,
          repoId: event.repoId,
          status: "accepted",
          acceptedAt: event.emittedAt,
          startedAt: O.none(),
          completedAt: O.none(),
          lastEventSequence: nextSequence(event),
          indexedFileCount: O.none(),
          errorMessage: O.none(),
        })
      )
    ),
    Match.when("query", () =>
      pipe(
        event.question,
        O.match({
          onNone: () =>
            Effect.fail(
              toRunProjectorError(`Accepted query run "${event.runId}" must include its original question.`, 500)
            ),
          onSome: (question) =>
            Effect.succeed(
              new QueryRun({
                kind: "query",
                id: event.runId,
                repoId: event.repoId,
                question,
                status: "accepted",
                acceptedAt: event.emittedAt,
                startedAt: O.none(),
                completedAt: O.none(),
                lastEventSequence: nextSequence(event),
                answer: O.none(),
                citations: [],
                retrievalPacket: O.none(),
                errorMessage: O.none(),
              })
            ),
        })
      )
    ),
    Match.exhaustive
  );

const updateRunStatus = (
  run: RepoRun,
  patch: {
    readonly status: RepoRun["status"];
    readonly startedAt: O.Option<DateTime.Utc>;
    readonly completedAt: O.Option<DateTime.Utc>;
    readonly lastEventSequence: RunEventSequenceValue;
    readonly errorMessage: O.Option<string>;
  }
): RepoRun =>
  Match.value(run).pipe(
    Match.discriminatorsExhaustive("kind")({
      index: (indexRun) =>
        new IndexRun({
          ...indexRun,
          status: patch.status,
          startedAt: patch.startedAt,
          completedAt: patch.completedAt,
          lastEventSequence: patch.lastEventSequence,
          errorMessage: patch.errorMessage,
        }),
      query: (queryRun) =>
        new QueryRun({
          ...queryRun,
          status: patch.status,
          startedAt: patch.startedAt,
          completedAt: patch.completedAt,
          lastEventSequence: patch.lastEventSequence,
          errorMessage: patch.errorMessage,
        }),
    })
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
  if (event.kind === "accepted") {
    return yield* acceptedRunFromEvent(event);
  }

  if (event.kind === "started" || event.kind === "resumed") {
    const run = yield* requireCurrentRun(currentRun, event);

    return updateRunStatus(run, {
      status: "running",
      startedAt: pipe(
        run.startedAt,
        O.orElse(() => O.some(event.emittedAt))
      ),
      completedAt: O.none(),
      lastEventSequence: nextSequence(event),
      errorMessage: O.none(),
    });
  }

  if (event.kind === "interrupted") {
    const run = yield* requireCurrentRun(currentRun, event);

    return updateRunStatus(run, {
      status: "interrupted",
      startedAt: run.startedAt,
      completedAt: O.some(event.emittedAt),
      lastEventSequence: nextSequence(event),
      errorMessage: O.none(),
    });
  }

  if (event.kind === "failed") {
    const run = yield* requireCurrentRun(currentRun, event);

    return updateRunStatus(run, {
      status: "failed",
      startedAt: run.startedAt,
      completedAt: O.some(event.emittedAt),
      lastEventSequence: nextSequence(event),
      errorMessage: O.some(event.message),
    });
  }

  if (event.kind === "completed") {
    const run = yield* requireCurrentRun(currentRun, event);

    return yield* Match.value(run).pipe(
      Match.discriminatorsExhaustive("kind")({
        index: (indexRun) =>
          Effect.succeed(
            new IndexRun({
              ...indexRun,
              status: "completed",
              completedAt: O.some(event.emittedAt),
              lastEventSequence: nextSequence(event),
              indexedFileCount: pipe(
                event.indexedFileCount,
                O.map(decodeNonNegativeInt),
                O.orElse(() => indexRun.indexedFileCount)
              ),
              errorMessage: O.none(),
            })
          ),
        query: (queryRun) =>
          Effect.succeed(
            new QueryRun({
              ...queryRun,
              status: "completed",
              completedAt: O.some(event.emittedAt),
              lastEventSequence: nextSequence(event),
              errorMessage: O.none(),
            })
          ),
      })
    );
  }

  if (event.kind === "progress") {
    const run = yield* requireCurrentRun(currentRun, event);

    return updateRunStatus(run, {
      status: "running",
      startedAt: pipe(
        run.startedAt,
        O.orElse(() => O.some(event.emittedAt))
      ),
      completedAt: O.none(),
      lastEventSequence: nextSequence(event),
      errorMessage: O.none(),
    });
  }

  if (event.kind === "retrieval-packet") {
    const run = yield* requireCurrentQueryRun(currentRun, event);

    return new QueryRun({
      ...run,
      status: "running",
      retrievalPacket: O.some(event.packet),
      lastEventSequence: nextSequence(event),
      errorMessage: O.none(),
    });
  }

  const run = yield* requireCurrentQueryRun(currentRun, event);

  return new QueryRun({
    ...run,
    status: "running",
    answer: O.some(event.answer),
    citations: event.citations,
    lastEventSequence: nextSequence(event),
    errorMessage: O.none(),
  });
});
