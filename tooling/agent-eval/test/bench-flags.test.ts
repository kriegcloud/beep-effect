import {
  AllBenchAgents,
  AllBenchConditions,
  parseBenchAgentsFlag,
  parseBenchConditionsFlag,
  parseCsvFlag,
  parseMaxWallMinutesFlag,
  parseTaskIdsFlag,
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
});
