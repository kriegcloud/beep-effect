import {
  AllBenchAgents,
  AllBenchConditions,
  parseBenchAgentsFlag,
  parseBenchConditionsFlag,
  parseClaudeEffortFlag,
  parseCsvFlag,
  parseMaxWallMinutesFlag,
  parseModelFlag,
  parseReasoningFlag,
  parseTaskIdsFlag,
  parseWorktreeRootFlag,
  resolveDefaultWorktreeRoot,
} from "@beep/agent-eval/commands/bench-flags";
import { describe, expect, it } from "vitest";

describe("bench flag parsing", () => {
  it("normalizes csv values with trimming and stable de-duplication", () => {
    expect(parseCsvFlag(" current, minimal ,current,adaptive ")).toEqual(["current", "minimal", "adaptive"]);
  });

  it("defaults to all conditions when flag is empty", () => {
    expect(parseBenchConditionsFlag("")).toEqual(AllBenchConditions);
  });

  it("defaults to all agents when flag is empty", () => {
    expect(parseBenchAgentsFlag("")).toEqual(AllBenchAgents);
  });

  it("throws on unknown condition values", () => {
    expect(() => parseBenchConditionsFlag("current,unknown")).toThrow();
  });

  it("throws on unknown agent values", () => {
    expect(() => parseBenchAgentsFlag("codex,cursor")).toThrow();
  });

  it("parses task ids with de-duplication", () => {
    expect(parseTaskIdsFlag("apps_web_01, tooling_cli_01,apps_web_01")).toEqual(["apps_web_01", "tooling_cli_01"]);
  });

  it("parses optional positive max wall minutes", () => {
    expect(parseMaxWallMinutesFlag(undefined)).toBeUndefined();
    expect(parseMaxWallMinutesFlag("2.5")).toBe(2.5);
  });

  it("throws on non-positive or invalid max wall minutes", () => {
    expect(() => parseMaxWallMinutesFlag("0")).toThrow();
    expect(() => parseMaxWallMinutesFlag("-1")).toThrow();
    expect(() => parseMaxWallMinutesFlag("abc")).toThrow();
  });

  it("parses optional model overrides", () => {
    expect(parseModelFlag(undefined, "--codex-model", "gpt-5.2")).toBe("gpt-5.2");
    expect(parseModelFlag(" gpt-5.3-codex-spark ", "--codex-model", "gpt-5.2")).toBe("gpt-5.3-codex-spark");
  });

  it("rejects empty model override values", () => {
    expect(() => parseModelFlag("   ", "--codex-model", "gpt-5.2")).toThrow();
  });

  it("parses claude effort level", () => {
    expect(parseClaudeEffortFlag(undefined)).toBeUndefined();
    expect(parseClaudeEffortFlag("low")).toBe("low");
    expect(parseClaudeEffortFlag("medium")).toBe("medium");
    expect(parseClaudeEffortFlag("high")).toBe("high");
  });

  it("rejects unsupported claude effort values", () => {
    expect(() => parseClaudeEffortFlag("max")).toThrow();
  });

  it("parses unified reasoning effort levels", () => {
    expect(parseReasoningFlag(undefined)).toBeUndefined();
    expect(parseReasoningFlag("none")).toBe("none");
    expect(parseReasoningFlag("minimal")).toBe("minimal");
    expect(parseReasoningFlag("low")).toBe("low");
    expect(parseReasoningFlag("medium")).toBe("medium");
    expect(parseReasoningFlag("high")).toBe("high");
    expect(parseReasoningFlag("xhigh")).toBe("xhigh");
  });

  it("rejects unsupported unified reasoning effort values", () => {
    expect(() => parseReasoningFlag("max")).toThrow();
  });

  it("parses optional worktree root and expands tilde with HOME", () => {
    expect(parseWorktreeRootFlag(undefined, "/home/alex")).toBeUndefined();
    expect(parseWorktreeRootFlag("/tmp/worktrees", "/home/alex")).toBe("/tmp/worktrees");
    expect(parseWorktreeRootFlag("~/agent-eval/worktrees", "/home/alex")).toBe("/home/alex/agent-eval/worktrees");
  });

  it("rejects invalid worktree root values", () => {
    expect(() => parseWorktreeRootFlag("   ", "/home/alex")).toThrow();
    expect(() => parseWorktreeRootFlag("~/agent-eval/worktrees", undefined)).toThrow();
  });

  it("resolves default worktree root from XDG_CACHE_HOME then HOME", () => {
    expect(resolveDefaultWorktreeRoot("/var/cache", "/home/alex")).toBe("/var/cache/beep-effect3/agent-eval/worktrees");
    expect(resolveDefaultWorktreeRoot(undefined, "/home/alex")).toBe(
      "/home/alex/.cache/beep-effect3/agent-eval/worktrees"
    );
  });

  it("fails to resolve default worktree root when XDG/HOME are unavailable", () => {
    expect(() => resolveDefaultWorktreeRoot(undefined, undefined)).toThrow();
  });
});
