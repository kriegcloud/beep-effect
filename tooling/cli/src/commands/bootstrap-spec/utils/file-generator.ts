/**
 * @file File Generation Service for bootstrap-spec CLI
 *
 * Creates directory structure and files for a new specification based on
 * complexity level. Supports three complexity levels:
 * - simple: README + REFLECTION_LOG
 * - medium: Adds QUICK_START + outputs/
 * - complex: Full structure with orchestration, templates, handoffs
 *
 * @module bootstrap-spec/utils/file-generator
 * @since 0.1.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { FsUtils, FsUtilsLive, RepoUtils, RepoUtilsLive } from "@beep/tooling-utils";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import { FileWriteError } from "../errors.js";
import type { SpecComplexity } from "../schemas.js";
import {
  AGENT_PROMPTS_TEMPLATE,
  HANDOFF_TEMPLATE,
  MASTER_ORCHESTRATION_TEMPLATE,
  QUICK_START_TEMPLATE,
  README_TEMPLATE,
  REFLECTION_LOG_TEMPLATE,
  RUBRICS_TEMPLATE,
  renderTemplate,
  type SpecContext,
} from "./template.js";

// -----------------------------------------------------------------------------
// Identity Composer
// -----------------------------------------------------------------------------

const $I = $RepoCliId.create("commands/bootstrap-spec/utils/file-generator");

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * Represents a file to be generated.
 *
 * @since 0.1.0
 * @category models
 */
export interface GeneratedFile {
  /** Absolute path where the file will be created */
  readonly path: string;
  /** Content to write to the file */
  readonly content: string;
  /** Whether this is a new file (true) or a modification (false) */
  readonly isNew: boolean;
}

/**
 * A plan describing what directories and files will be created.
 *
 * @since 0.1.0
 * @category models
 */
export interface GenerationPlan {
  /** Directories to create (in order) */
  readonly directories: readonly string[];
  /** Files to create with their content */
  readonly files: readonly GeneratedFile[];
  /** Complexity level for the generated spec */
  readonly complexity: SpecComplexity;
}

// -----------------------------------------------------------------------------
// File Definitions by Complexity
// -----------------------------------------------------------------------------

/**
 * Returns the directories to create based on complexity.
 */
const getDirectories = (specDir: string, complexity: SpecComplexity): string[] => {
  const base = [specDir];

  if (complexity === "simple") {
    return base;
  }

  if (complexity === "medium") {
    return [...base, `${specDir}/outputs`];
  }

  // complex
  return [...base, `${specDir}/outputs`, `${specDir}/templates`, `${specDir}/handoffs`];
};

/**
 * Returns the files to create based on complexity.
 */
const getFiles = (specDir: string, context: SpecContext): GeneratedFile[] => {
  const files: GeneratedFile[] = [];

  // All complexity levels get README and REFLECTION_LOG
  files.push({
    path: `${specDir}/README.md`,
    content: renderTemplate(README_TEMPLATE, context),
    isNew: true,
  });
  files.push({
    path: `${specDir}/REFLECTION_LOG.md`,
    content: renderTemplate(REFLECTION_LOG_TEMPLATE, context),
    isNew: true,
  });

  if (context.complexity === "simple") {
    return files;
  }

  // Medium adds QUICK_START and outputs/.gitkeep
  files.push({
    path: `${specDir}/QUICK_START.md`,
    content: renderTemplate(QUICK_START_TEMPLATE, context),
    isNew: true,
  });
  files.push({
    path: `${specDir}/outputs/.gitkeep`,
    content: "",
    isNew: true,
  });

  if (context.complexity === "medium") {
    return files;
  }

  // Complex adds full structure
  files.push({
    path: `${specDir}/MASTER_ORCHESTRATION.md`,
    content: renderTemplate(MASTER_ORCHESTRATION_TEMPLATE, context),
    isNew: true,
  });
  files.push({
    path: `${specDir}/AGENT_PROMPTS.md`,
    content: renderTemplate(AGENT_PROMPTS_TEMPLATE, context),
    isNew: true,
  });
  files.push({
    path: `${specDir}/RUBRICS.md`,
    content: renderTemplate(RUBRICS_TEMPLATE, context),
    isNew: true,
  });
  files.push({
    path: `${specDir}/templates/.gitkeep`,
    content: "",
    isNew: true,
  });
  files.push({
    path: `${specDir}/handoffs/HANDOFF_P1.md`,
    content: renderTemplate(HANDOFF_TEMPLATE, context),
    isNew: true,
  });

  return files;
};

// -----------------------------------------------------------------------------
// FileGeneratorService
// -----------------------------------------------------------------------------

