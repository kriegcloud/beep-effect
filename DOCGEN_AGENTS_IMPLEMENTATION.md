# Docgen Agents Implementation Guide

> **Purpose**: Implementation prompt for Claude to build a programmatic agent orchestration system for automated JSDoc documentation in the beep-effect monorepo.

---

> **✅ API VERIFIED (2025-12-06)**
>
> This document has been updated with the **correct** `@effect/ai` APIs based on source code analysis.
>
> **Verified API patterns:**
> - `Tool.make(name, options)` ✅ Correct
> - `Toolkit.make(...tools)` ✅ Correct
> - `toolkit.toLayer({ handlers })` ✅ Correct
> - `Chat.empty` or `Chat.fromPrompt()` - NOT `Chat.make()`
> - `chat.generateText({ prompt })` - NOT `chat.send()`
> - `AnthropicLanguageModel.model(modelId, config)` - Returns Layer, NOT `make()`
>
> **Reference documentation:**
> - `docs/research/effect-ai-actual-api-reference.md`
> - `docs/research/tokenizer-deep-dive.md`
> - `docs/research/effect-workflow-durability.md`

---

## Executive Summary

This guide provides complete implementation details for a multi-agent documentation system that automates JSDoc coverage improvements across the beep-effect monorepo. The system leverages `@effect/ai` and `@effect/ai-anthropic` (already installed) to orchestrate Claude agents that:

1. **Discover** packages needing documentation
2. **Analyze** JSDoc coverage gaps
3. **Fix** missing `@category`, `@example`, and `@since` tags
4. **Validate** that examples compile correctly
5. **Report** progress and results

The solution follows Effect-first patterns with typed errors, Layer composition, and no async/await.

### Durability with @effect/workflow

The system uses **`@effect/workflow`** for crash-resilient, resumable operations:
- **Automatic checkpointing**: Each AI interaction is an Activity whose result is persisted
- **Crash recovery**: If interrupted, the workflow resumes from the last completed Activity
- **Idempotency**: Same workflow input produces same execution ID
- **Rate limiting**: Durable rate limiters for API calls survive restarts

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLI Entry Point                               │
│                    bun run docgen:agents                            │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      WorkflowEngine Layer                            │
│  • Development: WorkflowEngine.layerMemory (in-memory)              │
│  • Production: ClusterWorkflowEngine + / (Postgres) │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   DocgenAgentsWorkflow                               │
│  • Idempotency key: package paths                                   │
│  • Persists Activity results                                        │
│  • Resumes from last checkpoint on crash                            │
│  • Tracks cumulative token usage                                    │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Activities (Persisted)                          │
│  • ReadConfigActivity: Load package configuration                   │
│  • AnalyzePackageActivity: Run JSDoc analysis (AI call)             │
│  • FixJsDocActivity: Fix documentation (AI call)                    │
│  • WriteFileActivity: Persist file changes                          │
│  • ValidateExamplesActivity: Verify examples compile                │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Tool Layer                                   │
│  • AnalyzePackage: Run docgen analyze                               │
│  • ReadFile: Read source files                                      │
│  • WriteFile: Write updated files                                   │
│  • ValidateExamples: Run docgen generate                            │
│  • SearchEffectDocs: MCP tool for Effect documentation              │
└─────────────────────────────────────────────────────────────────────┘
```

### Durability Flow

```
Workflow Start → [Activity 1] → [Activity 2] → ... → [Activity N] → Complete
                      ↓              ↓                    ↓
                  Persist        Persist              Persist
                      ↓              ↓                    ↓
                   Storage       Storage              Storage

On Crash/Restart:
    Workflow Resume → Replay [Activity 1] → Replay [Activity 2] → Continue [Activity 3] → ...
                           ↑                    ↑
                      From Storage          From Storage
```

---

## Dependencies

The following packages are **already installed** in the monorepo:

```json
{
  "@effect/ai": "^0.20.0",
  "@effect/ai-anthropic": "^0.20.0",
  "@effect/platform": "^0.77.0",
  "@effect/platform-bun": "^0.60.0",
  "@effect/cli": "^0.59.0",
  "effect": "^3.16.0"
}
```

### Additional Dependencies for Durability

Install the workflow packages:

```bash
bun add @effect/workflow @effect/cluster
```

```json
{
  "@effect/workflow": "^0.5.0",
  "@effect/cluster": "^0.20.0"
}
```

**Note**: For production SQL storage, you'll also need `@effect/sql-pg` (already installed in this monorepo).

---

## File Structure

Create the following files in the existing CLI structure:

```
tooling/cli/src/commands/docgen/
├── agents/                          # NEW: Agent orchestration
│   ├── index.ts                     # Agent command entry point
│   ├── service.ts                   # DocgenAgentService definition
│   ├── workflow.ts                  # Workflow definition (DocgenAgentsWorkflow)
│   ├── activities.ts                # Activity definitions for durable operations
│   ├── schemas.ts                   # Schema definitions for workflow payload/results
│   ├── coordinator.ts               # Coordinator agent logic
│   ├── doc-fixer.ts                 # DocFixer agent logic
│   ├── tools.ts                     # Tool definitions for agents
│   ├── tool-handlers.ts             # Tool handler implementations
│   ├── prompts.ts                   # System prompts for agents
│   └── errors.ts                    # Agent-specific errors
├── docgen.ts                        # UPDATE: Add agents subcommand
└── ... (existing files)
```

---

## Implementation

### 1. Agent Errors (`agents/errors.ts`)

```typescript
/**
 * Error types for docgen agent operations.
 * @module
 */
import * as S from "effect/Schema";

/**
 * Error when agent API communication fails.
 * @category Errors
 * @since 0.1.0
 */
export class AgentApiError extends S.TaggedError<AgentApiError>()(
  "AgentApiError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  }
) {}

/**
 * Error when tool execution fails within an agent.
 * @category Errors
 * @since 0.1.0
 */
export class AgentToolError extends S.TaggedError<AgentToolError>()(
  "AgentToolError",
  {
    toolName: S.String,
    message: S.String,
    cause: S.optional(S.Unknown),
  }
) {}

/**
 * Error when agent produces invalid output.
 * @category Errors
 * @since 0.1.0
 */
export class AgentOutputError extends S.TaggedError<AgentOutputError>()(
  "AgentOutputError",
  {
    message: S.String,
    output: S.Unknown,
  }
) {}

/**
 * Error when agent exceeds iteration limit.
 * @category Errors
 * @since 0.1.0
 */
export class AgentIterationLimitError extends S.TaggedError<AgentIterationLimitError>()(
  "AgentIterationLimitError",
  {
    packageName: S.String,
    iterations: S.Number,
    maxIterations: S.Number,
  }
) {}

/**
 * Union of all agent errors.
 * @category Errors
 * @since 0.1.0
 */
export type AgentError =
  | AgentApiError
  | AgentToolError
  | AgentOutputError
  | AgentIterationLimitError;
```

### 2. Workflow Schemas (`agents/schemas.ts`)

```typescript
/**
 * Schema definitions for durable workflow payloads and results.
 * @module
 */
import * as S from "effect/Schema";

// -----------------------------------------------------------------------------
// Workflow Payload
// -----------------------------------------------------------------------------

/**
 * Input payload for the DocgenAgents workflow.
 * @category Schemas
 * @since 0.1.0
 */
export const DocgenWorkflowPayload = S.Struct({
  packagePaths: S.Array(S.String),
  dryRun: S.Boolean,
  model: S.String,
  maxIterations: S.Number,
});

export type DocgenWorkflowPayload = S.Schema.Type<typeof DocgenWorkflowPayload>;

// -----------------------------------------------------------------------------
// Activity Results
// -----------------------------------------------------------------------------

/**
 * Result of reading package configuration.
 * @category Schemas
 * @since 0.1.0
 */
export const ConfigResult = S.Struct({
  packagePath: S.String,
  srcDir: S.String,
  exclude: S.Array(S.String),
});

export type ConfigResult = S.Schema.Type<typeof ConfigResult>;

/**
 * Result of analyzing a package for JSDoc coverage.
 * @category Schemas
 * @since 0.1.0
 */
export const AnalysisResult = S.Struct({
  packagePath: S.String,
  exportCount: S.Number,
  missingCount: S.Number,
  filesToFix: S.Array(
    S.Struct({
      filePath: S.String,
      exportName: S.String,
      missingTags: S.Array(S.String),
    })
  ),
});

export type AnalysisResult = S.Schema.Type<typeof AnalysisResult>;

/**
 * Result of an AI call to fix JSDoc.
 * @category Schemas
 * @since 0.1.0
 */
export const AICallResult = S.Struct({
  filePath: S.String,
  content: S.String,
  tokensUsed: S.Number,
  inputTokens: S.Number,
  outputTokens: S.Number,
});

