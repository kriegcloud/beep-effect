/**
 * @file Durable activities for docgen workflow.
 * Each activity's result is persisted and replayed on workflow resume.
 * @module docgen/agents/activities
 * @since 1.0.0
 */

import { HttpRequestError, HttpResponseError, MalformedInput, MalformedOutput, UnknownError } from "@effect/ai/AiError";
import * as Chat from "@effect/ai/Chat";
import { PlatformError } from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Activity from "@effect/workflow/Activity";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Schedule from "effect/Schedule";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { DocgenConfigError, TsMorphError } from "../errors.js";
import { analyzePackage } from "../shared/ast.js";
import { loadDocgenConfig } from "../shared/config.js";
import { AgentApiError, AgentToolError, AnalysisError } from "./errors.js";
import { DOC_FIXER_SYSTEM_PROMPT } from "./prompts.js";
import {
  AICallResult,
  AnalysisResult,
  ConfigResult,
  ReadFileResult,
  ValidationResult,
  WriteResult,
} from "./schemas.js";
// -----------------------------------------------------------------------------
// Activity: ReadConfig
// -----------------------------------------------------------------------------

/**
 * Read and parse the docgen configuration for a package.
 * @category Activities
 * @since 0.1.0
 */
export const ReadConfigActivity = (packagePath: string) =>
  Activity.make({
    name: `ReadConfig-${F.pipe(packagePath, Str.replaceAll("/", "_"))}`,
    success: ConfigResult,
    error: DocgenConfigError,
    execute: Effect.gen(function* () {
      const config = yield* loadDocgenConfig(packagePath);
      return {
        packagePath,
        srcDir: config.srcDir ?? "src",
        exclude: config.exclude ?? A.empty<string>(),
      };
    }),
  });

// -----------------------------------------------------------------------------
// Activity: AnalyzePackage
// -----------------------------------------------------------------------------

/**
 * Analyze a package to identify exports needing documentation.
 * @category Activities
 * @since 0.1.0
 */
export const AnalyzePackageActivity = (packagePath: string, srcDir: string, exclude: ReadonlyArray<string>) =>
  Activity.make({
    name: `AnalyzePackage-${F.pipe(packagePath, Str.replaceAll("/", "_"))}`,
    success: AnalysisResult,
    error: S.Union(TsMorphError, AnalysisError),
    execute: Effect.gen(function* () {
      const exports = yield* analyzePackage(packagePath, srcDir, exclude);

      const filesToFix = F.pipe(
        exports,
        A.filter((e) => A.isNonEmptyReadonlyArray(e.missingTags)),
        A.map((e) => ({
          filePath: e.filePath,
          exportName: e.name,
          missingTags: e.missingTags,
        }))
      );

      return {
        packagePath,
        exportCount: A.length(exports),
        missingCount: A.length(filesToFix),
        filesToFix,
      };
    }),
  });

// -----------------------------------------------------------------------------
// Activity: CallAI
// -----------------------------------------------------------------------------

/**
 * Call the AI model to fix JSDoc in a file.
 * @category Activities
 * @since 0.1.0
 */
export const CallAIActivity = (filePath: string, fileContent: string, missingTags: ReadonlyArray<string>) =>
  Activity.make({
    name: `CallAI-${F.pipe(filePath, Str.replaceAll("/", "_"))}`,
    success: AICallResult,
    error: S.Union(HttpRequestError, AgentApiError, HttpResponseError, MalformedInput, MalformedOutput, UnknownError),
    execute: Effect.gen(function* () {
      const prompt = `Fix the JSDoc documentation in this file. Add the following missing tags: ${F.pipe(missingTags, A.join(", "))}

File content:
\`\`\`typescript
${fileContent}
\`\`\`

Return the complete file with all JSDoc tags properly added.`;

      const chat = yield* Chat.fromPrompt([{ role: "system", content: DOC_FIXER_SYSTEM_PROMPT }]);

      const response = yield* chat.generateText({ prompt });

      return {
        filePath,
        content: response.text,
        tokensUsed: response.usage?.totalTokens ?? 0,
        inputTokens: response.usage?.inputTokens ?? 0,
        outputTokens: response.usage?.outputTokens ?? 0,
      };
    }),
    interruptRetryPolicy: Schedule.exponential("100 millis", 1.5).pipe(
      Schedule.union(Schedule.spaced("10 seconds")),
      Schedule.union(Schedule.recurs(5))
    ),
  });

// -----------------------------------------------------------------------------
// Activity: WriteFile
// -----------------------------------------------------------------------------

/**
 * Write updated content to a source file.
 * @category Activities
 * @since 0.1.0
 */
export const WriteFileActivity = (filePath: string, content: string) =>
  Activity.make({
    name: `WriteFile-${F.pipe(filePath, Str.replaceAll("/", "_"))}`,
    success: WriteResult,
    error: S.Union(AgentToolError, PlatformError),
    execute: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      yield* fs.writeFileString(filePath, content);

      return {
        filePath,
        bytesWritten: new TextEncoder().encode(content).length,
        success: true,
      };
    }),
  });

// -----------------------------------------------------------------------------
// Activity: ReadFile
// -----------------------------------------------------------------------------

/**
 * Read a source file for AI processing.
 * @category Activities
 * @since 0.1.0
 */
export const ReadFileActivity = (filePath: string) =>
  Activity.make({
    name: `ReadFile-${F.pipe(filePath, Str.replaceAll("/", "_"))}`,
    success: ReadFileResult,
    error: S.Union(AgentToolError, PlatformError),
    execute: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const content = yield* fs.readFileString(filePath);
      const lines = F.pipe(content, Str.split("\n"));

      return {
        filePath,
        content,
        lineCount: A.length(lines),
      };
    }),
  });

// -----------------------------------------------------------------------------
// Activity: ValidateExamples
// -----------------------------------------------------------------------------

/**
 * Validate that JSDoc examples compile correctly.
 * @category Activities
 * @since 0.1.0
 */
export const ValidateExamplesActivity = (packagePath: string) =>
  Activity.make({
    name: `ValidateExamples-${F.pipe(packagePath, Str.replaceAll("/", "_"))}`,
    success: ValidationResult,
    error: AgentToolError,
    execute: Effect.gen(function* () {
      yield* Effect.logInfo(`Validating examples for: ${packagePath}`);

      // TODO: Implement actual validation via @effect/docgen
      return {
        packagePath,
        valid: true,
        errors: A.empty(),
      };
    }),
  });
