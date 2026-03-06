import net from "node:net";
import { RepoRunRpcGroup } from "@beep/runtime-protocol";
import { FilePath } from "@beep/schema";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunHttpClient from "@effect/platform-bun/BunHttpClient";
import * as BunPath from "@effect/platform-bun/BunPath";
import { Effect, Layer, Schedule, Stream } from "effect";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as RpcClient from "effect/unstable/rpc/RpcClient";
import * as RpcSerialization from "effect/unstable/rpc/RpcSerialization";
import { SidecarRuntimeConfig, sidecarLayer } from "../packages/runtime/server/src/index.js";

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
          reject(new Error("bad address"));
          return;
        }
        server.close((error) => (error ? reject(error) : resolve(address.port)));
      });
    }),
  catch: (cause) => cause,
});
const requestJson = (url: string, init?: RequestInit) =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch(url, init);
      return { status: response.status, body: await response.json() };
    },
    catch: (cause) => cause,
  });
const waitForHealthyBootstrap = (baseUrl: string) =>
  requestJson(`${baseUrl}/health`).pipe(
    Effect.flatMap(({ body, status }) => (status === 200 ? Effect.succeed(body) : Effect.fail(status))),
    Effect.retry(Schedule.spaced("50 millis").pipe(Schedule.compose(Schedule.recurs(20))))
  );
const makeRepoRunRpcClient = (baseUrl: string) =>
  RpcClient.make(RepoRunRpcGroup).pipe(
    Effect.provide(
      RpcClient.layerProtocolHttp({ url: `${baseUrl}/rpc` }).pipe(
        Layer.provide(BunHttpClient.layer),
        Layer.provide(RpcSerialization.layerNdjson)
      )
    )
  );
const logRun = (baseUrl: string, runId: string) =>
  requestJson(`${baseUrl}/runs/${encodeURIComponent(runId)}`).pipe(
    Effect.tap((value) => Effect.sync(() => console.log(JSON.stringify(value, null, 2))))
  );
await Effect.runPromise(
  Effect.scoped(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const tempRoot = yield* fs.makeTempDirectoryScoped({ prefix: "repro-grounded-query-" });
      const appDataDir = decodeFilePath(path.join(tempRoot, "app-data"));
      const repoPath = decodeFilePath(path.join(tempRoot, "fixture-repo"));
      const repoSourceDir = path.join(repoPath, "src");
      const port = yield* allocatePort;
      const baseUrl = `http://127.0.0.1:${port}/api/v0`;
      yield* fs.makeDirectory(repoSourceDir, { recursive: true });
      yield* fs.writeFileString(
        path.join(repoSourceDir, "index.ts"),
        [
          "export const answer = 42;",
          "",
          "export function greet(name: string): string {",
          "  return `hello ${name}`;",
          "}",
          "",
        ].join("\n")
      );
      yield* fs.writeFileString(
        path.join(repoSourceDir, "util.ts"),
        ["export interface Helper {", "  readonly value: number;", "}", ""].join("\n")
      );
      yield* fs.writeFileString(
        path.join(repoPath, "tsconfig.json"),
        JSON.stringify({ compilerOptions: { module: "ESNext", target: "ES2022" }, include: ["src/**/*.ts"] }, null, 2)
      );
      yield* fs.writeFileString(path.join(repoPath, "README.md"), "# fixture\n");
      const config = new SidecarRuntimeConfig({
        appDataDir,
        host: "127.0.0.1",
        port,
        sessionId: "repro",
        version: "0.0.0-repro",
      });
      yield* Layer.launch(sidecarLayer(config)).pipe(Effect.forkScoped);
      yield* waitForHealthyBootstrap(baseUrl);
      const registration = yield* requestJson(`${baseUrl}/repos`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: "Fixture Repo", repoPath }),
      });
      const repoId = registration.body.id;
      const rpc = yield* makeRepoRunRpcClient(baseUrl);
      const index = yield* rpc.StartIndexRepoRun({ repoId, sourceFingerprint: O.none() });
      console.log("INDEX", yield* Stream.runCollect(rpc.StreamRunEvents({ runId: index.runId, cursor: O.none() })));
      const describe = yield* rpc.StartQueryRepoRun({
        repoId,
        question: "describe symbol `answer`",
        questionFingerprint: O.none(),
      });
      console.log(
        "DESCRIBE",
        yield* Stream.runCollect(rpc.StreamRunEvents({ runId: describe.runId, cursor: O.none() }))
      );
      yield* logRun(baseUrl, describe.runId);
      const count = yield* rpc.StartQueryRepoRun({
        repoId,
        question: "How many files?",
        questionFingerprint: O.none(),
      });
      console.log("COUNT", yield* Stream.runCollect(rpc.StreamRunEvents({ runId: count.runId, cursor: O.none() })));
      yield* logRun(baseUrl, count.runId);
      const exportsRun = yield* rpc.StartQueryRepoRun({
        repoId,
        question: "what does `src/index.ts` export?",
        questionFingerprint: O.none(),
      });
      console.log(
        "EXPORTS",
        yield* Stream.runCollect(rpc.StreamRunEvents({ runId: exportsRun.runId, cursor: O.none() }))
      );
      yield* logRun(baseUrl, exportsRun.runId);
    }).pipe(Effect.provide([BunFileSystem.layer, BunPath.layer]))
  )
);
