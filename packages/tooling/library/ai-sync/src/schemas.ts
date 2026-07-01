/**
 * Native AI agent configuration schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AiSyncId } from "@beep/identity/packages";
import { UnknownRecord } from "@beep/schema";
import * as S from "effect/Schema";
import {
  ClaudeMcpJson,
  ClaudeSettings,
  CodexConfig,
  CodexMcpServer,
  CodexSkillEntry,
  CodexSkills,
  McpJsonServer,
} from "./_generated/schemas.gen.ts";

const $I = $AiSyncId.create("schemas");

/**
 * Agent instruction markdown document.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { AgentInstructionDocument } from "@beep/ai-sync"
 *
 * const document = S.decodeUnknownSync(AgentInstructionDocument)("# Rules")
 * console.log(document.startsWith("#"))
 * ```
 * @category schemas
 * @since 0.0.0
 */
export const AgentInstructionDocument = S.NonEmptyString.pipe(
  $I.annoteSchema("AgentInstructionDocument", {
    description: "Non-empty markdown instructions read by agents such as Codex, Claude Code, Grok Build, and Junie.",
  })
);

/**
 * Runtime type for {@link AgentInstructionDocument}.
 *
 * @example
 * ```ts
 * import type { AgentInstructionDocument } from "@beep/ai-sync"
 * const document: AgentInstructionDocument = "# Instructions"
 * console.log(document)
 * ```
 * @category schemas
 * @since 0.0.0
 */
export type AgentInstructionDocument = typeof AgentInstructionDocument.Type;

/**
 * Generic agent skill frontmatter shared by compatible agents.
 *
 * @example
 * ```ts
 * import { AgentSkillFrontmatter } from "@beep/ai-sync"
 *
 * const frontmatter = AgentSkillFrontmatter.make({
 *   name: "effect-first-development",
 *   description: "Use Effect patterns"
 * })
 * console.log(frontmatter.name)
 * ```
 * @category schemas
 * @since 0.0.0
 */
export class AgentSkillFrontmatter extends S.Class<AgentSkillFrontmatter>($I`AgentSkillFrontmatter`)(
  {
    name: S.String,
    description: S.String,
  },
  $I.annote("AgentSkillFrontmatter", {
    description: "Common skill frontmatter fields shared by Claude Code, Codex, Grok Build, and Junie skill packages.",
  })
) {}

/**
 * Unknown native schema marker for documented-but-undisclosed surfaces.
 *
 * @example
 * ```ts
 * import { UnknownNativeSchemaCell } from "@beep/ai-sync"
 * const cell = UnknownNativeSchemaCell.make({
 *   agent: "grok-build",
 *   domain: "hooks",
 *   reason: "Native hook payload schema is not public."
 * })
 * console.log(cell.reason)
 * ```
 * @category schemas
 * @since 0.0.0
 */
export class UnknownNativeSchemaCell extends S.Class<UnknownNativeSchemaCell>($I`UnknownNativeSchemaCell`)(
  {
    agent: S.String,
    domain: S.String,
    reason: S.String,
  },
  $I.annote("UnknownNativeSchemaCell", {
    description: "Explicit marker for an undocumented native surface that V1 must not model by guesswork.",
  })
) {}

/**
 * Documentation-backed generic command metadata.
 *
 * @example
 * ```ts
 * import { AgentCommandMetadata } from "@beep/ai-sync"
 * const command = AgentCommandMetadata.make({ name: "review", description: "Review the repo" })
 * console.log(command.name)
 * ```
 * @category schemas
 * @since 0.0.0
 */
export class AgentCommandMetadata extends S.Class<AgentCommandMetadata>($I`AgentCommandMetadata`)(
  {
    name: S.String,
    description: S.String,
    arguments: S.Array(S.String).pipe(S.optionalKey),
  },
  $I.annote("AgentCommandMetadata", {
    description: "Portable metadata for agents with documented custom command concepts.",
  })
) {}

/**
 * Generic package/plugin manifest metadata used only where a native schema is known.
 *
 * @example
 * ```ts
 * import { AgentPluginManifestMetadata } from "@beep/ai-sync"
 * const manifest = AgentPluginManifestMetadata.make({ name: "example", version: "0.0.0" })
 * console.log(manifest.version)
 * ```
 * @category schemas
 * @since 0.0.0
 */
export class AgentPluginManifestMetadata extends S.Class<AgentPluginManifestMetadata>($I`AgentPluginManifestMetadata`)(
  {
    name: S.String,
    version: S.String,
    description: S.String.pipe(S.optionalKey),
    metadata: UnknownRecord.pipe(S.optionalKey),
  },
  $I.annote("AgentPluginManifestMetadata", {
    description: "Plugin manifest metadata for documented plugin surfaces.",
  })
) {}

/**
 * Generated Codex config schema, Claude-style MCP JSON, and settings schemas.
 *
 * @category schemas
 * @since 0.0.0
 */
export { ClaudeMcpJson, ClaudeSettings, CodexConfig, CodexMcpServer, CodexSkillEntry, CodexSkills, McpJsonServer };
