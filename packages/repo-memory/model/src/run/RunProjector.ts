import { $RepoMemoryModelId } from "@beep/identity/packages";
import { makeStatusCauseError, NonNegativeInt, StatusCauseFields, TaggedErrorClass } from "@beep/schema";
import { type DateTime, Effect, Match, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { RunEventSequence, type RunEventSequence as RunEventSequenceValue } from "../internal/domain.js";
import {
  AnswerQueryStage,
  GroundingQueryStage,
  IndexRun,
  PacketQueryStage,
  QueryRun,
  type QueryStagePhase,
  QueryStageTrace,
  type RepoRun,
  RetrievalQueryStage,
  type RunStreamEvent,
} from "../internal/protocolModels.js";

const $I = $RepoMemoryModelId.create("run/RunProjector");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodeRunEventSequence = S.decodeUnknownSync(RunEventSequence);
const completedStagePercent = decodeNonNegativeInt(100);
const queryStageOrder = ["grounding", "retrieval", "packet", "answer"] as const;
type QueryStagePercentValue = GroundingQueryStage["percent"] extends O.Option<infer A> ? A : never;

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

const makeQueryStage = (
  phase: QueryStagePhase,
  patch?: {
    readonly artifactAvailable?: O.Option<boolean>;
    readonly completedAt?: O.Option<DateTime.Utc>;
    readonly latestMessage?: O.Option<string>;
    readonly percent?: O.Option<QueryStagePercentValue>;
    readonly startedAt?: O.Option<DateTime.Utc>;
    readonly status?: "pending" | "running" | "completed";
  }
) => {
  const base: {
    readonly artifactAvailable: O.Option<boolean>;
    readonly completedAt: O.Option<DateTime.Utc>;
    readonly latestMessage: O.Option<string>;
    readonly percent: O.Option<QueryStagePercentValue>;
    readonly startedAt: O.Option<DateTime.Utc>;
    readonly status: "pending" | "running" | "completed";
  } = {
    status: "pending" as const,
    startedAt: O.none<DateTime.Utc>(),
    completedAt: O.none<DateTime.Utc>(),
    latestMessage: O.none<string>(),
    percent: O.none<QueryStagePercentValue>(),
    artifactAvailable: O.none<boolean>(),
    ...patch,
  };

  switch (phase) {
    case "grounding":
      return new GroundingQueryStage(base);
    case "retrieval":
      return new RetrievalQueryStage(base);
    case "packet":
      return new PacketQueryStage(base);
    case "answer":
      return new AnswerQueryStage(base);
  }
};

const makePendingQueryStageTrace = () =>
  new QueryStageTrace({
    grounding: makeQueryStage("grounding") as GroundingQueryStage,
    retrieval: makeQueryStage("retrieval") as RetrievalQueryStage,
    packet: makeQueryStage("packet") as PacketQueryStage,
    answer: makeQueryStage("answer") as AnswerQueryStage,
  });

const queryStageFields = (stage: GroundingQueryStage | RetrievalQueryStage | PacketQueryStage | AnswerQueryStage) => ({
  status: stage.status,
  startedAt: stage.startedAt,
  completedAt: stage.completedAt,
  latestMessage: stage.latestMessage,
  percent: stage.percent,
  artifactAvailable: stage.artifactAvailable,
});

const updateQueryStageTrace = (
  trace: QueryStageTrace,
  phase: QueryStagePhase,
  update: (
    stage: GroundingQueryStage | RetrievalQueryStage | PacketQueryStage | AnswerQueryStage
  ) => GroundingQueryStage | RetrievalQueryStage | PacketQueryStage | AnswerQueryStage
) =>
  new QueryStageTrace({
    grounding: phase === "grounding" ? (update(trace.grounding) as GroundingQueryStage) : trace.grounding,
    retrieval: phase === "retrieval" ? (update(trace.retrieval) as RetrievalQueryStage) : trace.retrieval,
    packet: phase === "packet" ? (update(trace.packet) as PacketQueryStage) : trace.packet,
    answer: phase === "answer" ? (update(trace.answer) as AnswerQueryStage) : trace.answer,
  });

const ensureQueryStageTrace = (run: QueryRun): QueryStageTrace =>
  pipe(run.queryStages, O.getOrElse(makePendingQueryStageTrace));

const completeQueryStage = (
  trace: QueryStageTrace,
  phase: QueryStagePhase,
  at: DateTime.Utc,
  options?: {
    readonly artifactAvailable?: boolean;
    readonly latestMessage?: string;
  }
) =>
  updateQueryStageTrace(trace, phase, (stage) =>
    makeQueryStage(phase, {
      ...queryStageFields(stage),
      status: "completed",
      startedAt: pipe(
        stage.startedAt,
        O.orElse(() => O.some(at))
      ),
      completedAt: O.some(at),
      latestMessage: options?.latestMessage === undefined ? stage.latestMessage : O.some(options.latestMessage),
      percent: O.some(completedStagePercent),
      artifactAvailable:
        options?.artifactAvailable === undefined ? stage.artifactAvailable : O.some(options.artifactAvailable),
    })
  );

const completeStagesBefore = (trace: QueryStageTrace, phase: QueryStagePhase, at: DateTime.Utc): QueryStageTrace => {
  const targetIndex = queryStageOrder.indexOf(phase);
  let nextTrace = trace;

  for (const currentPhase of queryStageOrder) {
    if (queryStageOrder.indexOf(currentPhase) >= targetIndex) {
      break;
    }

    nextTrace = completeQueryStage(nextTrace, currentPhase, at);
  }

  return nextTrace;
};

const projectQueryProgress = (
  run: QueryRun,
  event: Extract<RunStreamEvent, { readonly kind: "progress" }>
): QueryRun => {
  if (
    event.phase !== "grounding" &&
    event.phase !== "retrieval" &&
    event.phase !== "packet" &&
    event.phase !== "answer"
  ) {
    return run;
  }
  const phase = event.phase as QueryStagePhase;

  const nextTrace = pipe(
    ensureQueryStageTrace(run),
    (trace) => completeStagesBefore(trace, phase, event.emittedAt),
    (trace) =>
      updateQueryStageTrace(trace, phase, (stage) =>
        makeQueryStage(phase, {
          ...queryStageFields(stage),
          status: "running",
          startedAt: pipe(
            stage.startedAt,
            O.orElse(() => O.some(event.emittedAt))
          ),
          completedAt: O.none(),
          latestMessage: O.some(event.message),
          percent: event.percent,
        })
      )
  );

  return new QueryRun({
    ...run,
    queryStages: O.some(nextTrace),
  });
};

const projectQueryArtifactStage = (
  run: QueryRun,
  phase: "packet" | "answer",
  emittedAt: DateTime.Utc,
  latestMessage: string
): QueryRun =>
  new QueryRun({
    ...run,
    queryStages: O.some(
      pipe(
        ensureQueryStageTrace(run),
        (trace) => completeStagesBefore(trace, phase, emittedAt),
        (trace) =>
          completeQueryStage(trace, phase, emittedAt, {
            artifactAvailable: true,
            latestMessage,
          })
      )
    ),
  });

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
                queryStages: O.some(makePendingQueryStageTrace()),
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
    const updatedRun = updateRunStatus(run, {
      status: "running",
      startedAt: pipe(
        run.startedAt,
        O.orElse(() => O.some(event.emittedAt))
      ),
      completedAt: O.none(),
      lastEventSequence: nextSequence(event),
      errorMessage: O.none(),
    });

    return updatedRun.kind === "query" ? projectQueryProgress(updatedRun, event) : updatedRun;
  }

  if (event.kind === "retrieval-packet") {
    const run = yield* requireCurrentQueryRun(currentRun, event);

    return projectQueryArtifactStage(
      new QueryRun({
        ...run,
        status: "running",
        retrievalPacket: O.some(event.packet),
        lastEventSequence: nextSequence(event),
        errorMessage: O.none(),
      }),
      "packet",
      event.emittedAt,
      "Retrieval packet materialized."
    );
  }

  const run = yield* requireCurrentQueryRun(currentRun, event);

  return projectQueryArtifactStage(
    new QueryRun({
      ...run,
      status: "running",
      answer: O.some(event.answer),
      citations: event.citations,
      lastEventSequence: nextSequence(event),
      errorMessage: O.none(),
    }),
    "answer",
    event.emittedAt,
    "Grounded answer drafted."
  );
});
