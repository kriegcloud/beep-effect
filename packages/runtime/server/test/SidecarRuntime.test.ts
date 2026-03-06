import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import net from "node:net";
import { $RuntimeServerId } from "@beep/identity/packages";
import { RunCursor, RunEventSequence } from "@beep/repo-memory-model";
import { RepoRegistration, RepoRun, RepoRunRpcGroup, SidecarBootstrap } from "@beep/runtime-protocol";
import { FilePath, TaggedErrorClass } from "@beep/schema";
import { Text } from "@beep/utils";
import * as NodeHttpClient from "@effect/platform-node/NodeHttpClient";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { describe, expect, it } from "@effect/vitest";
import { Duration, Effect, Layer, pipe, Ref, Schedule, Stream } from "effect";
import * as A from "effect/Array";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as RpcClient from "effect/unstable/rpc/RpcClient";
import * as RpcSerialization from "effect/unstable/rpc/RpcSerialization";

const $I = $RuntimeServerId.create("test/SidecarRuntime.test");
const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeRunCursor = S.decodeUnknownSync(RunCursor);
const decodeRunEventSequence = S.decodeUnknownSync(RunEventSequence);
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

class SidecarRuntimeTestError extends TaggedErrorClass<SidecarRuntimeTestError>($I`SidecarRuntimeTestError`)(
  "SidecarRuntimeTestError",
  {
    message: S.String,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
  },
  $I.annote("SidecarRuntimeTestError", {
    description: "Typed black-box lifecycle error for the spawned Bun repo-memory sidecar tests.",
  })
) {}

const toTestError = (message: string, cause?: unknown): SidecarRuntimeTestError =>
  new SidecarRuntimeTestError({
    message,
    cause: O.fromUndefinedOr(cause),
  });

const allocatePort = Effect.tryPromise({
  try: () =>
    new Promise<number>((resolve, reject) => {
      const server = net.createServer();

      server.on("error", reject);
      server.listen(0, "127.0.0.1", () => {
        const address = server.address();
        if (address === null || typeof address === "string") {
          server.close();
          reject(toTestError("Expected a TCP address when allocating a local test port."));
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
  catch: (cause) =>
    cause instanceof SidecarRuntimeTestError
      ? cause
      : toTestError("Failed to allocate a local TCP port for sidecar integration testing.", cause),
});

const requestJson = <Schema extends S.Top & { readonly DecodingServices: never }>(
  schema: Schema,
  url: string,
  init?: RequestInit
) =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () => fetch(url, init),
      catch: (cause) => toTestError(`HTTP request failed for ${url}.`, cause),
    });
    const bodyText = yield* Effect.tryPromise({
      try: () => response.text(),
      catch: (cause) => toTestError(`Failed to read response text from ${url}.`, cause),
    });
    const body = yield* S.decodeUnknownEffect(S.UnknownFromJsonString)(bodyText).pipe(
      Effect.flatMap(S.decodeUnknownEffect(schema)),
      Effect.mapError((cause) =>
        toTestError(
          `Expected JSON matching schema from ${url} with status ${response.status}, received: ${bodyText}`,
          cause
        )
      )
    );

    return {
      body,
      status: response.status,
    };
  });

const requestText = (url: string, init?: RequestInit) =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () => fetch(url, init),
      catch: (cause) => toTestError(`HTTP request failed for ${url}.`, cause),
    });
    const body = yield* Effect.tryPromise({
      try: () => response.text(),
      catch: (cause) => toTestError(`Failed to read response text from ${url}.`, cause),
    });

    return {
      body,
      status: response.status,
    };
  });

const makeRepoRunRpcClient = (baseUrl: string) =>
  Effect.gen(function* () {
    const context = yield* Layer.build(
      RpcClient.layerProtocolHttp({
        url: `${baseUrl}/rpc`,
      }).pipe(Layer.provide(NodeHttpClient.layerUndici), Layer.provide(RpcSerialization.layerNdjson))
    );

    return yield* RpcClient.make(RepoRunRpcGroup).pipe(Effect.provide(context));
  });

