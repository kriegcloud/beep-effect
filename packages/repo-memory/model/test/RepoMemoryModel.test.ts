import {
  InterruptRepoRunRequest,
  RepoId,
  RepoRun,
  ResumeRepoRunRequest,
  RunCommandAck,
  RunCursor,
  RunId,
  StreamRunEventsRequest,
} from "@beep/repo-memory-model";
import { describe, expect, it } from "@effect/vitest";
import { PrimaryKey } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const decodeRepoId = S.decodeUnknownSync(RepoId);
const decodeRunCursor = S.decodeUnknownSync(RunCursor);
const decodeRunId = S.decodeUnknownSync(RunId);

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
    });

    expect(indexRun.kind).toBe("index");
    expect(queryRun.kind).toBe("query");
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
});