export type AICallResult = S.Schema.Type<typeof AICallResult>;

/**
 * Result of writing a file.
 * @category Schemas
 * @since 0.1.0
 */
export const WriteResult = S.Struct({
  filePath: S.String,
  bytesWritten: S.Number,
  success: S.Boolean,
});

export type WriteResult = S.Schema.Type<typeof WriteResult>;

/**
 * Result of validating examples.
 * @category Schemas
 * @since 0.1.0
 */
export const ValidationResult = S.Struct({
  packagePath: S.String,
  valid: S.Boolean,
  errors: S.Array(S.String),
});

export type ValidationResult = S.Schema.Type<typeof ValidationResult>;

// -----------------------------------------------------------------------------
// Package Fix Result
// -----------------------------------------------------------------------------

/**
 * Result of fixing a single package.
 * @category Schemas
 * @since 0.1.0
 */
export const PackageFixResultSchema = S.Struct({
  packageName: S.String,
  packagePath: S.String,
  success: S.Boolean,
  exportsFixed: S.Number,
  exportsRemaining: S.Number,
  validationPassed: S.Boolean,
  errors: S.Array(S.String),
  durationMs: S.Number,
  tokenUsage: S.Struct({
    inputTokens: S.Number,
    outputTokens: S.Number,
    totalTokens: S.Number,
    reasoningTokens: S.Number,
    cachedInputTokens: S.Number,
  }),
});

export type PackageFixResult = S.Schema.Type<typeof PackageFixResultSchema>;

// -----------------------------------------------------------------------------
// Workflow Result
// -----------------------------------------------------------------------------

/**
 * Final result of the DocgenAgents workflow.
 * @category Schemas
 * @since 0.1.0
 */
export const DocgenWorkflowResult = S.Struct({
  results: S.Array(PackageFixResultSchema),
  totalExportsFixed: S.Number,
  totalTokens: S.Number,
  durationMs: S.Number,
});

export type DocgenWorkflowResult = S.Schema.Type<typeof DocgenWorkflowResult>;
```

### 3. Workflow Activities (`agents/activities.ts`)

```typescript
/**
 * Durable activities for docgen workflow.
 * Each activity's result is persisted and replayed on workflow resume.
 * @module
 */
