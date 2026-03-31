import { $RepoMemoryRuntimeId } from "@beep/identity/packages";
import type { RetrievalPacket } from "@beep/repo-memory-model";
import {
  type IndexRun,
  type QueryRun,
  type QueryStagePhase,
  type RepoRun,
  RunCursor,
  RunEventSequence,
  type RunId,
  RunProgressUpdatedEvent,
  RunResumedEvent,
  RunStartedEvent,
  RunStreamEvent,
  RunStreamFailure,
  type StreamRunEventsRequest,
} from "@beep/repo-memory-model";
import { RepoRunStore } from "@beep/repo-memory-store";
import { NonNegativeInt } from "@beep/schema";
import { thunkTrue } from "@beep/utils";
import { DateTime, Effect, flow, Layer, Match, pipe, Schedule, ServiceMap, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Msgpack from "effect/unstable/encoding/Msgpack";
import * as EventJournal from "effect/unstable/eventlog/EventJournal";
import * as Reactivity from "effect/unstable/reactivity/Reactivity";
import { projectRunEvent } from "../run/RunProjector.js";
import type { RunExecutionTransition } from "../run/RunStateMachine.js";
import { mapStatusCauseError, type RepoRunServiceError, toRunServiceError } from "./RepoRunServiceShared.js";

const $I = $RepoMemoryRuntimeId.create("internal/RepoRunEventLog");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodeRunCursor = S.decodeUnknownSync(RunCursor);
const decodeRunEventPayload = S.decodeUnknownEffect(Msgpack.schema(RunStreamEvent));
const decodeRunEventSequence = S.decodeUnknownSync(RunEventSequence);
const encodeRunEventPayload = S.encodeUnknownEffect(Msgpack.schema(RunStreamEvent));

type ProjectedRunEvent = Extract<RunStreamEvent, { readonly kind: "answer" | "progress" | "retrieval-packet" }>;

const isTerminalEvent = (event: RunStreamEvent): boolean =>
  event.kind === "completed" || event.kind === "failed" || event.kind === "interrupted";

/**
 * Internal event-log projection and replay boundary for repo runs.
 *
 * @since 0.0.0
 * @category PortContract
 */
type RepoRunEventLogShape = {
  readonly appendExecutionTransitionEvent: (
    runId: RunId,
    emittedAt: DateTime.Utc,
    transition: RunExecutionTransition
  ) => Effect.Effect<RepoRun, RepoRunServiceError>;
  readonly appendProjectedEvent: (
    currentRun: RepoRun,
    event: ProjectedRunEvent
  ) => Effect.Effect<RepoRun, RepoRunServiceError>;
  readonly appendQueryStageProgress: (
    currentRun: QueryRun,
    progress: {
      readonly message: string;
      readonly percent: number;
      readonly phase: QueryStagePhase;
    }
  ) => Effect.Effect<QueryRun, RepoRunServiceError>;
  readonly appendRunEvent: (event: RunStreamEvent) => Effect.Effect<RunStreamEvent, RepoRunServiceError>;
  readonly ensureProjectedIndexRun: (run: RepoRun) => Effect.Effect<IndexRun, RepoRunServiceError>;
  readonly ensureProjectedQueryRun: (run: RepoRun) => Effect.Effect<QueryRun, RepoRunServiceError>;
  readonly nextSequenceForRun: (run: RepoRun) => RunEventSequence;
  readonly replayEventsForRun: (
    request: StreamRunEventsRequest
  ) => Effect.Effect<ReadonlyArray<RunStreamEvent>, RepoRunServiceError>;
  readonly streamRunEvents: (request: StreamRunEventsRequest) => Stream.Stream<RunStreamEvent, RunStreamFailure>;
};

/**
 * Service tag for run-event append, projection, replay, and streaming.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class RepoRunEventLog extends ServiceMap.Service<RepoRunEventLog, RepoRunEventLogShape>()($I`RepoRunEventLog`) {
  static readonly layer: Layer.Layer<
    RepoRunEventLog,
    never,
    EventJournal.EventJournal | Reactivity.Reactivity | RepoRunStore
  > = Layer.effect(
    RepoRunEventLog,
    Effect.suspend(() => makeRepoRunEventLog()).pipe(
      Effect.withSpan("RepoRunEventLog.make"),
      Effect.annotateLogs({ component: "repo-run-event-log" })
    )
  );
}

const makeRepoRunEventLog = Effect.fn("RepoRunEventLog.make")(function* () {
  const journal = yield* EventJournal.EventJournal;
  const reactivity = yield* Reactivity.Reactivity;
  const repoRunStore = yield* RepoRunStore;

  const invalidationKeysForRun = Match.type<RepoRun>().pipe(
    Match.withReturnType<ReadonlyArray<string>>(),
    Match.discriminatorsExhaustive("kind")({
      index: (indexRun) =>
        A.make("runs", `run:${indexRun.id}`, `repo:${indexRun.repoId}`, `repo-index:${indexRun.repoId}`),
      query: (queryRun) => A.make("runs", `run:${queryRun.id}`, `repo:${queryRun.repoId}`),
    })
  );

  const invalidateForRun = Effect.fn("RepoRunEventLog.invalidateForRun")(function* (run: RepoRun) {
    yield* reactivity.invalidate(invalidationKeysForRun(run));
  });

  const persistRunSnapshot = Effect.fn("RepoRunEventLog.persistRunSnapshot")(function* (run: RepoRun) {
    yield* mapStatusCauseError(repoRunStore.saveRun(run));
    yield* invalidateForRun(run);
  });

  const persistRetrievalPacket = Effect.fn("RepoRunEventLog.persistRetrievalPacket")(function* (
    runId: RunId,
    packet: RetrievalPacket
  ) {
    yield* mapStatusCauseError(repoRunStore.saveRetrievalPacket(runId, packet));
    yield* reactivity.invalidate(A.make(`run:${runId}`, `repo:${packet.repoId}`));
  });

  const ensureProjectedIndexRun: RepoRunEventLogShape["ensureProjectedIndexRun"] = Effect.fn(
    "RepoRunEventLog.ensureProjectedIndexRun"
  )(function* (run) {
    if (run.kind !== "index") {
      return yield* toRunServiceError(`Expected an index run projection for "${run.id}".`, 500);
    }

    return run;
  });

  const ensureProjectedQueryRun: RepoRunEventLogShape["ensureProjectedQueryRun"] = Effect.fn(
    "RepoRunEventLog.ensureProjectedQueryRun"
  )(function* (run) {
    if (run.kind !== "query") {
      return yield* toRunServiceError(`Expected a query run projection for "${run.id}".`, 500);
    }

    return run;
  });

  const materializeRunEvent = Effect.fn("RepoRunEventLog.materializeRunEvent")(function* (
    event: RunStreamEvent
  ): Effect.fn.Return<void, RepoRunServiceError> {
    return yield* reactivity.withBatch(
      Effect.gen(function* () {
        const currentRun = yield* mapStatusCauseError(repoRunStore.getRun(event.runId));
        const projectedRun = yield* mapStatusCauseError(projectRunEvent(currentRun, event));

        if (event.kind === "retrieval-packet") {
          yield* persistRetrievalPacket(event.runId, event.packet);
        }

        yield* persistRunSnapshot(projectedRun);
      })
    );
  });

  const mapJournalError = <A, E>(method: string, effect: Effect.Effect<A, E>) =>
    effect.pipe(Effect.mapError((error) => toRunServiceError(`Failed to ${method}.`, 500, error)));

  const appendRunEvent: RepoRunEventLogShape["appendRunEvent"] = Effect.fn("RepoRunEventLog.appendRunEvent")(
    function* (event) {
      const payload = yield* encodeRunEventPayload(event).pipe(
        Effect.mapError((cause) =>
          toRunServiceError(`Failed to encode run event "${event.kind}" for "${event.runId}".`, 500, cause)
        )
      );

      return yield* mapJournalError(
        `append run event "${event.kind}" for "${event.runId}"`,
        journal
          .write({
            event: event.kind,
            primaryKey: event.runId,
            payload,
            effect: () => materializeRunEvent(event).pipe(Effect.as(event)),
          })
          .pipe(
            Effect.retry({
              times: 3,
              schedule: Schedule.exponential("100 millis"),
            })
          )
      );
    }
  );

  const decodeJournalEvent = Effect.fn("RepoRunEventLog.decodeJournalEvent")(function* (entry: EventJournal.Entry) {
    return yield* decodeRunEventPayload(entry.payload).pipe(
      Effect.mapError((cause) =>
        toRunServiceError(`Failed to decode run event payload for "${entry.primaryKey}".`, 500, cause)
      )
    );
  });

  const replayEventsForRun: RepoRunEventLogShape["replayEventsForRun"] = Effect.fn(
    "RepoRunEventLog.replayEventsForRun"
  )(function* (request) {
    const entries = yield* mapJournalError(`load journal entries for run "${request.runId}"`, journal.entries);
    const decoded = yield* Effect.forEach(entries, (entry) =>
      entry.primaryKey === request.runId ? decodeJournalEvent(entry).pipe(Effect.map(O.some)) : Effect.succeed(O.none())
    );
    const replayEvents = pipe(
      decoded,
      A.reduce(A.empty<RunStreamEvent>(), (events, maybeEvent) =>
        O.isSome(maybeEvent) ? pipe(events, A.append(maybeEvent.value)) : events
      ),
      A.filter((event) =>
        pipe(
          request.cursor,
          O.match({
            onNone: thunkTrue,
            onSome: (cursor) => event.sequence > cursor,
          })
        )
      )
    );

    if (A.isReadonlyArrayNonEmpty(replayEvents)) {
      return replayEvents;
    }

    const maybeRun = yield* mapStatusCauseError(repoRunStore.getRun(request.runId));

    return yield* O.match(maybeRun, {
      onNone: () => toRunServiceError(`Run not found: "${request.runId}".`, 404),
      onSome: () => Effect.succeed(replayEvents),
    });
  });

  const nextSequenceForRun: RepoRunEventLogShape["nextSequenceForRun"] = (run) =>
    decodeRunEventSequence(run.lastEventSequence + 1);

  const appendExecutionTransitionEvent: RepoRunEventLogShape["appendExecutionTransitionEvent"] = Effect.fn(
    "RepoRunEventLog.appendExecutionTransitionEvent"
  )(function* (runId, emittedAt, transition) {
    yield* Match.value(transition.eventKind).pipe(
      Match.when("started", () =>
        appendRunEvent(
          new RunStartedEvent({
            runId,
            sequence: transition.run.lastEventSequence,
            emittedAt,
          })
        )
      ),
      Match.when("resumed", () =>
        appendRunEvent(
          new RunResumedEvent({
            runId,
            sequence: transition.run.lastEventSequence,
            emittedAt,
          })
        )
      ),
      Match.exhaustive
    );

    return transition.run;
  });

  const appendProjectedEvent: RepoRunEventLogShape["appendProjectedEvent"] = Effect.fn(
    "RepoRunEventLog.appendProjectedEvent"
  )(function* (currentRun, event) {
    yield* appendRunEvent(event);
    return yield* mapStatusCauseError(projectRunEvent(O.some(currentRun), event));
  });

  const appendQueryStageProgress: RepoRunEventLogShape["appendQueryStageProgress"] = Effect.fn(
    "RepoRunEventLog.appendQueryStageProgress"
  )(function* (currentRun, progress) {
    return yield* ensureProjectedQueryRun(
      yield* appendProjectedEvent(
        currentRun,
        new RunProgressUpdatedEvent({
          runId: currentRun.id,
          sequence: nextSequenceForRun(currentRun),
          emittedAt: yield* DateTime.now,
          phase: progress.phase,
          message: progress.message,
          percent: O.some(decodeNonNegativeInt(progress.percent)),
        })
      )
    );
  });

  const streamRunEvents: RepoRunEventLogShape["streamRunEvents"] = (request) =>
    Stream.scoped(
      Stream.unwrap(
        Effect.gen(function* () {
          yield* Effect.annotateCurrentSpan({
            run_id: request.runId,
            cursor_present: O.isSome(request.cursor),
          });
          const subscription = yield* journal.changes;
          const replayEvents = yield* replayEventsForRun(request).pipe(
            Effect.mapError((error) => new RunStreamFailure({ message: error.message, status: error.status }))
          );
          const lastReplayCursor = pipe(
            replayEvents,
            A.last,
            O.map((event) => decodeRunCursor(event.sequence)),
            O.orElse(() => request.cursor)
          );
          const replayStream = Stream.fromIterable(replayEvents);

          yield* Effect.annotateCurrentSpan({
            replay_event_count: replayEvents.length,
            replay_is_terminal: pipe(replayEvents, A.last, O.exists(isTerminalEvent)),
          });

          if (pipe(replayEvents, A.last, O.exists(isTerminalEvent))) {
            return replayStream;
          }

          const liveStream = Stream.fromSubscription(subscription).pipe(
            Stream.filter((entry) => entry.primaryKey === request.runId),
            Stream.mapEffect(
              flow(
                decodeJournalEvent,
                Effect.mapError((error) => new RunStreamFailure({ message: error.message, status: error.status }))
              )
            ),
            Stream.filter((event) =>
              pipe(
                lastReplayCursor,
                O.match({
                  onNone: thunkTrue,
                  onSome: (cursor) => event.sequence > cursor,
                })
              )
            ),
            Stream.takeUntil(isTerminalEvent)
          );

          return Stream.concat(replayStream, liveStream);
        }).pipe(Effect.withSpan("RepoRunEventLog.streamRunEvents"))
      )
    );

  return RepoRunEventLog.of({
    appendExecutionTransitionEvent,
    appendProjectedEvent,
    appendQueryStageProgress,
    appendRunEvent,
    ensureProjectedIndexRun,
    ensureProjectedQueryRun,
    nextSequenceForRun,
    replayEventsForRun,
    streamRunEvents,
  });
});
