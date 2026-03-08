import {
  InterruptRepoRunRequest,
  type QueryRepoRunInput,
  type RepoRegistrationInput,
  RunId,
  ResumeRepoRunRequest,
  SidecarBootstrap,
  StreamRunEventsRequest,
} from "@beep/runtime-protocol";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Stream } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  makeRepoMemoryClient,
  makeRepoMemoryHttpClientDefault,
  makeRepoMemoryRpcClient,
  makeRepoMemoryRpcUrl,
  normalizeSidecarBaseUrl,
  RepoMemoryClient,
  RepoMemoryClientConfig,
  RepoMemoryClientError,
} from "../src/index.ts";

const clientError = () =>
  new RepoMemoryClientError({
    message: "boom",
    status: 500,
    cause: O.none(),
  });

const decodeRunId = S.decodeUnknownSync(RunId);

describe("repo-memory client", () => {
  it("decodes client configuration", () => {
    const config = S.decodeUnknownSync(RepoMemoryClientConfig)({
      baseUrl: "http://127.0.0.1:4318",
      sessionId: "session:test",
    });

    expect(config.baseUrl).toBe("http://127.0.0.1:4318");
    expect(config.sessionId).toBe("session:test");
  });

  it("normalizes root and control-plane sidecar URLs", () => {
    expect(normalizeSidecarBaseUrl("http://127.0.0.1:8788")).toBe("http://127.0.0.1:8788");
    expect(normalizeSidecarBaseUrl("http://127.0.0.1:8788/")).toBe("http://127.0.0.1:8788");
    expect(normalizeSidecarBaseUrl("http://127.0.0.1:8788/api/v0")).toBe("http://127.0.0.1:8788");
    expect(normalizeSidecarBaseUrl("http://127.0.0.1:8788/api/v0/")).toBe("http://127.0.0.1:8788");
    expect(normalizeSidecarBaseUrl(new URL("http://127.0.0.1:8788/api/v0/"))).toBe("http://127.0.0.1:8788");
    expect(makeRepoMemoryRpcUrl("http://127.0.0.1:8788/api/v0")).toBe("http://127.0.0.1:8788/api/v0/rpc");
  });

  it("constructs typed client errors", () => {
    const error = clientError();

    expect(error._tag).toBe("RepoMemoryClientError");
    expect(error.message).toBe("boom");
  });

  it.effect("provides the expanded client service tag", () =>
    Effect.gen(function* () {
      const client = yield* RepoMemoryClient;
      const repos = yield* client.listRepos;
      const runs = yield* client.listRuns;
      const bootstrap = yield* Effect.flip(client.bootstrap);

      expect(repos).toEqual([]);
      expect(runs).toEqual([]);
      expect(bootstrap._tag).toBe("RepoMemoryClientError");
      expect(typeof client.getRun).toBe("function");
      expect(typeof client.interruptRun).toBe("function");
      expect(typeof client.registerRepo).toBe("function");
      expect(typeof client.resumeRun).toBe("function");
      expect(typeof client.startIndexRun).toBe("function");
      expect(typeof client.startQueryRun).toBe("function");
      expect(typeof client.streamRunEvents).toBe("function");
    }).pipe(
      Effect.provide(
        Layer.succeed(RepoMemoryClient)(
          RepoMemoryClient.of({
            bootstrap: Effect.fail(clientError()),
            getRun: () => Effect.fail(clientError()),
            interruptRun: (_request: InterruptRepoRunRequest) => Effect.fail(clientError()),
            listRepos: Effect.succeed([]),
            listRuns: Effect.succeed([]),
            registerRepo: (_input: RepoRegistrationInput) => Effect.fail(clientError()),
            resumeRun: (_request: ResumeRepoRunRequest) => Effect.fail(clientError()),
            startIndexRun: () => Effect.fail(clientError()),
            startQueryRun: (_input: QueryRepoRunInput) => Effect.fail(clientError()),
            streamRunEvents: () => Stream.fail(clientError()),
          })
        )
      )
    )
  );

  it.effect("constructs protocol clients and the composed boundary without issuing requests", () =>
    Effect.gen(function* () {
      const controlPlane = yield* makeRepoMemoryHttpClientDefault({
        baseUrl: "http://127.0.0.1:8788/api/v0",
      });
      const rpc = yield* makeRepoMemoryRpcClient({
        baseUrl: "http://127.0.0.1:8788/api/v0",
      });
      const client = yield* makeRepoMemoryClient(
        new RepoMemoryClientConfig({
          baseUrl: "http://127.0.0.1:8788/api/v0",
          sessionId: "session:test",
        })
      );

      expect(typeof controlPlane.health).toBe("function");
      expect(typeof controlPlane.listRepos).toBe("function");
      expect(typeof controlPlane.registerRepo).toBe("function");
      expect(typeof controlPlane.listRuns).toBe("function");
      expect(typeof controlPlane.getRun).toBe("function");
      expect(typeof rpc.StartIndexRepoRun).toBe("function");
      expect(typeof rpc.StartQueryRepoRun).toBe("function");
      expect(typeof rpc.InterruptRepoRun).toBe("function");
      expect(typeof rpc.ResumeRepoRun).toBe("function");
      expect(typeof rpc.StreamRunEvents).toBe("function");
      expect(typeof client.bootstrap).toBe("object");
      expect(typeof client.interruptRun).toBe("function");
      expect(typeof client.registerRepo).toBe("function");
      expect(typeof client.resumeRun).toBe("function");
      expect(typeof client.streamRunEvents).toBe("function");
    }).pipe(Effect.scoped)
  );

  it.effect("maps invalid client-side bootstrap failures into a stable typed error", () =>
    Effect.gen(function* () {
      const client = yield* makeRepoMemoryClient(
        new RepoMemoryClientConfig({
          baseUrl: "://repo-memory",
          sessionId: "session:test",
        })
      );
      const error = yield* Effect.flip(client.bootstrap);

      expect(error._tag).toBe("RepoMemoryClientError");
      expect(error.message).toBe("Failed to load sidecar bootstrap.");
      expect(error.status).toBe(500);
    }).pipe(Effect.scoped)
  );

  it.effect("maps invalid stream transport failures into a stable typed error", () =>
    Effect.gen(function* () {
      const client = yield* makeRepoMemoryClient(
        new RepoMemoryClientConfig({
          baseUrl: "://repo-memory",
          sessionId: "session:test",
        })
      );
      const runId = decodeRunId("run:client:stream");
      const error = yield* Effect.flip(
        Stream.runDrain(
          client.streamRunEvents(
            new StreamRunEventsRequest({
              runId,
              cursor: O.none(),
            })
          )
        )
      );

      expect(error._tag).toBe("RepoMemoryClientError");
      expect(error.message).toBe(`Failed to stream run events for "${runId}".`);
      expect(error.status).toBe(500);
    }).pipe(Effect.scoped)
  );

  it("keeps bootstrap decoding aligned with the transport schema", () => {
    const bootstrap = S.decodeUnknownSync(SidecarBootstrap)({
      sessionId: "session:test",
      host: "127.0.0.1",
      port: 4318,
      baseUrl: "http://127.0.0.1:4318",
      pid: 1234,
      version: "0.0.0",
      status: "healthy",
      startedAt: Date.parse("2026-03-06T20:00:00.000Z"),
    });

    expect(bootstrap.status).toBe("healthy");
  });
});
