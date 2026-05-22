import { Agent, AgentMode } from "@beep/agent-capability-domain";
import * as AgentCapability from "@beep/shared-domain/identity/AgentCapability";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

const systemPrincipal = { kind: "System", component: "Runtime" } as const;

const baseEntityInput = (entityType: string, id: number) => ({
  createdAt: id,
  createdByPrincipal: systemPrincipal,
  entityType,
  id,
  orgId: 1,
  rowVersion: 1,
  schemaVersion: "0.0.0",
  source: "System",
  updatedAt: id + 1,
  updatedByPrincipal: systemPrincipal,
});

describe("@beep/agent-capability-domain", () => {
  it("exports value schemas from the package identity", () => {
    expect(AgentMode.is.deterministic_fixture("deterministic_fixture")).toBe(true);
  });

  it("wires Agent to the agent-capability BaseEntity identity", () => {
    expect(Agent.definition.entityId).toBe(AgentCapability.AgentId);
    expect(Agent.definition.entityId.tableName).toBe("agent_capability_agent");
    expect(Agent.definition.entityId.entityType).toBe("AgentCapabilityAgent");
    expect(Agent.definition.persisted.id.storageKind).toBe("entityId");
    expect(Agent.definition.persisted.mode.storageKind).toBe("literal");
  });

  it("decodes and constructs an Agent row", () => {
    const decoded = S.decodeUnknownSync(Agent)({
      ...baseEntityInput("AgentCapabilityAgent", 4),
      fixtureKey: "agent.reviewer",
      mode: "deterministic_fixture",
      name: "Reviewer Agent",
      skillFixtureKey: "skill.review",
    });
    const constructed = Agent.make(decoded);

    expect(decoded).toBeInstanceOf(Agent);
    expect(constructed).toBeInstanceOf(Agent);
    expect(constructed.entityType).toBe("AgentCapabilityAgent");
    expect(constructed.mode).toBe("deterministic_fixture");
    expect(constructed.skillFixtureKey).toBe("skill.review");
  });
});
