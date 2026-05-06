import { aiMetricsCommand } from "@beep/repo-cli/commands/AIMetrics/index";
import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Layer, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as Str from "effect/String";
import * as TestConsole from "effect/testing/TestConsole";
import { Command } from "effect/unstable/cli";
import { describe, expect, it } from "vitest";

const runAiMetricsCommand = Command.runWith(aiMetricsCommand, { version: "0.0.0" });
const CommandTestLayer = Layer.mergeAll(NodeServices.layer, TestConsole.layer);

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

describe("ai-metrics command", () => {
  it("emits ingest JSON without raw local paths or Claude private identifiers", async () => {
    await Effect.runPromise(
      withTempDirectory((tmpDir) =>
        Effect.gen(function* () {
          const path = yield* Path.Path;
          const inputPath = path.join(tmpDir, "claude.jsonl");
          yield* writeText(
            inputPath,
            '{"sessionId":"claude-private-session","cwd":"/private/repo/path","timestamp":"2026-05-05T11:00:00Z","message":{"role":"user"}}\n'
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
          expect(output).not.toContain("/private/repo/path");
          expect(process.exitCode ?? 0).toBe(0);
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
            "op://beep-effect/ai-metrics/hash-salt",
            "--json",
          ]);

          const output = yield* loggedText();
          expect(output).toContain("dankserver");
          expect(output).toContain("hashSaltSecretRef");
          expect(output).toContain("op://beep-effect/ai-metrics/hash-salt");
          expect(process.exitCode ?? 0).toBe(0);
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
            "--json",
          ]);

          const output = yield* loggedText();
          expect(output).toContain("gateway_metadata");
          expect(output).toContain("provided");
          expect(output).not.toContain(tmpDir);
          expect(output).not.toContain("super-secret-token");
          expect(process.exitCode ?? 0).toBe(0);
        })
      )
    );
  });
});
