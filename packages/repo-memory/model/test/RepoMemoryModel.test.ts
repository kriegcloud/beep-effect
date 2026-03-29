import {
  InterruptRepoRunRequest,
  RepoId,
  RepoRun,
  ResumeRepoRunRequest,
  RetrievalCountPayload,
  RetrievalPacket,
  RunCommandAck,
  RunCursor,
  RunId,
  renderRetrievalPacketAnswer,
  StreamRunEventsRequest,
} from "@beep/repo-memory-model";
import { NonNegativeInt } from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import { PrimaryKey } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const decodeRepoId = S.decodeUnknownSync(RepoId);
const decodeRunCursor = S.decodeUnknownSync(RunCursor);
const decodeRunId = S.decodeUnknownSync(RunId);
const decodeRetrievalPacket = S.decodeUnknownSync(RetrievalPacket);
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);

describe("repo-memory model", () => {
  it("builds stable primary keys for replayable run-event subscriptions", () => {
    const runId = decodeRunId("run:model:primary-key");

    const withoutCursor = new StreamRunEventsRequest({
      runId,
      cursor: O.none(),
    });
    const withCursor = new StreamRunEventsRequest({
      runId,
      cursor: O.some(decodeRunCursor(7)),
    });

    expect(withoutCursor[PrimaryKey.symbol]()).toBe("run:model:primary-key:stream");
    expect(withCursor[PrimaryKey.symbol]()).toBe("run:model:primary-key:stream:7");
  });

  it("decodes both query and index projections through the shared tagged union", () => {
    const decodeRepoRun = S.decodeUnknownSync(RepoRun);

    const indexRun = decodeRepoRun({
      kind: "index",
      id: decodeRunId("run:index:model"),
      repoId: decodeRepoId("repo:model:index"),
      status: "accepted",
      acceptedAt: Date.parse("2026-03-06T17:00:00.000Z"),
      lastEventSequence: 0,
    });

    const queryRun = decodeRepoRun({
      kind: "query",
      id: decodeRunId("run:query:model"),
      repoId: decodeRepoId("repo:model:query"),
      question: "where is `greet`?",
      status: "completed",
      acceptedAt: Date.parse("2026-03-06T17:00:00.000Z"),
      lastEventSequence: 3,
      answer: "Symbol located.",
      citations: [],
      queryStages: {
        grounding: {
          phase: "grounding",
          status: "completed",
          startedAt: Date.parse("2026-03-06T17:00:01.000Z"),
          completedAt: Date.parse("2026-03-06T17:00:02.000Z"),
          latestMessage: "Normalized the question.",
          percent: 100,
        },
        retrieval: {
          phase: "retrieval",
          status: "completed",
          startedAt: Date.parse("2026-03-06T17:00:02.000Z"),
          completedAt: Date.parse("2026-03-06T17:00:03.000Z"),
          latestMessage: "Retrieved grounded evidence.",
          percent: 100,
        },
        packet: {
          phase: "packet",
          status: "completed",
          startedAt: Date.parse("2026-03-06T17:00:03.000Z"),
          completedAt: Date.parse("2026-03-06T17:00:04.000Z"),
          latestMessage: "Retrieval packet materialized.",
          percent: 100,
          artifactAvailable: true,
        },
        answer: {
          phase: "answer",
          status: "completed",
          startedAt: Date.parse("2026-03-06T17:00:04.000Z"),
          completedAt: Date.parse("2026-03-06T17:00:05.000Z"),
          latestMessage: "Grounded answer drafted.",
          percent: 100,
          artifactAvailable: true,
        },
      },
    });

    expect(indexRun.kind).toBe("index");
    expect(queryRun.kind).toBe("query");
    if (queryRun.kind === "query") {
      expect(O.getOrThrow(queryRun.queryStages).packet.status).toBe("completed");
      expect(O.getOrThrow(O.getOrThrow(queryRun.queryStages).answer.artifactAvailable)).toBe(true);
    }
  });

  it("decodes interrupt and resume command payloads plus their shared ack", () => {
    const interruptRequest = S.decodeUnknownSync(InterruptRepoRunRequest)({
      runId: decodeRunId("run:interrupt:model"),
    });
    const resumeRequest = S.decodeUnknownSync(ResumeRepoRunRequest)({
      runId: decodeRunId("run:resume:model"),
    });
    const ack = S.decodeUnknownSync(RunCommandAck)({
      runId: decodeRunId("run:command:ack"),
      command: "interrupt",
      requestedAt: Date.parse("2026-03-08T18:30:00.000Z"),
    });

    expect(interruptRequest.runId).toBe("run:interrupt:model");
    expect(resumeRequest.runId).toBe("run:resume:model");
    expect(ack.command).toBe("interrupt");
  });

  it("decodes structured retrieval packets and renders an answer from packet state alone", () => {
    const packet = decodeRetrievalPacket({
      repoId: decodeRepoId("repo:model:packet"),
      sourceSnapshotId: "snapshot:model:packet",
      query: "How many files?",
      normalizedQuery: "how many files?",
      queryKind: "countFiles",
      retrievedAt: Date.parse("2026-03-10T10:00:00.000Z"),
      outcome: "resolved",
      summary: "Counted indexed TypeScript source files.",
      citations: [],
      notes: ["countFiles=7"],
      payload: new RetrievalCountPayload({
        target: "files",
        count: decodeNonNegativeInt(7),
      }),
    });

    expect(packet.queryKind).toBe("countFiles");
    expect(renderRetrievalPacketAnswer(packet)).toContain("7 TypeScript source files");
  });
});
