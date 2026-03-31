import {
  AnswerDraftedEvent,
  Citation,
  CitationSpan,
  type QueryRun,
  RepoId,
  RetrievalCountPayload,
  RetrievalPacket,
  RetrievalPacketMaterializedEvent,
  RunAcceptedEvent,
  RunEventSequence,
  RunId,
  RunInterruptedEvent,
  RunProgressUpdatedEvent,
  RunResumedEvent,
} from "@beep/repo-memory-model";
import { projectRunEvent } from "@beep/repo-memory-runtime/run/RunProjector";
import { FilePath, NonNegativeInt, PosInt } from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import { DateTime, Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodePosInt = S.decodeUnknownSync(PosInt);
const decodeRepoId = S.decodeUnknownSync(RepoId);
const decodeRunEventSequence = S.decodeUnknownSync(RunEventSequence);
const decodeRunId = S.decodeUnknownSync(RunId);
const makeUtc = (value: number): DateTime.Utc => DateTime.toUtc(DateTime.makeUnsafe(value));

const repoId = decodeRepoId("repo:projector:test");
const queryRunId = decodeRunId("run:query:projector:test");
const indexRunId = decodeRunId("run:index:projector:test");
const filePath = decodeFilePath("/tmp/repo/src/index.ts");

const makeCitation = () =>
  new Citation({
    id: "citation:projector",
    repoId,
    label: "index.ts",
    rationale: "Projector test citation.",
    span: new CitationSpan({
      filePath,
      startLine: decodePosInt(1),
      endLine: decodePosInt(1),
      startColumn: O.some(decodePosInt(1)),
      endColumn: O.some(decodePosInt(8)),
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
    summary: "Projector packet summary.",
    citations: [makeCitation()],
    notes: ["projector-note"],
    payload: O.some(
      new RetrievalCountPayload({
        target: "symbols",
        count: decodeNonNegativeInt(1),
      })
    ),
    issue: O.none(),
  });

const expectQueryStageStatuses = (
  run: QueryRun,
  expected: {
    readonly grounding: "pending" | "running" | "completed";
    readonly retrieval: "pending" | "running" | "completed";
    readonly packet: "pending" | "running" | "completed";
    readonly answer: "pending" | "running" | "completed";
  }
) => {
  const queryStages = O.getOrThrow(run.queryStages);

  expect(queryStages.grounding.status).toBe(expected.grounding);
  expect(queryStages.retrieval.status).toBe(expected.retrieval);
  expect(queryStages.packet.status).toBe(expected.packet);
  expect(queryStages.answer.status).toBe(expected.answer);
};

describe("repo-memory run projector", () => {
  it.effect("projects fixed query stages from accepted progress packet and answer events", () =>
    Effect.gen(function* () {
      const acceptedEvent = new RunAcceptedEvent({
        runId: queryRunId,
        sequence: decodeRunEventSequence(1),
        emittedAt: makeUtc(1_706_300_000_000),
        runKind: "query",
        repoId,
        question: O.some("describe symbol `answer`"),
      });
      const groundingProgress = new RunProgressUpdatedEvent({
        runId: queryRunId,
        sequence: decodeRunEventSequence(2),
        emittedAt: makeUtc(1_706_300_001_000),
        phase: "grounding",
        message: "Normalizing the question.",
        percent: O.some(decodeNonNegativeInt(25)),
      });
      const retrievalProgress = new RunProgressUpdatedEvent({
        runId: queryRunId,
        sequence: decodeRunEventSequence(3),
        emittedAt: makeUtc(1_706_300_002_000),
        phase: "retrieval",
        message: "Retrieving grounded evidence.",
        percent: O.some(decodeNonNegativeInt(60)),
      });
      const packetProgress = new RunProgressUpdatedEvent({
        runId: queryRunId,
        sequence: decodeRunEventSequence(4),
        emittedAt: makeUtc(1_706_300_003_000),
        phase: "packet",
        message: "Freezing the retrieval packet.",
        percent: O.some(decodeNonNegativeInt(80)),
      });
      const retrievalPacket = new RetrievalPacketMaterializedEvent({
        runId: queryRunId,
        sequence: decodeRunEventSequence(5),
        emittedAt: makeUtc(1_706_300_004_000),
        packet: makePacket(makeUtc(1_706_300_004_000)),
      });
      const answerProgress = new RunProgressUpdatedEvent({
        runId: queryRunId,
        sequence: decodeRunEventSequence(6),
        emittedAt: makeUtc(1_706_300_005_000),
        phase: "answer",
        message: "Rendering the answer from packet state.",
        percent: O.some(decodeNonNegativeInt(95)),
      });
      const answer = new AnswerDraftedEvent({
        runId: queryRunId,
        sequence: decodeRunEventSequence(7),
        emittedAt: makeUtc(1_706_300_006_000),
        answer: "Symbol `answer` is exported from src/index.ts.",
        citations: [makeCitation()],
      });

      const accepted = yield* projectRunEvent(O.none(), acceptedEvent);
      const grounded = yield* projectRunEvent(O.some(accepted), groundingProgress);
      const retrieved = yield* projectRunEvent(O.some(grounded), retrievalProgress);
      const packeting = yield* projectRunEvent(O.some(retrieved), packetProgress);
      const withPacket = yield* projectRunEvent(O.some(packeting), retrievalPacket);
      const answering = yield* projectRunEvent(O.some(withPacket), answerProgress);
      const withAnswer = yield* projectRunEvent(O.some(answering), answer);

      expect(accepted.kind).toBe("query");
      if (accepted.kind !== "query") {
        return yield* Effect.die("Expected projected query run after acceptance.");
      }
      expectQueryStageStatuses(accepted, {
        grounding: "pending",
        retrieval: "pending",
        packet: "pending",
        answer: "pending",
      });

      if (grounded.kind !== "query" || retrieved.kind !== "query" || packeting.kind !== "query") {
        return yield* Effect.die("Expected query runs while projecting stage progress.");
      }

      expectQueryStageStatuses(grounded, {
        grounding: "running",
        retrieval: "pending",
        packet: "pending",
        answer: "pending",
      });
      expectQueryStageStatuses(retrieved, {
        grounding: "completed",
        retrieval: "running",
        packet: "pending",
        answer: "pending",
      });
      expectQueryStageStatuses(packeting, {
        grounding: "completed",
        retrieval: "completed",
        packet: "running",
        answer: "pending",
      });

      if (withPacket.kind !== "query" || withAnswer.kind !== "query" || answering.kind !== "query") {
        return yield* Effect.die("Expected projected query run after packet and answer artifacts.");
      }

      expectQueryStageStatuses(withPacket, {
        grounding: "completed",
        retrieval: "completed",
        packet: "completed",
        answer: "pending",
      });
      expect(O.getOrThrow(O.getOrThrow(withPacket.queryStages).packet.artifactAvailable)).toBe(true);
      expect(O.getOrThrow(withPacket.retrievalPacket).summary).toContain("Projector packet");

      expectQueryStageStatuses(answering, {
        grounding: "completed",
        retrieval: "completed",
        packet: "completed",
        answer: "running",
      });

      expectQueryStageStatuses(withAnswer, {
        grounding: "completed",
        retrieval: "completed",
        packet: "completed",
        answer: "completed",
      });
      expect(O.getOrThrow(O.getOrThrow(withAnswer.queryStages).answer.artifactAvailable)).toBe(true);
      expect(O.getOrThrow(withAnswer.answer)).toContain("src/index.ts");
      expect(withAnswer.citations.length).toBe(1);
    })
  );

  it.effect("preserves projected query stage progress across interruption and resume", () =>
    Effect.gen(function* () {
      const accepted = yield* projectRunEvent(
        O.none(),
        new RunAcceptedEvent({
          runId: queryRunId,
          sequence: decodeRunEventSequence(1),
          emittedAt: makeUtc(1_706_310_000_000),
          runKind: "query",
          repoId,
          question: O.some("describe symbol `answer`"),
        })
      );
      const grounding = yield* projectRunEvent(
        O.some(accepted),
        new RunProgressUpdatedEvent({
          runId: queryRunId,
          sequence: decodeRunEventSequence(2),
          emittedAt: makeUtc(1_706_310_001_000),
          phase: "grounding",
          message: "Normalizing the question.",
          percent: O.some(decodeNonNegativeInt(25)),
        })
      );
      const retrieval = yield* projectRunEvent(
        O.some(grounding),
        new RunProgressUpdatedEvent({
          runId: queryRunId,
          sequence: decodeRunEventSequence(3),
          emittedAt: makeUtc(1_706_310_002_000),
          phase: "retrieval",
          message: "Retrieving grounded evidence.",
          percent: O.some(decodeNonNegativeInt(60)),
        })
      );
      const interrupted = yield* projectRunEvent(
        O.some(retrieval),
        new RunInterruptedEvent({
          runId: queryRunId,
          sequence: decodeRunEventSequence(4),
          emittedAt: makeUtc(1_706_310_003_000),
        })
      );
      const resumed = yield* projectRunEvent(
        O.some(interrupted),
        new RunResumedEvent({
          runId: queryRunId,
          sequence: decodeRunEventSequence(5),
          emittedAt: makeUtc(1_706_310_004_000),
        })
      );
      const packeting = yield* projectRunEvent(
        O.some(resumed),
        new RunProgressUpdatedEvent({
          runId: queryRunId,
          sequence: decodeRunEventSequence(6),
          emittedAt: makeUtc(1_706_310_005_000),
          phase: "packet",
          message: "Freezing the retrieval packet.",
          percent: O.some(decodeNonNegativeInt(80)),
        })
      );

      if (
        retrieval.kind !== "query" ||
        interrupted.kind !== "query" ||
        resumed.kind !== "query" ||
        packeting.kind !== "query"
      ) {
        return yield* Effect.die("Expected query runs while testing interruption and resume.");
      }

      expectQueryStageStatuses(retrieval, {
        grounding: "completed",
        retrieval: "running",
        packet: "pending",
        answer: "pending",
      });
      expectQueryStageStatuses(interrupted, {
        grounding: "completed",
        retrieval: "running",
        packet: "pending",
        answer: "pending",
      });
      expectQueryStageStatuses(resumed, {
        grounding: "completed",
        retrieval: "running",
        packet: "pending",
        answer: "pending",
      });
      expectQueryStageStatuses(packeting, {
        grounding: "completed",
        retrieval: "completed",
        packet: "running",
        answer: "pending",
      });
    })
  );

  it.effect("rejects projecting a retrieval packet onto an index run with a typed 409", () =>
    Effect.gen(function* () {
      const accepted = yield* projectRunEvent(
        O.none(),
        new RunAcceptedEvent({
          runId: indexRunId,
          sequence: decodeRunEventSequence(1),
          emittedAt: makeUtc(1_706_400_000_000),
          runKind: "index",
          repoId,
          question: O.none(),
        })
      );

      const retrievalPacket = new RetrievalPacketMaterializedEvent({
        runId: indexRunId,
        sequence: decodeRunEventSequence(2),
        emittedAt: makeUtc(1_706_400_001_000),
        packet: makePacket(makeUtc(1_706_400_001_000)),
      });
      const error = yield* Effect.flip(projectRunEvent(O.some(accepted), retrievalPacket));

      expect(error._tag).toBe("RunProjectorError");
      expect(error.status).toBe(409);
      expect(error.message).toContain("must be a query run");
    })
  );
});
