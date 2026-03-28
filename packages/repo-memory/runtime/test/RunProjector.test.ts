import {
  AnswerDraftedEvent,
  Citation,
  CitationSpan,
  RepoId,
  RetrievalCountPayload,
  RetrievalPacket,
  RetrievalPacketMaterializedEvent,
  RunAcceptedEvent,
  RunEventSequence,
  RunId,
  RunProgressUpdatedEvent,
} from "@beep/repo-memory-model";
import { FilePath, NonNegativeInt, PosInt } from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import { DateTime, Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { projectRunEvent } from "../src/run/RunProjector.ts";

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

describe("repo-memory run projector", () => {
  it.effect("projects accepted progress packet and answer events onto a query run", () =>
    Effect.gen(function* () {
      const acceptedEvent = new RunAcceptedEvent({
        runId: queryRunId,
        sequence: decodeRunEventSequence(1),
        emittedAt: makeUtc(1_706_300_000_000),
        runKind: "query",
        repoId,
        question: O.some("describe symbol `answer`"),
      });
      const progress = new RunProgressUpdatedEvent({
        runId: queryRunId,
        sequence: decodeRunEventSequence(2),
        emittedAt: makeUtc(1_706_300_001_000),
        phase: "retrieval",
        message: "Retrieving grounded evidence.",
        percent: O.some(decodeNonNegativeInt(60)),
      });
      const retrievalPacket = new RetrievalPacketMaterializedEvent({
        runId: queryRunId,
        sequence: decodeRunEventSequence(3),
        emittedAt: makeUtc(1_706_300_002_000),
        packet: makePacket(makeUtc(1_706_300_002_000)),
      });
      const answer = new AnswerDraftedEvent({
        runId: queryRunId,
        sequence: decodeRunEventSequence(4),
        emittedAt: makeUtc(1_706_300_003_000),
        answer: "Symbol `answer` is exported from src/index.ts.",
        citations: [makeCitation()],
      });

      const accepted = yield* projectRunEvent(O.none(), acceptedEvent);
      const running = yield* projectRunEvent(O.some(accepted), progress);
      const withPacket = yield* projectRunEvent(O.some(running), retrievalPacket);
      const withAnswer = yield* projectRunEvent(O.some(withPacket), answer);

      expect(accepted.kind).toBe("query");
      expect(accepted.status).toBe("accepted");
      expect(accepted.lastEventSequence).toBe(1);
      expect(running.status).toBe("running");
      expect(running.lastEventSequence).toBe(2);
      expect(withPacket.kind).toBe("query");
      expect(withPacket.lastEventSequence).toBe(3);
      if (withPacket.kind !== "query") {
        return yield* Effect.die("Expected projected query run after retrieval packet.");
      }
      expect(O.getOrThrow(withPacket.retrievalPacket).summary).toContain("Projector packet");

      expect(withAnswer.kind).toBe("query");
      expect(withAnswer.lastEventSequence).toBe(4);
      if (withAnswer.kind !== "query") {
        return yield* Effect.die("Expected projected query run after answer.");
      }
      expect(O.getOrThrow(withAnswer.answer)).toContain("src/index.ts");
      expect(withAnswer.citations.length).toBe(1);
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
