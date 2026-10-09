import {
  parseTrialSessionIdentity,
  parseTrialUsage,
  TrialUsageReportJson,
} from "@beep/repo-cli/test/AgentEffectiveness";
import { Sha256Hex } from "@beep/schema/Sha256";
import { describe, expect, it } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import claude from "./fixtures/agent-effectiveness/native-usage/claude.jsonl?raw";
import codex from "./fixtures/agent-effectiveness/native-usage/codex.jsonl?raw";
import grok from "./fixtures/agent-effectiveness/native-usage/grok.jsonl?raw";

describe("observed native usage receipts", () => {
  it.effect("keeps Codex input inclusive of cache and unknown requests", () =>
    Effect.gen(function* () {
      const report = yield* parseTrialUsage("codex", codex, []);
      expect(report.coverage).toBe("complete");
      expect(report.identityCoverage).toBe("unknown");
      expect(report.hostModels).toEqual([]);
      assertSome(report.usage.inputTokens, 28606);
      assertSome(report.usage.cacheReadInputTokens, 26368);
      assertSome(report.usage.outputTokens, 123);
      assertNone(report.usage.requestCount);
      expect(report.usage.inputAccounting).toBe("includes-cache");
      assertNone(report.selectedToolCalls);
      assertSome(report.nativeSelectedToolCalls, 0);
      assertNone(report.cliSelectedToolCalls);
      expect(report.adoptionCoverage).toBe("native-only");
    })
  );
  it.effect("uses Claude terminal total instead of summing assistant samples", () =>
    Effect.gen(function* () {
      const report = yield* parseTrialUsage("claude", claude, ["Read"]);
      assertSome(report.usage.inputTokens, 4);
      assertSome(report.usage.outputTokens, 160);
      assertSome(report.usage.cacheWriteInputTokens, 5231);
      assertSome(report.usage.cacheReadInputTokens, 26227);
      expect(report.usage.inputAccounting).toBe("excludes-cache");
      expect(report.toolNames).toContain("Read");
      expect(report.childUsage).toBe("unavailable");
      expect(report.hostModels.map((observed) => observed.model)).toEqual(["claude-opus-5-5"]);
      expect(report.identityCoverage).toBe("model-only");
      expect(report.hostEfforts).toEqual([]);
    })
  );
  it.effect("does not count Grok request deltas twice with end totals", () =>
    Effect.gen(function* () {
      const report = yield* parseTrialUsage("grok", grok, []);
      assertSome(report.usage.inputTokens, 14459);
      assertSome(report.usage.outputTokens, 210);
      assertSome(report.usage.cacheReadInputTokens, 15360);
      assertSome(report.usage.requestCount, 2);
      expect(report.samples).toHaveLength(3);
      expect(report.hostModels.map((observed) => observed.model)).toEqual(["grok-4.7-build"]);
      expect(report.identityCoverage).toBe("model-only");
      expect(report.toolNames).toHaveLength(1);
    })
  );
  it.effect("retains malformed/trailing-line gaps without fabricated totals", () =>
    Effect.gen(function* () {
      const report = yield* parseTrialUsage("codex", `${codex}{"type":`, []);
      expect(report.coverage).toBe("malformed");
      expect(report.malformedLines).toHaveLength(1);
      assertNone(report.usage.inputTokens);
      assertNone(report.selectedToolCalls);
      const empty = yield* parseTrialUsage("grok", "", []);
      expect(empty.coverage).toBe("missing-terminal");
      assertNone(empty.usage.requestCount);
    })
  );
  it.effect("rejects ambiguous cumulative terminal replay", () =>
    Effect.gen(function* () {
      const report = yield* parseTrialUsage("grok", grok + grok, []);
      expect(report.coverage).toBe("ambiguous-terminal");
      assertNone(report.usage.outputTokens);
    })
  );
  it.effect("keeps host scope explicit and incomplete model call counts unknown", () =>
    Effect.gen(function* () {
      const report = yield* parseTrialUsage(
        "grok",
        '{"type":"end","usage":{"input_tokens":5,"output_tokens":2},"modelUsage":{"host":{},"child":{"modelCalls":1}}}',
        []
      );
      assertNone(report.usage.requestCount);
      expect(report.usage.observedScope).toBe("host");
      expect(report.usage.childCoverage).toBe("unknown");
      expect(report.usage.aggregateBasis).toBe("terminal-cumulative");
      const noCalls = yield* parseTrialUsage("grok", '{"type":"end","usage":{},"modelUsage":{}}', []);
      assertNone(noCalls.usage.requestCount);
    })
  );
  it.effect("round-trips explicit null counts and retained native fields", () =>
    Effect.gen(function* () {
      const parsed = yield* parseTrialUsage("claude", claude, ["Read"]);
      const encoded = yield* TrialUsageReportJson.encode(parsed);
      expect(encoded).toContain('"requestCount":null');
      expect(encoded).toContain('"childCoverage":"unknown"');
      const decoded = yield* TrialUsageReportJson.decode(encoded);
      expect(decoded).toEqual(parsed);
      assertSome(decoded.usage.reasoningOutputTokens, 0);
    })
  );
});

