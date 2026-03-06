import { RepoMemoryClient, RepoMemoryClientConfig, RepoMemoryClientError } from "@beep/repo-memory-client";
import { SidecarBootstrap } from "@beep/runtime-protocol";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const clientError = () =>
  new RepoMemoryClientError({
    message: "boom",
    status: 500,
    cause: O.none(),
  });

describe("repo-memory client", () => {
  it("decodes client configuration", () => {
    const config = S.decodeUnknownSync(RepoMemoryClientConfig)({
      baseUrl: "http://127.0.0.1:4318",
      sessionId: "session:test",
    });

    expect(config.baseUrl).toBe("http://127.0.0.1:4318");
    expect(config.sessionId).toBe("session:test");
  });

  it("constructs typed client errors", () => {
    const error = clientError();

    expect(error._tag).toBe("RepoMemoryClientError");
    expect(error.message).toBe("boom");
  });

  it.effect("provides the client service tag", () =>
    Effect.gen(function* () {
      const client = yield* RepoMemoryClient;
      const repos = yield* client.listRepos;
      const runs = yield* client.listRuns;

      expect(repos).toEqual([]);
      expect(runs).toEqual([]);
    }).pipe(
      Effect.provide(
        Layer.succeed(RepoMemoryClient)(
          RepoMemoryClient.of({
            bootstrap: Effect.fail(clientError()),
            listRepos: Effect.succeed([]),
            listRuns: Effect.succeed([]),
          })
        )
      )
    )
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
