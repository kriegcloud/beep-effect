/**
 * @file Durable workflow definition for docgen agents.
 * @module docgen/agents/workflow
 * @since 0.1.0
 */
import * as DurableClock from "@effect/workflow/DurableClock";
import * as Workflow from "@effect/workflow/Workflow";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Ord from "effect/Order";
import * as R from "effect/Record";
import * as Ref from "effect/Ref";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  AnalyzePackageActivity,
  CallAIActivity,
  ReadConfigActivity,
  ReadFileActivity,
  ValidateExamplesActivity,
  WriteFileActivity,
} from "./activities.js";
import { AgentApiError, AgentToolError, DocgenWorkflowError } from "./errors.js";
import { DocgenWorkflowResult, type PackageFixResult } from "./schemas.js";

// -----------------------------------------------------------------------------
// Error Mapping Helpers
// -----------------------------------------------------------------------------

/**
 * Map any error to AgentToolError for tool-related activities.
 */
const mapToToolError = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  toolName: string
): Effect.Effect<A, AgentToolError, R> =>
  Effect.mapError(effect, (e) => new AgentToolError({ toolName, message: String(e) }));

/**
 * Map any error to AgentApiError for AI-related activities.
 */
const mapToApiError = <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, AgentApiError, R> =>
  Effect.mapError(effect, (e) => new AgentApiError({ message: String(e) }));

// -----------------------------------------------------------------------------
// Workflow Definition
// -----------------------------------------------------------------------------

/**
 * The DocgenAgents workflow orchestrates documentation fixing across packages.
 * @category Workflows
 * @since 0.1.0
 */
export const DocgenAgentsWorkflow = Workflow.make({
  name: "DocgenAgentsWorkflow",
  payload: {
    packagePaths: S.Array(S.String),
    dryRun: S.Boolean,
    model: S.String,
    maxIterations: S.Number,
  },
  idempotencyKey: ({ packagePaths }) => F.pipe(packagePaths, A.sort(Ord.string), A.join(",")),
  success: DocgenWorkflowResult,
  error: DocgenWorkflowError,
});

/**
 * Workflow handler layer.
 * @category Layers
 * @since 0.1.0
 */
