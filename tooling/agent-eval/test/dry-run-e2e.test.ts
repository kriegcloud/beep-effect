import { Effect, Path } from "effect";
import { describe, expect, it } from "vitest";
import { type CorrectionEntry, type PricingTable, runBenchmarkSuite } from "../src/benchmark/runner.js";
import type { AgentTaskSpec } from "../src/schemas/index.js";

describe("dry-run benchmark", () => {
  it("runs one task per category across four conditions", async () => {
    const tasks: ReadonlyArray<AgentTaskSpec> = [
      {
        id: "apps_web_01",
        title: "app",
        category: "apps_web",
        prompt: "Build chat tool route with schema validation",
        cwd: ".",
        acceptanceCommands: ["echo ok"],
        timeoutMinutes: 1,
        touchedPathAllowlist: ["apps/web/src/lib/effect/tools.ts"],
      },
      {
        id: "tooling_cli_01",
        title: "tooling",
        category: "tooling_cli",
        prompt: "Define ServiceMap service and layer",
        cwd: ".",
        acceptanceCommands: ["echo ok"],
        timeoutMinutes: 1,
        touchedPathAllowlist: ["tooling/cli/src/commands/root.ts"],
      },
      {
        id: "package_lib_01",
        title: "pkg",
        category: "package_lib",
        prompt: "Handle tagged errors with Effect.catch",
        cwd: ".",
        acceptanceCommands: ["echo ok"],
        timeoutMinutes: 1,
        touchedPathAllowlist: ["packages/common/utils/src/index.ts"],
      },
    ];

    const correctionIndex: ReadonlyArray<CorrectionEntry> = [
      {
        id: "ctx",
        keywords: ["service", "layer"],
        fact: "Use ServiceMap.Service instead of Context.Tag",
      },
    ];

    const pricingTable: PricingTable = {
      version: "2026-02-25",
      entries: [
        {
          model: "gpt-5.2",
          inputPerMillionUsd: 1,
          outputPerMillionUsd: 3,
        },
        {
          model: "claude-sonnet-4-6",
          inputPerMillionUsd: 2,
          outputPerMillionUsd: 6,
        },
      ],
      fallback: {
        model: "fallback",
        inputPerMillionUsd: 2,
        outputPerMillionUsd: 4,
      },
    };

    const pathApi = await Effect.runPromise(
      Effect.gen(function* () {
        return yield* Path.Path;
      }).pipe(Effect.provide(Path.layer))
    );

    const suite = await runBenchmarkSuite({
      tasks,
      conditions: ["current", "minimal", "adaptive", "adaptive_kg"],
      agents: ["codex", "claude"],
      trials: 1,
      simulate: true,
      repoRoot: process.cwd(),
      pathApi,
      policyOverlays: [],
      correctionIndex,
      pricingTable,
      graphiti: {
        url: "http://localhost:8000/mcp",
        groupId: "beep-dev",
      },
      strictTaskCount: 3,
      isolateInWorktree: false,
    });

    expect(suite.records.length).toBe(24);

    const current = suite.records.find(
      (record) =>
        record.task.id === "apps_web_01" && record.config.condition === "current" && record.config.agent === "codex"
    );

    const minimal = suite.records.find(
      (record) =>
        record.task.id === "apps_web_01" && record.config.condition === "minimal" && record.config.agent === "codex"
    );

    expect(current).toBeDefined();
    expect(minimal).toBeDefined();
    expect((minimal?.result.inputTokens ?? 0) < (current?.result.inputTokens ?? 0)).toBe(true);
    expect((minimal?.result.costUsd ?? 0) < (current?.result.costUsd ?? 0)).toBe(true);
  });
});
