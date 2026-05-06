import { DuckDb, DuckDbConnectionOptions } from "@beep/duckdb";
import {
  AiMetricsConfigSnapshotInput,
  AiMetricsDeployTarget,
  AiMetricsDerivedStorageWriteInput,
  AiMetricsDerivedTranscriptRecord,
  AiMetricsForwarderInput,
  AiMetricsInstallInput,
  AiMetricsPrivacyMode,
  AiMetricsRawArchiveObject,
  AiMetricsSourceDiscoveryInput,
  AiMetricsTool,
  AiMetricsTranscriptSource,
  configSnapshotToJson,
  decryptEncryptedRawArchiveEnvelope,
  discoverAiMetricsSources,
  forwarderRunResultToJson,
  makeAiMetricsConfigSnapshot,
  makeAiMetricsInstallSpec,
  makeAiMetricsPrivacyCheckResult,
  privacyCheckToJson,
  readEncryptedRawArchiveEnvelope,
  runAiMetricsForwarder,
  sourceDiscoveryToJson,
  summarizeTranscriptText,
  writeAiMetricsDerivedStorage,
} from "@beep/repo-ai-metrics";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Encoding, FileSystem, Order, Path, pipe, Redacted } from "effect";
import * as A from "effect/Array";
import * as Str from "effect/String";

const withTempDirectory = <A, E, R>(use: (tmpDir: string) => Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      return yield* fs.makeTempDirectory();
    }),
    use,
    (tmpDir) =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        yield* fs.remove(tmpDir, { recursive: true, force: true });
      })
  );

const writeText = Effect.fn("AiMetricsTest.writeText")(function* (filePath: string, content: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* fs.makeDirectory(path.dirname(filePath), { recursive: true });
  yield* fs.writeFileString(filePath, content);
});

const relativeSnapshotPaths = (files: ReadonlyArray<{ readonly relativePath: string }>): ReadonlyArray<string> =>
  pipe(
    files,
    A.map((file) => file.relativePath),
    A.sort(Order.String)
  );

