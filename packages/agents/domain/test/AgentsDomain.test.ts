import { readFileSync } from "node:fs";
import * as Path from "node:path";
import { fileURLToPath } from "node:url";
import { Agent, AgentMode, Turn } from "@beep/agents-domain";
import * as TurnSubpath from "@beep/agents-domain/turn";
import {
  AssistantBlock,
  AssistantContent,
  ParagraphBlock,
  TextInline,
} from "@beep/agents-domain/values/AssistantContent";
import * as Agents from "@beep/shared-domain/identity/Agents";
import { baseEntityFixtureInput } from "@beep/test-utils";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));
const assistantContentSchemaId = (schema: { readonly ast: { readonly annotations: Record<string, unknown> } }) =>
  String(schema.ast.annotations.schemaId);
const readRepoFile = (relativePath: string) => readFileSync(Path.join(repoRoot, relativePath), "utf8");
const downstreamAssistantContentSources = [
  "packages/agents/use-cases/src/processes/AssistantTurn/AssistantTurn.contracts.ts",
  "packages/agents/use-cases/src/processes/AssistantTurn/AssistantTurn.fixture.ts",
  "packages/agents/use-cases/src/processes/Chat/Chat.rpc.ts",
  "packages/agents/server/src/AssistantTurn/AnthropicTurnCodec.ts",
  "packages/agents/server/src/AssistantTurn/AnthropicTurnKernel.ts",
] as const;
const turnCompatibilityBarrelImportPattern = /from\s+["']@beep\/agents-domain(?:\/turn)?["']/u;

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
    const assistantContentDocument = S.toJsonSchemaDocument(Turn.AssistantContent.AssistantContent);

    expect(Turn.AssistantBlock).toBe(AssistantBlock);
    expect(Turn.AssistantContent.AssistantBlock).toBe(AssistantBlock);
    expect(TurnSubpath.AssistantBlock).toBe(AssistantBlock);
    expect(TurnSubpath.AssistantContent.AssistantBlock).toBe(AssistantBlock);
    expect(Turn.AssistantContent.AssistantContent).toBe(AssistantContent);
    expect(TurnSubpath.AssistantContent.AssistantContent).toBe(AssistantContent);
    expect(assistantContentSchemaId(Turn.AssistantContent.AssistantBlock)).toBe(
      "Symbol(@beep/agents-domain/turn/AssistantContent/AssistantBlock)"
    );
    expect(assistantContentSchemaId(Turn.AssistantContent.AssistantContent)).toBe(
      "Symbol(@beep/agents-domain/turn/AssistantContent/AssistantContent)"
    );
    expect(assistantContentDocument.schema).toStrictEqual({ $ref: "#/$defs/AssistantContent" });
    expect(assistantContentDocument.definitions).toHaveProperty("AssistantContent");
    expect(S.toJsonSchemaDocument(Turn.AssistantBlock)).toStrictEqual(S.toJsonSchemaDocument(AssistantBlock));
    expect(S.toJsonSchemaDocument(TurnSubpath.AssistantBlock)).toStrictEqual(S.toJsonSchemaDocument(AssistantBlock));
    expect(assistantContentDocument).toStrictEqual(S.toJsonSchemaDocument(AssistantContent));

    const decoded = S.decodeUnknownSync(Turn.AssistantBlock)({
      type: "paragraph",
      children: [{ type: "text", text: "hello" }],
    });

    expect(decoded).toStrictEqual(ParagraphBlock.make({ children: [TextInline.make({ text: "hello" })] }));
  });

  it("keeps downstream assistant-turn code off the compatibility barrel", () => {
    for (const sourcePath of downstreamAssistantContentSources) {
      const sourceText = readRepoFile(sourcePath);

      expect(sourceText).toContain("@beep/agents-domain/values/AssistantContent");
      expect(sourceText).not.toMatch(turnCompatibilityBarrelImportPattern);
    }
  });
});