const writeFixtureRepo = (repoPath: FilePath) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const repoSourceDir = path.join(repoPath, "src");

    yield* fs.makeDirectory(repoSourceDir, { recursive: true });
    yield* fs.writeFileString(
      path.join(repoSourceDir, "index.ts"),
      Text.joinLines([
        'import { helper } from "./util";',
        'import type { Thing } from "./types";',
        "",
        "export const answer = helper(41);",
        "",
        "export function greet(name: string, _thing?: Thing): string {",
        "  return `hello ${name}`;",
        "}",
        "",
      ])
    );
    yield* fs.writeFileString(
      path.join(repoSourceDir, "util.ts"),
      Text.joinLines(["export const helper = (value: number): number => value + 1;", ""])
    );
    yield* fs.writeFileString(
      path.join(repoSourceDir, "types.ts"),
      Text.joinLines(["export interface Thing {", "  readonly name: string;", "}", ""])
    );
    yield* fs.writeFileString(
      path.join(repoPath, "tsconfig.json"),
      encodeJson({
        compilerOptions: {
          module: "ESNext",
          target: "ES2022",
        },
        include: ["src/**/*.ts"],
      })
    );
  });

interface SpawnedSidecar {
  readonly baseUrl: string;
  readonly child: ChildProcessWithoutNullStreams;
  readonly rootUrl: string;
  readonly shutdown: Effect.Effect<void, SidecarRuntimeTestError>;
  readonly stderr: Ref.Ref<string>;
  readonly stdout: Ref.Ref<string>;
}

const runtimeServerCwd = "/home/elpresidank/YeeBois/projects/beep-effect3/packages/runtime/server";

const appendOutput = (ref: Ref.Ref<string>, chunk: Buffer) =>
  Ref.update(ref, (current) => `${current}${chunk.toString("utf8")}`);

const waitForExit = (child: ChildProcessWithoutNullStreams, label: string) =>
  Effect.tryPromise({
    try: () =>
      new Promise<void>((resolve, reject) => {
        if (child.exitCode !== null || child.signalCode !== null) {
          resolve();
          return;
        }

        const onError = (cause: Error) => {
          cleanup();
          reject(cause);
        };
        const onExit = (code: number | null, signal: NodeJS.Signals | null) => {
          cleanup();
          if (code === 0 || code === 130 || signal === "SIGINT" || signal === "SIGTERM") {
            resolve();
            return;
          }

          reject(toTestError(`${label} exited unexpectedly with code ${String(code)} and signal ${String(signal)}.`));
        };
        const cleanup = () => {
          child.off("error", onError);
          child.off("exit", onExit);
        };

        child.once("error", onError);
        child.once("exit", onExit);
      }),
    catch: (cause) => toTestError(`Failed while waiting for ${label} to exit.`, cause),
  });

const spawnSidecar = (options: {
  readonly appDataDir: string;
  readonly port: number;
  readonly sessionId: string;
  readonly version: string;
  readonly otlpEnabled?: boolean;
  readonly devtoolsEnabled?: boolean;
  readonly devtoolsUrl?: string;
}) =>
  Effect.acquireRelease(
    Effect.gen(function* () {
      const stdout = yield* Ref.make("");
      const stderr = yield* Ref.make("");
      const child = yield* Effect.try({
        try: () =>
          spawn("bun", ["run", "src/main.ts"], {
            cwd: runtimeServerCwd,
            env: {
              ...process.env,
              BEEP_REPO_MEMORY_APP_DATA_DIR: options.appDataDir,
              BEEP_REPO_MEMORY_HOST: "127.0.0.1",
              BEEP_REPO_MEMORY_PORT: String(options.port),
              BEEP_REPO_MEMORY_SESSION_ID: options.sessionId,
              BEEP_REPO_MEMORY_VERSION: options.version,
              BEEP_REPO_MEMORY_OTLP_ENABLED: String(options.otlpEnabled ?? false),
              BEEP_REPO_MEMORY_DEVTOOLS_ENABLED: String(options.devtoolsEnabled ?? false),
              ...(options.devtoolsUrl === undefined
                ? {}
                : {
                    BEEP_REPO_MEMORY_DEVTOOLS_URL: options.devtoolsUrl,
                  }),
            },
            stdio: "pipe",
          }),
        catch: (cause) => toTestError("Failed to spawn the Bun sidecar process.", cause),
      });

      child.stdout.on("data", (chunk) => {
        void Effect.runFork(appendOutput(stdout, chunk));
      });
      child.stderr.on("data", (chunk) => {
        void Effect.runFork(appendOutput(stderr, chunk));
      });

      const shutdown = Effect.gen(function* () {
        if (child.exitCode !== null || child.signalCode !== null) {
          return;
        }

        child.kill("SIGINT");
        yield* waitForExit(child, "spawned sidecar").pipe(
          Effect.timeoutOrElse({
            duration: Duration.seconds(10),
            onTimeout: () =>
              Effect.fail(toTestError("Timed out waiting for the spawned sidecar to exit after SIGINT.")),
          })
        );
      });

      return {
        rootUrl: `http://127.0.0.1:${options.port}`,
        baseUrl: `http://127.0.0.1:${options.port}/api/v0`,
        child,
        shutdown,
        stderr,
        stdout,
      } satisfies SpawnedSidecar;
    }),
    (sidecar) => sidecar.shutdown.pipe(Effect.catch(() => Effect.void))
  );

