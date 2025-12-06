/**
 * @file DocgenAgentService - Effect service for AI agent operations.
 *
 * This service provides the core AI agent functionality:
 * - Token counting and usage tracking
 * - Package fixing with AI assistance
 * - Durable workflow execution
 *
 * Uses @effect/workflow for optional crash-resilient execution.
 *
 * @module docgen/agents/service
 */

import type * as ToolingUtils from "@beep/tooling-utils";
import { findRepoRoot, type NoSuchFileError } from "@beep/tooling-utils/repo";
import type {
  AiError,
  HttpRequestError,
  HttpResponseError,
  MalformedInput,
  MalformedOutput,
  UnknownError,
} from "@effect/ai/AiError";
import * as Chat from "@effect/ai/Chat";
import * as LanguageModel from "@effect/ai/LanguageModel";
import * as AnthropicClient from "@effect/ai-anthropic/AnthropicClient";
import * as AnthropicLanguageModel from "@effect/ai-anthropic/AnthropicLanguageModel";
import type { PlatformError } from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as NodeHttpClient from "@effect/platform-node/NodeHttpClient";
import * as A from "effect/Array";
import * as Config from "effect/Config";
import * as Console from "effect/Console";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import type * as Redacted from "effect/Redacted";
import * as Ref from "effect/Ref";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import { analyzePackage } from "../shared/ast.js";
import { loadDocgenConfig } from "../shared/config.js";
import type { ExportAnalysis } from "../types.ts";
import type { AgentError } from "./errors.js";
import { DOC_FIXER_SYSTEM_PROMPT } from "./prompts.js";
import type { PackageFixResult } from "./schemas.js";
import { DocFixerToolkitLive } from "./tool-handlers.js";

// -----------------------------------------------------------------------------
// Token Counter Service
// -----------------------------------------------------------------------------

/**
 * Token usage statistics interface.
 *
 * @category Models
 * @since 0.1.0
 */
export interface TokenStats {
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly totalTokens: number;
  readonly reasoningTokens: number;
  readonly cachedInputTokens: number;
}

/**
 * Service for tracking token usage across agent interactions.
 *
 * @category Services
 * @since 0.1.0
 */
export class TokenCounter extends Effect.Service<TokenCounter>()("TokenCounter", {
  effect: Effect.gen(function* () {
    const inputTokensRef = yield* Ref.make(0);
    const outputTokensRef = yield* Ref.make(0);
    const reasoningTokensRef = yield* Ref.make(0);
    const cachedInputTokensRef = yield* Ref.make(0);

    return {
      recordUsage: (usage: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
        reasoningTokens?: number;
        cachedInputTokens?: number;
      }) =>
        Effect.gen(function* () {
          yield* Ref.update(inputTokensRef, (n) => n + (usage.inputTokens ?? 0));
          yield* Ref.update(outputTokensRef, (n) => n + (usage.outputTokens ?? 0));
          yield* Ref.update(reasoningTokensRef, (n) => n + (usage.reasoningTokens ?? 0));
          yield* Ref.update(cachedInputTokensRef, (n) => n + (usage.cachedInputTokens ?? 0));
        }),

      getStats: Effect.gen(function* () {
        const inputTokens = yield* Ref.get(inputTokensRef);
        const outputTokens = yield* Ref.get(outputTokensRef);
        const reasoningTokens = yield* Ref.get(reasoningTokensRef);
        const cachedInputTokens = yield* Ref.get(cachedInputTokensRef);

        return {
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          reasoningTokens,
          cachedInputTokens,
        };
      }),

      reset: Effect.gen(function* () {
        yield* Ref.set(inputTokensRef, 0);
        yield* Ref.set(outputTokensRef, 0);
        yield* Ref.set(reasoningTokensRef, 0);
        yield* Ref.set(cachedInputTokensRef, 0);
      }),

      displayStats: Effect.gen(function* () {
        const stats = yield* Effect.gen(function* () {
          const inputTokens = yield* Ref.get(inputTokensRef);
          const outputTokens = yield* Ref.get(outputTokensRef);
          const reasoningTokens = yield* Ref.get(reasoningTokensRef);
          const cachedInputTokens = yield* Ref.get(cachedInputTokensRef);
          return { inputTokens, outputTokens, reasoningTokens, cachedInputTokens };
        });

        const formatter = Intl.NumberFormat("en-US");
        yield* Console.log(`Token Usage:`);
        yield* Console.log(`  Input:     ${formatter.format(stats.inputTokens)}`);
        yield* Console.log(`  Output:    ${formatter.format(stats.outputTokens)}`);
        yield* Console.log(`  Total:     ${formatter.format(stats.inputTokens + stats.outputTokens)}`);
        if (stats.cachedInputTokens > 0) {
          yield* Console.log(`  Cached:    ${formatter.format(stats.cachedInputTokens)}`);
        }
      }),
    };
  }),
}) {}

