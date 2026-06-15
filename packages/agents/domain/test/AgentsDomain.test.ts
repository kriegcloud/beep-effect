import { Agent, AgentMode, Turn } from "@beep/agents-domain";
import * as TurnSubpath from "@beep/agents-domain/turn";
import { AssistantBlock, ParagraphBlock, TextInline } from "@beep/agents-domain/values/AssistantContent";
import * as Agents from "@beep/shared-domain/identity/Agents";
import { baseEntityFixtureInput } from "@beep/test-utils";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

describe("@beep/agents-domain", () => {
  it("exports value schemas from the package identity", () => {
    expect(AgentMode.is.deterministic_fixture("deterministic_fixture")).toBe(true);
  });

  it("wires Agent to the agents BaseEntity identity", () => {
    expect(Agent.definition.entityId).toBe(Agents.AgentId);
    expect(Agent.definition.entityId.tableName).toBe("agents_agent");
    expect(Agent.definition.entityId.entityType).toBe("AgentsAgent");
    expect(Agent.definition.persisted.id.storageKind).toBe("entityId");
    expect(Agent.definition.persisted.mode.storageKind).toBe("literal");
  });

  it("decodes and constructs an Agent row", () => {
    const decoded = S.decodeUnknownSync(Agent)({
      ...baseEntityFixtureInput("AgentsAgent", 4),
      fixtureKey: "agent.reviewer",
      mode: "deterministic_fixture",
      name: "Reviewer Agent",
      skillFixtureKey: "skill.review",
    });
    const constructed = Agent.make(decoded);

    expect(decoded).toBeInstanceOf(Agent);
    expect(constructed).toBeInstanceOf(Agent);
    expect(constructed.entityType).toBe("AgentsAgent");
    expect(constructed.mode).toBe("deterministic_fixture");
    expect(constructed.skillFixtureKey).toBe("skill.review");
  });

  it("preserves turn compatibility exports for assistant content blocks", () => {
    expect(Turn.AssistantBlock).toBe(AssistantBlock);
    expect(Turn.AssistantContent.AssistantBlock).toBe(AssistantBlock);
    expect(TurnSubpath.AssistantBlock).toBe(AssistantBlock);
    expect(TurnSubpath.AssistantContent.AssistantBlock).toBe(AssistantBlock);

    const decoded = S.decodeUnknownSync(Turn.AssistantBlock)({
      type: "paragraph",
      children: [{ type: "text", text: "hello" }],
    });

    expect(decoded).toStrictEqual(ParagraphBlock.make({ children: [TextInline.make({ text: "hello" })] }));
  });
});
