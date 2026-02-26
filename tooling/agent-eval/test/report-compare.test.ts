import { renderComparisonMarkdown } from "@beep/agent-eval/benchmark/compare";
import { renderBenchmarkMarkdown } from "@beep/agent-eval/benchmark/report";
import type { AgentBenchSuite } from "@beep/agent-eval/schemas/index";
import { describe, expect, it } from "vitest";

const emptySuite = (status?: AgentBenchSuite["status"]): AgentBenchSuite => ({
  formatVersion: 1,
  runAtEpochMs: 1,
  strictTaskCount: 1,
  conditions: ["current"],
  runMode: "simulate",
  executionBackend: "cli",
  matrixFingerprint: "apps_web_01|current|codex|1",
  status,
  plannedRunCount: 1,
  completedRunCount: status === "aborted_wall_cap" ? 0 : 1,
  abortReason: status === "aborted_wall_cap" ? "Reached max wall clock budget" : undefined,
  records: [],
});

describe("benchmark markdown renderers", () => {
  it("renders incomplete suite warning in report", () => {
    const markdown = renderBenchmarkMarkdown(emptySuite("aborted_wall_cap"), "Report");
    expect(markdown.includes("status: aborted_wall_cap")).toBe(true);
    expect(markdown.includes("WARNING: Suite is incomplete")).toBe(true);
  });

  it("renders incomplete suite warning in compare", () => {
    const markdown = renderComparisonMarkdown(emptySuite("completed"), emptySuite("aborted_wall_cap"), "Compare");
    expect(markdown.includes("baselineStatus: completed")).toBe(true);
    expect(markdown.includes("candidateStatus: aborted_wall_cap")).toBe(true);
    expect(markdown.includes("WARNING: One or both suites are incomplete")).toBe(true);
  });

  it("renders non-comparable warning when run mode differs", () => {
    const baseline: AgentBenchSuite = {
      ...emptySuite("completed"),
      runMode: "simulate",
      matrixFingerprint: "apps_web_01|current|codex|1",
    };
    const candidate: AgentBenchSuite = {
      ...emptySuite("completed"),
      runMode: "live",
      matrixFingerprint: "apps_web_01|current|codex|1",
    };

    const markdown = renderComparisonMarkdown(baseline, candidate, "Compare");
    expect(markdown.includes("NON-COMPARABLE")).toBe(true);
    expect(markdown.includes("runMode differs")).toBe(true);
  });
});
