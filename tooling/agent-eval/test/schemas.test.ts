import {
  AgentBenchSuiteSchema,
  AgentRunConfigSchema,
  AgentRunResultSchema,
  AgentRunTranscriptSchema,
  AgentTaskSpecSchema,
  EffectV4EvidenceFactSchema,
  FailureSignatureSchema,
} from "@beep/agent-eval/schemas/index";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

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

  it("decodes legacy suite payload without completion metadata", () => {
    const decode = S.decodeUnknownSync(AgentBenchSuiteSchema);
    const suite = decode({
      formatVersion: 1,
      runAtEpochMs: 1,
      strictTaskCount: 1,
      conditions: ["current"],
      records: [
        {
          config: {
            agent: "codex",
            model: "gpt-5.2",
            condition: "current",
            trial: 1,
          },
          task: {
            id: "apps_web_01",
            title: "task",
            category: "apps_web",
            prompt: "prompt",
            cwd: ".",
            acceptanceCommands: ["bun run lint"],
            timeoutMinutes: 1,
            touchedPathAllowlist: ["apps/web/src/app/api/chat/route.ts"],
          },
          result: {
            runId: "r",
            taskId: "apps_web_01",
            success: true,
            checkPass: true,
            lintPass: true,
            testPass: true,
            wrongApiIncidentCount: 0,
            steps: 1,
            inputTokens: 1,
            outputTokens: 1,
            costUsd: 0.01,
            wallMs: 1.5,
          },
          selectedPolicyIds: ["core"],
          selectedSkills: ["effect-v4-errors"],
          correctionFacts: ["fact"],
          retrievedFacts: ["fact"],
          allowlistPass: true,
          touchedPaths: ["apps/web/src/app/api/chat/route.ts"],
          transcript: null,
          failureSignature: null,
        },
      ],
    });

    expect(suite.records.length).toBe(1);
    expect(suite.status).toBeUndefined();
  });

  it("decodes suite payload with incomplete metadata", () => {
    const decode = S.decodeUnknownSync(AgentBenchSuiteSchema);
    const suite = decode({
      formatVersion: 1,
      runAtEpochMs: 1,
      strictTaskCount: 1,
      conditions: ["current"],
      status: "aborted_wall_cap",
      plannedRunCount: 8,
      completedRunCount: 3,
      abortReason: "Reached max wall clock budget",
      records: [],
    });

    expect(suite.status).toBe("aborted_wall_cap");
    expect(suite.plannedRunCount).toBe(8);
    expect(suite.completedRunCount).toBe(3);
  });

  it("decodes suite payload with run metadata and transcript backend fields", () => {
    const decode = S.decodeUnknownSync(AgentBenchSuiteSchema);
    const suite = decode({
      formatVersion: 1,
      runAtEpochMs: 1,
      strictTaskCount: 1,
      conditions: ["minimal"],
      runMode: "live",
      executionBackend: "mixed",
      matrixFingerprint: "apps_web_01|minimal|codex|1",
      records: [
        {
          config: {
            agent: "codex",
            model: "gpt-5.2",
            condition: "minimal",
            trial: 1,
          },
          task: {
            id: "apps_web_01",
            title: "task",
            category: "apps_web",
            prompt: "prompt",
            cwd: ".",
            acceptanceCommands: ["bun run lint"],
            timeoutMinutes: 1,
            touchedPathAllowlist: ["apps/web/src/app/api/chat/route.ts"],
          },
          result: {
            runId: "r",
            taskId: "apps_web_01",
            success: false,
            checkPass: false,
            lintPass: false,
            testPass: false,
            wrongApiIncidentCount: 0,
            steps: 1,
            inputTokens: 1,
            outputTokens: 1,
            costUsd: 0.01,
            wallMs: 1.5,
          },
          selectedPolicyIds: ["core"],
          selectedSkills: ["effect-v4-errors"],
          correctionFacts: ["fact"],
          retrievedFacts: ["fact"],
          allowlistPass: true,
          touchedPaths: ["apps/web/src/app/api/chat/route.ts"],
          transcript: {
            runId: "r",
            taskId: "apps_web_01",
            agent: "codex",
            model: "gpt-5.2",
            command: "codex-sdk runStreamed model=gpt-5.2",
            promptPacket: "prompt",
            rawOutput: "{}",
            assistantText: "ok",
            inputTokens: 1,
            outputTokens: 1,
            costUsd: 0.01,
            touchedPaths: ["apps/web/src/app/api/chat/route.ts"],
            backend: "sdk",
            completionObserved: true,
            exitCode: null,
            signal: null,
          },
          failureSignature: {
            id: "sig",
            runId: "r",
            taskId: "apps_web_01",
            condition: "minimal",
            agent: "codex",
            failureType: "runtime",
            rootCause: "Agent command failed or timed out",
            ruleIds: [],
            touchedPaths: [],
          },
        },
      ],
    });

    expect(suite.runMode).toBe("live");
    expect(suite.executionBackend).toBe("mixed");
    expect(suite.matrixFingerprint).toBe("apps_web_01|minimal|codex|1");
    expect(suite.records[0]?.transcript?.backend).toBe("sdk");
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
