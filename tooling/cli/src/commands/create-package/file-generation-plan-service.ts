/**
 * Deterministic file generation planning/execution service.
 *
 * @since 0.0.0
 * @module
 */

import { DomainError } from "@beep/repo-utils";
import { FileSystem, Path } from "effect";
import * as Effect from "effect/Effect";

/**
 * A file write operation.
 *
 * @since 0.0.0
 * @category models
 */
export interface PlannedFile {
  readonly relativePath: string;
  readonly content: string;
}

/**
 * A symlink operation.
 *
 * @since 0.0.0
 * @category models
 */
export interface PlannedSymlink {
  readonly relativePath: string;
  readonly target: string;
}

/**
 * Input payload used to create a generation plan.
 *
 * @since 0.0.0
 * @category models
 */
export interface FileGenerationPlanInput {
  readonly outputDir: string;
  readonly directories: ReadonlyArray<string>;
  readonly files: ReadonlyArray<PlannedFile>;
  readonly symlinks?: ReadonlyArray<PlannedSymlink> | undefined;
}

/**
 * Planned action kinds.
 *
 * @since 0.0.0
 * @category models
 */
export type GenerationAction =
  | {
      readonly kind: "mkdir";
      readonly relativePath: string;
    }
  | {
      readonly kind: "write-file";
      readonly relativePath: string;
      readonly content: string;
    }
  | {
      readonly kind: "symlink";
      readonly relativePath: string;
      readonly target: string;
    };

/**
 * Deterministic generation plan.
 *
 * @since 0.0.0
 * @category models
 */
export interface FileGenerationPlan {
  readonly outputDir: string;
  readonly actions: ReadonlyArray<GenerationAction>;
}

/**
 * Execution report for a plan run.
 *
 * @since 0.0.0
 * @category models
 */
export interface FileGenerationExecutionResult {
  readonly createdDirectories: number;
  readonly writtenFiles: number;
  readonly skippedFileWrites: number;
  readonly createdSymlinks: number;
  readonly skippedSymlinks: number;
}

/**
 * Service contract for deterministic generation plan orchestration.
 *
 * @since 0.0.0
 * @category models
 */
export interface FileGenerationPlanService {
  readonly createPlan: (input: FileGenerationPlanInput) => FileGenerationPlan;
  readonly previewPlan: (plan: FileGenerationPlan) => ReadonlyArray<string>;
  readonly executePlan: (
    plan: FileGenerationPlan
  ) => Effect.Effect<FileGenerationExecutionResult, DomainError, FileSystem.FileSystem | Path.Path>;
}

const toPosixPath = (value: string): string => value.replaceAll("\\", "/");

const unique = (values: ReadonlyArray<string>): ReadonlyArray<string> => [...new Set(values)];

const sortedDirectories = (values: ReadonlyArray<string>): ReadonlyArray<string> =>
  [...values].sort((left, right) => {
    const leftDepth = left.split("/").length;
    const rightDepth = right.split("/").length;

    if (leftDepth !== rightDepth) {
      return leftDepth - rightDepth;
    }

    return left.localeCompare(right);
  });

const sortedByRelativePath = <T extends { readonly relativePath: string }>(
  entries: ReadonlyArray<T>
): ReadonlyArray<T> => [...entries].sort((left, right) => left.relativePath.localeCompare(right.relativePath));

const parentDirectoriesOf = (relativePath: string): ReadonlyArray<string> => {
  const normalized = toPosixPath(relativePath);
  const segments = normalized.split("/").filter((segment) => segment.length > 0);
  const parentDirs: Array<string> = [];

  for (let i = 1; i < segments.length; i += 1) {
    parentDirs.push(segments.slice(0, i).join("/"));
  }

  return parentDirs;
};

const readIfExists = Effect.fn(function* (absolutePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const exists = yield* fs.exists(absolutePath).pipe(Effect.orElseSucceed(() => false));
  if (!exists) {
    return undefined;
  }
  return yield* fs.readFileString(absolutePath).pipe(Effect.orElseSucceed(() => undefined));
});