// -----------------------------------------------------------------------------
// Service Definition
// -----------------------------------------------------------------------------

/**
 * Service interface for docgen agent operations.
 *
 * @category Services
 * @since 0.1.0
 */
export interface DocgenAgentService {
  /**
   * Fix JSDoc documentation for a single package.
   * All dependencies (Chat, LanguageModel, FileSystem, Path) are provided internally.
   */
  readonly fixPackage: (
    packagePath: string
  ) => Effect.Effect<
    PackageFixResult,
    AgentError | HttpRequestError | HttpResponseError | UnknownError | MalformedOutput | MalformedInput
  >;

  /**
   * Fix JSDoc documentation for multiple packages.
   * All dependencies are provided internally.
   */
  readonly fixPackages: (
    packagePaths: ReadonlyArray<string>,
    concurrency: number
  ) => Effect.Effect<
    ReadonlyArray<PackageFixResult>,
    AgentError | UnknownError | HttpRequestError | MalformedOutput | MalformedInput | HttpResponseError
  >;

  /**
   * Get current token usage statistics.
   */
  readonly getTokenStats: Effect.Effect<TokenStats>;
}

/**
 * DocgenAgentService context tag.
 *
 * @category Context
 * @since 0.1.0
 */
export const DocgenAgentService = Context.GenericTag<DocgenAgentService>("DocgenAgentService");

/**
 * Create the DocgenAgentService implementation.
 *
 * The service captures all AI dependencies at construction time and provides
 * them internally when executing methods - so callers don't need to provide
 * Chat or LanguageModel in their context.
 *
 * @category Constructors
 * @since 0.1.0
 */
export const make = (config: {
  model: string;
  maxTokens: number;
  maxIterations: number;
  dryRun: boolean;
}): Effect.Effect<
  DocgenAgentService,
  PlatformError | NoSuchFileError,
  TokenCounter | LanguageModel.LanguageModel | Path.Path | FileSystem.FileSystem | ToolingUtils.FsUtils.FsUtils
