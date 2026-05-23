/**
 * Repo-local agent configuration validation.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { decodeTomlTextAs } from "@beep/schema/Toml";
import { Str } from "@beep/utils";
import { Effect, FileSystem, Path } from "effect";
import * as S from "effect/Schema";
import { AiSyncError, AiSyncValidationResult } from "./models.ts";
import { AgentInstructionDocument, ClaudeMcpJson, ClaudeSettings, CodexConfig } from "./schemas.ts";

const decodeJsonTextAs = <Schema extends S.Top>(schema: Schema) => S.decodeUnknownEffect(S.fromJsonString(schema));

const decodeCodexToml = decodeTomlTextAs(CodexConfig);
const decodeClaudeMcpJson = decodeJsonTextAs(ClaudeMcpJson);
const decodeClaudeSettingsJson = decodeJsonTextAs(ClaudeSettings);
const decodeInstructionDocument = S.decodeUnknownEffect(AgentInstructionDocument);

const renderValidationCause = (cause: unknown): string => Str.replaceAll(/, got [^\n)]+/g, "")(String(cause));

const validationError = (relativePath: string, schemaId: string) => (cause: unknown) =>
  AiSyncError.make({
    message: `Agent config validation failed for ${relativePath} using ${schemaId}: ${renderValidationCause(cause)}`,
    relativePath,
    schemaId,
    cause,
  });

const validateByRelativePath = (relativePath: string, content: string) => {
  if (relativePath === ".codex/config.toml") {
    return decodeCodexToml(content).pipe(
      Effect.as(AiSyncValidationResult.make({ relativePath, schemaId: "codex-config" })),
      Effect.mapError(validationError(relativePath, "codex-config"))
    );
  }
  if (relativePath === ".mcp.json") {
    return decodeClaudeMcpJson(content).pipe(
      Effect.as(AiSyncValidationResult.make({ relativePath, schemaId: "claude-mcp-json" })),
      Effect.mapError(validationError(relativePath, "claude-mcp-json"))
    );
  }
  if (relativePath === ".claude/settings.json") {
    return decodeClaudeSettingsJson(content).pipe(
      Effect.as(AiSyncValidationResult.make({ relativePath, schemaId: "claude-settings" })),
      Effect.mapError(validationError(relativePath, "claude-settings"))
    );
  }
  if (relativePath === "AGENTS.md" || relativePath === "CLAUDE.md") {
    return decodeInstructionDocument(content).pipe(
      Effect.as(AiSyncValidationResult.make({ relativePath, schemaId: "agent-instruction-document" })),
      Effect.mapError(validationError(relativePath, "agent-instruction-document"))
    );
  }
  return Effect.fail(
    AiSyncError.make({
      message: `No V1 AI sync schema is registered for ${relativePath}.`,
      relativePath,
    })
  );
};

/**
 * Validate one repo-local config file through its native schema.
 *
 * @example
 * ```ts
 * import { validateRepoConfig } from "@beep/ai-sync"
 * console.log(validateRepoConfig)
 * ```
 * @category validation
 * @since 0.0.0
 */
export const validateRepoConfig = Effect.fn("AiSync.validateRepoConfig")(function* (options: {
  readonly repoRoot: string;
  readonly config: string;
}) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const content = yield* fs.readFileString(path.join(options.repoRoot, options.config)).pipe(
    Effect.mapError((cause) =>
      AiSyncError.make({
        message: `Unable to read agent config file ${options.config}.`,
        relativePath: options.config,
        cause,
      })
    )
  );
  return yield* validateByRelativePath(options.config, content);
});

/**
 * Validate the mandatory V1 dogfood config.
 *
 * @example
 * ```ts
 * import { validateDogfoodConfig } from "@beep/ai-sync"
 * console.log(validateDogfoodConfig)
 * ```
 * @category validation
 * @since 0.0.0
 */
export const validateDogfoodConfig = Effect.fn("AiSync.validateDogfoodConfig")(function* (repoRoot: string) {
  return yield* validateRepoConfig({ repoRoot, config: ".codex/config.toml" });
});

/**
 * Resolve the repository root from the package source directory.
 *
 * @example
 * ```ts
 * import { defaultRepoRoot } from "@beep/ai-sync"
 * console.log(defaultRepoRoot)
 * ```
 * @category validation
 * @since 0.0.0
 */
export const defaultRepoRoot = Effect.fn("AiSync.defaultRepoRoot")(function* () {
  const path = yield* Path.Path;
  return path.resolve(import.meta.dirname, "..", "..", "..", "..", "..");
});

/**
 * Validate the mandatory V1 config from the current checkout.
 *
 * @example
 * ```ts
 * import { validateCurrentCheckoutDogfood } from "@beep/ai-sync"
 * console.log(validateCurrentCheckoutDogfood)
 * ```
 * @category validation
 * @since 0.0.0
 */
export const validateCurrentCheckoutDogfood = Effect.fn("AiSync.validateCurrentCheckoutDogfood")(function* () {
  const repoRoot = yield* defaultRepoRoot();
  return yield* validateDogfoodConfig(repoRoot);
});
