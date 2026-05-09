import {
  AiMetricsForwarderRunResult,
  AiMetricsInstallApplyDryRunResult,
  AiMetricsInstallDoctorResult,
  AiMetricsInstallPlan,
  AiMetricsLabelQueueResult,
  AiMetricsOtlpExportResult,
  AiMetricsSourceDiscoveryResult,
  AiMetricsWeeklyReportResult,
} from "@beep/repo-ai-metrics";
import { aiMetricsCommand } from "@beep/repo-cli/commands/AIMetrics/index";
import { NodeServices } from "@effect/platform-node";
import { ConfigProvider, Duration, Effect, Encoding, FileSystem, Layer, Path, pipe, Schedule } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as TestConsole from "effect/testing/TestConsole";
import { Command } from "effect/unstable/cli";
import { describe, expect, it } from "vitest";

const runAiMetricsCommand = Command.runWith(aiMetricsCommand, { version: "0.0.0" });
const CommandTestLayer = Layer.mergeAll(NodeServices.layer, TestConsole.layer);
const decodeForwarderResult = S.decodeUnknownEffect(S.fromJsonString(AiMetricsForwarderRunResult));
const decodeInstallApplyDryRun = S.decodeUnknownEffect(S.fromJsonString(AiMetricsInstallApplyDryRunResult));
const decodeInstallDoctor = S.decodeUnknownEffect(S.fromJsonString(AiMetricsInstallDoctorResult));
const decodeInstallPlan = S.decodeUnknownEffect(S.fromJsonString(AiMetricsInstallPlan));
const decodeLabelQueue = S.decodeUnknownEffect(S.fromJsonString(AiMetricsLabelQueueResult));
const decodeOtlpExportResult = S.decodeUnknownEffect(S.fromJsonString(AiMetricsOtlpExportResult));
const decodeSourceDiscovery = S.decodeUnknownEffect(S.fromJsonString(AiMetricsSourceDiscoveryResult));
const decodeWeeklyReport = S.decodeUnknownEffect(S.fromJsonString(AiMetricsWeeklyReportResult));
const farFutureUntilEpochMs = 4_102_444_800_000;

type CapturedOtlpRequest = {
  readonly bodyByteLength: number;
  readonly bodyText: string;
  readonly contentType: string;
  readonly path: string;
};

const withTempDirectory = <A, E, R>(use: (tmpDir: string) => Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      process.exitCode = 0;
      return yield* fs.makeTempDirectory();
    }),
    use,
    (tmpDir) =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        process.exitCode = 0;
        yield* fs.remove(tmpDir, { recursive: true, force: true });
      })
  ).pipe(Effect.provide(CommandTestLayer));

const writeText = Effect.fn("AIMetricsCommandTest.writeText")(function* (filePath: string, content: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* fs.makeDirectory(path.dirname(filePath), { recursive: true });
  yield* fs.writeFileString(filePath, content);
});

const loggedText = Effect.fn("AIMetricsCommandTest.loggedText")(function* () {
  return pipe(yield* TestConsole.logLines, A.join("\n"));
});

const lastLoggedLine = Effect.fn("AIMetricsCommandTest.lastLoggedLine")(function* () {
  const last = pipe(yield* TestConsole.logLines, A.last);
  if (O.isSome(last)) {
    return last.value;
  }

  return "";
});

