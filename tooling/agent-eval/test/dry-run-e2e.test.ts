import { type CorrectionEntry, type PricingTable, runBenchmarkSuite } from "@beep/agent-eval/benchmark/runner";
import type { AgentTaskSpec } from "@beep/agent-eval/schemas/index";
import { Effect, Path } from "effect";
import { describe, expect, it } from "vitest";

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

const loadPathApi = async () =>
  Effect.runPromise(
    Effect.gen(function* () {
      return yield* Path.Path;
    }).pipe(Effect.provide(Path.layer))
  );

describe("dry-run benchmark", () => {
  it("runs one task per category across four conditions", async () => {
    const pathApi = await loadPathApi();

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

  it("supports targeted condition/agent matrix slices", async () => {
    const pathApi = await loadPathApi();

    const suite = await runBenchmarkSuite({
      tasks: tasks.slice(0, 2),
      conditions: ["minimal"],
      agents: ["codex"],
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
      strictTaskCount: 2,
      isolateInWorktree: false,
    });

    expect(suite.records.length).toBe(2);
    expect(suite.records.every((record) => record.config.condition === "minimal")).toBe(true);
    expect(suite.records.every((record) => record.config.agent === "codex")).toBe(true);
    expect(suite.status).toBe("completed");
  });

  it("emits run diagnostics and suite metrics callbacks", async () => {
    const pathApi = await loadPathApi();
    const diagnostics: Array<unknown> = [];

    const suite = await runBenchmarkSuite({
      tasks: tasks.slice(0, 1),
      conditions: ["minimal"],
      agents: ["codex"],
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
      strictTaskCount: 1,
      isolateInWorktree: false,
      onDiagnostic: (event) => {
        diagnostics.push(event);
      },
    });

    expect(suite.records.length).toBe(1);
    expect(diagnostics.some((event) => JSON.stringify(event).includes('"type":"run.diagnostic"'))).toBe(true);
    expect(diagnostics.some((event) => JSON.stringify(event).includes('"type":"suite.metrics"'))).toBe(true);
  });

  it("marks suite as aborted when max wall clock cap is reached", async () => {
    const pathApi = await loadPathApi();

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
      maxWallMinutes: 0.0000001,
    });

    expect(suite.status).toBe("aborted_wall_cap");
    expect((suite.plannedRunCount ?? 0) > (suite.completedRunCount ?? 0)).toBe(true);
    expect((suite.completedRunCount ?? 0) === suite.records.length).toBe(true);
    expect(typeof suite.abortReason).toBe("string");
  });
});