export const DocgenAgentsWorkflowLayer = DocgenAgentsWorkflow.toLayer(
  Effect.fn(function* (payload, executionId) {
    yield* Effect.logInfo(`Starting workflow: ${executionId}`);

    const startTime = DateTime.unsafeNow();
    const resultsRef = yield* Ref.make<ReadonlyArray<PackageFixResult>>(A.empty());
    const totalExportsFixedRef = yield* Ref.make(0);
    const totalTokensRef = yield* Ref.make(0);

    yield* Effect.forEach(
      payload.packagePaths,
      (packagePath) =>
        Effect.gen(function* () {
          yield* Effect.logInfo(`Processing package: ${packagePath}`);

          yield* DurableClock.sleep({
            name: `RateLimit-${F.pipe(packagePath, Str.replaceAll("/", "_"))}`,
            duration: "3 seconds",
            inMemoryThreshold: "60 seconds",
          });

          const packageStartTime = DateTime.unsafeNow();

          const config = yield* mapToToolError(ReadConfigActivity(packagePath), "ReadConfig");

          const analysis = yield* mapToToolError(
            AnalyzePackageActivity(packagePath, config.srcDir, config.exclude),
            "AnalyzePackage"
          );

          if (analysis.missingCount === 0) {
            yield* Effect.logInfo(`Package ${packagePath} is fully documented!`);
            yield* Ref.update(
              resultsRef,
              A.append({
                packageName: packagePath,
                packagePath,
                success: true,
                exportsFixed: 0,
                exportsRemaining: 0,
                validationPassed: true,
                errors: A.empty<string>(),
                durationMs: 0,
                tokenUsage: {
                  inputTokens: 0,
                  outputTokens: 0,
                  totalTokens: 0,
                  reasoningTokens: 0,
                  cachedInputTokens: 0,
                },
              })
            );
            return;
          }

          if (payload.dryRun) {
            yield* Effect.logInfo(`[DRY RUN] Would fix ${analysis.missingCount} exports in ${packagePath}`);
            yield* Ref.update(
              resultsRef,
              A.append({
                packageName: packagePath,
                packagePath,
                success: true,
                exportsFixed: 0,
                exportsRemaining: analysis.missingCount,
                validationPassed: true,
                errors: A.empty<string>(),
                durationMs: 0,
                tokenUsage: {
                  inputTokens: 0,
                  outputTokens: 0,
                  totalTokens: 0,
                  reasoningTokens: 0,
                  cachedInputTokens: 0,
                },
              })
            );
            return;
          }

          const packageInputTokensRef = yield* Ref.make(0);
          const packageOutputTokensRef = yield* Ref.make(0);
          const filesFixedRef = yield* Ref.make(0);

          const fileGroups = F.pipe(
            analysis.filesToFix,
            A.groupBy((f) => f.filePath)
          );

          yield* Effect.forEach(
            F.pipe(fileGroups, R.toEntries),
            ([filePath, fileExports]) =>
              Effect.gen(function* () {
                yield* DurableClock.sleep({
                  name: `AIRateLimit-${F.pipe(filePath, Str.replaceAll("/", "_"))}`,
                  duration: "2 seconds",
                });

                const fileData = yield* mapToToolError(ReadFileActivity(filePath), "ReadFile");

                const allMissingTags = F.pipe(
                  fileExports,
                  A.flatMap((e) => e.missingTags),
                  A.dedupe
                );

                const aiResult = yield* mapToApiError(CallAIActivity(filePath, fileData.content, allMissingTags));

                yield* Ref.update(packageInputTokensRef, (n) => n + aiResult.inputTokens);
                yield* Ref.update(packageOutputTokensRef, (n) => n + aiResult.outputTokens);
                yield* Ref.update(totalTokensRef, (n) => n + aiResult.tokensUsed);

                yield* mapToToolError(WriteFileActivity(filePath, aiResult.content), "WriteFile");
                yield* Ref.update(filesFixedRef, (n) => n + A.length(fileExports));
              }),
            { concurrency: 1 }
          );

          const validation = yield* mapToToolError(ValidateExamplesActivity(packagePath), "ValidateExamples");

          const packageEndTime = DateTime.unsafeNow();
          const packageDurationMs = DateTime.toEpochMillis(packageEndTime) - DateTime.toEpochMillis(packageStartTime);

          const filesFixed = yield* Ref.get(filesFixedRef);
          const packageInputTokens = yield* Ref.get(packageInputTokensRef);
          const packageOutputTokens = yield* Ref.get(packageOutputTokensRef);

          yield* Ref.update(totalExportsFixedRef, (n) => n + filesFixed);

          yield* Ref.update(
            resultsRef,
            A.append({
              packageName: packagePath,
              packagePath,
              success: validation.valid,
              exportsFixed: filesFixed,
              exportsRemaining: analysis.missingCount - filesFixed,
              validationPassed: validation.valid,
              errors: validation.errors,
              durationMs: packageDurationMs,
              tokenUsage: {
                inputTokens: packageInputTokens,
                outputTokens: packageOutputTokens,
                totalTokens: packageInputTokens + packageOutputTokens,
                reasoningTokens: 0,
                cachedInputTokens: 0,
              },
            })
          );
        }),
      { concurrency: 1 }
    );

    const endTime = DateTime.unsafeNow();
    const durationMs = DateTime.toEpochMillis(endTime) - DateTime.toEpochMillis(startTime);

    const results = yield* Ref.get(resultsRef);
    const totalExportsFixed = yield* Ref.get(totalExportsFixedRef);
    const totalTokens = yield* Ref.get(totalTokensRef);

    yield* Effect.logInfo(`Workflow complete: ${totalExportsFixed} exports fixed, ${totalTokens} tokens used`);

    return {
      results: [...results],
      totalExportsFixed,
      totalTokens,
      durationMs,
    };
  })
);