/**
 * Service for generating directory structure and files for new specs.
 *
 * Creates all necessary directories and files based on complexity level:
 * - simple: README.md, REFLECTION_LOG.md
 * - medium: Adds QUICK_START.md, outputs/
 * - complex: Adds MASTER_ORCHESTRATION.md, AGENT_PROMPTS.md, RUBRICS.md, templates/, handoffs/
 *
 * @example
 * ```ts
 * import { FileGeneratorService } from "./utils/file-generator.js"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const generator = yield* FileGeneratorService
 *   const context = { specName: "my-feature", complexity: "medium", ... }
 *   const plan = yield* generator.createPlan(context)
 *
 *   // Preview what will be created
 *   const preview = yield* generator.previewPlan(plan)
 *   console.log(preview)
 *
 *   // Execute the plan
 *   yield* generator.executePlan(plan)
 * })
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class FileGeneratorService extends Effect.Service<FileGeneratorService>()($I`FileGeneratorService`, {
  dependencies: [FsUtilsLive, RepoUtilsLive],
  effect: Effect.gen(function* () {
    const fsUtils = yield* FsUtils;
    const repo = yield* RepoUtils;
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const repoRoot = repo.REPOSITORY_ROOT;

    /**
     * Creates a generation plan for all directories and files.
     */
    const createPlan = (context: SpecContext): Effect.Effect<GenerationPlan, FileWriteError> =>
      Effect.gen(function* () {
        const specDir = path.join(repoRoot, "specs", context.specName);

        const directories = getDirectories(specDir, context.complexity);
        const files = getFiles(specDir, context);

        return { directories, files, complexity: context.complexity };
      }).pipe(Effect.withSpan("FileGeneratorService.createPlan"));

    /**
     * Executes a generation plan, creating directories and files.
     */
    const executePlan = (plan: GenerationPlan): Effect.Effect<void, FileWriteError> =>
      Effect.gen(function* () {
        // Create directories first (sequential to ensure parent dirs exist)
        yield* Effect.forEach(
          plan.directories,
          (dir) =>
            fsUtils.mkdirCached(dir).pipe(
              Effect.mapError(
                (cause): FileWriteError =>
                  new FileWriteError({
                    filePath: dir,
                    cause,
                  })
              )
            ),
          { concurrency: 1 }
        );

        // Write files (can be parallelized)
        yield* Effect.forEach(
          plan.files,
          (file) =>
            fs.writeFileString(file.path, file.content).pipe(
              Effect.mapError(
                (cause): FileWriteError =>
                  new FileWriteError({
                    filePath: file.path,
                    cause,
                  })
              )
            ),
          { concurrency: 10 }
        );
      }).pipe(Effect.withSpan("FileGeneratorService.executePlan"));

    /**
     * Creates a preview string for dry-run mode.
     */
    const previewPlan = (plan: GenerationPlan): Effect.Effect<string> =>
      Effect.sync(() => {
        const lines: string[] = [
          "=== DRY RUN - No files will be created ===",
          "",
          `Complexity: ${plan.complexity}`,
          "",
          "Directories to create:",
          ...F.pipe(
            plan.directories,
            A.map((d) => `  [DIR]  ${d}`)
          ),
          "",
          "Files to create:",
          ...F.pipe(
            plan.files,
            A.map((f) => `  [FILE] ${f.path}`)
          ),
          "",
          `Summary: ${A.length(plan.directories)} directories, ${A.length(plan.files)} files`,
        ];
        return F.pipe(lines, A.join("\n"));
      });

    /**
     * Check if a spec already exists.
     */
    const specExists = (specName: string): Effect.Effect<boolean, never> =>
      Effect.gen(function* () {
        const specDir = path.join(repoRoot, "specs", specName);
        return yield* fsUtils.isDirectory(specDir).pipe(Effect.catchAll(() => Effect.succeed(false as boolean)));
      });

    /**
     * Get the path to a spec directory.
     */
    const getSpecPath = (specName: string): string => path.join(repoRoot, "specs", specName);

    return {
      /** Repository root path */
      repoRoot,
      /** Create a generation plan from context */
      createPlan,
      /** Execute a generation plan */
      executePlan,
      /** Preview a plan for dry-run mode */
      previewPlan,
      /** Check if a spec already exists */
      specExists,
      /** Get path to a spec directory */
      getSpecPath,
    };
  }),
}) {}

/**
 * Live layer for FileGeneratorService.
 *
 * @since 0.1.0
 * @category layers
 */
export const FileGeneratorServiceLive = FileGeneratorService.Default;
