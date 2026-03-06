import { RepoId, RunCursor, RunId } from "@beep/repo-memory-domain";
import { describe, expect, it } from "@effect/vitest";
import { PrimaryKey } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as HttpApiSchema from "effect/unstable/httpapi/HttpApiSchema";
import {
  RepoRegistrationCreated,
  RepoRun,
  SidecarBadRequest,
  SidecarInternalError,
  SidecarNotFound,
  StreamRunEventsRequest,
} from "../src/index.js";

const decodeRunCursor = S.decodeUnknownSync(RunCursor);
const decodeRepoId = S.decodeUnknownSync(RepoId);
const decodeRunId = S.decodeUnknownSync(RunId);
describe("runtime protocol", () => {
  it("preserves explicit HTTP status annotations on control-plane schemas", () => {
    expect(HttpApiSchema.getStatusSuccess(RepoRegistrationCreated.ast)).toBe(201);
    expect(HttpApiSchema.getStatusError(SidecarBadRequest.ast)).toBe(400);
    expect(HttpApiSchema.getStatusError(SidecarNotFound.ast)).toBe(404);
    expect(HttpApiSchema.getStatusError(SidecarInternalError.ast)).toBe(500);
  });

  it("builds stable primary keys for replayable run-event subscriptions", () => {
    const runId = decodeRunId("run:protocol:primary-key");

    const withoutCursor = new StreamRunEventsRequest({
      runId,
      cursor: O.none(),
    });
    const withCursor = new StreamRunEventsRequest({
      runId,
      cursor: O.some(decodeRunCursor(7)),
    });

    expect(withoutCursor[PrimaryKey.symbol]()).toBe("run:protocol:primary-key:stream");
    expect(withCursor[PrimaryKey.symbol]()).toBe("run:protocol:primary-key:stream:7");
  });

  it("decodes both query and index projections through the shared tagged union", () => {
    const decodeRepoRun = S.decodeUnknownSync(RepoRun);

    const indexRun = decodeRepoRun({
      kind: "index",
      id: decodeRunId("run:index:protocol"),
      repoId: decodeRepoId("repo:protocol:index"),
      status: "accepted",
      acceptedAt: Date.parse("2026-03-06T17:00:00.000Z"),
      lastEventSequence: 0,
    });

    const queryRun = decodeRepoRun({
      kind: "query",
      id: decodeRunId("run:query:protocol"),
      repoId: decodeRepoId("repo:protocol:query"),
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
});