import * as Activity from "@effect/workflow/Activity";
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Str from "effect/String";
import * as Schedule from "effect/Schedule";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as LanguageModel from "@effect/ai/LanguageModel";
import * as Chat from "@effect/ai/Chat";
import {
  ConfigResult,
  AnalysisResult,
  AICallResult,
  WriteResult,
  ValidationResult,
} from "./schemas.js";
import { AgentApiError, AgentToolError } from "./errors.js";
import { analyzePackage } from "../shared/ast.js";
import { loadDocgenConfig } from "../shared/config.js";
import { DOC_FIXER_SYSTEM_PROMPT } from "./prompts.js";

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
    name: `ReadConfig-${packagePath}`,
    success: ConfigResult,
    error: S.TaggedStruct("ConfigError", { path: S.String, message: S.String }),
    execute: Effect.gen(function* () {
      const config = yield* loadDocgenConfig(packagePath);
      return {
        packagePath,
        srcDir: config.srcDir ?? "src",
        exclude: config.exclude ?? A.empty(),
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
    name: `AnalyzePackage-${packagePath}`,
    success: AnalysisResult,
    error: S.TaggedStruct("AnalysisError", { path: S.String, message: S.String }),
    execute: Effect.gen(function* () {
      const exports = yield* analyzePackage(packagePath, srcDir, exclude);

      const filesToFix = F.pipe(
        exports,
        A.filter((e) => A.isNonEmptyArray(e.missingTags)),
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
// Activity: CallAI (for JSDoc fixing)
// -----------------------------------------------------------------------------

/**
 * Call the AI model to fix JSDoc in a file.
 * This is the core AI interaction, persisted for crash recovery.
 * @category Activities
 * @since 0.1.0
 */
export const CallAIActivity = (
  filePath: string,
  fileContent: string,
  missingTags: ReadonlyArray<string>
) =>
  Activity.make({
    name: `CallAI-${F.pipe(filePath, Str.replaceAll("/", "_"))}`,
    success: AICallResult,
    error: AgentApiError,
    execute: Effect.gen(function* () {
      const prompt = `Fix the JSDoc documentation in this file. Add the following missing tags: ${F.pipe(missingTags, A.join(", "))}

File content:
\`\`\`typescript
${fileContent}
\`\`\`

Return the complete file with all JSDoc tags properly added.`;

      // Create chat with system prompt
      const chat = yield* Chat.fromPrompt([
        { role: "system", content: DOC_FIXER_SYSTEM_PROMPT },
      ]);

      // Generate text response
      const response = yield* chat.generateText({ prompt });

      return {
        filePath,
        content: response.text,
        tokensUsed: response.usage?.totalTokens ?? 0,
        inputTokens: response.usage?.inputTokens ?? 0,
        outputTokens: response.usage?.outputTokens ?? 0,
      };
    }),
    // Retry on interruption (e.g., process restart during API call)
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
    error: AgentToolError,
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
    success: S.Struct({
      filePath: S.String,
      content: S.String,
      lineCount: S.Number,
    }),
    error: AgentToolError,
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
    name: `ValidateExamples-${packagePath}`,
    success: ValidationResult,
    error: AgentToolError,
    execute: Effect.gen(function* () {
      // TODO: Implement actual validation via @effect/docgen
      // For now, return success
      yield* Effect.logInfo(`Validating examples for: ${packagePath}`);

      return {
        packagePath,
        valid: true,
        errors: A.empty(),
      };
    }),
  });
```

### 4. Workflow Definition (`agents/workflow.ts`)

```typescript
/**
 * Durable workflow definition for docgen agents.
 * @module
 */
import * as Workflow from "@effect/workflow/Workflow";
import * as DurableClock from "@effect/workflow/DurableClock";
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as DateTime from "effect/DateTime";
import * as Struct from "effect/Struct";
import * as Str from "effect/String";
import * as Ord from "effect/Order";
import * as Ref from "effect/Ref";
import {
  DocgenWorkflowPayload,
  DocgenWorkflowResult,
  PackageFixResultSchema,
  type PackageFixResult,
} from "./schemas.js";
import {
  ReadConfigActivity,
  AnalyzePackageActivity,
  CallAIActivity,
  WriteFileActivity,
  ReadFileActivity,
  ValidateExamplesActivity,
} from "./activities.js";
import { AgentApiError, AgentToolError } from "./errors.js";

// -----------------------------------------------------------------------------
// Workflow Definition
// -----------------------------------------------------------------------------

/**
 * The DocgenAgents workflow orchestrates documentation fixing across packages.
 *
 * Features:
 * - Idempotent: Same package paths produce same execution ID
 * - Resumable: Crashes resume from last completed Activity
 * - Rate-limited: Durable sleeps between API calls
 *
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
  idempotencyKey: ({ packagePaths }) =>
    F.pipe(packagePaths, A.sort(Ord.string), A.join(",")),
  success: DocgenWorkflowResult,
  error: S.Union(AgentApiError, AgentToolError),
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

    // Process each package sequentially using Effect.forEach
    yield* Effect.forEach(
      payload.packagePaths,
      (packagePath) =>
        Effect.gen(function* () {
          yield* Effect.logInfo(`Processing package: ${packagePath}`);

          // Rate limit: durable sleep between packages
          yield* DurableClock.sleep({
            name: `RateLimit-${packagePath}`,
            duration: "3 seconds",
            inMemoryThreshold: "60 seconds",
          });

          const packageStartTime = DateTime.unsafeNow();

          // Step 1: Read config (Activity - persisted)
          const config = yield* ReadConfigActivity(packagePath);

          // Step 2: Analyze package (Activity - persisted)
          const analysis = yield* AnalyzePackageActivity(
            packagePath,
            config.srcDir,
            config.exclude
          );

          if (analysis.missingCount === 0) {
            yield* Effect.logInfo(`Package ${packagePath} is fully documented!`);
            yield* Ref.update(resultsRef, A.append({
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
            }));
            return;
          }

          if (payload.dryRun) {
            yield* Effect.logInfo(
              `[DRY RUN] Would fix ${analysis.missingCount} exports in ${packagePath}`
            );
            yield* Ref.update(resultsRef, A.append({
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
            }));
            return;
          }

          // Step 3: Fix each file needing documentation
          const packageInputTokensRef = yield* Ref.make(0);
          const packageOutputTokensRef = yield* Ref.make(0);
          const filesFixedRef = yield* Ref.make(0);

          // Group by file path to avoid multiple writes
          const fileGroups = F.pipe(
            analysis.filesToFix,
            A.groupBy((f) => f.filePath)
          );

          yield* Effect.forEach(
            F.pipe(fileGroups, Struct.toEntries),
            ([filePath, fileExports]) =>
              Effect.gen(function* () {
                // Rate limit between AI calls
                yield* DurableClock.sleep({
                  name: `AIRateLimit-${F.pipe(filePath, Str.replaceAll("/", "_"))}`,
                  duration: "2 seconds",
                });

                // Read file (Activity - persisted)
                const fileData = yield* ReadFileActivity(filePath);

                // Collect all missing tags for this file
                const allMissingTags = F.pipe(
                  fileExports,
                  A.flatMap((e) => e.missingTags),
                  A.dedupe
                );

                // Call AI to fix JSDoc (Activity - persisted)
                const aiResult = yield* CallAIActivity(
                  filePath,
                  fileData.content,
                  allMissingTags
                );

                yield* Ref.update(packageInputTokensRef, (n) => n + aiResult.inputTokens);
                yield* Ref.update(packageOutputTokensRef, (n) => n + aiResult.outputTokens);
                yield* Ref.update(totalTokensRef, (n) => n + aiResult.tokensUsed);

                // Write file (Activity - persisted)
                yield* WriteFileActivity(filePath, aiResult.content);
                yield* Ref.update(filesFixedRef, (n) => n + A.length(fileExports));
              }),
            { concurrency: 1 } // Sequential to respect rate limits
          );

          // Step 4: Validate examples (Activity - persisted)
          const validation = yield* ValidateExamplesActivity(packagePath);

          const packageEndTime = DateTime.unsafeNow();
          const packageDurationMs =
            DateTime.toEpochMillis(packageEndTime) -
            DateTime.toEpochMillis(packageStartTime);

          const filesFixed = yield* Ref.get(filesFixedRef);
          const packageInputTokens = yield* Ref.get(packageInputTokensRef);
          const packageOutputTokens = yield* Ref.get(packageOutputTokensRef);

          yield* Ref.update(totalExportsFixedRef, (n) => n + filesFixed);

          yield* Ref.update(resultsRef, A.append({
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
          }));
        }),
      { concurrency: 1 } // Sequential processing
    );

    const endTime = DateTime.unsafeNow();
    const durationMs =
      DateTime.toEpochMillis(endTime) - DateTime.toEpochMillis(startTime);

    const results = yield* Ref.get(resultsRef);
    const totalExportsFixed = yield* Ref.get(totalExportsFixedRef);
    const totalTokens = yield* Ref.get(totalTokensRef);

    yield* Effect.logInfo(
      `Workflow complete: ${totalExportsFixed} exports fixed, ${totalTokens} tokens used`
    );

    return {
      results,
      totalExportsFixed,
      totalTokens,
      durationMs,
    };
  })
);
```

### 5. Tool Definitions (`agents/tools.ts`)

```typescript
/**
 * Tool definitions for docgen agents.
 * @module
 */
import { Tool, Toolkit } from "@effect/ai";
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Command from "@effect/platform/Command";
import * as CommandExecutor from "@effect/platform/CommandExecutor";

// -----------------------------------------------------------------------------
// Tool: AnalyzePackage
// -----------------------------------------------------------------------------

/**
 * Analyze a package for JSDoc coverage.
 * @category Tools
 * @since 0.1.0
 */
export const AnalyzePackage = Tool.make("AnalyzePackage", {
  description:
    "Run JSDoc analysis on a package to identify missing documentation. Returns the JSDOC_ANALYSIS.md content.",
  parameters: {
    packagePath: S.String.pipe(
      S.annotations({
        description: "Relative path to the package from repo root (e.g., 'packages/common/identity')",
      })
    ),
  },
  success: S.Struct({
    analysisContent: S.String,
    exportCount: S.Number,
    missingCount: S.Number,
  }),
  failure: S.String,
});

/**
 * @category Tool Types
 * @since 0.1.0
 */
export type AnalyzePackageParams = Tool.Parameters<typeof AnalyzePackage>;

// -----------------------------------------------------------------------------
// Tool: ReadSourceFile
// -----------------------------------------------------------------------------

/**
 * Read a source file from the package.
 * @category Tools
 * @since 0.1.0
 */
export const ReadSourceFile = Tool.make("ReadSourceFile", {
  description: "Read the contents of a TypeScript source file to understand context for documentation.",
  parameters: {
    filePath: S.String.pipe(
      S.annotations({
        description: "Absolute path to the file to read",
      })
    ),
  },
  success: S.Struct({
    content: S.String,
    lineCount: S.Number,
  }),
  failure: S.String,
});

/**
 * @category Tool Types
 * @since 0.1.0
 */
export type ReadSourceFileParams = Tool.Parameters<typeof ReadSourceFile>;

// -----------------------------------------------------------------------------
// Tool: WriteSourceFile
// -----------------------------------------------------------------------------

/**
 * Write updated content to a source file.
 * @category Tools
 * @since 0.1.0
 */
export const WriteSourceFile = Tool.make("WriteSourceFile", {
  description: "Write updated TypeScript source code with JSDoc improvements to a file.",
  parameters: {
    filePath: S.String.pipe(
      S.annotations({
        description: "Absolute path to the file to write",
      })
    ),
    content: S.String.pipe(
      S.annotations({
        description: "The complete file content to write",
      })
    ),
  },
  success: S.Struct({
    success: S.Boolean,
    bytesWritten: S.Number,
  }),
  failure: S.String,
});

/**
 * @category Tool Types
 * @since 0.1.0
 */
export type WriteSourceFileParams = Tool.Parameters<typeof WriteSourceFile>;

// -----------------------------------------------------------------------------
// Tool: ValidateExamples
// -----------------------------------------------------------------------------

/**
 * Validate that JSDoc examples compile correctly.
 * @category Tools
 * @since 0.1.0
 */
export const ValidateExamples = Tool.make("ValidateExamples", {
  description:
    "Run @effect/docgen to validate that all JSDoc examples in a package compile correctly.",
  parameters: {
    packagePath: S.String.pipe(
      S.annotations({
        description: "Relative path to the package from repo root",
      })
    ),
  },
  success: S.Struct({
    valid: S.Boolean,
    errors: S.Array(S.String),
    moduleCount: S.Number,
  }),
  failure: S.String,
});

/**
 * @category Tool Types
 * @since 0.1.0
 */
export type ValidateExamplesParams = Tool.Parameters<typeof ValidateExamples>;

// -----------------------------------------------------------------------------
// Tool: SearchEffectDocs
// -----------------------------------------------------------------------------

/**
 * Search Effect documentation for API patterns and examples.
 * @category Tools
 * @since 0.1.0
 */
export const SearchEffectDocs = Tool.make("SearchEffectDocs", {
  description:
    "Search the Effect documentation for API patterns, usage examples, and best practices. Use this to find correct patterns for JSDoc examples.",
  parameters: {
    query: S.String.pipe(
      S.annotations({
        description: "Search query for Effect documentation (e.g., 'Array.map', 'Schema.TaggedError')",
      })
    ),
  },
  success: S.Struct({
    results: S.Array(
      S.Struct({
        title: S.String,
        content: S.String,
        documentId: S.Number,
      })
    ),
  }),
  failure: S.String,
});

/**
 * @category Tool Types
 * @since 0.1.0
 */
export type SearchEffectDocsParams = Tool.Parameters<typeof SearchEffectDocs>;

// -----------------------------------------------------------------------------
// Tool: ListPackageExports
// -----------------------------------------------------------------------------

/**
 * List all exports from a package's index file.
 * @category Tools
 * @since 0.1.0
 */
export const ListPackageExports = Tool.make("ListPackageExports", {
  description: "Get a list of all public exports from a package to understand what needs documentation.",
  parameters: {
    packagePath: S.String.pipe(
      S.annotations({
        description: "Relative path to the package from repo root",
      })
    ),
  },
  success: S.Struct({
    exports: S.Array(
      S.Struct({
        name: S.String,
        kind: S.Literal("function", "const", "type", "interface", "class", "namespace", "enum"),
        filePath: S.String,
        line: S.Number,
        hasJsDoc: S.Boolean,
      })
    ),
  }),
  failure: S.String,
});

/**
 * @category Tool Types
 * @since 0.1.0
 */
export type ListPackageExportsParams = Tool.Parameters<typeof ListPackageExports>;

// -----------------------------------------------------------------------------
// DocFixer Toolkit
// -----------------------------------------------------------------------------

/**
 * Complete toolkit for the DocFixer agent.
 * @category Toolkits
 * @since 0.1.0
 */
export const DocFixerToolkit = Toolkit.make(
  AnalyzePackage,
  ReadSourceFile,
  WriteSourceFile,
  ValidateExamples,
  SearchEffectDocs,
  ListPackageExports
);

/**
 * @category Toolkit Types
 * @since 0.1.0
 */
export type DocFixerToolkit = typeof DocFixerToolkit;
```

### 6. Tool Handlers (`agents/tool-handlers.ts`)

```typescript
/**
 * Tool handler implementations for docgen agents.
 * @module
 */
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as DateTime from "effect/DateTime";
import * as P from "effect/Predicate";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Command from "@effect/platform/Command";
import * as CommandExecutor from "@effect/platform/CommandExecutor";
import * as ToolingUtils from "@beep/tooling-utils";
const { FsUtils } = ToolingUtils;
import {
  DocFixerToolkit,
  type AnalyzePackageParams,
  type ReadSourceFileParams,
  type WriteSourceFileParams,
  type ValidateExamplesParams,
  type SearchEffectDocsParams,
  type ListPackageExportsParams,
} from "./tools.js";
import { analyzePackage } from "../shared/ast.js";
import { generateAnalysisReport } from "../shared/markdown.js";
import { loadDocgenConfig } from "../shared/config.js";

/**
 * Create the DocFixer toolkit layer with all tool handlers.
 * @category Layers
 * @since 0.1.0
 */
export const DocFixerToolkitLive = DocFixerToolkit.toLayer({
  AnalyzePackage: ({ packagePath }) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const repoRoot = yield* FsUtils.getRepoRoot;

      const absolutePath = path.resolve(repoRoot, packagePath);
      const config = yield* loadDocgenConfig(absolutePath);

      const srcDir = config.srcDir ?? "src";
      const exclude = config.exclude ?? A.empty();

      const exports = yield* analyzePackage(absolutePath, srcDir, exclude);

      const analysis = {
        packageName: packagePath,
        packagePath: absolutePath,
        timestamp: DateTime.formatIso(DateTime.unsafeNow()),
        exports,
        summary: {
          totalExports: A.length(exports),
          fullyDocumented: F.pipe(
            exports,
            A.filter((e) => A.isEmptyArray(e.missingTags)),
            A.length
          ),
          missingDocumentation: F.pipe(
            exports,
            A.filter((e) => A.isNonEmptyArray(e.missingTags)),
            A.length
          ),
          missingCategory: F.pipe(
            exports,
            A.filter((e) => F.pipe(e.missingTags, A.contains("@category"))),
            A.length
          ),
          missingExample: F.pipe(
            exports,
            A.filter((e) => F.pipe(e.missingTags, A.contains("@example"))),
            A.length
          ),
          missingSince: F.pipe(
            exports,
            A.filter((e) => F.pipe(e.missingTags, A.contains("@since"))),
            A.length
          ),
        },
      };

      const report = generateAnalysisReport(analysis);

      return {
        analysisContent: report,
        exportCount: analysis.summary.totalExports,
        missingCount: analysis.summary.missingDocumentation,
      };
    }).pipe(
      Effect.mapError((e) => `Failed to analyze package: ${String(e)}`)
    ),

  ReadSourceFile: ({ filePath }) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const content = yield* fs.readFileString(filePath);
      const lines = F.pipe(content, Str.split("\n"));

      return {
        content,
        lineCount: A.length(lines),
      };
    }).pipe(
      Effect.mapError((e) => `Failed to read file: ${String(e)}`)
    ),

  WriteSourceFile: ({ filePath, content }) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      yield* fs.writeFileString(filePath, content);

      return {
        success: true,
        bytesWritten: new TextEncoder().encode(content).length,
      };
    }).pipe(
      Effect.mapError((e) => `Failed to write file: ${String(e)}`)
    ),

  ValidateExamples: ({ packagePath }) =>
    Effect.gen(function* () {
      const executor = yield* CommandExecutor.CommandExecutor;
      const path = yield* Path.Path;
      const repoRoot = yield* FsUtils.getRepoRoot;

      const absolutePath = path.resolve(repoRoot, packagePath);

      const command = Command.make("bunx", "@effect/docgen", "--validate-examples").pipe(
        Command.workingDirectory(absolutePath)
      );

      const result = yield* executor.start(command).pipe(
        Effect.flatMap((process) => process.exitCode),
        Effect.map((exitCode) => exitCode === 0),
        Effect.catchAll(() => Effect.succeed(false))
      );

      // TODO: Parse actual errors from docgen output
      return {
        valid: result,
        errors: result ? A.empty<string>() : A.make("Validation failed - check docgen output"),
        moduleCount: 0,
      };
    }).pipe(
      Effect.mapError((e) => `Failed to validate examples: ${String(e)}`)
    ),

  SearchEffectDocs: ({ query }) =>
    Effect.gen(function* () {
      // This would integrate with the MCP Effect docs tool
      // For now, return a placeholder
      // In production, this calls mcp__effect_docs__effect_docs_search

      yield* Effect.logInfo(`Searching Effect docs for: ${query}`);

      return {
        results: [
          {
            title: "Effect Documentation",
            content: `Search results for "${query}" would appear here when MCP is integrated.`,
            documentId: 0,
          },
        ],
      };
    }).pipe(
      Effect.mapError((e) => `Failed to search docs: ${String(e)}`)
    ),

  ListPackageExports: ({ packagePath }) =>
    Effect.gen(function* () {
      const path = yield* Path.Path;
      const repoRoot = yield* FsUtils.getRepoRoot;

      const absolutePath = path.resolve(repoRoot, packagePath);
      const config = yield* loadDocgenConfig(absolutePath);

      const srcDir = config.srcDir ?? "src";
      const exclude = config.exclude ?? A.empty();

      const exports = yield* analyzePackage(absolutePath, srcDir, exclude);

      return {
        exports: F.pipe(
          exports,
          A.map((e) => ({
            name: e.name,
            kind: e.kind,
            filePath: e.filePath,
            line: e.line,
            hasJsDoc: e.hasJsDoc,
          }))
        ),
      };
    }).pipe(
      Effect.mapError((e) => `Failed to list exports: ${String(e)}`)
    ),
});
```

### 7. System Prompts (`agents/prompts.ts`)

```typescript
/**
 * System prompts for docgen agents.
 * @module
 */

