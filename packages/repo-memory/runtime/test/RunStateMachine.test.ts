import {
  Citation,
  CitationSpan,
  IndexRepoRunInput,
  QueryRepoRunInput,
  RepoId,
  RetrievalCountPayload,
  RetrievalPacket,
  RunId,
} from "@beep/repo-memory-model";
import { FilePath, NonNegativeInt, PosInt } from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import { DateTime, Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  acceptedIndexRun,
  acceptedQueryRun,
  beginRunExecution,
  completeIndexRun,
  completeQueryRun,
  interruptRun,
} from "../src/run/RunStateMachine.ts";

const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodePosInt = S.decodeUnknownSync(PosInt);
const decodeRepoId = S.decodeUnknownSync(RepoId);
const decodeRunId = S.decodeUnknownSync(RunId);
const makeUtc = (value: number): DateTime.Utc => DateTime.toUtc(DateTime.makeUnsafe(value));

const repoId = decodeRepoId("repo:runtime:test");
const indexRunId = decodeRunId("run:index:runtime:test");
const queryRunId = decodeRunId("run:query:runtime:test");
const filePath = decodeFilePath("/tmp/repo/src/index.ts");

const makeCitation = () =>
  new Citation({
    id: "citation:test",
    repoId,
    label: "index.ts",
    rationale: "Grounded test citation.",
    span: new CitationSpan({
      filePath,
      startLine: decodePosInt(1),
      endLine: decodePosInt(2),
      startColumn: O.some(decodePosInt(1)),
      endColumn: O.some(decodePosInt(12)),
      symbolName: O.some("answer"),
    }),
  });

const makePacket = (retrievedAt: DateTime.Utc) =>
  new RetrievalPacket({
    repoId,
    sourceSnapshotId: O.none(),
    query: "describe symbol `answer`",
    normalizedQuery: "describe symbol `answer`",
    queryKind: "countSymbols",
    retrievedAt,
    outcome: "resolved",
    summary: "Grounded retrieval summary.",
    citations: [makeCitation()],
    notes: ["packet-note"],
    payload: O.some(
      new RetrievalCountPayload({
        target: "symbols",
        count: decodeNonNegativeInt(1),
      })
    ),
    issue: O.none(),
  });

describe("repo-memory run state machine", () => {
  it.effect("transitions query runs through started interrupted resumed completed with monotonic sequences", () =>
    Effect.gen(function* () {
      const acceptedAt = makeUtc(1_706_000_000_000);
      const startedAt = makeUtc(1_706_000_001_000);
      const interruptedAt = makeUtc(1_706_000_002_000);
      const resumedAt = makeUtc(1_706_000_003_000);
      const completedAt = makeUtc(1_706_000_004_000);
      const accepted = acceptedQueryRun({
        acceptedAt,
        payload: new QueryRepoRunInput({
          repoId,
          question: "describe symbol `answer`",
          questionFingerprint: O.none(),
        }),
        runId: queryRunId,
      });

      const started = yield* beginRunExecution(accepted, startedAt);
      const interrupted = yield* interruptRun(started.run, interruptedAt);
      const resumed = yield* beginRunExecution(interrupted, resumedAt);
      if (resumed.run.kind !== "query") {
        return yield* Effect.die("Expected a query run after resuming query execution.");
      }
      const completed = yield* completeQueryRun(
        resumed.run,
        completedAt,
        "Symbol `answer` is exported.",
        [makeCitation()],
        makePacket(completedAt)
      );

      expect(started.eventKind).toBe("started");
      expect(started.run.status).toBe("running");
      expect(started.run.lastEventSequence).toBe(2);
      expect(DateTime.toEpochMillis(O.getOrThrow(started.run.startedAt))).toBe(DateTime.toEpochMillis(startedAt));

      expect(interrupted.status).toBe("interrupted");
      expect(interrupted.lastEventSequence).toBe(3);
      expect(DateTime.toEpochMillis(O.getOrThrow(interrupted.completedAt))).toBe(DateTime.toEpochMillis(interruptedAt));
      expect(O.isNone(interrupted.errorMessage)).toBe(true);

      expect(resumed.eventKind).toBe("resumed");
      expect(resumed.run.status).toBe("running");
      expect(resumed.run.lastEventSequence).toBe(4);
      expect(DateTime.toEpochMillis(O.getOrThrow(resumed.run.startedAt))).toBe(DateTime.toEpochMillis(startedAt));
      expect(O.isSome(resumed.run.queryStages)).toBe(true);

      expect(completed.status).toBe("completed");
      expect(completed.lastEventSequence).toBe(5);
      expect(DateTime.toEpochMillis(O.getOrThrow(completed.completedAt))).toBe(DateTime.toEpochMillis(completedAt));
      expect(O.getOrThrow(completed.answer)).toContain("Symbol `answer`");
      expect(O.isSome(completed.retrievalPacket)).toBe(true);
      expect(O.isSome(completed.queryStages)).toBe(true);
    })
  );

  it.effect("rejects interrupting an already interrupted run with a typed 409", () =>
    Effect.gen(function* () {
      const accepted = acceptedIndexRun({
        acceptedAt: makeUtc(1_706_100_000_000),
        payload: new IndexRepoRunInput({
          repoId,
          sourceFingerprint: O.none(),
        }),
        runId: indexRunId,
      });
      const started = yield* beginRunExecution(accepted, makeUtc(1_706_100_001_000));
      const interrupted = yield* interruptRun(started.run, makeUtc(1_706_100_002_000));
      const error = yield* Effect.flip(interruptRun(interrupted, makeUtc(1_706_100_003_000)));

      expect(error._tag).toBe("RunStateMachineError");
      expect(error.status).toBe(409);
      expect(error.message).toContain("cannot interrupt");
    })
  );

  it.effect("rejects beginning execution from a completed run with a typed 409", () =>
    Effect.gen(function* () {
      const accepted = acceptedIndexRun({
        acceptedAt: makeUtc(1_706_200_000_000),
        payload: new IndexRepoRunInput({
          repoId,
          sourceFingerprint: O.none(),
        }),
        runId: decodeRunId("run:index:runtime:completed"),
      });
      const started = yield* beginRunExecution(accepted, makeUtc(1_706_200_001_000));
      if (started.run.kind !== "index") {
        return yield* Effect.die("Expected an index run when starting index execution.");
      }
      const completed = yield* completeIndexRun(started.run, makeUtc(1_706_200_002_000), 42);
      const error = yield* Effect.flip(beginRunExecution(completed, makeUtc(1_706_200_003_000)));

      expect(error._tag).toBe("RunStateMachineError");
      expect(error.status).toBe(409);
      expect(error.message).toContain("begin execution");
    })
  );
});