const withRawArchiveKeyEnv = <A, E, R>(rawArchiveKey: string, use: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  Effect.provide(
    use,
    ConfigProvider.layer(
      ConfigProvider.fromUnknown({
        BEEP_AI_METRICS_RAW_ARCHIVE_KEY: rawArchiveKey,
      })
    )
  );

const withOtlpSink = <A, E, R>(
  use: (baseUrl: string, requests: ReadonlyArray<CapturedOtlpRequest>) => Effect.Effect<A, E, R>
) =>
  Effect.acquireUseRelease(
    Effect.sync(() => {
      const requests: Array<CapturedOtlpRequest> = [];
      const server = Bun.serve({
        fetch: async (request) => {
          const body = await request.arrayBuffer();
          requests.push({
            bodyByteLength: body.byteLength,
            bodyText: new TextDecoder().decode(body),
            contentType: request.headers.get("content-type") ?? "",
            path: new URL(request.url).pathname,
          });
          return new Response(null, { status: 200 });
        },
        hostname: "127.0.0.1",
        port: 0,
      });
      return { requests, server };
    }),
    ({ requests, server }) => use(`http://127.0.0.1:${server.port}`, requests),
    ({ server }) => Effect.promise(() => server.stop(true))
  );

const findCapturedOtlpTraceRequest = Effect.fn("AIMetricsCommandTest.findCapturedOtlpTraceRequest")(function* (
  requests: ReadonlyArray<CapturedOtlpRequest>
) {
  const traceRequest = pipe(
    requests,
    A.findFirst((request) => request.path === "/v1/traces")
  );

  if (O.isSome(traceRequest)) {
    return traceRequest.value;
  }

  return yield* Effect.fail("OTLP trace request was not captured yet.");
});

const waitForCapturedOtlpTraceRequest = (
  requests: ReadonlyArray<CapturedOtlpRequest>
): Effect.Effect<CapturedOtlpRequest, string> =>
  findCapturedOtlpTraceRequest(requests).pipe(
    Effect.retry(Schedule.both(Schedule.spaced(Duration.millis(25)), Schedule.recurs(200)))
  );

describe("ai-metrics command", () => {
  it("emits ingest JSON without raw local paths or Claude private identifiers", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const inputPath = path.join(tmpDir, "claude.jsonl");
          yield* writeText(
            inputPath,
            [
              '{"sessionId":"claude-private-session","cwd":"/private/repo/path","timestamp":"2026-05-05T11:00:00Z","message":{"role":"user"}}',
              '{"type":"sk-private-event-name","timestamp":"2026-05-05T11:01:00Z","message":{"role":"assistant"}}',
            ].join("\n")
          );

          yield* runAiMetricsCommand([
            "ingest",
            "--source",
            "claude",
            "--input",
            inputPath,
            "--hash-salt",
            "test-salt",
            "--json",
          ]);

          const output = yield* loggedText();
          expect(output).toContain("sourcePathHash");
          expect(output).toContain("message");
          expect(output).not.toContain(tmpDir);
          expect(output).not.toContain(inputPath);
          expect(output).not.toContain("claude-private-session");
          expect(output).not.toContain("sk-private-event-name");
          expect(output).not.toContain("/private/repo/path");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("does not expose input paths when ingest cannot read transcript input", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const inputPath = path.join(tmpDir, "private-missing-codex.jsonl");

          yield* runAiMetricsCommand([
            "ingest",
            "--source",
            "codex",
            "--input",
            inputPath,
            "--hash-salt",
            "test-salt",
            "--json",
          ]);

          const output = pipe(yield* TestConsole.errorLines, A.join("\n"));
          expect(output).toContain("Failed to read transcript input.");
          expect(output).not.toContain(inputPath);
          expect(output).not.toContain(tmpDir);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("requires a hash salt secret reference for non-local install previews", async () => {
    await Effect.runPromise(
      withTempDirectory(() =>
        Effect.gen(function* () {
          yield* runAiMetricsCommand(["install", "preview", "--target", "dankserver"]);

          const output = pipe(yield* TestConsole.errorLines, A.join("\n"));
          expect(output).toContain("hash-salt-secret-ref");
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("emits dankserver install preview JSON with a hash salt secret reference", async () => {
    await Effect.runPromise(
      withTempDirectory(() =>
        Effect.gen(function* () {
          yield* runAiMetricsCommand([
            "install",
            "preview",
            "--target",
            "dankserver",
            "--hash-salt-secret-ref",
            "op://TBK/ai-metrics/hash-salt",
            "--raw-archive-key-secret-ref",
            "op://TBK/ai-metrics/raw-archive-key",
            "--json",
          ]);

          const output = yield* loggedText();
          expect(output).toContain("dankserver");
          expect(output).toContain("hashSaltSecretRef");
          expect(output).toContain("op://TBK/ai-metrics/hash-salt");
          expect(output).toContain("rawArchiveKeySecretRef");
          expect(output).toContain("op://TBK/ai-metrics/raw-archive-key");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("renders a bounded dankserver forwarder timer command", async () => {
    await Effect.runPromise(
      withTempDirectory(() =>
        Effect.gen(function* () {
          yield* runAiMetricsCommand([
            "forwarder",
            "timer",
            "--target",
            "dankserver",
            "--data-root",
            ".beep/ai-metrics",
            "--hash-salt-secret-ref",
            "op://TBK/ai-metrics/hash-salt",
            "--raw-archive-key-secret-ref",
            "op://TBK/ai-metrics/raw-archive-key",
            "--json",
          ]);

          const output = yield* loggedText();
          expect(output).toContain("--max-file-bytes 8388608");
          expect(output).toContain("--max-files 5");
          expect(output).toContain("OnUnitInactiveSec=30m");
          expect(output).toContain("capture PATH at render time");
          expect(output).toContain("/usr/bin/env PATH=");
          expect(output).toContain(" bun packages/tooling/tool/cli/src/bin.ts -- ai-metrics forwarder run");
          expect(output).toContain("beep-ai-metrics-forwarder.timer");
          expect(output).not.toContain("--max-files 200");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("renders a dedicated local Phoenix compose target", async () => {
    await Effect.runPromise(
      withTempDirectory(() =>
        Effect.gen(function* () {
          yield* runAiMetricsCommand(["install", "compose", "--target", "local", "--json"]);

          const output = yield* loggedText();
          expect(output).toContain("arizephoenix/phoenix:latest");
          expect(output).toContain("127.0.0.1:6006:6006");
          expect(output).toContain("beep-ai-metrics-phoenix");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("emits typed install plan JSON", async () => {
    await Effect.runPromise(
      withTempDirectory(() =>
        Effect.gen(function* () {
          yield* runAiMetricsCommand(["install", "plan", "--target", "local", "--json"]);

          const plan = yield* decodeInstallPlan(yield* lastLoggedLine());
          expect(plan.target).toBe("local");
          expect(plan.dryRunOnly).toBe(true);
          expect(plan.steps).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                stepId: "backend.phoenix.plan",
              }),
            ])
          );
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("runs install doctor with one source and missing-source warnings", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const homeDir = path.join(tmpDir, "home");
          const repoRoot = path.join(tmpDir, "repo");
          yield* writeText(
            path.join(homeDir, ".codex/sessions/2026/05/05/codex-session.jsonl"),
            '{"type":"session_meta","timestamp":"2026-05-05T10:00:00Z"}\n'
          );

          yield* runAiMetricsCommand([
            "install",
            "doctor",
            "--target",
            "local",
            "--repo-root",
            repoRoot,
            "--home-dir",
            homeDir,
            "--all",
            "--hash-salt",
            "test-salt",
            "--json",
          ]);

          const doctor = yield* decodeInstallDoctor(yield* lastLoggedLine());
          const output = yield* loggedText();
          expect(doctor.status).toBe("warning");
          expect(doctor.availableSourceCount).toBe(1);
          expect(output).not.toContain(tmpDir);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("fails install doctor when no local sources are available", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const homeDir = path.join(tmpDir, "home");
          const repoRoot = path.join(tmpDir, "repo");

          yield* runAiMetricsCommand([
            "install",
            "doctor",
            "--target",
            "local",
            "--repo-root",
            repoRoot,
            "--home-dir",
            homeDir,
            "--all",
            "--json",
          ]);

          const doctor = yield* decodeInstallDoctor(yield* lastLoggedLine());
          expect(doctor.status).toBe("failed");
          expect(doctor.availableSourceCount).toBe(0);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("dry-runs dankserver install apply without remote mutation", async () => {
    await Effect.runPromise(
      withTempDirectory(() =>
        Effect.gen(function* () {
          yield* runAiMetricsCommand([
            "install",
            "apply",
            "--target",
            "dankserver",
            "--hash-salt-secret-ref",
            "op://TBK/ai-metrics/hash-salt",
            "--raw-archive-key-secret-ref",
            "op://TBK/ai-metrics/raw-archive-key",
            "--dry-run",
            "--json",
          ]);

          const result = yield* decodeInstallApplyDryRun(yield* lastLoggedLine());
          expect(result.target).toBe("dankserver");
          expect(result.dryRun).toBe(true);
          expect(result.plan.steps).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                command: "cd infra && pulumi preview --stack beep-ai-metrics-dankserver",
                stepId: "backend.phoenix.plan",
              }),
            ])
          );
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("refuses install apply without dry-run in P5a", async () => {
    await Effect.runPromise(
      withTempDirectory(() =>
        Effect.gen(function* () {
          yield* runAiMetricsCommand(["install", "apply", "--target", "local"]);

          const output = pipe(yield* TestConsole.errorLines, A.join("\n"));
          expect(output).toContain("dry-run-only");
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("emits config snapshot JSON for repo-owned agent files", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          yield* writeText(path.join(tmpDir, "AGENTS.md"), "root guide\n");
          yield* writeText(path.join(tmpDir, ".codex/config.toml"), 'model = "gpt-5"\n');
          yield* writeText(path.join(tmpDir, ".repos/effect-v4/AGENTS.md"), "vendored guide\n");

          yield* runAiMetricsCommand(["config", "snapshot", "--repo-root", tmpDir, "--json"]);

          const output = yield* loggedText();
          expect(output).toContain("configHash");
          expect(output).toContain("AGENTS.md");
          expect(output).not.toContain(".repos/effect-v4/AGENTS.md");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("does not expose repo paths when config snapshot cannot read an agent file", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const agentPath = path.join(tmpDir, "AGENTS.md");
          yield* writeText(agentPath, "root guide\n");
          yield* fs.chmod(agentPath, 0o000);

          yield* runAiMetricsCommand(["config", "snapshot", "--repo-root", tmpDir, "--json"]);

          const output = pipe(yield* TestConsole.errorLines, A.join("\n"));
          expect(output).toContain("Failed to read config snapshot file.");
          expect(output).not.toContain(agentPath);
          expect(output).not.toContain(tmpDir);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("emits privacy check JSON without raw transcript text", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const inputPath = path.join(tmpDir, "codex.jsonl");
          yield* writeText(
            inputPath,
            [
              '{"type":"user_message","timestamp":"2026-05-05T12:00:00Z","message":"ship the private plan","OPENAI_API_KEY":"sk-privatefixture"}',
              '{"type":"assistant_message","timestamp":"2026-05-05T12:01:00Z","content":"private implementation details"}',
            ].join("\n")
          );

          yield* runAiMetricsCommand([
            "privacy",
            "check",
            "--source",
            "codex",
            "--input",
            inputPath,
            "--hash-salt",
            "test-salt",
            "--json",
          ]);

          const output = yield* loggedText();
          expect(output).toContain("hashSaltStatus");
          expect(output).toContain("provided");
          expect(output).not.toContain("ship the private plan");
          expect(output).not.toContain("private implementation details");
          expect(output).not.toContain("sk-privatefixture");
          expect(output).not.toContain(tmpDir);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("does not expose input paths when privacy check cannot inspect input", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const inputPath = path.join(tmpDir, "private-missing-codex.jsonl");

          yield* runAiMetricsCommand([
            "privacy",
            "check",
            "--source",
            "codex",
            "--input",
            inputPath,
            "--hash-salt",
            "test-salt",
            "--json",
          ]);

          const output = pipe(yield* TestConsole.errorLines, A.join("\n"));
          expect(output).toContain("Failed to inspect privacy input.");
          expect(output).not.toContain(inputPath);
          expect(output).not.toContain(tmpDir);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("discovers local sources without exposing private paths or OpenClaw secrets", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const homeDir = path.join(tmpDir, "home");
          const repoRoot = path.join(tmpDir, "repo");
          const claudeProjectName = pipe(repoRoot, Str.replace(/[/\\]/gu, "-"));
          const openClawUnitPath = path.join(homeDir, ".config/systemd/user/openclaw-gateway.service");

          yield* writeText(
            path.join(homeDir, ".codex/sessions/2026/05/05/codex-session.jsonl"),
            '{"type":"session_meta","timestamp":"2026-05-05T10:00:00Z"}\n'
          );
          yield* writeText(
            path.join(homeDir, ".codex/sessions/2026/05/05/oversized-codex-session.jsonl"),
            `{"type":"session_meta","timestamp":"2026-05-05T10:01:00Z","payload":"${pipe("x", Str.repeat(256))}"}\n`
          );
          yield* writeText(
            path.join(homeDir, ".claude/projects", claudeProjectName, "claude-session.jsonl"),
            '{"sessionId":"claude-session","timestamp":"2026-05-05T11:00:00Z"}\n'
          );
          yield* writeText(openClawUnitPath, "[Service]\nEnvironment=OPENCLAW_GATEWAY_TOKEN=super-secret-token\n");

          yield* runAiMetricsCommand([
            "sources",
            "discover",
            "--repo-root",
            repoRoot,
            "--home-dir",
            homeDir,
            "--openclaw-unit",
            openClawUnitPath,
            "--all",
            "--hash-salt",
            "test-salt",
            "--max-file-bytes",
            "128",
            "--json",
          ]);

          const result = yield* decodeSourceDiscovery(yield* lastLoggedLine());
          const codex = pipe(
            result.sources,
            A.findFirst((source) => source.sourceKind === "codex")
          );
          const output = yield* loggedText();
          expect(result.maxFileBytes).toBe(128);
          expect(O.isSome(codex)).toBe(true);
          if (O.isSome(codex)) {
            expect(codex.value.fileCount).toBe(1);
            expect(codex.value.files[0]?.sizeBytes).toBeLessThanOrEqual(128);
            expect(codex.value.sizeExcludedFileCount).toBe(1);
          }
          expect(output).toContain("gateway_metadata");
          expect(output).toContain("provided");
          expect(output).not.toContain(tmpDir);
          expect(output).not.toContain("super-secret-token");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("runs durable local forwarder without exposing raw transcript text", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const homeDir = path.join(tmpDir, "home");
          const repoRoot = path.join(tmpDir, "repo");
          const dataRoot = path.join(tmpDir, "metrics");
          const rawArchiveKey = Encoding.encodeBase64(new Uint8Array(32).fill(11));

          yield* writeText(
            path.join(homeDir, ".codex/sessions/codex-session.jsonl"),
            [
              '{"type":"session_meta","timestamp":"2026-05-05T10:00:00Z"}',
              '{"type":"event_msg","timestamp":"2026-05-05T10:01:00Z","payload":{"message":"private-forwarder-secret"}}',
            ].join("\n")
          );
          yield* writeText(path.join(repoRoot, "AGENTS.md"), "root guide\n");

          yield* withRawArchiveKeyEnv(
            rawArchiveKey,
            runAiMetricsCommand([
              "forwarder",
              "run",
              "--repo-root",
              repoRoot,
              "--home-dir",
              homeDir,
              "--data-root",
              dataRoot,
              "--all",
              "--hash-salt",
              "test-salt",
              "--json",
            ])
          );

          const output = yield* loggedText();
          expect(output).toContain("sourceFileCount");
          expect(output).toContain("archiveObjectCount");
          expect(output).toContain("turnCount");
          expect(output).not.toContain("private-forwarder-secret");
          expect(output).not.toContain(rawArchiveKey);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("does not expose raw source paths or archive keys on forwarder read failures", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const homeDir = path.join(tmpDir, "home");
          const repoRoot = path.join(tmpDir, "repo");
          const dataRoot = path.join(tmpDir, "metrics");
          const rawArchiveKey = Encoding.encodeBase64(new Uint8Array(32).fill(13));
          const sourcePath = path.join(homeDir, ".codex/sessions/private-source.jsonl");

          yield* writeText(sourcePath, '{"type":"event_msg","timestamp":"2026-05-05T10:01:00Z"}');
          yield* fs.chmod(sourcePath, 0o000);
          yield* writeText(path.join(repoRoot, "AGENTS.md"), "root guide\n");

          yield* withRawArchiveKeyEnv(
            rawArchiveKey,
            runAiMetricsCommand([
              "forwarder",
              "run",
              "--repo-root",
              repoRoot,
              "--home-dir",
              homeDir,
              "--data-root",
              dataRoot,
              "--all",
              "--hash-salt",
              "test-salt",
              "--json",
            ])
          );

          const output = pipe(yield* TestConsole.errorLines, A.join("\n"));
          expect(output).toContain("Failed to read AI metrics codex source file");
          expect(output).not.toContain(sourcePath);
          expect(output).not.toContain(tmpDir);
          expect(output).not.toContain(rawArchiveKey);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("runs the scriptable P4 label, benchmark, and weekly report workflow", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const homeDir = path.join(tmpDir, "home");
          const repoRoot = path.join(tmpDir, "repo");
          const dataRoot = path.join(tmpDir, "metrics");
          const rawArchiveKey = Encoding.encodeBase64(new Uint8Array(32).fill(19));

          yield* writeText(
            path.join(homeDir, ".codex/sessions/codex-session.jsonl"),
            [
              '{"type":"session_meta","timestamp":"2026-05-05T10:00:00Z"}',
              '{"type":"event_msg","timestamp":"2026-05-05T10:01:00Z","message":"private-cli-report-text"}',
            ].join("\n")
          );
          yield* writeText(path.join(repoRoot, "AGENTS.md"), "root guide\n");

          yield* withRawArchiveKeyEnv(
            rawArchiveKey,
            runAiMetricsCommand([
              "forwarder",
              "run",
              "--repo-root",
              repoRoot,
              "--home-dir",
              homeDir,
              "--data-root",
              dataRoot,
              "--all",
              "--hash-salt",
              "test-salt",
              "--json",
            ])
          );
          const forwarder = yield* decodeForwarderResult(yield* lastLoggedLine());

          yield* runAiMetricsCommand([
            "label",
            "queue",
            "--data-root",
            dataRoot,
            "--since",
            "0",
            "--until",
            String(farFutureUntilEpochMs),
            "--json",
          ]);
          const queue = yield* decodeLabelQueue(yield* lastLoggedLine());
          const firstTask = A.head(queue.items);
          expect(O.isSome(firstTask)).toBe(true);
          if (O.isNone(firstTask)) {
            return;
          }

          yield* runAiMetricsCommand([
            "label",
            "add",
            "--data-root",
            dataRoot,
            "--task",
            firstTask.value.agentTaskId,
            "--passed",
            "true",
            "--rating",
            "5",
            "--quality-gate",
            "passed",
            "--interventions",
            "1",
            "--follow-up-fix",
            "false",
            "--note",
            "OPENAI_API_KEY=secret-cli-report-fixture",
            "--json",
          ]);

          yield* runAiMetricsCommand([
            "benchmark",
            "case",
            "add",
            "--data-root",
            dataRoot,
            "--case",
            "case-cli",
            "--title",
            "CLI proof",
            "--prompt-hash",
            "prompt-hash-only",
            "--checks",
            "bun run check",
            "--json",
          ]);

          yield* runAiMetricsCommand([
            "benchmark",
            "run",
            "--data-root",
            dataRoot,
            "--case",
            "case-cli",
            "--config",
            forwarder.configSnapshotId,
            "--elapsed-ms",
            "1200",
            "--passed",
            "true",
            "--quality-gate",
            "passed",
            "--json",
          ]);

          yield* runAiMetricsCommand([
            "report",
            "weekly",
            "--data-root",
            dataRoot,
            "--since",
            "0",
            "--until",
            String(farFutureUntilEpochMs),
            "--json",
          ]);
          const report = yield* decodeWeeklyReport(yield* lastLoggedLine());
          const reportJson = yield* fs.readFileString(report.jsonPath);

          expect(report.document.scores).toHaveLength(1);
          expect(reportJson).toContain(forwarder.configSnapshotId);
          expect(reportJson).not.toContain("private-cli-report-text");
          expect(reportJson).not.toContain("secret-cli-report-fixture");
          expect(reportJson).not.toContain(tmpDir);
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });

  it("reports sanitized OTLP export failures when no derived runs exist", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const dataRoot = path.join(tmpDir, "metrics");

          yield* runAiMetricsCommand([
            "otlp",
            "export",
            "--target",
            "local",
            "--data-root",
            dataRoot,
            "--ingest-run",
            "latest",
            "--json",
          ]);

          const output = pipe(yield* TestConsole.errorLines, A.join("\n"));
          expect(output).toContain("Failed to select the latest AI metrics ingest run.");
          expect(output).not.toContain(dataRoot);
          expect(output).not.toContain(tmpDir);
          expect(process.exitCode).toBe(1);
        })
      )
    );
  });

  it("exports local derived OTLP spans as protobuf without raw transcript leakage", async () => {
    await Effect.runPromise(
      withOtlpSink((otlpBaseUrl, requests) =>
        withTempDirectory((tmpDir) =>
          Effect.gen(function* () {
            const path = yield* Path.Path;
            const homeDir = path.join(tmpDir, "home");
            const repoRoot = path.join(tmpDir, "repo");
            const dataRoot = path.join(tmpDir, "metrics");
            const rawArchiveKey = Encoding.encodeBase64(new Uint8Array(32).fill(17));

            yield* writeText(
              path.join(homeDir, ".codex/sessions/codex-session.jsonl"),
              [
                '{"type":"session_meta","timestamp":"2026-05-05T10:00:00Z"}',
                '{"type":"tool_result","timestamp":"2026-05-05T10:01:00Z","message":"private-otlp-fixture"}',
              ].join("\n")
            );
            yield* writeText(path.join(repoRoot, "AGENTS.md"), "root guide\n");

            yield* withRawArchiveKeyEnv(
              rawArchiveKey,
              runAiMetricsCommand([
                "forwarder",
                "run",
                "--repo-root",
                repoRoot,
                "--home-dir",
                homeDir,
                "--data-root",
                dataRoot,
                "--all",
                "--hash-salt",
                "test-salt",
                "--json",
              ])
            );

            yield* runAiMetricsCommand([
              "otlp",
              "export",
              "--target",
              "local",
              "--data-root",
              dataRoot,
              "--ingest-run",
              "latest",
              "--otlp-base-url",
              otlpBaseUrl,
              "--json",
            ]);

            const resultJson = yield* lastLoggedLine();
            const result = yield* decodeOtlpExportResult(resultJson);
            const traceRequest = yield* waitForCapturedOtlpTraceRequest(requests);

            expect(traceRequest.contentType).toContain("application/x-protobuf");
            expect(traceRequest.bodyByteLength).toBeGreaterThan(0);
            expect(traceRequest.bodyText).not.toContain("private-otlp-fixture");
            expect(traceRequest.bodyText).not.toContain(tmpDir);
            expect(result.endpointTraceUrl).toBe(`${otlpBaseUrl}/v1/traces`);
            expect(result.spanCount).toBeGreaterThan(0);
            expect(resultJson).not.toContain("private-otlp-fixture");
            expect(resultJson).not.toContain(rawArchiveKey);
            expect(resultJson).not.toContain(tmpDir);
            expect(process.exitCode ?? 0).toBe(0);
          })
        )
      )
    );
  });

  it("accepts non-local OTLP export install secret references before reading derived runs", async () => {
    await Effect.runPromise(
      withOtlpSink((otlpBaseUrl) =>
        withTempDirectory((tmpDir) =>
          Effect.gen(function* () {
            const path = yield* Path.Path;
            const dataRoot = path.join(tmpDir, "metrics");

            yield* runAiMetricsCommand([
              "otlp",
              "export",
              "--target",
              "dankserver",
              "--data-root",
              dataRoot,
              "--ingest-run",
              "latest",
              "--hash-salt-secret-ref",
              "op://TBK/ai-metrics/hash-salt",
              "--raw-archive-key-secret-ref",
              "op://TBK/ai-metrics/raw-archive-key",
              "--otlp-base-url",
              otlpBaseUrl,
              "--json",
            ]);

            const output = pipe(yield* TestConsole.errorLines, A.join("\n"));
            expect(output).toContain("Failed to select the latest AI metrics ingest run.");
            expect(output).not.toContain("hash-salt-secret-ref");
            expect(output).not.toContain("raw-archive-key-secret-ref");
            expect(output).not.toContain(dataRoot);
            expect(output).not.toContain(tmpDir);
            expect(process.exitCode).toBe(1);
          })
        )
      )
    );
  });
});
