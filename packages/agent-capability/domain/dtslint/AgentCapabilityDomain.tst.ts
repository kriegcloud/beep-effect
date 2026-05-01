import { Agent, type AgentMode, type AgentMode as AgentModeType } from "@beep/agent-capability-domain";
import type * as AgentCapability from "@beep/shared-domain/identity/AgentCapability";
import { describe, expect, it } from "tstyche";

declare const agent: typeof Agent.Type;

describe("@beep/agent-capability-domain", () => {
  it("preserves exported value schema types", () => {
    expect<typeof AgentMode.Type>().type.toBe<AgentModeType>();
    expect<AgentModeType>().type.toBe<"deterministic_fixture">();
  });

  it("preserves Agent BaseEntity identity wiring", () => {
    expect(Agent.definition.entityId).type.toBe<typeof AgentCapability.AgentId>();
    expect<typeof Agent.definition.entityId.tableName>().type.toBe<"agent_capability_agent">();
    expect<typeof Agent.definition.entityId.entityType>().type.toBe<"AgentCapabilityAgent">();
    expect<typeof Agent.definition.fieldMap.mode.storageKind>().type.toBe<"literal">();
    expect<typeof Agent.definition.fieldMap.skillFixtureKey.columnName>().type.toBe<"skill_fixture_key">();
    expect<typeof Agent.fields.mode.Type>().type.toBe<AgentModeType>();
  });

  it("preserves decode and constructor types", () => {
    expect<typeof Agent.Encoded>().type.toBeAssignableTo<typeof Agent.Encoded>();
    expect(new Agent(agent)).type.toBe<Agent>();
    expect<Agent["mode"]>().type.toBe<AgentModeType>();
  });
});
