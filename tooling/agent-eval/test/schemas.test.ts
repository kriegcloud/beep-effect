import { describe, expect, it } from "vitest";
import * as S from "effect/Schema";
import { AgentRunConfigSchema, AgentRunResultSchema, AgentTaskSpecSchema } from "../src/schemas/index.js";

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
});
