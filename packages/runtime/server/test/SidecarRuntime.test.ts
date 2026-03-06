import { describe, expect, test } from "bun:test";
import net from "node:net";
import { FilePath } from "@beep/schema";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import { Effect, Layer, Schedule } from "effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import { SidecarRuntimeConfig, sidecarLayer } from "../src/index.js";

const decodeFilePath = S.decodeUnknownSync(FilePath);

const allocatePort = Effect.tryPromise({
  try: () =>
    new Promise<number>((resolve, reject) => {
      const server = net.createServer();

      server.on("error", reject);
      server.listen(0, "127.0.0.1", () => {
        const address = server.address();
        if (address === null || typeof address === "string") {
          server.close();
          reject(new Error("Expected a TCP address when allocating a local test port."));
          return;
        }

        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(address.port);
        });
      });
    }),
  catch: (cause) => cause,
});

const requestJson = (url: string, init?: RequestInit) =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch(url, init);
      return {
        body: await response.json(),
        status: response.status,
      };
    },
    catch: (cause) => cause,
  });

const requestText = (url: string, init?: RequestInit) =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch(url, init);
      return {
        body: await response.text(),
        status: response.status,
      };
    },
    catch: (cause) => cause,
  });

const waitForHealthyBootstrap = (baseUrl: string) =>
  requestJson(`${baseUrl}/health`).pipe(
    Effect.flatMap(({ body, status }) => (status === 200 ? Effect.succeed(body) : Effect.fail(status))),
    Effect.retry(Schedule.spaced("50 millis").pipe(Schedule.compose(Schedule.recurs(20))))
  );

describe("sidecarLayer", () => {
  test("boots against SQLite and serves register, index, query, and events routes", async () => {
    await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const tempRoot = yield* fs.makeTempDirectoryScoped({ prefix: "sidecar-runtime-test-" });
          const appDataDir = decodeFilePath(path.join(tempRoot, "app-data"));
          const repoPath = decodeFilePath(path.join(tempRoot, "fixture-repo"));
          const repoSourceDir = path.join(repoPath, "src");
          const port = yield* allocatePort;
          const baseUrl = `http://127.0.0.1:${port}/api/v0`;

          yield* fs.makeDirectory(repoSourceDir, { recursive: true });
          yield* fs.writeFileString(path.join(repoSourceDir, "index.ts"), "export const answer = 42;\n");
          yield* fs.writeFileString(path.join(repoPath, "README.md"), "# fixture\n");

          const config = new SidecarRuntimeConfig({
            appDataDir,
            host: "127.0.0.1",
            port,
            sessionId: "test-session",
            version: "0.0.0-test",
          });

          yield* Layer.launch(sidecarLayer(config)).pipe(Effect.forkScoped);

          const bootstrap = yield* waitForHealthyBootstrap(baseUrl);
          expect(bootstrap.status).toBe("healthy");

          const registrationResponse = yield* requestJson(`${baseUrl}/repos`, {
            body: JSON.stringify({
              displayName: "Fixture Repo",
              repoPath,
            }),
            headers: {
              "content-type": "application/json",
            },
            method: "POST",
          });
          expect(registrationResponse.status).toBe(201);
          expect(registrationResponse.body.displayName).toBe("Fixture Repo");

          const repoId = registrationResponse.body.id;
          const indexRunResponse = yield* requestJson(`${baseUrl}/repos/${encodeURIComponent(repoId)}/index-runs`, {
            method: "POST",
          });
          expect(indexRunResponse.status).toBe(201);
          expect(indexRunResponse.body.kind).toBe("index");
          expect(indexRunResponse.body.status).toBe("completed");

          const queryRunResponse = yield* requestJson(`${baseUrl}/query-runs`, {
            body: JSON.stringify({
              question: "How many files?",
              repoId,
            }),
            headers: {
              "content-type": "application/json",
            },
            method: "POST",
          });
          expect(queryRunResponse.status).toBe(201);
          expect(queryRunResponse.body.kind).toBe("query");
          expect(queryRunResponse.body.status).toBe("completed");
          expect(typeof queryRunResponse.body.answer).toBe("string");

          const runsResponse = yield* requestJson(`${baseUrl}/runs`);
          expect(runsResponse.status).toBe(200);
          expect(runsResponse.body).toHaveLength(2);

          const eventsResponse = yield* requestText(
            `${baseUrl}/runs/${encodeURIComponent(queryRunResponse.body.id)}/events`
          );
          expect(eventsResponse.status).toBe(200);
          expect(eventsResponse.body).toContain("event: accepted");
          expect(eventsResponse.body).toContain("event: retrieval-packet");
          expect(eventsResponse.body).toContain("event: answer");
          expect(eventsResponse.body).toContain("event: completed");
        }).pipe(Effect.provide([BunFileSystem.layer, BunPath.layer]))
      )
    );
  });
});