> =>
  Effect.gen(function* () {
    const tokenCounter = yield* TokenCounter;
    const path = yield* Path.Path;
    const fs = yield* FileSystem.FileSystem;
    const repoRoot = yield* findRepoRoot;

    // Capture dependencies at construction time to provide them internally
    const languageModel = yield* LanguageModel.LanguageModel;
    const runtimeLayer = Layer.mergeAll(
      Layer.succeed(LanguageModel.LanguageModel, languageModel),
      Layer.succeed(FileSystem.FileSystem, fs),
      Layer.succeed(Path.Path, path)
    );

    const fixPackageDirect = (packagePath: string): Effect.Effect<PackageFixResult, AgentError | AiError> =>
      Effect.gen(function* () {
        const startTime = DateTime.unsafeNow();
        const absolutePath = path.resolve(repoRoot, packagePath);

        // Load config with provided layer for FileSystem/Path access
        const docgenConfig = yield* loadDocgenConfig(absolutePath).pipe(
          Effect.catchAll(() => Effect.succeed({ srcDir: "src", exclude: A.empty<string>() })),
          Effect.provide(runtimeLayer)
        );

        const srcDir = docgenConfig.srcDir ?? "src";
        const exclude = docgenConfig.exclude ?? A.empty();

        // Analyze package
        const exports = yield* analyzePackage(absolutePath, srcDir, exclude).pipe(
          Effect.match({
            onFailure: A.empty<ExportAnalysis>,
            onSuccess: (exports) => exports,
          })
        );

        const exportsWithMissing = F.pipe(
          exports,
          A.filter((e) => A.isNonEmptyReadonlyArray(e.missingTags))
        );

        if (A.isEmptyArray(exportsWithMissing)) {
          const endTime = DateTime.unsafeNow();
          return {
            packageName: packagePath,
            packagePath: absolutePath,
            success: true,
            exportsFixed: 0,
            exportsRemaining: 0,
            validationPassed: true,
            errors: A.empty<string>(),
            durationMs: DateTime.toEpochMillis(endTime) - DateTime.toEpochMillis(startTime),
            tokenUsage: {
              inputTokens: 0,
              outputTokens: 0,
              totalTokens: 0,
              reasoningTokens: 0,
              cachedInputTokens: 0,
            },
          };
        }

        if (config.dryRun) {
          const endTime = DateTime.unsafeNow();
          return {
            packageName: packagePath,
            packagePath: absolutePath,
            success: true,
            exportsFixed: 0,
            exportsRemaining: A.length(exportsWithMissing),
            validationPassed: true,
            errors: A.empty<string>(),
            durationMs: DateTime.toEpochMillis(endTime) - DateTime.toEpochMillis(startTime),
            tokenUsage: {
              inputTokens: 0,
              outputTokens: 0,
              totalTokens: 0,
              reasoningTokens: 0,
              cachedInputTokens: 0,
            },
          };
        }

        // Group by file
        const fileGroups = F.pipe(
          exportsWithMissing,
          A.groupBy((e) => e.filePath)
        );

        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        let filesFixed = 0;

        for (const [relativePath, fileExports] of F.pipe(fileGroups, Struct.entries, A.fromIterable)) {
          const filePath = path.resolve(absolutePath, relativePath);

          // Read file content using captured fs with provided layer
          const content = yield* fs.readFileString(filePath).pipe(
            Effect.catchAll(() => Effect.succeed("")),
            Effect.provide(runtimeLayer)
          );

          if (Str.isEmpty(content)) continue;

          const allMissingTags = F.pipe(
            fileExports,
            A.flatMap((e) => e.missingTags),
            A.dedupe
          );

          const prompt = `Fix the JSDoc documentation in this file. Add the following missing tags: ${F.pipe(allMissingTags, A.join(", "))}

File: ${relativePath}

\`\`\`typescript
${content}
\`\`\`

Return the complete file with all JSDoc tags properly added.`;

          // Use Chat.fromPrompt with the captured runtime layer
          const chat = yield* Chat.fromPrompt([{ role: "system", content: DOC_FIXER_SYSTEM_PROMPT }]).pipe(
            Effect.provide(runtimeLayer)
          );

          const response = yield* chat.generateText({ prompt }).pipe(Effect.provide(runtimeLayer));

          totalInputTokens += response.usage?.inputTokens ?? 0;
          totalOutputTokens += response.usage?.outputTokens ?? 0;

          yield* tokenCounter.recordUsage({
            inputTokens: response.usage?.inputTokens ?? 0,
            outputTokens: response.usage?.outputTokens ?? 0,
          });

          // Write updated file using captured fs with provided layer
          yield* fs.writeFileString(filePath, response.text).pipe(
            Effect.catchAll(() => Effect.void),
            Effect.provide(runtimeLayer)
          );

          filesFixed += A.length(fileExports);
        }

        const endTime = DateTime.unsafeNow();

        return {
          packageName: packagePath,
          packagePath: absolutePath,
          success: true,
          exportsFixed: filesFixed,
          exportsRemaining: A.length(exportsWithMissing) - filesFixed,
          validationPassed: true,
          errors: A.empty<string>(),
          durationMs: DateTime.toEpochMillis(endTime) - DateTime.toEpochMillis(startTime),
          tokenUsage: {
            inputTokens: totalInputTokens,
            outputTokens: totalOutputTokens,
            totalTokens: totalInputTokens + totalOutputTokens,
            reasoningTokens: 0,
            cachedInputTokens: 0,
          },
        };
      });

    return DocgenAgentService.of({
      fixPackage: (packagePath) => fixPackageDirect(packagePath),

      fixPackages: (packagePaths, concurrency) =>
        Effect.forEach(packagePaths, (p) => fixPackageDirect(p), {
          concurrency: Math.max(1, concurrency),
        }),

      getTokenStats: tokenCounter.getStats,
    });
  });

// -----------------------------------------------------------------------------
// Layers
// -----------------------------------------------------------------------------

/**
 * AnthropicLanguageModel layer.
 *
 * @category Layers
 * @since 0.1.0
 */
export const ModelLayer = (model: string) =>
  AnthropicLanguageModel.layer({
    model,
    config: { max_tokens: 8192 },
  });

/**
 * AnthropicClient layer with config from environment.
 *
 * @category Layers
 * @since 0.1.0
 */
export const ClientLayer = AnthropicClient.layerConfig({
  apiKey: Config.redacted("AI_ANTHROPIC_API_KEY").pipe(
    Config.map(O.some),
    Config.orElse(() => Config.succeed(O.none<Redacted.Redacted>())),
    Config.map(O.getOrUndefined)
  ),
});

/**
 * Live implementation of DocgenAgentService.
 *
 * @category Layers
 * @since 0.1.0
 */
export const DocgenAgentServiceLive = (options: {
  readonly model: string;
  readonly maxTokens?: number;
  readonly maxIterations?: number;
  readonly dryRun?: boolean;
}) =>
  Layer.effect(
    DocgenAgentService,
    make({
      model: options.model,
      maxTokens: options.maxTokens ?? 8192,
      maxIterations: options.maxIterations ?? 20,
      dryRun: options.dryRun ?? false,
    })
  ).pipe(
    Layer.provide(TokenCounter.Default),
    Layer.provide(ModelLayer(options.model)),
    Layer.provide(ClientLayer),
    Layer.provide(NodeHttpClient.layer),
    Layer.provide(DocFixerToolkitLive)
  );