/**
 * System prompt for the DocFixer agent.
 * @category Prompts
 * @since 0.1.0
 */
export const DOC_FIXER_SYSTEM_PROMPT = `You are a specialized JSDoc documentation agent for the beep-effect monorepo. Your task is to add missing JSDoc documentation to TypeScript exports.

## Your Mission

For the package you're assigned, you will:
1. Analyze the package to find exports missing documentation
2. Read source files to understand the code context
3. Add appropriate JSDoc tags to each export
4. Validate that examples compile correctly

## Required JSDoc Tags

Every public export MUST have these tags:

### @category
Hierarchical category path. Use these patterns:
- "Constructors" - Factory functions and builders
- "Models" or "Models/SubType" - Type definitions and interfaces
- "Utils" or "Utils/SubType" - Utility functions
- "Errors" - Error classes
- "Services" - Effect service definitions
- "Layers" - Effect layer definitions
- "Schemas" - Effect Schema definitions

### @example
Complete, compilable TypeScript example:
\`\`\`typescript
/**
 * @example
 * \`\`\`typescript
 * import { MyFunction } from "@beep/package-name"
 * import * as Effect from "effect/Effect"
 *
 * const result = MyFunction({ input: "value" })
 * console.log(result)
 * // => Expected output
 * \`\`\`
 */
\`\`\`

### @since
Version when the export was added. Use "0.1.0" for new documentation.

## Critical Rules

1. **Effect Patterns**: Always use Effect idioms in examples:
   - Use \`Effect.gen\` for sequential effects
   - Use \`F.pipe\` with \`A.map\`, \`A.filter\` (never native array methods)
   - Use \`S.Struct\`, \`S.String\` (PascalCase for Schema constructors)
   - Use \`Schema.TaggedError\` for error types

2. **Import Conventions**:
   - \`import * as Effect from "effect/Effect"\`
   - \`import * as S from "effect/Schema"\`
   - \`import * as A from "effect/Array"\`
   - \`import * as F from "effect/Function"\`

3. **Never use**:
   - Native \`.map()\`, \`.filter()\`, \`.forEach()\` on arrays
   - \`async/await\` or bare Promises
   - \`any\` type

## Workflow

1. Call \`AnalyzePackage\` to get the JSDOC_ANALYSIS.md report
2. For each high-priority item:
   a. Call \`ReadSourceFile\` to understand the code
   b. If needed, call \`SearchEffectDocs\` for Effect API patterns
   c. Write the complete updated file with \`WriteSourceFile\`
3. After all changes, call \`ValidateExamples\` to verify
4. If validation fails, fix the issues and retry

## Output Format

After completing your work, respond with a JSON summary:
\`\`\`json
{
  "packageName": "@beep/package-name",
  "exportsFixed": 15,
  "exportsRemaining": 0,
  "validationPassed": true,
  "errors": []
}
\`\`\`
`;