const ensureDirectoryFor = Effect.fn(function* (absolutePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const parentDir = path.dirname(absolutePath);
  yield* fs
    .makeDirectory(parentDir, { recursive: true })
    .pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to create directory "${parentDir}"`, cause })));
});

/**
 * Construct the default generation plan service implementation.
 *
 * @since 0.0.0
 * @category constructors
 */
export const createFileGenerationPlanService = (): FileGenerationPlanService => {
  const createPlan: FileGenerationPlanService["createPlan"] = (input) => {
    const directoryCandidates = unique([
      ...input.directories.map(toPosixPath),
      ...input.files.flatMap((file) => parentDirectoriesOf(file.relativePath)),
      ...(input.symlinks ?? []).flatMap((symlink) => parentDirectoriesOf(symlink.relativePath)),
    ]).filter((relativePath) => relativePath.length > 0);

    const mkdirActions = sortedDirectories(directoryCandidates).map(
      (relativePath) =>
        ({
          kind: "mkdir",
          relativePath,
        }) as const
    );

    const writeActions = sortedByRelativePath(input.files).map(
      (file) =>
        ({
          kind: "write-file",
          relativePath: toPosixPath(file.relativePath),
          content: file.content,
        }) as const
    );

    const symlinkActions = sortedByRelativePath(input.symlinks ?? []).map(
      (link) =>
        ({
          kind: "symlink",
          relativePath: toPosixPath(link.relativePath),
          target: link.target,
        }) as const
    );

    return {
      outputDir: input.outputDir,
      actions: [...mkdirActions, ...writeActions, ...symlinkActions],
    } satisfies FileGenerationPlan;
  };

  const previewPlan: FileGenerationPlanService["previewPlan"] = (plan) =>
    plan.actions.map((action) => {
      switch (action.kind) {
        case "mkdir":
          return `mkdir ${action.relativePath}`;
        case "write-file":
          return `write ${action.relativePath}`;
        case "symlink":
          return `symlink ${action.relativePath} -> ${action.target}`;
      }
    });

  const executePlan: FileGenerationPlanService["executePlan"] = Effect.fn(function* (plan) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    let createdDirectories = 0;
    let writtenFiles = 0;
    let skippedFileWrites = 0;
    let createdSymlinks = 0;
    let skippedSymlinks = 0;

    for (const action of plan.actions) {
      const absolutePath = path.join(plan.outputDir, action.relativePath);

      switch (action.kind) {
        case "mkdir": {
          yield* fs
            .makeDirectory(absolutePath, { recursive: true })
            .pipe(
              Effect.mapError(
                (cause) => new DomainError({ message: `Failed to create directory "${absolutePath}"`, cause })
              )
            );
          createdDirectories += 1;
          break;
        }
        case "write-file": {
          yield* ensureDirectoryFor(absolutePath);

          const existing = yield* readIfExists(absolutePath);
          if (existing === action.content) {
            skippedFileWrites += 1;
            break;
          }

          yield* fs
            .writeFileString(absolutePath, action.content)
            .pipe(
              Effect.mapError((cause) => new DomainError({ message: `Failed to write file "${absolutePath}"`, cause }))
            );

          writtenFiles += 1;
          break;
        }
        case "symlink": {
          yield* ensureDirectoryFor(absolutePath);

          const pathExists = yield* fs.exists(absolutePath).pipe(Effect.orElseSucceed(() => false));
          if (pathExists) {
            const currentTarget = yield* fs.readLink(absolutePath).pipe(Effect.orElseSucceed(() => undefined));
            if (currentTarget === action.target) {
              skippedSymlinks += 1;
              break;
            }

            yield* fs
              .remove(absolutePath, { recursive: true, force: true })
              .pipe(
                Effect.mapError(
                  (cause) => new DomainError({ message: `Failed to remove existing path "${absolutePath}"`, cause })
                )
              );
          }

          yield* fs
            .symlink(action.target, absolutePath)
            .pipe(
              Effect.mapError(
                (cause) => new DomainError({ message: `Failed to create symlink "${absolutePath}"`, cause })
              )
            );

          createdSymlinks += 1;
          break;
        }
      }
    }

    return {
      createdDirectories,
      writtenFiles,
      skippedFileWrites,
      createdSymlinks,
      skippedSymlinks,
    } satisfies FileGenerationExecutionResult;
  });

  return {
    createPlan,
    previewPlan,
    executePlan,
  };
};
