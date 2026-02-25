import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";
import {
  AgentRunConfigSchema,
  AgentRunResultSchema,
  AgentRunTranscriptSchema,
  AgentTaskSpecSchema,
  EffectV4EvidenceFactSchema,
  FailureSignatureSchema,
} from "../src/schemas/index.js";

describe("agent-eval schemas", () => {
  it("decodes valid task spec", () => {
    const decode = S.decodeUnknownSync(AgentTaskSpecSchema);
    const task = decode({
      id: "apps_web_01",
      title: "Web graph route reliability",
      category: "apps_web",
      prompt: "Implement robust graph search route behavior",
      cwd: ".",
      acceptanceCommands: ["bun run check"],
      timeoutMinutes: 5,
      touchedPathAllowlist: ["apps/web/src/app/api/graph/search/route.ts"],
    });
    expect(task.id).toBe("apps_web_01");
  });

  it("fails invalid run config", () => {
    const decode = S.decodeUnknownSync(AgentRunConfigSchema);
    expect(() =>
      decode({
        agent: "cursor",
        model: "x",
        condition: "current",
        trial: 1,
      })
    ).toThrow();
  });

  it("fails invalid run result", () => {
    const decode = S.decodeUnknownSync(AgentRunResultSchema);
    expect(() =>
      decode({
        runId: "r",
        taskId: "t",
        success: true,
        checkPass: true,
        lintPass: true,
        testPass: true,
        wrongApiIncidentCount: "0",
        steps: 1,
        inputTokens: 1,
        outputTokens: 1,
        costUsd: 0.1,
        wallMs: 1,
      })
    ).toThrow();
  });

  it("fails invalid transcript payload", () => {
    const decode = S.decodeUnknownSync(AgentRunTranscriptSchema);
    expect(() =>
      decode({
        runId: "run",
        taskId: "task",
        agent: "codex",
        model: "gpt-5.2",
        command: "codex exec",
        promptPacket: "prompt",
        rawOutput: "{}",
        assistantText: "ok",
        inputTokens: 5,
        outputTokens: 10,
        costUsd: 0.12,
        touchedPaths: [7],
      })
    ).toThrow();
  });

  it("fails invalid effect v4 evidence fact payload", () => {
    const decode = S.decodeUnknownSync(EffectV4EvidenceFactSchema);
    expect(() =>
      decode({
        id: "ctx-tag",
        fact: "Context.Tag replaced",
        sourceType: "external_blog",
        sourceRef: "x",
        replacement: "ServiceMap.Service",
        keywords: ["context"],
        severity: "critical",
      })
    ).toThrow();
  });

  it("fails invalid failure signature payload", () => {
    const decode = S.decodeUnknownSync(FailureSignatureSchema);
    expect(() =>
      decode({
        id: "sig",
        runId: "run",
        taskId: "task",
        condition: "adaptive",
        agent: "codex",
        failureType: "network",
        rootCause: "oops",
        ruleIds: ["context-tag"],
        touchedPaths: ["tooling/cli/src/index.ts"],
      })
    ).toThrow();
  });
});
