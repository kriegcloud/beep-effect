/**
 * Schema-first models for AI agent configuration sync and validation.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AiSyncId } from "@beep/identity/packages";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $AiSyncId.create("models");

/**
 * V1 agent identifiers.
 *
 * @example
 * ```ts
 * import { AiSyncAgentId } from "@beep/ai-sync"
 * console.log(AiSyncAgentId.Enum.codex)
 * ```
 * @category models
 * @since 0.0.0
 */
export const AiSyncAgentId = LiteralKit([
  "claude-code",
  "codex",
  "grok-build",
  "jetbrains-ai-assistant",
  "junie",
  "mcp",
  "acp",
  "rulesync",
]).pipe(
  $I.annoteSchema("AiSyncAgentId", {
    description: "Agents and cross-vendor primitives tracked by the AI sync source map.",
  })
);

/**
 * Runtime type for {@link AiSyncAgentId}.
 *
 * @example
 * ```ts
 * import type { AiSyncAgentId } from "@beep/ai-sync"
 * const agent: AiSyncAgentId = "codex"
 * console.log(agent)
 * ```
 * @category models
 * @since 0.0.0
 */
export type AiSyncAgentId = typeof AiSyncAgentId.Type;

/**
 * V1 configuration domains.
 *
 * @example
 * ```ts
 * import { AiSyncDomainId } from "@beep/ai-sync"
 * console.log(AiSyncDomainId.Enum["mcp-servers"])
 * ```
 * @category models
 * @since 0.0.0
 */
export const AiSyncDomainId = LiteralKit([
  "skills",
  "rules",
  "commands",
  "hooks",
  "plugins",
  "mcp-servers",
  "config",
  "settings",
  "plugin-manifest",
  "marketplace",
  "protocol",
  "unified-config",
]).pipe(
  $I.annoteSchema("AiSyncDomainId", {
    description: "Configuration domains covered by the V1 schema matrix.",
  })
);

/**
 * Runtime type for {@link AiSyncDomainId}.
 *
 * @example
 * ```ts
 * import type { AiSyncDomainId } from "@beep/ai-sync"
 * const domain: AiSyncDomainId = "skills"
 * console.log(domain)
 * ```
 * @category models
 * @since 0.0.0
 */
export type AiSyncDomainId = typeof AiSyncDomainId.Type;

/**
 * Source evidence tiers.
 *
 * @example
 * ```ts
 * import { AiSyncSourceTier } from "@beep/ai-sync"
 * console.log(AiSyncSourceTier.Enum.tier_1)
 * ```
 * @category models
 * @since 0.0.0
 */
export const AiSyncSourceTier = LiteralKit(["tier_1", "tier_2", "tier_3", "tier_4"]).pipe(
  $I.annoteSchema("AiSyncSourceTier", {
    description: "Evidence tier used to justify each native schema surface.",
  })
);

/**
 * Runtime type for {@link AiSyncSourceTier}.
 *
 * @example
 * ```ts
 * import type { AiSyncSourceTier } from "@beep/ai-sync"
 * const tier: AiSyncSourceTier = "tier_1"
 * console.log(tier)
 * ```
 * @category models
 * @since 0.0.0
 */
export type AiSyncSourceTier = typeof AiSyncSourceTier.Type;

/**
 * Support state for an agent/domain cell.
 *
 * @example
 * ```ts
 * import { AiSyncSupportStatus } from "@beep/ai-sync"
 * console.log(AiSyncSupportStatus.Enum.unknown_schema)
 * ```
 * @category models
 * @since 0.0.0
 */
export const AiSyncSupportStatus = LiteralKit(["supported", "na", "unknown_schema"]).pipe(
  $I.annoteSchema("AiSyncSupportStatus", {
    description: "Whether an agent/domain cell is modeled, unsupported, or intentionally unknown.",
  })
);

/**
 * Runtime type for {@link AiSyncSupportStatus}.
 *
 * @example
 * ```ts
 * import type { AiSyncSupportStatus } from "@beep/ai-sync"
 * const status: AiSyncSupportStatus = "supported"
 * console.log(status)
 * ```
 * @category models
 * @since 0.0.0
 */
