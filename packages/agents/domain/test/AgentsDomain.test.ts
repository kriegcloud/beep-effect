import { Agent, AgentMode, assistantContentToDocument, TableBlock, YouTubeBlock } from "@beep/agents-domain";
import * as Md from "@beep/md/Md.model";
import * as Agents from "@beep/shared-domain/identity/Agents";
import { baseEntityFixtureInput } from "@beep/test-utils";
import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
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

  it("lifts rich assistant blocks into canonical Md nodes", () => {
    const document = assistantContentToDocument([
      {
        type: "code",
        language: "mermaid",
        code: "flowchart TD\nA --> B",
      },
      {
        type: "table",
        headerRow: true,
        rows: [
          {
            cells: [
              { children: [{ type: "text", text: "Name" }] },
              { children: [{ type: "text", text: "Value", code: true }] },
            ],
          },
        ],
      },
      {
        type: "youtube",
        videoId: "dQw4w9WgXcQ",
      },
    ]);

    expect(document.children).toEqual([
      Md.Pre.make({ language: O.some("mermaid"), value: "flowchart TD\nA --> B" }),
      Md.Table.make({
        headerRow: true,
        children: [
          Md.TableRow.make({
            children: [
              Md.TableCell.make({ children: [Md.Text.make({ value: "Name" })] }),
              Md.TableCell.make({ children: [Md.Code.make({ value: "Value" })] }),
            ],
          }),
        ],
      }),
      Md.YouTube.make({ videoId: "dQw4w9WgXcQ" }),
    ]);
  });

  it("rejects malformed assistant table and youtube blocks at the domain boundary", () => {
    expect(() =>
      S.decodeUnknownSync(TableBlock)({
        type: "table",
        rows: [
          { cells: [{ children: [{ type: "text", text: "Name" }] }] },
          {
            cells: [{ children: [{ type: "text", text: "Value" }] }, { children: [{ type: "text", text: "Extra" }] }],
          },
        ],
      })
    ).toThrow(/Tables must contain/);

    expect(() =>
      S.decodeUnknownSync(YouTubeBlock)({
        type: "youtube",
        videoId: "https://youtu.be/dQw4w9WgXcQ",
      })
    ).toThrow(/YouTube blocks/);
  });
});
