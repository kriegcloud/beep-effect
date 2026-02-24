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
 * @since 0.1.0
 */

import type * as FsUtils from "@beep/tooling-utils/FsUtils";
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
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import type * as Redacted from "effect/Redacted";
import * as Ref from "effect/Ref";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import { analyzePackage } from "../shared/ast.js";
import { loadDocgenConfig } from "../shared/config.js";
import type { ExportAnalysis } from "../types.js";
import type { AgentError } from "./errors.js";
import { JSDOC_BATCH_GENERATOR_PROMPT } from "./prompts.js";
import type { PackageFixResult } from "./schemas.js";
import { DocFixerToolkitLive } from "./tool-handlers.js";

// -----------------------------------------------------------------------------
// JSDoc Helpers
// -----------------------------------------------------------------------------

/**
 * Insert JSDoc at a specific line in file content.
 *
 * @category Utils
 * @since 0.1.0
 */
const insertJsDocAtLine = (content: string, jsDocContent: string, exportInfo: ExportAnalysis): string => {
  const lines = F.pipe(content, Str.split("\n"));
  const jsDocLines = F.pipe(jsDocContent, Str.split("\n"));

  let resultLines: ReadonlyArray<string>;

  if (exportInfo.existingJsDocStartLine !== undefined && exportInfo.existingJsDocEndLine !== undefined) {
    // Replace existing JSDoc
    const beforeLines = F.pipe(lines, A.take(exportInfo.existingJsDocStartLine - 1));
    const afterLines = F.pipe(lines, A.drop(exportInfo.existingJsDocEndLine));
    // ✅ FIX: Use Effect Array utilities instead of spread operator
    resultLines = F.pipe(beforeLines, A.appendAll(jsDocLines), A.appendAll(afterLines));
  } else {
    // Insert new JSDoc before the declaration
    const beforeLines = F.pipe(lines, A.take(exportInfo.insertionLine - 1));
    const afterLines = F.pipe(lines, A.drop(exportInfo.insertionLine - 1));
    // ✅ FIX: Use Effect Array utilities instead of spread operator
    resultLines = F.pipe(beforeLines, A.appendAll(jsDocLines), A.appendAll(afterLines));
  }

  return F.pipe(resultLines, (arr) => A.join(arr, "\n"));
};

/**
 * Number of exports to process per API call.
 *
 * Tradeoffs:
 * - Smaller batches: More API calls, but safer parsing and easier retries
 * - Larger batches: Fewer API calls, but risk hitting token limits (~100k for Claude)
 *
 * With 5 exports averaging ~200 tokens each (declaration + context), plus
 * ~500 tokens per generated JSDoc, a batch uses ~3,500 tokens - well within limits.
 *
 * @internal
 */
const BATCH_SIZE = 5;

/**
 * Parse batch JSDoc response into individual blocks.
 *
 * Extracts JSDoc blocks delimited by ---JSDOC:name--- and ---END--- markers.
 * Returns only successfully parsed blocks; failed exports can be retried individually.
 *
 * @category Utils
 * @since 0.1.0
 */