export type AiSyncSupportStatus = typeof AiSyncSupportStatus.Type;

/**
 * Drift check strategy for a source.
 *
 * @example
 * ```ts
 * import { AiSyncDriftMechanism } from "@beep/ai-sync"
 * console.log(AiSyncDriftMechanism.Enum.hash)
 * ```
 * @category models
 * @since 0.0.0
 */
export const AiSyncDriftMechanism = LiteralKit([
  "version",
  "hash",
  "version_and_hash",
  "semantic_field_diff",
  "content_hash",
  "release_redirect",
]).pipe(
  $I.annoteSchema("AiSyncDriftMechanism", {
    description: "Mechanism used to detect drift for an upstream schema or documentation source.",
  })
);

/**
 * Runtime type for {@link AiSyncDriftMechanism}.
 *
 * @example
 * ```ts
 * import type { AiSyncDriftMechanism } from "@beep/ai-sync"
 * const mechanism: AiSyncDriftMechanism = "hash"
 * console.log(mechanism)
 * ```
 * @category models
 * @since 0.0.0
 */
export type AiSyncDriftMechanism = typeof AiSyncDriftMechanism.Type;

/**
 * Transform proof status.
 *
 * @example
 * ```ts
 * import { AiSyncTransformStatus } from "@beep/ai-sync"
 * console.log(AiSyncTransformStatus.Enum.lossless)
 * ```
 * @category models
 * @since 0.0.0
 */
export const AiSyncTransformStatus = LiteralKit(["lossless", "lossy", "declined"]).pipe(
  $I.annoteSchema("AiSyncTransformStatus", {
    description: "Whether a transform is proven lossless, proven lossy, or evidence-declined.",
  })
);

/**
 * Runtime type for {@link AiSyncTransformStatus}.
 *
 * @example
 * ```ts
 * import type { AiSyncTransformStatus } from "@beep/ai-sync"
 * const status: AiSyncTransformStatus = "lossless"
 * console.log(status)
 * ```
 * @category models
 * @since 0.0.0
 */
export type AiSyncTransformStatus = typeof AiSyncTransformStatus.Type;

