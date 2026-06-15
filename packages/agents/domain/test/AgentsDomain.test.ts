import { readdirSync, readFileSync } from "node:fs";
import * as Path from "node:path";
import { fileURLToPath } from "node:url";
import { Agent, AgentMode, assistantContentToDocument, TableBlock, Turn, YouTubeBlock } from "@beep/agents-domain";
import * as TurnSubpath from "@beep/agents-domain/turn";
import {
  AssistantBlock,
  AssistantContent,
  ParagraphBlock,
  TextInline,
} from "@beep/agents-domain/values/AssistantContent";
import * as Md from "@beep/md/Md.model";
import * as Agents from "@beep/shared-domain/identity/Agents";
import { baseEntityFixtureInput } from "@beep/test-utils";
import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));
const assistantContentSchemaId = (schema: { readonly ast: { readonly annotations: Record<string, unknown> } }) =>
  String(schema.ast.annotations.schemaId);
const readRepoFile = (relativePath: string) => readFileSync(Path.join(repoRoot, relativePath), "utf8");
const repoRelativePath = (absolutePath: string) => Path.relative(repoRoot, absolutePath).split(Path.sep).join("/");
const collectAgentsSourceFiles = (directory: string): ReadonlyArray<string> => {
  const sourceFiles: Array<string> = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "dist" || entry.name === "docs" || entry.name === "node_modules" || entry.name.startsWith(".")) {
      continue;
    }

    const entryPath = Path.join(directory, entry.name);
    if (entry.isDirectory()) {
      sourceFiles.push(...collectAgentsSourceFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entryPath.endsWith(".ts") && entryPath.includes(`${Path.sep}src${Path.sep}`)) {
      sourceFiles.push(entryPath);
    }
  }

  return sourceFiles.sort();
};
const turnCompatibilityBarrelImportPattern =
  /^\s*import\s+(?:type\s+)?[\s\S]*?\s+from\s+["']@beep\/agents-domain(?:\/turn)?["'];?/gmu;
const assistantContentSymbolPattern = /\b(?:AssistantBlock|AssistantContent)\b/u;

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
      assistantContentSchemaId(AssistantBlock)
    );
    expect(assistantContentSchemaId(Turn.AssistantContent.AssistantContent)).toBe(
      assistantContentSchemaId(AssistantContent)
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

  it("keeps agents source code off assistant content compatibility barrel imports", () => {
    const violations = collectAgentsSourceFiles(Path.join(repoRoot, "packages/agents")).flatMap((sourcePath) => {
      const sourceText = readRepoFile(repoRelativePath(sourcePath));
      const forbiddenImports = [...sourceText.matchAll(turnCompatibilityBarrelImportPattern)]
        .map((match) => match[0])
        .filter((importDeclaration) => assistantContentSymbolPattern.test(importDeclaration));

      return forbiddenImports.map((importDeclaration) => ({
        importDeclaration,
        sourcePath: repoRelativePath(sourcePath),
      }));
    });

    expect(violations).toEqual([]);
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