describe("@beep/repo-ai-metrics", () => {
  it.effect(
    "summarizes Codex JSONL and counts rejected lines",
    Effect.fn(function* () {
      const content = [
        '{"type":"session_meta","timestamp":"2026-05-05T10:00:00Z","payload":{"id":"s1"}}',
        '{"type":"event_msg","timestamp":"2026-05-05T10:01:00Z","payload":{"message":"ran"}}',
        "not-json",
      ].join("\n");

      const summary = yield* summarizeTranscriptText({
        content,
        sourceKind: AiMetricsTranscriptSource.Enum.codex,
        sourcePath: "codex.jsonl",
      });

      expect(summary.sourceKind).toBe("codex");
      expect(summary.totalLines).toBe(3);
      expect(summary.acceptedEvents).toBe(2);
      expect(summary.rejectedLines).toBe(1);
      expect(summary.eventNames).toEqual(["event_msg", "session_meta"]);
      expect(summary.firstTimestamp).toBe("2026-05-05T10:00:00Z");
      expect(summary.lastTimestamp).toBe("2026-05-05T10:01:00Z");
      expect(summary.sourcePathHash).not.toBe("codex.jsonl");
    })
  );

  it.effect(
    "summarizes Claude JSONL with missing type",
    Effect.fn(function* () {
      const content = '{"sessionId":"claude-session","timestamp":"2026-05-05T11:00:00Z","message":{"role":"user"}}';

      const summary = yield* summarizeTranscriptText({
        content,
        sourceKind: AiMetricsTranscriptSource.Enum.claude,
        sourcePath: "claude.jsonl",
      });

      expect(summary.acceptedEvents).toBe(1);
      expect(summary.eventNames).toEqual(["message"]);
      expect(summary.sourcePathHash).not.toBe("claude.jsonl");
    })
  );

  it.effect(
    "runs durable ingest with encrypted raw archive, DuckDB projection, and Parquet export",
    Effect.fn(function* () {
      yield* withTempDirectory(
        Effect.fn(function* (tmpDir) {
          const path = yield* Path.Path;
          const fs = yield* FileSystem.FileSystem;
          const homeDir = path.join(tmpDir, "home");
          const repoRoot = path.join(tmpDir, "repo");
          const dataRoot = path.join(tmpDir, "metrics");
          const codexRoot = path.join(homeDir, ".codex/sessions");
          const claudeRoot = path.join(homeDir, ".claude/projects/repo");
          const duckDbPath = path.join(dataRoot, "derived/ai-metrics.duckdb");
          const rawArchiveKey = Redacted.make(Encoding.encodeBase64(new Uint8Array(32).fill(7)));

          yield* writeText(
            path.join(codexRoot, "codex.jsonl"),
            [
              '{"type":"session_meta","timestamp":"2026-05-05T10:00:00Z","payload":{"id":"s1"}}',
              '{"type":"event_msg","timestamp":"2026-05-05T10:01:00Z","payload":{"message":"SECRET_TOKEN=secret-value"}}',
            ].join("\n")
          );
          yield* writeText(
            path.join(claudeRoot, "claude.jsonl"),
            '{"type":"assistant","timestamp":"2026-05-05T10:02:00Z","message":{"content":"done"}}'
          );
          yield* writeText(path.join(repoRoot, "AGENTS.md"), "# Test agent guide\n");

          yield* Effect.gen(function* () {
            const result = yield* runAiMetricsForwarder(
              new AiMetricsForwarderInput({
                claudeProjectsRoot: claudeRoot,
                codexSessionsRoot: codexRoot,
                dataRoot,
                hashSalt: "test-salt",
                homeDir,
                includeAll: true,
                rawArchiveKey,
                repoRoot,
                target: AiMetricsDeployTarget.Enum.local,
              })
            );

            expect(result.sourceFileCount).toBe(2);
            expect(result.archiveObjectCount).toBe(2);
            expect(result.turnCount).toBe(3);
            expect(yield* forwarderRunResultToJson(result)).toContain(result.ingestRunId);
            expect(yield* fs.exists(path.join(result.parquetExportDir, "ai_metrics_turns.parquet"))).toBe(true);

            const duckdb = yield* DuckDb;
            const turnRows = yield* duckdb.query("SELECT count(*) AS count FROM ai_metrics_turns");
            expect(turnRows).toEqual([{ count: "3" }]);
            const archiveRows = yield* duckdb.query(
              "SELECT archive_path FROM ai_metrics_raw_archive_objects WHERE source_kind = 'codex'"
            );
            const archivePath = globalThis.String(archiveRows[0]?.archive_path ?? "");
            const archiveText = yield* fs.readFileString(archivePath);
            expect(archiveText).not.toContain("secret-value");

            const envelope = yield* readEncryptedRawArchiveEnvelope(archivePath);
            const plaintext = yield* decryptEncryptedRawArchiveEnvelope({ envelope, rawArchiveKey });
            expect(plaintext).toContain("secret-value");
          }).pipe(Effect.provide(DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath: duckDbPath }))));
        })
      ).pipe(Effect.provide(NodeServices.layer));
    })
  );

  it.effect(
    "retains repeated derived ingest runs for the same source records",
    Effect.fn(function* () {
      yield* withTempDirectory(
        Effect.fn(function* (tmpDir) {
          const path = yield* Path.Path;
          const dataRoot = path.join(tmpDir, "metrics");
          const duckDbPath = path.join(dataRoot, "derived/ai-metrics.duckdb");
          const sourcePath = path.join(tmpDir, "home/.codex/sessions/codex.jsonl");
          const content = '{"type":"event_msg","timestamp":"2026-05-05T10:01:00Z"}';

          yield* writeText(path.join(tmpDir, "repo", "AGENTS.md"), "# Test agent guide\n");

          yield* Effect.gen(function* () {
            const summary = yield* summarizeTranscriptText({
              content,
              hashSalt: "test-salt",
              sourceKind: AiMetricsTranscriptSource.Enum.codex,
              sourcePath,
            });
            const privacy = yield* makeAiMetricsPrivacyCheckResult({
              content,
              hashSalt: "test-salt",
              sourcePath,
              summary,
            });
            const installSpec = yield* makeAiMetricsInstallSpec(
              new AiMetricsInstallInput({
                dataRoot,
                target: AiMetricsDeployTarget.Enum.local,
              })
            );
            const configSnapshot = yield* makeAiMetricsConfigSnapshot(
              new AiMetricsConfigSnapshotInput({
                repoRoot: path.join(tmpDir, "repo"),
              })
            );
            const record = new AiMetricsDerivedTranscriptRecord({
              archiveObject: new AiMetricsRawArchiveObject({
                algorithm: "AES-256-GCM",
                archiveObjectId: "raw-content-addressed-object",
                archivePath: path.join(dataRoot, "raw/codex/raw-content-addressed-object.json"),
                encryptedAtEpochMillis: 1,
                plaintextContentHash: "plaintext-content-hash",
                sourceKind: AiMetricsTranscriptSource.Enum.codex,
                sourcePathHash: summary.sourcePathHash,
              }),
              privacy,
            });
            const baseInput = {
              configSnapshot: configSnapshot.snapshot,
              records: [record],
              startedAtEpochMillis: 1,
              storage: installSpec.storage,
              target: AiMetricsDeployTarget.Enum.local,
            };

            yield* writeAiMetricsDerivedStorage(
              new AiMetricsDerivedStorageWriteInput({
                ...baseInput,
                ingestRunId: "forwarder-1",
              })
            );
            yield* writeAiMetricsDerivedStorage(
              new AiMetricsDerivedStorageWriteInput({
                ...baseInput,
                ingestRunId: "forwarder-2",
              })
            );

            const duckdb = yield* DuckDb;
            const runRows = yield* duckdb.query("SELECT count(*) AS count FROM ai_metrics_ingest_runs");
            const sourceRows = yield* duckdb.query("SELECT count(*) AS count FROM ai_metrics_source_files");
            const archiveRows = yield* duckdb.query("SELECT count(*) AS count FROM ai_metrics_raw_archive_objects");
            const sessionRows = yield* duckdb.query("SELECT count(*) AS count FROM ai_metrics_sessions");
            const turnRows = yield* duckdb.query("SELECT count(*) AS count FROM ai_metrics_turns");

            expect(runRows).toEqual([{ count: "2" }]);
            expect(sourceRows).toEqual([{ count: "2" }]);
            expect(archiveRows).toEqual([{ count: "2" }]);
            expect(sessionRows).toEqual([{ count: "2" }]);
            expect(turnRows).toEqual([{ count: "2" }]);
          }).pipe(Effect.provide(DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath: duckDbPath }))));
        })
      ).pipe(Effect.provide(NodeServices.layer));
    })
  );

  it.effect(
    "resolves the dankserver install target",
    Effect.fn(function* () {
      const spec = yield* makeAiMetricsInstallSpec(
        new AiMetricsInstallInput({
          defaultTool: AiMetricsTool.Enum.phoenix,
          hashSaltSecretRef: "op://beep-effect/ai-metrics/hash-salt",
          privacyMode: AiMetricsPrivacyMode.Enum.encrypted_raw_redacted_ui,
          rawArchiveKeySecretRef: "op://beep-effect/ai-metrics/raw-archive-key",
          target: AiMetricsDeployTarget.Enum.dankserver,
        })
      );

      expect(spec.stackName).toBe("beep-ai-metrics-dankserver");
      expect(spec.storage.dataRoot).toBe("/srv/data/ai-metrics");
      expect(spec.defaultScoreWeights.outcome).toBe(0.7);
      expect(
        pipe(
          spec.services,
          A.map((service) => service.tool)
        )
      ).toEqual(["langfuse", "phoenix", "opik"]);
      expect(spec.hashSaltSecretRef).toBe("op://beep-effect/ai-metrics/hash-salt");
    })
  );

  it.effect(
    "rejects non-local install specs without a hash salt secret reference",
    Effect.fn(function* () {
      const error = yield* Effect.flip(
        makeAiMetricsInstallSpec(
          new AiMetricsInstallInput({
            target: AiMetricsDeployTarget.Enum.dankserver,
          })
        )
      );

      expect(error.message).toContain("non-local installs require hashSaltSecretRef");
    })
  );

  it.effect(
    "falls back unknown transcript type metadata to bounded event names",
    Effect.fn(function* () {
      const summary = yield* summarizeTranscriptText({
        content: '{"type":"sk-secretfixture","timestamp":"2026-05-05T10:00:00Z"}',
        hashSalt: "test-salt",
        sourceKind: AiMetricsTranscriptSource.Enum.codex,
        sourcePath: "codex.jsonl",
      });

      expect(summary.eventNames).toEqual(["event"]);
    })
  );

  it.effect(
    "builds a privacy proof without exposing raw prompt, output, path, or secret text",
    Effect.fn(function* () {
      yield* withTempDirectory(
        Effect.fn(function* (tmpDir) {
          const path = yield* Path.Path;
          const sourcePath = path.join(tmpDir, "codex-session.jsonl");
          const content = [
            '{"type":"user_message","timestamp":"2026-05-05T12:00:00Z","message":"please refactor the billing flow","OPENAI_API_KEY":"sk-secretfixture"}',
            '{"type":"assistant_message","timestamp":"2026-05-05T12:01:00Z","content":"done with private output"}',
          ].join("\n");
          const summary = yield* summarizeTranscriptText({
            content,
            hashSalt: "test-salt",
            sourceKind: AiMetricsTranscriptSource.Enum.codex,
            sourcePath,
          });
          const result = yield* makeAiMetricsPrivacyCheckResult({
            content,
            hashSalt: "test-salt",
            sourcePath,
            summary,
          });
          const json = yield* privacyCheckToJson(result);

          expect(result.hashSaltStatus).toBe("provided");
          expect(result.redaction.safeForDerivedUi).toBe(false);
          expect(result.redaction.excludedRawTextFieldCount).toBeGreaterThan(0);
          expect(result.redaction.openAiKeyCount).toBe(1);
          expect(result.sanitized.rawEventEnvelopes).toHaveLength(2);
          expect(json).not.toContain("please refactor");
          expect(json).not.toContain("private output");
          expect(json).not.toContain("sk-secretfixture");
          expect(json).not.toContain(tmpDir);
          expect(json).not.toContain(sourcePath);
        })
      ).pipe(Effect.provide(NodeServices.layer));
    })
  );

  it.effect(
    "reports derived UI as safe when secret-shaped values are absent",
    Effect.fn(function* () {
      const content = '{"type":"session_meta","timestamp":"2026-05-05T12:00:00Z"}';
      const summary = yield* summarizeTranscriptText({
        content,
        hashSalt: "test-salt",
        sourceKind: AiMetricsTranscriptSource.Enum.codex,
        sourcePath: "codex.jsonl",
      });
      const result = yield* makeAiMetricsPrivacyCheckResult({
        content,
        hashSalt: "test-salt",
        sourcePath: "codex.jsonl",
        summary,
      });

      expect(result.redaction.safeForDerivedUi).toBe(true);
    })
  );

  it.effect(
    "snapshots repo-owned agent config while excluding vendored and generated roots",
    Effect.fn(function* () {
      yield* withTempDirectory(
        Effect.fn(function* (tmpDir) {
          const path = yield* Path.Path;
          yield* writeText(path.join(tmpDir, ".codex/config.toml"), 'model = "gpt-5"\n');
          yield* writeText(path.join(tmpDir, ".claude/settings.json"), '{"hooks":[]}\n');
          yield* writeText(path.join(tmpDir, ".aiassistant/rules/agent-instructions.md"), "agent rules\n");
          yield* writeText(path.join(tmpDir, "AGENTS.md"), "root agent guide\n");
          yield* writeText(path.join(tmpDir, "packages/demo/AGENTS.md"), "nested guide\n");
          yield* writeText(path.join(tmpDir, ".repos/effect-v4/AGENTS.md"), "vendored guide\n");
          yield* writeText(path.join(tmpDir, "node_modules/pkg/CLAUDE.md"), "dependency guide\n");

          const result = yield* makeAiMetricsConfigSnapshot(new AiMetricsConfigSnapshotInput({ repoRoot: tmpDir }));
          const again = yield* makeAiMetricsConfigSnapshot(new AiMetricsConfigSnapshotInput({ repoRoot: tmpDir }));
          const json = yield* configSnapshotToJson(result);

          expect(relativeSnapshotPaths(result.files)).toEqual([
            ".aiassistant/rules/agent-instructions.md",
            ".claude/settings.json",
            ".codex/config.toml",
            "AGENTS.md",
            "packages/demo/AGENTS.md",
          ]);
          expect(result.snapshot.configHash).toBe(again.snapshot.configHash);
          expect(json).not.toContain(".repos/effect-v4/AGENTS.md");
          expect(json).not.toContain("node_modules/pkg/CLAUDE.md");

          yield* writeText(path.join(tmpDir, ".codex/config.toml"), 'model = "gpt-5.1"\n');
          const changed = yield* makeAiMetricsConfigSnapshot(new AiMetricsConfigSnapshotInput({ repoRoot: tmpDir }));
          expect(changed.snapshot.configHash).not.toBe(result.snapshot.configHash);
        })
      ).pipe(Effect.provide(NodeServices.layer));
    })
  );

  it.effect(
    "discovers Codex, Claude, and OpenClaw sources without exposing private paths or service secrets",
    Effect.fn(function* () {
      yield* withTempDirectory(
        Effect.fn(function* (tmpDir) {
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
            path.join(homeDir, ".claude/projects", claudeProjectName, "claude-session.jsonl"),
            '{"sessionId":"claude-session","timestamp":"2026-05-05T11:00:00Z"}\n'
          );
          yield* writeText(openClawUnitPath, "[Service]\nEnvironment=OPENCLAW_GATEWAY_TOKEN=super-secret-token\n");

          const result = yield* discoverAiMetricsSources(
            new AiMetricsSourceDiscoveryInput({
              hashSalt: "test-salt",
              homeDir,
              includeAll: true,
              openClawUnitPath,
              repoRoot,
            })
          );
          const json = yield* sourceDiscoveryToJson(result);

          expect(result.hashSaltStatus).toBe("provided");
          expect(result.discoveredFileCount).toBe(3);
          expect(result.sources).toEqual(
            expect.arrayContaining([
              expect.objectContaining({ fileCount: 1, sourceKind: "codex", status: "available" }),
              expect.objectContaining({ fileCount: 1, sourceKind: "claude", status: "available" }),
              expect.objectContaining({ fileCount: 1, sourceKind: "openclaw", status: "available" }),
            ])
          );
          expect(json).toContain("gateway_metadata");
          expect(json).not.toContain(tmpDir);
          expect(json).not.toContain("super-secret-token");
        })
      ).pipe(Effect.provide(NodeServices.layer));
    })
  );
});