const renderChildOutput = (sidecar: SpawnedSidecar) =>
  Effect.gen(function* () {
    const stdout = yield* Ref.get(sidecar.stdout);
    const stderr = yield* Ref.get(sidecar.stderr);

    return [`stdout:\n${stdout}`, `stderr:\n${stderr}`].join("\n\n");
  });

const waitForHealthyBootstrap = (sidecar: SpawnedSidecar) =>
  requestJson(SidecarBootstrap, `${sidecar.baseUrl}/health`).pipe(
    Effect.flatMap(({ body, status }) =>
      status === 200 ? Effect.succeed(body) : Effect.fail(toTestError(`Unexpected health status ${status}.`))
    ),
    Effect.retry(Schedule.spaced(Duration.millis(100)).pipe(Schedule.compose(Schedule.recurs(80)))),
    Effect.catch((error) =>
      renderChildOutput(sidecar).pipe(
        Effect.flatMap((output) =>
          Effect.fail(toTestError(`Sidecar did not become healthy on ${sidecar.baseUrl}/health.\n\n${output}`, error))
        )
      )
    )
  );

const readBootstrapStdoutLine = (sidecar: SpawnedSidecar) =>
  Effect.gen(function* () {
    const stdout = yield* Ref.get(sidecar.stdout);
    const bootstrapLine = pipe(
      stdout.split("\n"),
      A.findFirst((line) => line.includes('"type":"bootstrap"')),
      O.getOrUndefined
    );

    if (bootstrapLine === undefined) {
      return yield* toTestError("Expected a machine-readable bootstrap line on sidecar stdout.");
    }

    const decoded = yield* S.decodeUnknownEffect(S.UnknownFromJsonString)(bootstrapLine).pipe(
      Effect.flatMap(
        S.decodeUnknownEffect(
          S.Struct({
            type: S.Literal("bootstrap"),
            sessionId: S.String,
            version: S.String,
            host: S.String,
            port: S.Number,
            baseUrl: S.String,
            pid: S.Number,
            status: S.Literal("healthy"),
            startedAt: S.Number,
          })
        )
      ),
      Effect.mapError((cause) => toTestError(`Failed to decode bootstrap stdout line: ${bootstrapLine}`, cause))
    );

    return decoded;
  });

const expectQueryRun = (run: RepoRun) => {
  if (run.kind !== "query") {
    throw toTestError(`Expected a query run projection, received "${run.kind}".`);
  }

  return run;
};