/**
 * System prompt for the Coordinator agent.
 * @category Prompts
 * @since 0.1.0
 */
export const COORDINATOR_SYSTEM_PROMPT = `You are the documentation coordinator for the beep-effect monorepo. Your job is to orchestrate documentation improvements across multiple packages.

## Your Mission

1. Discover packages that need documentation work
2. Prioritize packages by documentation debt
3. Delegate work to DocFixer agents
4. Track progress and report results

## Workflow

1. Use the package discovery tools to find packages with missing documentation
2. Sort packages by number of missing JSDoc tags (highest first)
3. For each package, launch a DocFixer task
4. Monitor progress and aggregate results

## Output Format

Provide a final summary in JSON:
\`\`\`json
{
  "packagesProcessed": 5,
  "totalExportsFixed": 150,
  "packagesSucceeded": 4,
  "packagesFailed": 1,
  "failedPackages": ["@beep/failed-package"],
  "totalTime": "2m 34s"
}
\`\`\`
`;
```

### 8. DocgenAgentService (`agents/service.ts`)

This service wraps the durable workflow and provides a simple interface for the CLI.

```typescript
/**
 * DocgenAgentService - Effect service for AI agent operations.
 * Now uses @effect/workflow for durable, crash-resilient execution.
 * @module
 *
 * ✅ Uses correct @effect/ai APIs verified against source:
 * - Chat.empty / Chat.fromPrompt() for creating chat sessions
 * - chat.generateText({ prompt }) for sending messages
 * - AnthropicLanguageModel.model() returns a Layer
 * - Response.Usage for token tracking
 *
 * ✅ Uses @effect/workflow for durability:
 * - DocgenAgentsWorkflow for durable execution
 * - Activities for crash-resilient AI calls
 * - DurableClock for rate limiting
 */
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Ref from "effect/Ref";
import * as Redacted from "effect/Redacted";
import * as Config from "effect/Config";
import * as DateTime from "effect/DateTime";
import * as Str from "effect/String";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as WorkflowEngine from "@effect/workflow/WorkflowEngine";
import * as ClusterWorkflowEngine from "@effect/cluster/ClusterWorkflowEngine";
import * as SqlMessageStorage from "@effect/cluster/SqlMessageStorage";
import type * as SqlClient from "@effect/sql/SqlClient";
import * as Response from "@effect/ai/Response";
import * as Chat from "@effect/ai/Chat";
import * as AnthropicClient from "@effect/ai-anthropic/AnthropicClient";
import * as AnthropicLanguageModel from "@effect/ai-anthropic/AnthropicLanguageModel";
import * as HttpClient from "@effect/platform/HttpClient";
import type { AgentError } from "./errors.js";
import { DocgenAgentsWorkflow, DocgenAgentsWorkflowLayer } from "./workflow.js";
import { type PackageFixResult, type DocgenWorkflowResult } from "./schemas.js";
import { DocFixerToolkit, DocFixerToolkitLive } from "./tools.js";
import { DOC_FIXER_SYSTEM_PROMPT } from "./prompts.js";

// -----------------------------------------------------------------------------
// Token Counter Service (Real-Time Token Tracking)
// -----------------------------------------------------------------------------

/**
 * Token usage statistics.
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
 * Uses Response.Usage from generateText() responses for accurate tracking.
 * @category Services
 * @since 0.1.0
 */
class TokenCounter extends Effect.Service<TokenCounter>()("TokenCounter", {
  effect: Effect.gen(function* () {
    const inputTokensRef = yield* Ref.make(0);
    const outputTokensRef = yield* Ref.make(0);
    const totalTokensRef = yield* Ref.make(0);
    const reasoningTokensRef = yield* Ref.make(0);
    const cachedInputTokensRef = yield* Ref.make(0);

    const recordUsage = (usage: Response.Usage) =>
      Effect.gen(function* () {
        if (usage.inputTokens !== undefined) {
          yield* Ref.update(inputTokensRef, (n) => n + usage.inputTokens!);
        }
        if (usage.outputTokens !== undefined) {
          yield* Ref.update(outputTokensRef, (n) => n + usage.outputTokens!);
        }
        if (usage.totalTokens !== undefined) {
          yield* Ref.update(totalTokensRef, (n) => n + usage.totalTokens!);
        }
        if (usage.reasoningTokens !== undefined) {
          yield* Ref.update(reasoningTokensRef, (n) => n + usage.reasoningTokens!);
        }
        if (usage.cachedInputTokens !== undefined) {
          yield* Ref.update(cachedInputTokensRef, (n) => n + usage.cachedInputTokens!);
        }
      });

    const getStats: Effect.Effect<TokenStats> = Effect.gen(function* () {
      const inputTokens = yield* Ref.get(inputTokensRef);
      const outputTokens = yield* Ref.get(outputTokensRef);
      const totalTokens = yield* Ref.get(totalTokensRef);
      const reasoningTokens = yield* Ref.get(reasoningTokensRef);
      const cachedInputTokens = yield* Ref.get(cachedInputTokensRef);

      return {
        inputTokens,
        outputTokens,
        totalTokens,
        reasoningTokens,
        cachedInputTokens,
      };
    });

    const reset = Effect.gen(function* () {
      yield* Ref.set(inputTokensRef, 0);
      yield* Ref.set(outputTokensRef, 0);
      yield* Ref.set(totalTokensRef, 0);
      yield* Ref.set(reasoningTokensRef, 0);
      yield* Ref.set(cachedInputTokensRef, 0);
    });

    const displayStats = Effect.gen(function* () {
      const stats = yield* getStats;
      const formatNumber = (n: number): string =>
        Intl.NumberFormat("en-US").format(n);

      yield* Console.log(
        F.pipe(
          [
            "",
            "━━━ Token Usage ━━━",
            `Input:     ${formatNumber(stats.inputTokens)}`,
            `Output:    ${formatNumber(stats.outputTokens)}`,
            `Reasoning: ${formatNumber(stats.reasoningTokens)}`,
            `Cached:    ${formatNumber(stats.cachedInputTokens)}`,
            `Total:     ${formatNumber(stats.totalTokens)}`,
            "━━━━━━━━━━━━━━━━━━━",
            "",
          ],
          A.join("\n")
        )
      );
    });

    return {
      recordUsage,
      getStats,
      reset,
      displayStats,
    };
  }),
}) {}

// -----------------------------------------------------------------------------
// Service Definition
// -----------------------------------------------------------------------------

/**
 * Configuration for the DocgenAgentService.
 * @category Models
 * @since 0.1.0
 */
export interface DocgenAgentConfig {
  readonly apiKey: Redacted.Redacted;
  readonly model: string;
  readonly maxTokens: number;
  readonly maxIterations: number;
}

/**
 * Service interface for docgen agent operations.
 * @category Services
 * @since 0.1.0
 */
export interface DocgenAgentService {
  /**
   * Fix JSDoc documentation for a single package.
   */
  readonly fixPackage: (
    packagePath: string
  ) => Effect.Effect<PackageFixResult, AgentError>;

  /**
   * Fix JSDoc documentation for multiple packages in parallel.
   */
  readonly fixPackages: (
    packagePaths: ReadonlyArray<string>,
    concurrency: number
  ) => Effect.Effect<ReadonlyArray<PackageFixResult>, AgentError>;

  /**
   * Get current token usage statistics.
   */
  readonly getTokenStats: Effect.Effect<TokenStats>;
}

/**
 * Result of fixing a single package.
 * @category Models
 * @since 0.1.0
 */
export interface PackageFixResult {
  readonly packageName: string;
  readonly packagePath: string;
  readonly success: boolean;
  readonly exportsFixed: number;
  readonly exportsRemaining: number;
  readonly validationPassed: boolean;
  readonly errors: ReadonlyArray<string>;
  readonly durationMs: number;
  readonly tokenUsage: TokenStats;
}

/**
 * DocgenAgentService context tag.
 * @category Context
 * @since 0.1.0
 */
export class DocgenAgentService extends Context.Tag("DocgenAgentService")<
  DocgenAgentService,
  DocgenAgentService
>() {}

// -----------------------------------------------------------------------------
// Implementation
// -----------------------------------------------------------------------------

/**
 * Create the DocgenAgentService implementation.
 *
 * Supports two modes:
 * - **Durable mode**: Uses @effect/workflow for crash recovery and resumption
 * - **Direct mode**: Runs AI calls directly without persistence
 *
 * @category Constructors
 * @since 0.1.0
 */