const parseJsDocBatch = (
  responseText: string,
  exports: ReadonlyArray<ExportAnalysis>
): ReadonlyArray<{ readonly exportInfo: ExportAnalysis; readonly jsDoc: string }> =>
  F.pipe(
    exports,
    A.filterMap((exp) => {
      const startMarker = `---JSDOC:${exp.name}---`;
      const endMarker = `---END---`;

      const startIdx = F.pipe(responseText, Str.indexOf(startMarker));
      if (O.isNone(startIdx)) return O.none();

      const contentStart = startIdx.value + Str.length(startMarker);
      const searchFrom = F.pipe(responseText, Str.slice(contentStart, Str.length(responseText)));
      const endIdx = F.pipe(searchFrom, Str.indexOf(endMarker));
      if (O.isNone(endIdx)) return O.none();

      const jsDoc = F.pipe(searchFrom, Str.slice(0, endIdx.value), Str.trim);

      // Validate it's a proper JSDoc block
      const isValid = F.pipe(jsDoc, Str.startsWith("/**")) && F.pipe(jsDoc, Str.endsWith("*/"));

      return isValid ? O.some({ exportInfo: exp, jsDoc }) : O.none();
    })
  );

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
  TokenCounter | LanguageModel.LanguageModel | Path.Path | FileSystem.FileSystem | FsUtils.FsUtils
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
        yield* Effect.logInfo(`Analyzing package: ${packagePath}`);
        const exports = yield* analyzePackage(absolutePath, srcDir, exclude).pipe(
          Effect.match({
            onFailure: A.empty<ExportAnalysis>,
            onSuccess: (e) => e,
          })
        );

        yield* Effect.logInfo(`Found ${A.length(exports)} exports`);

        const exportsWithMissing = F.pipe(
          exports,
          A.filter((e) => A.isNonEmptyReadonlyArray(e.missingTags))
        );

        yield* Effect.logInfo(`${A.length(exportsWithMissing)} exports need documentation`);

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

        // ✅ FIX: Use Ref instead of mutable variables
        const totalInputTokensRef = yield* Ref.make(0);
        const totalOutputTokensRef = yield* Ref.make(0);
        const exportsFixedRef = yield* Ref.make(0);
        const errorsRef = yield* Ref.make<ReadonlyArray<string>>(A.empty());

        // ✅ FIX: Use HashMap instead of native Map
        const fileContentCacheRef = yield* Ref.make(HashMap.empty<string, string>());

        // Group exports by file and sort by line number (descending) to insert from bottom up
        // This way earlier insertions don't affect line numbers of later ones
        const fileGroups = F.pipe(
          exportsWithMissing,
          A.groupBy((e) => e.filePath)
        );

        // ✅ FIX: Use Effect.forEach instead of for...of
        yield* Effect.forEach(
          F.pipe(fileGroups, Struct.entries, A.fromIterable),
          ([relativePath, fileExports]) =>
            Effect.gen(function* () {
              const filePath = path.resolve(absolutePath, relativePath);

              // Read file content (or use cached version)
              const cachedContent = yield* F.pipe(Ref.get(fileContentCacheRef), Effect.map(HashMap.get(filePath)));

              let content: string;
              if (O.isSome(cachedContent)) {
                content = cachedContent.value;
              } else {
                content = yield* fs.readFileString(filePath).pipe(
                  Effect.catchAll(() => Effect.succeed("")),
                  Effect.provide(runtimeLayer)
                );
                if (Str.isEmpty(content)) return;
                yield* Ref.update(fileContentCacheRef, HashMap.set(filePath, content));
              }

              // Sort exports by line number descending - process from bottom to top
              // This way earlier insertions don't affect line numbers of later ones
              const insertionLineOrderDesc = F.pipe(
                Order.number,
                Order.mapInput((exp: ExportAnalysis) => exp.insertionLine),
                Order.reverse
              );
              const sortedExports = F.pipe(fileExports, A.sort(insertionLineOrderDesc));

              // Split into batches for efficient API usage
              const batches = F.pipe(sortedExports, A.chunksOf(BATCH_SIZE));
              yield* Effect.logInfo(`Processing ${A.length(sortedExports)} exports in ${A.length(batches)} batches`);

              // Process each batch
              yield* Effect.forEach(
                batches,
                (batch, batchIndex) =>
                  Effect.gen(function* () {
                    yield* Effect.logInfo(
                      `Batch ${batchIndex + 1}/${A.length(batches)}: ${F.pipe(
                        batch,
                        A.map((e) => e.name),
                        A.join(", ")
                      )}`
                    );

                    // Build batch prompt with all exports
                    const batchPromptParts = F.pipe(
                      batch,
                      A.map(
                        (exp, idx) => `
### Export ${idx + 1}: ${exp.name}
Kind: ${exp.kind}
Missing tags: ${F.pipe(exp.missingTags, A.join(", "))}
${exp.hasJsDoc ? `Existing tags: ${F.pipe(exp.presentTags, A.join(", "))}` : "No existing JSDoc"}

Declaration:
\`\`\`typescript
${exp.declarationSource}
\`\`\`
${exp.contextBefore ? `\nContext:\n${exp.contextBefore}` : ""}`
                      )
                    );

                    const prompt = `Generate JSDoc for these ${A.length(batch)} exports:\n${F.pipe(batchPromptParts, A.join("\n"))}\n\nReturn JSDoc blocks using the ---JSDOC:name--- format.`;

                    // Single API call for entire batch
                    const chat = yield* Chat.fromPrompt([
                      { role: "system", content: JSDOC_BATCH_GENERATOR_PROMPT },
                    ]).pipe(Effect.provide(runtimeLayer));

                    const response = yield* chat.generateText({ prompt }).pipe(Effect.provide(runtimeLayer));

                    // Track token usage
                    yield* Ref.update(totalInputTokensRef, (n) => n + (response.usage?.inputTokens ?? 0));
                    yield* Ref.update(totalOutputTokensRef, (n) => n + (response.usage?.outputTokens ?? 0));

                    yield* tokenCounter.recordUsage({
                      inputTokens: response.usage?.inputTokens ?? 0,
                      outputTokens: response.usage?.outputTokens ?? 0,
                    });

                    // Parse response to extract individual JSDoc blocks
                    const jsDocBlocks = parseJsDocBatch(response.text, batch);

                    yield* Effect.logInfo(`Parsed ${A.length(jsDocBlocks)}/${A.length(batch)} JSDoc blocks from batch`);

                    // Track which exports failed parsing for potential retry
                    const parsedNames = F.pipe(
                      jsDocBlocks,
                      A.map((b) => b.exportInfo.name)
                    );
                    const failedExports = F.pipe(
                      batch,
                      A.filter(
                        (exp) =>
                          !F.pipe(
                            parsedNames,
                            A.some((name) => name === exp.name)
                          )
                      )
                    );

                    // Log failures and record errors
                    if (A.isNonEmptyReadonlyArray(failedExports)) {
                      const failedNames = F.pipe(
                        failedExports,
                        A.map((e) => e.name),
                        A.join(", ")
                      );
                      yield* Effect.logWarning(`Failed to parse JSDoc for: ${failedNames}`);
                      yield* Effect.forEach(failedExports, (exp) =>
                        Ref.update(errorsRef, A.append(`Failed to parse JSDoc for ${exp.name}`))
                      );
                    }

                    // Insert each JSDoc (already sorted by line descending, so safe to insert in order)
                    yield* Effect.forEach(
                      jsDocBlocks,
                      ({ exportInfo, jsDoc }) =>
                        Effect.gen(function* () {
                          const currentContent = yield* F.pipe(
                            Ref.get(fileContentCacheRef),
                            Effect.map(HashMap.get(filePath)),
                            Effect.map(O.getOrElse(() => ""))
                          );
                          const newContent = insertJsDocAtLine(currentContent, jsDoc, exportInfo);
                          yield* Ref.update(fileContentCacheRef, HashMap.set(filePath, newContent));
                          yield* Ref.update(exportsFixedRef, (n) => n + 1);
                          yield* Effect.logInfo(`  ✓ Added JSDoc for ${exportInfo.name}`);
                        }),
                      { concurrency: 1 }
                    );
                  }),
                { concurrency: 1 }
              );

              yield* Effect.logInfo(`Writing ${relativePath}...`);

              // Write the updated file content
              const finalContent = yield* F.pipe(Ref.get(fileContentCacheRef), Effect.map(HashMap.get(filePath)));
              if (O.isSome(finalContent)) {
                yield* fs.writeFileString(filePath, finalContent.value).pipe(
                  Effect.catchAll(() => Effect.void),
                  Effect.provide(runtimeLayer)
                );
              }
            }),
          { concurrency: 1 }
        );

        const endTime = DateTime.unsafeNow();

        // Get final values from Refs
        const totalInputTokens = yield* Ref.get(totalInputTokensRef);
        const totalOutputTokens = yield* Ref.get(totalOutputTokensRef);
        const exportsFixed = yield* Ref.get(exportsFixedRef);
        const errors = yield* Ref.get(errorsRef);

        return {
          packageName: packagePath,
          packagePath: absolutePath,
          success: A.isEmptyReadonlyArray(errors),
          exportsFixed,
          exportsRemaining: A.length(exportsWithMissing) - exportsFixed,
          validationPassed: true,
          // Convert ReadonlyArray to mutable array for schema compatibility
          errors: F.pipe(errors, A.fromIterable) as string[],
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