it.effect("projects source-bound parent and child identities without inventing effort or child completeness", () =>
  Effect.gen(function* () {
    const artifact = { path: "/private/0.raw", digest: Sha256Hex.make("0".repeat(64)) };
    const codexChild = yield* parseTrialSessionIdentity("codex", [
      {
        artifact,
        relativePath: ".codex/sessions/a.jsonl",
        raw:
          '{"type":"session_meta","payload":{"source":{"subagent":{"thread_spawn":{"parent_thread_id":"parent"}}}}}\n' +
          '{"type":"turn_context","payload":{"model":"gpt-6.1-sol","effort":"medium","secret":"DO_NOT_PROJECT"}}\n',
      },
    ]);
    expect(codexChild.observations[0]?.scope).toBe("child");
    assertSome(codexChild.observations[0]!.effort, "medium");
    expect(codexChild.childCoverage).toBe("unknown");
    expect(JSON.stringify(codexChild)).not.toContain("DO_NOT_PROJECT");
    const claudeChild = yield* parseTrialSessionIdentity("claude", [
      {
        artifact,
        relativePath: ".claude/projects/-workspace/subagents/agent-a.jsonl",
        raw: '{"type":"assistant","message":{"model":"claude-opus-5-5","usage":{}}}',
      },
    ]);
    expect(claudeChild.observations[0]?.scope).toBe("child");
    assertNone(claudeChild.observations[0]!.effort);
    const grok = yield* parseTrialSessionIdentity("grok", [
      {
        artifact,
        relativePath: ".grok/sessions/a/summary.json",
        raw: '{\n "current_model_id":"grok-4.7", "reasoning_effort":"medium", "credential":"DO_NOT_PROJECT"\n}',
      },
    ]);
    expect(grok.observations[0]?.layer).toBe("selected-session-metadata");
    expect(grok.observations[0]?.scope).toBe("unknown");
    expect(JSON.stringify(grok)).not.toContain("DO_NOT_PROJECT");
    const linkedGrok = yield* parseTrialSessionIdentity("grok", [
      {
        artifact,
        relativePath: ".grok/sessions/root/parent/subagents/child/meta.json",
        raw: '{"subagent_id":"child","parent_session_id":"parent","effective_model_id":"grok-4.7"}',
      },
      {
        artifact,
        relativePath: ".grok/sessions/root/child/summary.json",
        raw: '{"current_model_id":"grok-4.7","reasoning_effort":"medium"}',
      },
    ]);
    expect(linkedGrok.observations.map((observed) => observed.scope)).toEqual(["child", "child"]);
    expect(linkedGrok.childCoverage).toBe("unknown");

    expect(
      (yield* parseTrialSessionIdentity("codex", [{ artifact, relativePath: "a", raw: "broken" }])).malformedLines
    ).toBe(1);
  })
);