const make = Effect.gen(function* () {
  const tokenCounter = yield* TokenCounter;

  const config = yield* Effect.config(
    Config.all({
      model: Config.string("DOCGEN_AGENT_MODEL").pipe(
        Config.withDefault("claude-sonnet-4-20250514")
      ),
      maxTokens: Config.integer("DOCGEN_AGENT_MAX_TOKENS").pipe(
        Config.withDefault(8192)
      ),
      maxIterations: Config.integer("DOCGEN_AGENT_MAX_ITERATIONS").pipe(
        Config.withDefault(20)
      ),
      durable: Config.boolean("DOCGEN_AGENT_DURABLE").pipe(
        Config.withDefault(false)
      ),
    })
  );

  /**
   * Fix package using the durable workflow approach.
   * Activities are checkpointed to storage and can be replayed on crash.
   */
  const fixPackageDurable = (packagePath: string) =>
    Effect.gen(function* () {
      const engine = yield* WorkflowEngine.WorkflowEngine;

      yield* Effect.logInfo(`Starting durable documentation fix for: ${packagePath}`);

      // Execute the workflow with an idempotent execution ID
      const executionId = `docgen-${F.pipe(packagePath, Str.replaceAll("/", "-"))}`;

      const result = yield* engine.execute(DocgenAgentsWorkflow)({
        executionId,
        payload: {
          packagePath,
          maxIterations: config.maxIterations,
        },
      });

      yield* Effect.logInfo(
        `Completed ${packagePath}: ${result.exportsFixed} fixed, ${result.exportsRemaining} remaining`
      );

      return result;
    });

  /**
   * Fix package using direct AI calls (non-durable).
   * Faster but no crash recovery.
   */
  const fixPackageDirect = (packagePath: string) =>
    Effect.gen(function* () {
      const startTime = DateTime.unsafeNow();

      yield* Effect.logInfo(`Starting documentation fix for: ${packagePath}`);

      // Reset token counter for this package
      yield* tokenCounter.reset;

      // Get toolkit with handlers
      const toolkitWithHandler = yield* DocFixerToolkit;

      // ✅ CORRECT: Use Chat.fromPrompt(), NOT Chat.make()
      const chat = yield* Chat.fromPrompt([
        { role: "system", content: DOC_FIXER_SYSTEM_PROMPT },
      ]);

      // Initial prompt to start the agent
      const initialPrompt = `Please fix the JSDoc documentation for the package at: ${packagePath}

Start by analyzing the package to see what needs to be documented.`;

      // Run the conversation loop
      let iterations = 0;
      let lastResponse = "";

      const runLoop = Effect.gen(function* () {
        while (iterations < config.maxIterations) {
          iterations++;

          const prompt =
            iterations === 1 ? initialPrompt : "Continue fixing documentation.";

          // ✅ CORRECT: Use chat.generateText({ prompt, toolkit }), NOT chat.send()
          const response = yield* chat.generateText({
            prompt,
            toolkit: toolkitWithHandler,
          });

          lastResponse = response.text;

          // ✅ Record token usage from response (real-time tracking)
          yield* tokenCounter.recordUsage(response.usage);

          // Display real-time token stats
          yield* tokenCounter.displayStats;

          // Check if agent is done (look for JSON summary)
          if (F.pipe(lastResponse, Str.includes('"validationPassed"'))) {
            break;
          }

          yield* Effect.logDebug(
            `Iteration ${iterations}: ${F.pipe(lastResponse, Str.slice(0, 100))}...`
          );
        }
      });

      yield* runLoop;

      // Parse result from agent response
      const endTime = DateTime.unsafeNow();
      const durationMs =
        DateTime.toEpochMillis(endTime) - DateTime.toEpochMillis(startTime);
      const tokenUsage = yield* tokenCounter.getStats;
      const result = parseAgentResult(lastResponse, packagePath, durationMs, tokenUsage);

      yield* Effect.logInfo(
        `Completed ${packagePath}: ${result.exportsFixed} fixed, ${result.exportsRemaining} remaining`
      );
      yield* Effect.logInfo(
        `Token usage: ${tokenUsage.totalTokens.toLocaleString()} total ` +
          `(${tokenUsage.inputTokens.toLocaleString()} in, ${tokenUsage.outputTokens.toLocaleString()} out)`
      );

      return result;
    });

  // Choose implementation based on durable mode
  const fixPackage = (packagePath: string) =>
    config.durable
      ? fixPackageDurable(packagePath)
      : fixPackageDirect(packagePath);

  const fixPackages = (
    packagePaths: ReadonlyArray<string>,
    concurrency: number
  ) =>
    Effect.forEach(
      packagePaths,
      (path) =>
        fixPackage(path).pipe(
          Effect.catchAll((error) =>
            Effect.succeed<PackageFixResult>({
              packageName: path,
              packagePath: path,
              success: false,
              exportsFixed: 0,
              exportsRemaining: -1,
              validationPassed: false,
              errors: A.make(String(error)),
              durationMs: 0,
              tokenUsage: {
                inputTokens: 0,
                outputTokens: 0,
                totalTokens: 0,
                reasoningTokens: 0,
                cachedInputTokens: 0,
              },
            })
          )
        ),
      { concurrency }
    );

  const getTokenStats = tokenCounter.getStats;

  return DocgenAgentService.of({
    fixPackage,
    fixPackages,
    getTokenStats,
  });
});

/**
 * Parse the agent's JSON result from its response.
 * @category Utils
 * @since 0.1.0
 */
const parseAgentResult = (
  response: string,
  packagePath: string,
  durationMs: number,
  tokenUsage: TokenStats
): PackageFixResult => {
  // Extract JSON from response using Effect String utilities
  const jsonMatch = F.pipe(response, Str.match(/```json\n([\s\S]*?)\n```/));

  return F.pipe(
    jsonMatch,
    O.flatMap((matches) => F.pipe(matches, A.get(1))),
    O.flatMap((jsonStr) => {
      // Safe JSON parse using Option
      try {
        return O.some(JSON.parse(jsonStr));
      } catch {
        return O.none();
      }
    }),
    O.map((parsed) => ({
      packageName: parsed.packageName ?? packagePath,
      packagePath,
      success: parsed.validationPassed ?? false,
      exportsFixed: parsed.exportsFixed ?? 0,
      exportsRemaining: parsed.exportsRemaining ?? 0,
      validationPassed: parsed.validationPassed ?? false,
      errors: parsed.errors ?? A.empty(),
      durationMs,
      tokenUsage,
    })),
    O.getOrElse(() => ({
      packageName: packagePath,
      packagePath,
      success: false,
      exportsFixed: 0,
      exportsRemaining: -1,
      validationPassed: false,
      errors: ["Failed to parse agent response"],
      durationMs,
      tokenUsage,
    }))
  );
};

// -----------------------------------------------------------------------------
// Layer
// -----------------------------------------------------------------------------

/**
 * ✅ CORRECT: AnthropicLanguageModel.model() returns an AiModel.Model instance.
 * Extract the .layer property to get the Layer for dependency injection.
 * @category Layers
 * @since 0.1.0
 */
const ModelLayer = AnthropicLanguageModel.model("claude-sonnet-4-20250514", {
  max_tokens: 8192,
}).layer;

/**
 * AnthropicClient layer with config from environment.
 * @category Layers
 * @since 0.1.0
 */
const ClientLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const apiKey = yield* Config.redacted("ANTHROPIC_API_KEY");
    return Layer.succeed(
      AnthropicClient.AnthropicClient,
      yield* AnthropicClient.make({ apiKey })
    );
  })
);

/**
 * In-memory workflow engine for development.
 * Activities are persisted in memory and lost on restart.
 * @category Layers
 * @since 0.1.0
 */
const WorkflowEngineLayerDev = WorkflowEngine.layerMemory;

/**
 * SQL-backed workflow engine for production.
 * Activities are persisted to PostgreSQL and survive restarts.
 * Requires SqlClient dependency.
 *
 * @example
 * ```typescript
 * import * as SqlMessageStorage from "@effect/cluster/SqlMessageStorage";
 * import { PgClient } from "@effect/sql-pg";
 *
 * const WorkflowEngineLayerProd = ClusterWorkflowEngine.layer.pipe(
 *   Layer.provide(SqlMessageStorage.layer),
 *   Layer.provide(PgClient.layer({
 *     host: Config.succeed("localhost"),
 *     database: Config.succeed("docgen_workflows"),
 *   }))
 * );
 * ```
 *
 * @category Layers
 * @since 0.1.0
 */

/**
 * Live implementation of DocgenAgentService.
 *
 * Includes:
 * - TokenCounter for real-time token tracking
 * - DocFixerToolkit for file operations
 * - AnthropicClient and Model for AI calls
 * - WorkflowEngine for durable execution (when enabled)
 * - DocgenAgentsWorkflowLayer for workflow handler
 *
 * @category Layers
 * @since 0.1.0
 */
