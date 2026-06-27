/**
 * Schema-first AI agent configuration schemas, source metadata, drift checks,
 * and validated transforms.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Drift-check helpers.
 *
 * @example
 * ```ts
 * import { checkGeneratedArtifacts } from "@beep/ai-sync"
 * console.log(checkGeneratedArtifacts)
 * ```
 * @category services
 * @since 0.0.0
 */
export * from "./drift.ts";
/**
 * Public data models for source metadata, support status, drift reports, and
 * transform evidence.
 *
 * @example
 * ```ts
 * import { AiSyncAgentId } from "@beep/ai-sync"
 * console.log(AiSyncAgentId.Enum.codex)
 * ```
 * @category models
 * @since 0.0.0
 */
export * from "./models.ts";
/**
 * Native agent configuration schemas.
 *
 * @example
 * ```ts
 * import { CodexConfig } from "@beep/ai-sync"
 * console.log(CodexConfig.ast)
 * ```
 * @category schemas
 * @since 0.0.0
 */
export * from "./schemas.ts";
/**
 * Source-map constants and V1 support matrix.
 *
 * @example
 * ```ts
 * import { V1_SCHEMA_COVERAGE } from "@beep/ai-sync"
 * console.log(V1_SCHEMA_COVERAGE.length)
 * ```
 * @category constants
 * @since 0.0.0
 */
export * from "./source-map.ts";
/**
 * Cross-agent transforms whose semantics are proven for V1.
 *
 * @example
 * ```ts
 * import { codexMcpServersToClaudeMcpJson } from "@beep/ai-sync"
 * console.log(codexMcpServersToClaudeMcpJson)
 * ```
 * @category interop
 * @since 0.0.0
 */
export * from "./transforms.ts";
/**
 * Repo-local validation helpers.
 *
 * @example
 * ```ts
 * import { validateRepoConfig } from "@beep/ai-sync"
 * console.log(validateRepoConfig)
 * ```
 * @category validation
 * @since 0.0.0
 */
export * from "./validation.ts";