/**
 * Metadata for one upstream source.
 *
 * @example
 * ```ts
 * import { AiSyncSourceMetadata } from "@beep/ai-sync"
 * const source = AiSyncSourceMetadata.make({
 *   id: "codex-config",
 *   agent: "codex",
 *   domain: "config",
 *   tier: "tier_1",
 *   url: "https://example.com/schema.json",
 *   isOfficial: true,
 *   driftMechanism: "hash"
 * })
 * console.log(source.id)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiSyncSourceMetadata extends S.Class<AiSyncSourceMetadata>($I`AiSyncSourceMetadata`)(
  {
    id: S.String,
    agent: AiSyncAgentId,
    domain: AiSyncDomainId,
    tier: AiSyncSourceTier,
    url: S.String,
    versionPin: S.optionalKey(S.String),
    contentHash: S.optionalKey(S.String),
    isOfficial: S.Boolean,
    driftMechanism: AiSyncDriftMechanism,
  },
  $I.annote("AiSyncSourceMetadata", {
    description: "Source tier, pin, and drift metadata for one upstream evidence item.",
  })
) {}

/**
 * Support matrix cell.
 *
 * @example
 * ```ts
 * import { AiSyncSchemaCell } from "@beep/ai-sync"
 * const cell = AiSyncSchemaCell.make({
 *   agent: "codex",
 *   domain: "config",
 *   status: "supported",
 *   rationale: "Codex publishes a JSON schema."
 * })
 * console.log(cell.status)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiSyncSchemaCell extends S.Class<AiSyncSchemaCell>($I`AiSyncSchemaCell`)(
  {
    agent: AiSyncAgentId,
    domain: AiSyncDomainId,
    status: AiSyncSupportStatus,
    sourceId: S.optionalKey(S.String),
    rationale: S.String,
  },
  $I.annote("AiSyncSchemaCell", {
    description: "Agent/domain support status and rationale.",
  })
) {}

/**
 * Drift difference for one upstream source.
 *
 * @example
 * ```ts
 * import { AiSyncDriftFinding } from "@beep/ai-sync"
 * const finding = AiSyncDriftFinding.make({
 *   sourceId: "codex-config",
 *   expectedHash: "old",
 *   actualHash: "new",
 *   message: "Source moved"
 * })
 * console.log(finding.sourceId)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiSyncDriftFinding extends S.Class<AiSyncDriftFinding>($I`AiSyncDriftFinding`)(
  {
    sourceId: S.String,
    expectedHash: S.String,
    actualHash: S.String,
    message: S.String,
  },
  $I.annote("AiSyncDriftFinding", {
    description: "Structured drift finding for a source whose current content differs from the committed pin.",
  })
) {}

/**
 * Drift check report.
 *
 * @example
 * ```ts
 * import { AiSyncDriftReport } from "@beep/ai-sync"
 * const report = AiSyncDriftReport.make({ mode: "local", findings: [] })
 * console.log(report.findings.length)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiSyncDriftReport extends S.Class<AiSyncDriftReport>($I`AiSyncDriftReport`)(
  {
    mode: LiteralKit(["local", "strict", "refresh"]),
    findings: S.Array(AiSyncDriftFinding),
  },
  $I.annote("AiSyncDriftReport", {
    description: "Result of a local, strict, or refresh-oriented drift check.",
  })
) {}

/**
 * Transform proof metadata.
 *
 * @example
 * ```ts
 * import { AiSyncTransformEvidence } from "@beep/ai-sync"
 * const evidence = AiSyncTransformEvidence.make({
 *   id: "codex-mcp-to-claude-mcp",
 *   status: "lossless",
 *   sourceAgent: "codex",
 *   targetAgent: "claude-code",
 *   domain: "mcp-servers",
 *   rationale: "Both shapes preserve command, args, env, and url."
 * })
 * console.log(evidence.status)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiSyncTransformEvidence extends S.Class<AiSyncTransformEvidence>($I`AiSyncTransformEvidence`)(
  {
    id: S.String,
    status: AiSyncTransformStatus,
    sourceAgent: AiSyncAgentId,
    targetAgent: AiSyncAgentId,
    domain: AiSyncDomainId,
    rationale: S.String,
  },
  $I.annote("AiSyncTransformEvidence", {
    description: "Evidence ledger entry for a V1 transform candidate.",
  })
) {}

/**
 * Validation success record for a repo-local config file.
 *
 * @example
 * ```ts
 * import { AiSyncValidationResult } from "@beep/ai-sync"
 * const result = AiSyncValidationResult.make({
 *   relativePath: ".codex/config.toml",
 *   schemaId: "codex-config"
 * })
 * console.log(result.relativePath)
 * ```
 * @category validation
 * @since 0.0.0
 */
export class AiSyncValidationResult extends S.Class<AiSyncValidationResult>($I`AiSyncValidationResult`)(
  {
    relativePath: S.String,
    schemaId: S.String,
  },
  $I.annote("AiSyncValidationResult", {
    description: "Successful validation result for a repo-local agent config file.",
  })
) {}

/**
 * Typed AI sync operational error.
 *
 * @example
 * ```ts
 * import { AiSyncError } from "@beep/ai-sync"
 * const error = AiSyncError.make({ message: "Validation failed" })
 * console.log(error._tag)
 * ```
 * @category errors
 * @since 0.0.0
 */
export class AiSyncError extends TaggedErrorClass<AiSyncError>($I`AiSyncError`)(
  "AiSyncError",
  {
    message: S.String,
    sourceId: S.optionalKey(S.String),
    relativePath: S.optionalKey(S.String),
    schemaId: S.optionalKey(S.String),
    cause: S.optionalKey(S.Defect({ includeStack: true })),
  },
  $I.annote("AiSyncError", {
    description: "Typed operational error for AI sync generation, drift checks, transforms, and validation.",
  })
) {}
