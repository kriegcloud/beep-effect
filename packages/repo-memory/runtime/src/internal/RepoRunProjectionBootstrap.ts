import { $RepoMemoryRuntimeId } from "@beep/identity/packages";
import {
  RepoRun,
  RunCursor,
  type RunId,
  RunStreamEvent,
  type RunStreamFailure,
  type StreamRunEventsRequest,
} from "@beep/repo-memory-model";
import { RepoRunStore } from "@beep/repo-memory-store";
import { Effect, Layer, pipe, ServiceMap, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { RepoRunEventLog } from "./RepoRunEventLog.js";
import {
  isSequenceAfterCursor,
  isTerminalRun,
  isTerminalRunEvent,
  mapStatusCauseError,
  type RepoRunServiceError,
  toRunServiceError,
  toRunStreamFailure,
} from "./RepoRunServiceShared.js";

const $I = $RepoMemoryRuntimeId.create("internal/RepoRunProjectionBootstrap");
const decodeRunCursor = S.decodeUnknownSync(RunCursor);

/**
 * Internal read-plane handoff describing the persisted run snapshot plus
 * replay metadata needed before attaching a live event tail.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RunStreamBootstrap extends S.Class<RunStreamBootstrap>($I`RunStreamBootstrap`)(
  {
    run: RepoRun,
    replayEvents: S.Array(RunStreamEvent),
    effectiveCursor: S.OptionFromOptionalKey(RunCursor),
    terminalAfterReplay: S.Boolean,
  },
  $I.annote("RunStreamBootstrap", {
    description: "Internal read-plane handoff describing snapshot hydration plus replay metadata for one run stream.",
  })
) {}

/**
 * Read-plane bootstrap and replay boundary for persisted run projections.
 *
 * @since 0.0.0
 * @category PortContract
 */
type RepoRunProjectionBootstrapShape = {
  readonly listRuns: Effect.Effect<ReadonlyArray<RepoRun>, RepoRunServiceError>;
  readonly prepareStream: (request: StreamRunEventsRequest) => Effect.Effect<RunStreamBootstrap, RepoRunServiceError>;
  readonly requireRun: (runId: RunId) => Effect.Effect<RepoRun, RepoRunServiceError>;
  readonly streamRunEvents: (request: StreamRunEventsRequest) => Stream.Stream<RunStreamEvent, RunStreamFailure>;
};

/**
 * Service tag for snapshot-primary read bootstrap plus replay handoff.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class RepoRunProjectionBootstrap extends ServiceMap.Service<
  RepoRunProjectionBootstrap,
  RepoRunProjectionBootstrapShape
>()($I`RepoRunProjectionBootstrap`) {
  static readonly layer: Layer.Layer<RepoRunProjectionBootstrap, never, RepoRunEventLog | RepoRunStore> = Layer.effect(
    RepoRunProjectionBootstrap,
    Effect.suspend(() => makeRepoRunProjectionBootstrap()).pipe(
      Effect.withSpan("RepoRunProjectionBootstrap.make"),
      Effect.annotateLogs({ component: "repo-run-projection-bootstrap" })
    )
  );
}

const makeRepoRunProjectionBootstrap = Effect.fn("RepoRunProjectionBootstrap.make")(function* () {
  const repoRunEventLog = yield* RepoRunEventLog;
  const repoRunStore = yield* RepoRunStore;

  const requireRun: RepoRunProjectionBootstrapShape["requireRun"] = Effect.fn("RepoRunProjectionBootstrap.requireRun")(
    function* (runId) {
      const maybeRun = yield* mapStatusCauseError(repoRunStore.getRun(runId));

      return yield* O.match(maybeRun, {
        onNone: () => toRunServiceError(`Run not found: "${runId}".`, 404),
        onSome: Effect.succeed,
      });
    }
  );

  const listRuns: RepoRunProjectionBootstrapShape["listRuns"] = mapStatusCauseError(repoRunStore.listRuns).pipe(
    Effect.withSpan("RepoRunProjectionBootstrap.listRuns"),
    Effect.annotateLogs({ component: "repo-run-projection-bootstrap" })
  );

  const ensureCursorWithinSnapshot = Effect.fn("RepoRunProjectionBootstrap.ensureCursorWithinSnapshot")(function* (
    run: RepoRun,
    cursor: O.Option<RunCursor>
  ): Effect.fn.Return<void, RepoRunServiceError> {
    if (O.isSome(cursor) && cursor.value > run.lastEventSequence) {
      return yield* toRunServiceError(
        `Replay cursor "${cursor.value}" exceeds the last stored sequence "${run.lastEventSequence}" for "${run.id}".`,
        409
      );
    }
  });

  const ensureStrictlyIncreasingEvents = Effect.fn("RepoRunProjectionBootstrap.ensureStrictlyIncreasingEvents")(
    function* (runId: RunId, events: ReadonlyArray<RunStreamEvent>): Effect.fn.Return<void, RepoRunServiceError> {
      let previous = O.none<number>();

      for (const event of events) {
        if (O.isSome(previous) && event.sequence <= previous.value) {
          return yield* toRunServiceError(
            `Decoded run events for "${runId}" must be strictly increasing by sequence.`,
            500
          );
        }

        previous = O.some(event.sequence);
      }
    }
  );

  const ensureSnapshotTailMatchesJournal = Effect.fn("RepoRunProjectionBootstrap.ensureSnapshotTailMatchesJournal")(
    function* (run: RepoRun, events: ReadonlyArray<RunStreamEvent>): Effect.fn.Return<void, RepoRunServiceError> {
      const lastEvent = pipe(events, A.last);

      if (O.isNone(lastEvent)) {
        if (run.lastEventSequence > 0) {
          return yield* toRunServiceError(
            `Run "${run.id}" has stored sequence "${run.lastEventSequence}" but no decoded journal events.`,
            500
          );
        }

        return;
      }

      if (lastEvent.value.sequence !== run.lastEventSequence) {
        return yield* toRunServiceError(
          `Decoded journal tail "${lastEvent.value.sequence}" does not match stored sequence "${run.lastEventSequence}" for "${run.id}".`,
          500
        );
      }

      const journalIsTerminal = isTerminalRunEvent(lastEvent.value);
      const snapshotIsTerminal = isTerminalRun(run);

      if (journalIsTerminal !== snapshotIsTerminal) {
        return yield* toRunServiceError(
          `Stored run "${run.id}" terminal state does not match the decoded journal tail.`,
          500
        );
      }
    }
  );

  const ensureReplayStaysAfterCursor = Effect.fn("RepoRunProjectionBootstrap.ensureReplayStaysAfterCursor")(function* (
    run: RepoRun,
    cursor: O.Option<RunCursor>,
    replayEvents: ReadonlyArray<RunStreamEvent>
  ): Effect.fn.Return<void, RepoRunServiceError> {
    for (const event of replayEvents) {
      if (O.isSome(cursor) && event.sequence <= cursor.value) {
        return yield* toRunServiceError(
          `Replay for "${run.id}" included sequence "${event.sequence}" at or before the requested cursor "${cursor.value}".`,
          500
        );
      }

      if (event.sequence > run.lastEventSequence) {
        return yield* toRunServiceError(
          `Replay for "${run.id}" included sequence "${event.sequence}" beyond the stored run sequence "${run.lastEventSequence}".`,
          500
        );
      }
    }
  });

  const prepareStream: RepoRunProjectionBootstrapShape["prepareStream"] = Effect.fn(
    "RepoRunProjectionBootstrap.prepareStream"
  )(function* (request) {
    const run = yield* requireRun(request.runId);
    return yield* prepareStreamForRun(request, run);
  });

  const prepareStreamForRun = Effect.fn("RepoRunProjectionBootstrap.prepareStreamForRun")(function* (
    request: StreamRunEventsRequest,
    run: RepoRun
  ) {
    yield* ensureCursorWithinSnapshot(run, request.cursor);

    const decodedEvents = yield* repoRunEventLog.readRunEvents(request.runId);
    yield* ensureStrictlyIncreasingEvents(request.runId, decodedEvents);
    yield* ensureSnapshotTailMatchesJournal(run, decodedEvents);

    const replayEvents = pipe(decodedEvents, A.filter(isSequenceAfterCursor(request.cursor)));
    yield* ensureReplayStaysAfterCursor(run, request.cursor, replayEvents);

    const effectiveCursor = pipe(
      replayEvents,
      A.last,
      O.map((event) => decodeRunCursor(event.sequence)),
      O.orElse(() => request.cursor)
    );
    const terminalAfterReplay = pipe(replayEvents, A.last, O.exists(isTerminalRunEvent)) || isTerminalRun(run);

    yield* Effect.annotateCurrentSpan({
      run_id: request.runId,
      cursor_present: O.isSome(request.cursor),
      replay_event_count: replayEvents.length,
      terminal_after_replay: terminalAfterReplay,
    });

    return new RunStreamBootstrap({
      run,
      replayEvents,
      effectiveCursor,
      terminalAfterReplay,
    });
  });

  const streamRunEvents: RepoRunProjectionBootstrapShape["streamRunEvents"] = (request) =>
    Stream.scoped(
      Stream.unwrap(
        Effect.gen(function* () {
          const run = yield* requireRun(request.runId).pipe(Effect.mapError(toRunStreamFailure));
          if (isTerminalRun(run)) {
            const terminalBootstrap = yield* prepareStreamForRun(request, run).pipe(
              Effect.mapError(toRunStreamFailure)
            );

            return Stream.fromIterable(terminalBootstrap.replayEvents);
          }

          const liveStream = yield* repoRunEventLog.openLiveRunEventsAfter(request.runId, request.cursor);
          const bootstrap = yield* prepareStreamForRun(request, run).pipe(Effect.mapError(toRunStreamFailure));
          const replayStream = Stream.fromIterable(bootstrap.replayEvents);

          if (bootstrap.terminalAfterReplay) {
            return replayStream;
          }

          return Stream.concat(
            replayStream,
            liveStream.pipe(Stream.filter((event) => isSequenceAfterCursor(bootstrap.effectiveCursor)(event)))
          );
        }).pipe(Effect.withSpan("RepoRunProjectionBootstrap.streamRunEvents"))
      )
    );

  return RepoRunProjectionBootstrap.of({
    listRuns,
    prepareStream,
    requireRun,
    streamRunEvents,
  });
});