export const DocgenAgentServiceLive = Layer.effect(DocgenAgentService, make).pipe(
  Layer.provide(TokenCounter.Default),
  Layer.provide(DocFixerToolkitLive),
  Layer.provide(ModelLayer),
  Layer.provide(ClientLayer),
  Layer.provide(HttpClient.layer),
  // Workflow layers for durable mode
  Layer.provide(DocgenAgentsWorkflowLayer),
  Layer.provide(WorkflowEngineLayerDev)
);

/**
 * Production layer with SQL-backed persistence.
 * Use this for crash-resilient deployments.
 *
 * @category Layers
 * @since 0.1.0
 */
export const DocgenAgentServiceProd = (sqlClientLayer: Layer.Layer<SqlClient>) =>
  Layer.effect(DocgenAgentService, make).pipe(
    Layer.provide(TokenCounter.Default),
    Layer.provide(DocFixerToolkitLive),
    Layer.provide(ModelLayer),
    Layer.provide(ClientLayer),
    Layer.provide(HttpClient.layer),
    Layer.provide(DocgenAgentsWorkflowLayer),
    Layer.provide(
      ClusterWorkflowEngine.layer.pipe(
        Layer.provide(SqlMessageStorage.layer),
        Layer.provide(sqlClientLayer)
      )
    )
  );
```

### 9. CLI Command (`agents/index.ts`)

```typescript
/**
 * CLI command for docgen agents with real-time token tracking.
 * @module
 */
import * as CliCommand from "@effect/cli/Command";
import * as CliOptions from "@effect/cli/Options";
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Console from "effect/Console";
import * as DateTime from "effect/DateTime";
import * as Num from "effect/Number";
import { DocgenAgentService, DocgenAgentServiceLive, type TokenStats } from "./service.js";
import { discoverConfiguredPackages, resolvePackagePath } from "../shared/discovery.js";
import * as Output from "../shared/output.js";

// -----------------------------------------------------------------------------
// Cost Estimation
// -----------------------------------------------------------------------------

/**
 * Anthropic pricing per million tokens (as of Dec 2025).
 * @category Constants
 * @since 0.1.0
 */
const ANTHROPIC_PRICING = {
  "claude-sonnet-4-20250514": {
    input: 3.0,
    output: 15.0,
    cachedInput: 0.3,
  },
  "claude-opus-4-20250514": {
    input: 15.0,
    output: 75.0,
    cachedInput: 1.5,
  },
} as const;

/**
 * Estimate cost based on token usage.
 * @category Utils
 * @since 0.1.0
 */
const estimateCost = (
  usage: TokenStats,
  model: keyof typeof ANTHROPIC_PRICING
): number => {
  const pricing = ANTHROPIC_PRICING[model] ?? ANTHROPIC_PRICING["claude-sonnet-4-20250514"];
  const inputCost = (usage.inputTokens * pricing.input) / 1_000_000;
  const outputCost = (usage.outputTokens * pricing.output) / 1_000_000;
  const cachedSavings = (usage.cachedInputTokens * (pricing.input - pricing.cachedInput)) / 1_000_000;
  return inputCost + outputCost - cachedSavings;
};

// -----------------------------------------------------------------------------
// Options
// -----------------------------------------------------------------------------

const packageOption = CliOptions.text("package").pipe(
  CliOptions.withAlias("p"),
  CliOptions.withDescription("Target specific package (path or @beep/name)"),
  CliOptions.optional
);

const parallelOption = CliOptions.integer("parallel").pipe(
  CliOptions.withDescription("Number of packages to process in parallel"),
  CliOptions.withDefault(2)
);

const dryRunOption = CliOptions.boolean("dry-run").pipe(
  CliOptions.withDescription("Analyze packages without making changes"),
  CliOptions.withDefault(false)
);

const verboseOption = CliOptions.boolean("verbose").pipe(
  CliOptions.withAlias("v"),
  CliOptions.withDescription("Show detailed progress output"),
  CliOptions.withDefault(false)
);

const modelOption = CliOptions.text("model").pipe(
  CliOptions.withDescription("Claude model to use"),
  CliOptions.withDefault("claude-sonnet-4-20250514")
);

const durableOption = CliOptions.boolean("durable").pipe(
  CliOptions.withAlias("d"),
  CliOptions.withDescription(
    "Enable durable mode with crash recovery. " +
    "Activities are checkpointed and can resume after interruption."
  ),
  CliOptions.withDefault(false)
);

const resumeOption = CliOptions.text("resume").pipe(
  CliOptions.withDescription(
    "Resume a previously interrupted workflow by execution ID. " +
    "Requires --durable flag."
  ),
  CliOptions.optional
);

// -----------------------------------------------------------------------------
// Command
// -----------------------------------------------------------------------------

/**
 * The agents command for running AI-powered documentation fixes.
 * Includes real-time token tracking, cost estimation, and optional durability.
 *
 * @example
 * ```bash
 * # Standard mode (fast, no crash recovery)
 * bun run docgen:agents --package @beep/contract
 *
 * # Durable mode (crash-resilient, can resume)
 * bun run docgen:agents --durable --package @beep/contract
 *
 * # Resume an interrupted workflow
 * bun run docgen:agents --durable --resume docgen-packages-common-contract
 * ```
 *
 * @category Commands
 * @since 0.1.0
 */
