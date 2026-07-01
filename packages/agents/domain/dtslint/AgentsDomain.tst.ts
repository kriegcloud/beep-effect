import { Agent, AssistantBlock, AssistantContent } from "@beep/agents-domain";
import { describe, expect, it } from "tstyche";
import type { AgentMode, AgentMode as AgentModeType } from "@beep/agents-domain";
import type * as AssistantContentSubpath from "@beep/agents-domain/values/AssistantContent";
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

  it("preserves assistant content export types from the canonical value-object path", () => {
    expect(AssistantBlock).type.toBe<typeof AssistantContentSubpath.AssistantBlock>();
    expect(AssistantContent).type.toBe<typeof AssistantContentSubpath.AssistantContent>();
  });
});