describe("spawned Bun sidecar lifecycle", () => {
  it.live(
    "serves Prometheus metrics after run execution",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const tempRoot = yield* fs.makeTempDirectoryScoped({ prefix: "spawned-sidecar-observability-test-" });
          const appDataDir = decodeFilePath(path.join(tempRoot, "app-data"));
          const repoPath = decodeFilePath(path.join(tempRoot, "fixture-repo"));
          const port = yield* allocatePort;

          yield* writeFixtureRepo(repoPath);

          const sidecar = yield* spawnSidecar({
            appDataDir,
            port,
            sessionId: "spawned-runtime-observability-test",
            version: "0.0.0-test",
            otlpEnabled: false,
          });
          const bootstrap = yield* waitForHealthyBootstrap(sidecar);
          const stdoutBootstrap = yield* readBootstrapStdoutLine(sidecar);

          expect(stdoutBootstrap.sessionId).toBe(bootstrap.sessionId);
          expect(stdoutBootstrap.baseUrl).toBe(bootstrap.baseUrl);
          expect(stdoutBootstrap.port).toBe(bootstrap.port);

          const registrationResponse = yield* requestJson(RepoRegistration, `${sidecar.baseUrl}/repos`, {
            body: encodeJson({
              displayName: "Observability Fixture Repo",
              repoPath,
            }),
            headers: {
              "content-type": "application/json",
            },
            method: "POST",
          });
          expect(registrationResponse.status).toBe(201);

          const rpcClient = yield* makeRepoRunRpcClient(sidecar.baseUrl);
          const repoId = registrationResponse.body.id;

          const indexAccepted = yield* rpcClient.StartIndexRepoRun({
            repoId,
            sourceFingerprint: O.none(),
          });
          const indexEvents = yield* Stream.runCollect(
            rpcClient.StreamRunEvents({ runId: indexAccepted.runId, cursor: O.none() })
          );
          expect(
            pipe(
              indexEvents,
              A.map((event) => event.kind)
            )
          ).toEqual(["accepted", "started", "progress", "completed"]);

          const queryAccepted = yield* rpcClient.StartQueryRepoRun({
            repoId,
            question: "describe symbol `answer`",
            questionFingerprint: O.none(),
          });
          const queryEvents = yield* Stream.runCollect(
            rpcClient.StreamRunEvents({ runId: queryAccepted.runId, cursor: O.none() })
          );
          expect(
            pipe(
              queryEvents,
              A.map((event) => event.kind)
            )
          ).toEqual(["accepted", "started", "progress", "progress", "retrieval-packet", "answer", "completed"]);

          const metricsResponse = yield* requestText(`${sidecar.rootUrl}/metrics`);
          expect(metricsResponse.status).toBe(200);
          expect(metricsResponse.body).toContain("beep_repo_memory_http_requests_total");
          expect(metricsResponse.body).toContain("beep_repo_memory_runs_started_total");
          expect(metricsResponse.body).toContain("beep_repo_memory_query_results_total");
          expect(metricsResponse.body).toContain("beep_repo_memory_driver_operation_duration_ms");
          expect(metricsResponse.body).toContain("child_fibers_started");
        })
      ).pipe(Effect.provide(NodeServices.layer, { local: true })),
    60_000
  );

  it.live(
    "restarts on the same port and replays only missing events",
    () =>
      Effect.scoped(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const tempRoot = yield* fs.makeTempDirectoryScoped({ prefix: "spawned-sidecar-runtime-test-" });
          const appDataDir = decodeFilePath(path.join(tempRoot, "app-data"));
          const repoPath = decodeFilePath(path.join(tempRoot, "fixture-repo"));
          const port = yield* allocatePort;

          yield* writeFixtureRepo(repoPath);

          const firstSidecar = yield* spawnSidecar({
            appDataDir,
            port,
            sessionId: "spawned-runtime-test",
            version: "0.0.0-test",
            otlpEnabled: false,
          });
          yield* waitForHealthyBootstrap(firstSidecar);

          const registrationResponse = yield* requestJson(RepoRegistration, `${firstSidecar.baseUrl}/repos`, {
            body: encodeJson({
              displayName: "Spawned Fixture Repo",
              repoPath,
            }),
            headers: {
              "content-type": "application/json",
            },
            method: "POST",
          });
          expect(registrationResponse.status).toBe(201);

          const repoId = registrationResponse.body.id;
          const firstRpcClient = yield* makeRepoRunRpcClient(firstSidecar.baseUrl);

          const indexAccepted = yield* firstRpcClient.StartIndexRepoRun({
            repoId,
            sourceFingerprint: O.none(),
          });
          const indexEvents = yield* Stream.runCollect(
            firstRpcClient.StreamRunEvents({ runId: indexAccepted.runId, cursor: O.none() })
          );
          expect(
            pipe(
              indexEvents,
              A.map((event) => event.kind)
            )
          ).toEqual(["accepted", "started", "progress", "completed"]);

          const queryAccepted = yield* firstRpcClient.StartQueryRepoRun({
            repoId,
            question: "describe symbol `answer`",
            questionFingerprint: O.none(),
          });
          const queryEvents = yield* Stream.runCollect(
            firstRpcClient.StreamRunEvents({ runId: queryAccepted.runId, cursor: O.none() })
          );
          expect(
            pipe(
              queryEvents,
              A.map((event) => event.kind)
            )
          ).toEqual(["accepted", "started", "progress", "progress", "retrieval-packet", "answer", "completed"]);

          const replayCursorValue = pipe(
            queryEvents,
            A.get(3),
            O.map((event) => event.sequence),
            O.getOrUndefined
          );
          expect(replayCursorValue).toBe(decodeRunEventSequence(4));
          if (replayCursorValue === undefined) {
            return yield* Effect.die("Missing replay cursor from completed query events.");
          }

          yield* firstSidecar.shutdown;

          const secondSidecar = yield* spawnSidecar({
            appDataDir,
            port,
            sessionId: "spawned-runtime-test",
            version: "0.0.0-test",
            otlpEnabled: false,
          });
          yield* waitForHealthyBootstrap(secondSidecar);
          const secondBootstrapLine = yield* readBootstrapStdoutLine(secondSidecar);
          expect(secondBootstrapLine.port).toBe(port);

          const restoredQueryRunResponse = yield* requestJson(
            RepoRun,
            `${secondSidecar.baseUrl}/runs/${encodeURIComponent(queryAccepted.runId)}`
          );
          expect(restoredQueryRunResponse.status).toBe(200);
          const restoredQueryRun = expectQueryRun(restoredQueryRunResponse.body);
          expect(restoredQueryRun.status).toBe("completed");
          expect(O.getOrThrow(restoredQueryRun.answer)).toContain('Symbol "answer" is a const.');
          expect(O.getOrThrow(restoredQueryRun.retrievalPacket).summary).toContain('Described symbol "answer"');

          const secondRpcClient = yield* makeRepoRunRpcClient(secondSidecar.baseUrl);
          const replayedEvents = yield* Stream.runCollect(
            secondRpcClient.StreamRunEvents({
              runId: queryAccepted.runId,
              cursor: O.some(decodeRunCursor(replayCursorValue)),
            })
          );
          expect(
            pipe(
              replayedEvents,
              A.map((event) => event.kind)
            )
          ).toEqual(["retrieval-packet", "answer", "completed"]);
          expect(
            pipe(
              replayedEvents,
              A.map((event) => event.sequence)
            )
          ).toEqual([decodeRunEventSequence(5), decodeRunEventSequence(6), decodeRunEventSequence(7)]);

          const postRestartAccepted = yield* secondRpcClient.StartQueryRepoRun({
            repoId,
            question: "what does `src/index.ts` import?",
            questionFingerprint: O.none(),
          });
          const postRestartEvents = yield* Stream.runCollect(
            secondRpcClient.StreamRunEvents({
              runId: postRestartAccepted.runId,
              cursor: O.none(),
            })
          );
          expect(
            pipe(
              postRestartEvents,
              A.map((event) => event.kind)
            )
          ).toEqual(["accepted", "started", "progress", "progress", "retrieval-packet", "answer", "completed"]);

          const restoredRuns = yield* requestJson(S.Array(RepoRun), `${secondSidecar.baseUrl}/runs`);
          expect(restoredRuns.status).toBe(200);
          expect(restoredRuns.body.length).toBeGreaterThanOrEqual(3);
        })
      ).pipe(Effect.provide(NodeServices.layer, { local: true })),
    60_000
  );
});