export const agentsCommand = CliCommand.make(
  "agents",
  {
    package: packageOption,
    parallel: parallelOption,
    dryRun: dryRunOption,
    verbose: verboseOption,
    model: modelOption,
    durable: durableOption,
    resume: resumeOption,
  },
  (options) =>
    Effect.gen(function* () {
      yield* Console.log(Output.header("Docgen Agents"));

      // Display mode info
      if (options.durable) {
        yield* Console.log(Output.info("Durable mode enabled - activities will be checkpointed"));
        if (O.isSome(options.resume)) {
          yield* Console.log(Output.info(`Resuming workflow: ${options.resume.value}`));
        }
      }

      // Validate resume option requires durable mode
      if (O.isSome(options.resume) && !options.durable) {
        yield* Console.log(Output.error("--resume requires --durable flag"));
        return;
      }

      // Set environment variable for service to pick up
      if (options.durable) {
        process.env.DOCGEN_AGENT_DURABLE = "true";
      }

      // Discover target packages
      const packages = yield* F.pipe(
        options.package,
        O.match({
          onNone: () => discoverConfiguredPackages(),
          onSome: (pkg) => resolvePackagePath(pkg).pipe(Effect.map(A.make)),
        })
      );

      const packagesLength = A.length(packages);
      if (packagesLength === 0) {
        yield* Console.log(Output.warning("No packages found with docgen configuration"));
        return;
      }

      yield* Console.log(
        Output.info(`Found ${packagesLength} package(s) to process`)
      );

      if (options.dryRun) {
        yield* Console.log(Output.info("Dry run mode - no changes will be made"));
        yield* Console.log("\nPackages that would be processed:");
        yield* Effect.forEach(packages, (pkg) =>
          Console.log(`  - ${pkg.name} (${pkg.relativePath})`)
        );
        return;
      }

      // Run the agents
      const agentService = yield* DocgenAgentService;

      const packagePaths = F.pipe(
        packages,
        A.map((p) => p.relativePath)
      );

      const startTime = DateTime.unsafeNow();

      const results = yield* agentService.fixPackages(
        packagePaths,
        options.parallel
      );

      const endTime = DateTime.unsafeNow();
      const totalTimeMs = DateTime.toEpochMillis(endTime) - DateTime.toEpochMillis(startTime);

      // Report results
      yield* Console.log(Output.header("Results"));

      const succeeded = F.pipe(
        results,
        A.filter((r) => r.success)
      );
      const failed = F.pipe(
        results,
        A.filter((r) => !r.success)
      );

      yield* Console.log(
        Output.success(`Succeeded: ${A.length(succeeded)}/${A.length(results)} packages`)
      );

      if (A.isNonEmptyArray(failed)) {
        yield* Console.log(Output.error(`Failed: ${A.length(failed)} packages`));
        yield* Effect.forEach(failed, (f) =>
          Console.log(`  - ${f.packageName}: ${F.pipe(f.errors, A.join(", "))}`)
        );
      }

      const totalFixed = F.pipe(
        results,
        A.map((r) => r.exportsFixed),
        A.reduce(0, (a, b) => a + b)
      );

      // Aggregate token usage across all packages
      const totalTokenUsage: TokenStats = F.pipe(
        results,
        A.map((r) => r.tokenUsage),
        A.reduce(
          {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
            reasoningTokens: 0,
            cachedInputTokens: 0,
          },
          (acc, usage) => ({
            inputTokens: acc.inputTokens + usage.inputTokens,
            outputTokens: acc.outputTokens + usage.outputTokens,
            totalTokens: acc.totalTokens + usage.totalTokens,
            reasoningTokens: acc.reasoningTokens + usage.reasoningTokens,
            cachedInputTokens: acc.cachedInputTokens + usage.cachedInputTokens,
          })
        )
      );

      // Estimate cost
      const modelKey = options.model as keyof typeof ANTHROPIC_PRICING;
      const estimatedCost = estimateCost(totalTokenUsage, modelKey);

      yield* Console.log(Output.info(`Total exports fixed: ${totalFixed}`));
      const totalTimeSec = F.pipe(totalTimeMs / 1000);
      const formatTime = (sec: number): string =>
        Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(sec);
      const formatNumber = (n: number): string =>
        Intl.NumberFormat("en-US").format(n);
      const formatCost = (n: number): string =>
        Intl.NumberFormat("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(n);

      yield* Console.log(Output.info(`Total time: ${formatTime(totalTimeSec)}s`));

      // Display token usage summary
      yield* Console.log(Output.header("Token Usage Summary"));
      yield* Console.log(
        F.pipe(
          [
            `Input tokens:     ${formatNumber(totalTokenUsage.inputTokens)}`,
            `Output tokens:    ${formatNumber(totalTokenUsage.outputTokens)}`,
            `Reasoning tokens: ${formatNumber(totalTokenUsage.reasoningTokens)}`,
            `Cached tokens:    ${formatNumber(totalTokenUsage.cachedInputTokens)}`,
            `Total tokens:     ${formatNumber(totalTokenUsage.totalTokens)}`,
            "",
            `Estimated cost:   $${formatCost(estimatedCost)}`,
          ],
          A.join("\n")
        )
      );
    }).pipe(Effect.provide(DocgenAgentServiceLive))
);

/**
 * @category Commands
 * @since 0.1.0
 */
export default agentsCommand;
```

### 10. Update Main Docgen Command (`docgen.ts`)

Add the agents subcommand to the existing docgen command:

```typescript
// Add to existing imports
import agentsCommand from "./agents/index.js";

// Update the docgen command to include agents
export const docgenCommand = CliCommand.make("docgen").pipe(
  CliCommand.withSubcommands([
    initCommand,
    analyzeCommand,
    generateCommand,
    aggregateCommand,
    statusCommand,
    agentsCommand, // Add this line
  ])
);
```

### 11. Package.json Script

Add to root `package.json`:

```json
{
  "scripts": {
    "docgen:agents": "ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY bun run --filter=@beep/repo-cli -- docgen agents"
  }
}
```

---

## Testing Strategy

### Unit Tests

Create `tooling/cli/src/commands/docgen/agents/__tests__/`:

```typescript
// tools.test.ts
import { describe, it, expect } from "@beep/testkit";
import { Effect, Layer, Struct } from "effect";
import { DocFixerToolkit } from "../tools.js";

describe("DocFixerToolkit", () => {
  it("should contain all required tools", () => {
    const tools = Struct.keys(DocFixerToolkit.tools);
    expect(tools).toContain("AnalyzePackage");
    expect(tools).toContain("ReadSourceFile");
    expect(tools).toContain("WriteSourceFile");
    expect(tools).toContain("ValidateExamples");
    expect(tools).toContain("SearchEffectDocs");
  });
});
```

### Integration Test

```typescript
// service.test.ts
import { describe, it, expect } from "@beep/testkit";
import { Effect, Layer } from "effect";
import { DocgenAgentService, DocgenAgentServiceLive } from "../service.js";

describe("DocgenAgentService", () => {
  it.skip("should fix a test package", async () => {
    // This test requires ANTHROPIC_API_KEY
    const program = Effect.gen(function* () {
      const service = yield* DocgenAgentService;
      const result = yield* service.fixPackage("packages/common/identity");
      expect(result.packagePath).toBe("packages/common/identity");
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(DocgenAgentServiceLive))
    );
  });
});
```

---

## Cost Considerations

### Token Usage Estimates

| Operation                        | Input Tokens | Output Tokens | Est. Cost |
|----------------------------------|--------------|---------------|-----------|
| Analyze package                  | ~2,000       | ~500          | $0.02     |
| Read source file                 | ~3,000       | ~100          | $0.02     |
| Write source file                | ~4,000       | ~3,000        | $0.05     |
| Validate examples                | ~1,000       | ~200          | $0.01     |
| **Per package (avg 20 exports)** | ~50,000      | ~30,000       | ~$0.60    |
| **Full monorepo (~30 packages)** | ~1.5M        | ~900K         | ~$18      |

### Optimization Strategies

1. **Batch operations**: Group similar exports together
2. **Use Sonnet**: Default to claude-sonnet-4-20250514 for cost efficiency
3. **Caching**: Cache Effect docs searches within a session
4. **Incremental**: Only process packages with changes since last run
5. **Dry run first**: Always analyze before committing to full run

---

## Error Handling

### Error Recovery Flow

```
Agent Error → Retry Logic → Fallback → Report
     │              │            │
     │              │            └─ Log error, continue with next package
     │              └─ Retry up to 3 times with exponential backoff
     └─ Categorize: API, Tool, Output, Iteration errors
```

### Error Types

| Error | Cause | Recovery |
|-------|-------|----------|
| `AgentApiError` | Anthropic API failure | Retry with backoff |
| `AgentToolError` | Tool execution failed | Log and continue |
| `AgentOutputError` | Invalid agent response | Parse fallback |
| `AgentIterationLimitError` | Too many iterations | Stop and report partial |

---

## Usage Examples

### Fix All Packages

```bash
# Run agents on all configured packages
bun run docgen:agents

# With verbose output
bun run docgen:agents --verbose

# Process 4 packages in parallel
bun run docgen:agents --parallel 4
```

### Fix Single Package

```bash
# By path
bun run docgen:agents -p packages/common/identity

# By package name
bun run docgen:agents -p @beep/identity
```

### Dry Run

```bash
# See what would be processed without making changes
bun run docgen:agents --dry-run
```

### Using Different Model

```bash
# Use Opus for complex packages
bun run docgen:agents -p @beep/schema --model claude-opus-4-20250514
```

### Durable Mode (Crash Recovery)

```bash
# Enable durable mode - activities are checkpointed
bun run docgen:agents --durable

# Durable mode for a specific package
bun run docgen:agents --durable -p @beep/contract

# Resume an interrupted workflow (requires durable mode)
bun run docgen:agents --durable --resume docgen-packages-common-contract
```

**When to use durable mode:**
- Processing many packages (10+) where interruption is costly
- Unreliable network connections to Anthropic API
- Long-running sessions where you might need to pause/resume
- Production deployments where crash recovery is critical

**Trade-offs:**
- Slightly higher latency due to activity checkpointing
- Requires workflow engine setup (in-memory for dev, PostgreSQL for prod)
- More complex debugging when issues arise

---

## Future Enhancements

1. **MCP Integration**: Full integration with `mcp__effect_docs__effect_docs_search`
2. **Git Integration**: Auto-commit after successful fixes
3. **Progress Streaming**: Real-time progress updates via WebSocket
4. **Caching Layer**: Cache analysis results to avoid redundant work
5. **Quality Scoring**: Score documentation quality improvements
6. **Selective Fixing**: Target specific export kinds (types, functions, etc.)
7. **Example Generation**: Use Effect source code as examples
8. **CI Integration**: Run as GitHub Action on PRs

---

## Verification Checklist

After implementation, verify:

### Core Functionality
- [ ] `bun run docgen:agents --dry-run` lists packages correctly
- [ ] `bun run docgen:agents -p packages/common/identity` processes one package
- [ ] Agent correctly identifies missing JSDoc tags
- [ ] Agent adds valid `@category`, `@example`, `@since` tags
- [ ] Examples use correct Effect patterns (no native array methods)
- [ ] `bun run docgen:generate` validates examples compile
- [ ] Error handling works for API failures
- [ ] Parallel processing respects concurrency limit
- [ ] Results are correctly aggregated and reported

### Durability Mode
- [ ] `bun run docgen:agents --durable` enables workflow mode
- [ ] Activities are checkpointed (visible in verbose logs)
- [ ] `--resume` flag requires `--durable` flag
- [ ] Interrupted workflow can be resumed with same execution ID
- [ ] Token usage is correctly tracked in durable mode
- [ ] Error recovery works with activity replay

---

## Notes for Implementer

1. **Start simple**: Implement single package flow first, then add parallelism
2. **Test with small packages**: Use `@beep/identity` or `@beep/invariant` first
3. **Monitor token usage**: Log token counts during development
4. **Validate incrementally**: Run `docgen generate` after each file change
5. **Effect patterns**: Strictly follow the codebase's Effect conventions
6. **No async/await**: Use `Effect.gen` and `Effect.tryPromise` exclusively
7. **Durability first**: Test the direct mode before enabling durable mode
8. **Activity granularity**: Each AI call should be its own Activity for optimal recovery
9. **Workflow testing**: Use `WorkflowEngine.layerMemory` for local development
10. **Production persistence**: Use PostgreSQL backend for real deployments
