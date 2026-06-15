import { Agent, Turn } from "@beep/agents-domain";
import * as TurnSubpath from "@beep/agents-domain/turn";
import { describe, expect, it } from "tstyche";
import type { AgentMode, AgentMode as AgentModeType } from "@beep/agents-domain";
import type { AssistantBlock, AssistantContent } from "@beep/agents-domain/values/AssistantContent";
import type * as Agents from "@beep/shared-domain/identity/Agents";

declare const agent: Agent;

describe("@beep/agents-domain", () => {
  it("preserves exported value schema types", () => {
    expect<AgentMode>().type.toBe<AgentModeType>();
    expect<AgentModeType>().type.toBe<"deterministic_fixture">();
  });

  it("preserves Agent BaseEntity identity wiring", () => {
    expect(Agent.definition.entityId).type.toBe<typeof Agents.AgentId>();
    expect<typeof Agent.definition.entityId.tableName>().type.toBe<"agents_agent">();
    expect<typeof Agent.definition.entityId.entityType>().type.toBe<"AgentsAgent">();
    expect<typeof Agent.definition.persisted.mode.storageKind>().type.toBe<"literal">();
    expect<typeof Agent.definition.persisted.skillFixtureKey.columnName>().type.toBe<"skill_fixture_key">();
    expect<typeof Agent.fields.mode.Type>().type.toBe<AgentModeType>();
  });

  it("preserves decode and constructor types", () => {
    expect<typeof Agent.Encoded>().type.toBeAssignableTo<typeof Agent.Encoded>();
    expect(Agent.make(agent)).type.toBe<Agent>();
    expect<Agent["mode"]>().type.toBe<AgentModeType>();
  });

  it("preserves turn compatibility export types", () => {
    expect(Turn.AssistantBlock).type.toBe<typeof AssistantBlock>();
    expect(Turn.AssistantContent.AssistantBlock).type.toBe<typeof AssistantBlock>();
    expect(Turn.AssistantContent.AssistantContent).type.toBe<typeof AssistantContent>();
    expect(TurnSubpath.AssistantBlock).type.toBe<typeof AssistantBlock>();
    expect(TurnSubpath.AssistantContent.AssistantBlock).type.toBe<typeof AssistantBlock>();
    expect(TurnSubpath.AssistantContent.AssistantContent).type.toBe<typeof AssistantContent>();
  });
});
