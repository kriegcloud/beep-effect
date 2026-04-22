/**
 * Native runtime lint hotspot configuration for repository governance.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as A from "effect/Array";

/**
 * Files that currently receive blocking `no-native-runtime` severity in the legacy ESLint surface.
 *
 * Keep this list aligned with the legacy rollback lane so the repo-local checker preserves
 * the old warn-vs-error split while P3 is active.
 *
 * @example
 * ```ts
 * import { NO_NATIVE_RUNTIME_ERROR_FILES } from "@beep/repo-configs/eslint/NoNativeRuntimeHotspots"
 * const firstPath = NO_NATIVE_RUNTIME_ERROR_FILES[0]
 * void firstPath
 * ```
 * @category configuration
 * @since 0.0.0
 */
export const NO_NATIVE_RUNTIME_ERROR_FILES = [
  "tooling/cli/src/commands/DocsAggregate.ts",
  "tooling/cli/src/commands/Lint/index.ts",
  "tooling/cli/src/commands/Laws/index.ts",
  "tooling/cli/src/commands/Laws/EffectImports.ts",
  "tooling/cli/src/commands/Graphiti/internal/ProxyConfig.ts",
  "tooling/cli/src/commands/Graphiti/internal/ProxyServices.ts",
  "tooling/cli/src/commands/Graphiti/internal/ProxyRuntime.ts",
  ".claude/hooks/schemas/index.ts",
  ".claude/hooks/skill-suggester/index.ts",
  ".claude/hooks/subagent-init/index.ts",
  ".claude/hooks/agent-init/index.ts",
  ".claude/hooks/pattern-detector/core.ts",
] as const;

/**
 * Paths that enable the stricter hotspot-only runtime checks inside the ESLint rule logic.
 *
 * @example
 * ```ts
 * import { NO_NATIVE_RUNTIME_EXTRA_CHECK_PATTERNS } from "@beep/repo-configs/eslint/NoNativeRuntimeHotspots"
 * const firstPattern = NO_NATIVE_RUNTIME_EXTRA_CHECK_PATTERNS[0]
 * void firstPattern
 * ```
 * @category configuration
 * @since 0.0.0
 */
export const NO_NATIVE_RUNTIME_EXTRA_CHECK_PATTERNS = [
  /^packages\/ai\/sdk\/src\/core\/AgentSdkConfig\.ts$/,
  /^packages\/ai\/sdk\/src\/core\/SessionConfig\.ts$/,
  /^packages\/ai\/sdk\/src\/core\/Diagnose\.ts$/,
  /^packages\/ai\/sdk\/src\/core\/Storage\/SessionIndexStore\.ts$/,
  /^tooling\/cli\/src\/commands\/DocsAggregate\.ts$/,
  /^tooling\/cli\/src\/commands\/Lint\/index\.ts$/,
  /^tooling\/cli\/src\/commands\/Laws\/index\.ts$/,
  /^tooling\/cli\/src\/commands\/Laws\/EffectImports\.ts$/,
  /^tooling\/cli\/src\/commands\/Laws\/TerseEffect\.ts$/,
  /^tooling\/cli\/src\/commands\/Graphiti\/internal\/ProxyConfig\.ts$/,
  /^tooling\/cli\/src\/commands\/Graphiti\/internal\/ProxyServices\.ts$/,
  /^tooling\/cli\/src\/commands\/Graphiti\/internal\/ProxyRuntime\.ts$/,
  /^\.claude\/hooks\/schemas\/index\.ts$/,
  /^\.claude\/hooks\/skill-suggester\/index\.ts$/,
  /^\.claude\/hooks\/subagent-init\/index\.ts$/,
  /^\.claude\/hooks\/agent-init\/index\.ts$/,
  /^\.claude\/hooks\/pattern-detector\/core\.ts$/,
] as const;

/**
 * Check whether a file path matches the native runtime error file allowlist.
 *
 * @param relativeFilePath - Repo-relative file path to test against the explicit allowlist.
 * @returns `true` when the file is allowlisted for native runtime tagged errors.
 * @example
 * ```ts
 * import { isNoNativeRuntimeErrorFile } from "@beep/repo-configs/eslint/NoNativeRuntimeHotspots"
 * const matches = isNoNativeRuntimeErrorFile("tooling/cli/src/commands/Lint/index.ts")
 * void matches
 * ```
 * @category predicates
 * @since 0.0.0
 */
export const isNoNativeRuntimeErrorFile = (relativeFilePath: string): boolean =>
  A.some(NO_NATIVE_RUNTIME_ERROR_FILES, (filePath) => filePath === relativeFilePath);

/**
 * Check whether a file path matches a native runtime extra-check hotspot pattern.
 *
 * @param relativeFilePath - Repo-relative file path to test against hotspot patterns.
 * @returns `true` when the file path matches a native runtime hotspot pattern.
 * @example
 * ```ts
 * import { isNoNativeRuntimeExtraCheckHotspot } from "@beep/repo-configs/eslint/NoNativeRuntimeHotspots"
 * const matches = isNoNativeRuntimeExtraCheckHotspot("tooling/cli/src/commands/Laws/index.ts")
 * void matches
 * ```
 * @category predicates
 * @since 0.0.0
 */
export const isNoNativeRuntimeExtraCheckHotspot = (relativeFilePath: string): boolean =>
  A.some(NO_NATIVE_RUNTIME_EXTRA_CHECK_PATTERNS, (pattern) => pattern.test(relativeFilePath));
