import {
  AgentSkillFrontmatter,
  AiSyncSourceMetadata,
  ClaudeMcpJson,
  CodexConfig,
  checkGeneratedArtifacts,
  checkSourceDriftWithFetcher,
  claudeMcpJsonToCodexConfig,
  codexMcpServersToClaudeMcpJson,
  junieMcpJsonToClaudeMcpJson,
  normalizeAgentSkillFrontmatter,
  normalizeInstructionDocument,
  V1_SCHEMA_COVERAGE,
  V1_TRANSFORM_EVIDENCE,
  validateRepoConfig,
} from "@beep/ai-sync";
import { renderGeneratedSchemas } from "@beep/ai-sync/generator";
import { NodeServices } from "@effect/platform-node";
import { expect, layer } from "@effect/vitest";
import { Effect, Exit, FileSystem, Path } from "effect";
import * as A from "effect/Array";
import type { TUnsafe } from "@beep/types";
import type { Layer } from "effect";

const withTempDirectory = <A, E, R>(use: (tmpDir: string) => Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      return yield* fs.makeTempDirectory();
    }),
    use,
    (tmpDir) =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        yield* fs.remove(tmpDir, { recursive: true, force: true });
      })
  );

const writeText = Effect.fn("AiSyncTest.writeText")(function* (filePath: string, content: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  yield* fs.makeDirectory(path.dirname(filePath), { recursive: true });
  yield* fs.writeFileString(filePath, content);
});

layer(NodeServices.layer as Layer.Layer<TUnsafe.Any>)("@beep/ai-sync", (it) => {
  it.effect(
    "validates the generated artifact set offline",
    Effect.fn(function* () {
      const report = yield* checkGeneratedArtifacts();
      expect(report.findings).toEqual([]);
    })
  );

  it.effect(
    "renders generated literal domains through LiteralKit",
    Effect.fn(function* () {
      const generatedSchemas = renderGeneratedSchemas();
      expect(generatedSchemas).toContain('import { LiteralKit, UnknownRecord } from "@beep/schema";');
      expect(generatedSchemas).toContain("approval_policy: LiteralKit([");
      expect(generatedSchemas).toContain("sandbox_mode: LiteralKit([");
      expect(generatedSchemas).toContain("type: LiteralKit([");
      expect(generatedSchemas).not.toContain("approval_policy: S.Union(");
      expect(generatedSchemas).not.toContain("sandbox_mode: S.Union(");
      expect(generatedSchemas).not.toContain("type: S.Union(");
    })
  );

  it.effect(
    "validates a Codex TOML config and rejects typed invalid fields",
    Effect.fn(function* () {
      yield* withTempDirectory(
        Effect.fn(function* (tmpDir) {
          const path = yield* Path.Path;
          yield* writeText(
            path.join(tmpDir, ".codex/config.toml"),
            'model = "gpt-5"\n\n[skills]\ninclude_instructions = true\n\n[[skills.config]]\nname = "effect-first-development"\nenabled = true\n'
          );

          const valid = yield* validateRepoConfig({ repoRoot: tmpDir, config: ".codex/config.toml" });
          expect(valid.schemaId).toBe("codex-config");

          yield* writeText(
            path.join(tmpDir, ".codex/config.toml"),
            'model = "gpt-5"\n\n[skills]\ninclude_instructions = "definitely"\n'
          );
          const invalid = yield* Effect.exit(validateRepoConfig({ repoRoot: tmpDir, config: ".codex/config.toml" }));
          expect(Exit.isFailure(invalid)).toBe(true);
          expect(String(invalid)).toContain('["skills"]["include_instructions"]');
        })
      );
    })
  );

  it.effect(
    "reports synthetic source drift against an injected upstream response",
    Effect.fn(function* () {
      const source = AiSyncSourceMetadata.make({
        id: "synthetic",
        agent: "codex",
        domain: "config",
        tier: "tier_1",
        url: "https://example.com/schema.json",
        contentHash: "expected",
        isOfficial: true,
        driftMechanism: "hash",
      });

      const findings = yield* checkSourceDriftWithFetcher({
        sources: [source],
        fetcher: () => Effect.succeed("different"),
      });
      expect(findings).toHaveLength(1);
      expect(findings[0]?.sourceId).toBe("synthetic");
    })
  );

  it.effect(
    "round-trips Codex-compatible MCP fields through Claude-style MCP JSON",
    Effect.fn(function* () {
      const transformed = codexMcpServersToClaudeMcpJson(
        CodexConfig.make({
          mcp_servers: {
            shadcn: {
              command: "npx",
              args: ["-y", "shadcn@4.7.0", "mcp"],
            },
          },
        })
      );

      expect(transformed).toBeInstanceOf(ClaudeMcpJson);
      expect(transformed.mcpServers.shadcn?.command).toBe("npx");
      expect(transformed.mcpServers.shadcn?.args).toEqual(["-y", "shadcn@4.7.0", "mcp"]);

      const roundTripped = claudeMcpJsonToCodexConfig(transformed);
      expect(roundTripped.mcp_servers?.shadcn?.command).toBe("npx");
      expect(roundTripped.mcp_servers?.shadcn?.args).toEqual(["-y", "shadcn@4.7.0", "mcp"]);
    })
  );

  it.effect(
    "round-trips the modeled Junie and Claude MCP JSON shape",
    Effect.fn(function* () {
      const config = ClaudeMcpJson.make({
        mcpServers: {
          local: {
            type: "stdio",
            command: "node",
            args: ["mcp.js"],
          },
        },
      });

      const roundTripped = junieMcpJsonToClaudeMcpJson(config);
      expect(roundTripped.mcpServers.local?.command).toBe("node");
    })
  );

  it.effect(
    "normalizes lossy instruction and shared skill transform candidates",
    Effect.fn(function* () {
      expect(normalizeInstructionDocument("# Rules  \n\nUse Effect.  ")).toBe("# Rules\n\nUse Effect.");
      const skill = normalizeAgentSkillFrontmatter(
        AgentSkillFrontmatter.make({ name: "effect-first-development", description: "Use Effect patterns" })
      );
      expect(skill.name).toBe("effect-first-development");
    })
  );

  it.effect(
    "keeps unsupported and unknown V1 cells explicit",
    Effect.fn(function* () {
      expect(A.some(V1_SCHEMA_COVERAGE, (cell) => cell.status === "unknown_schema")).toBe(true);
      expect(A.some(V1_SCHEMA_COVERAGE, (cell) => cell.status === "na")).toBe(true);
      expect(A.some(V1_TRANSFORM_EVIDENCE, (entry) => entry.status === "declined")).toBe(true);
    })
  );
});
