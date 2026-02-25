import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleBench } from "@beep/agent-eval/commands/bench";
import { AgentEvalConfigError } from "@beep/agent-eval/errors";
import { AgentEvalPlatformLayer } from "@beep/agent-eval/runtime";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(testDir, "..");
const repoRoot = path.resolve(packageRoot, "..", "..");

const baseArgs = {
  taskDirectory: path.join(repoRoot, "benchmarks/agent-reliability/tasks"),
  strictTaskCount: 18,
  smoke: false,
  smokeTaskLimit: 1,
  smokeTimeoutMinutes: 1,
  diagnostics: true,
  policyDirectory: path.join(repoRoot, ".agents/policies"),
  correctionIndexFile: path.join(repoRoot, "benchmarks/agent-reliability/effect-v4-corrections.json"),
  pricingFile: path.join(repoRoot, "benchmarks/agent-reliability/pricing.json"),
  simulate: true,
  trials: 1,
  graphitiUrl: "http://localhost:8000/mcp",
  graphitiGroupId: "beep-dev",
  isolateInWorktree: false,
  worktreeRoot: undefined,
  codexModel: "gpt-5.2",
  claudeModel: "claude-sonnet-4-6",
  claudeEffort: undefined,
  reasoningEffort: undefined,
  conditions: ["minimal"] as const,
  agents: ["codex"] as const,
  maxWallMinutes: undefined,
};

describe("bench command targeting", () => {
  it("runs a targeted dry slice from selected task ids, conditions, and agents", async () => {
    const outPrefix = `/tmp/agent-eval-targeted-${Date.now()}`;
    const suite = await Effect.runPromise(
      handleBench({
        ...baseArgs,
        output: `${outPrefix}.json`,
        reportOutput: `${outPrefix}.md`,
        progressOutput: `${outPrefix}.progress.jsonl`,
        diagnosticsOutput: `${outPrefix}.diagnostics.jsonl`,
        taskIds: ["apps_web_01", "tooling_cli_01", "package_lib_01"],
      }).pipe(Effect.provide(AgentEvalPlatformLayer))
    );

    expect(suite.records.length).toBe(3);
    expect(suite.records.every((record) => record.config.condition === "minimal")).toBe(true);
    expect(suite.records.every((record) => record.config.agent === "codex")).toBe(true);

    const diagnosticsLines = readFileSync(`${outPrefix}.diagnostics.jsonl`, "utf8");
    expect(diagnosticsLines.includes('"type":"run.diagnostic"')).toBe(true);
    expect(diagnosticsLines.includes('"type":"suite.metrics"')).toBe(true);
  });

  it("fails when selected task ids contain unknown values", async () => {
    await expect(
      Effect.runPromise(
        handleBench({
          ...baseArgs,
          output: "/tmp/agent-eval-targeted-invalid.json",
          reportOutput: "/tmp/agent-eval-targeted-invalid.md",
          progressOutput: "/tmp/agent-eval-targeted-invalid.progress.jsonl",
          diagnosticsOutput: "/tmp/agent-eval-targeted-invalid.diagnostics.jsonl",
          taskIds: ["missing_task"],
        }).pipe(Effect.provide(AgentEvalPlatformLayer))
      )
    ).rejects.toBeInstanceOf(AgentEvalConfigError);
  });
});
