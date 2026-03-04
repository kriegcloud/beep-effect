/**
 * Deterministic file generation planning/execution service.
 *
 * @since 0.0.0
 * @module
 */

import { DomainError } from "@beep/repo-utils";
import { Data, Effect, FileSystem, identity, Order, Path } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Str from "effect/String";
/**
 * A file write operation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface PlannedFile {
  readonly relativePath: string;
  readonly content: string;
}

/**
 * A symlink operation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface PlannedSymlink {
  readonly relativePath: string;
  readonly target: string;
}

/**
 * Input payload used to create a generation plan.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
 */
export type GenerationAction = Data.TaggedEnum<{
  mkdir: {
    readonly relativePath: string;
  };
  "write-file": {
    readonly relativePath: string;
    readonly content: string;
  };
  symlink: {
    readonly relativePath: string;
    readonly target: string;
  };
}>;

const GenerationAction = Data.taggedEnum<GenerationAction>();

/**
 * Deterministic generation plan.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface FileGenerationPlan {
  readonly outputDir: string;
  readonly actions: ReadonlyArray<GenerationAction>;
}

/**
 * Execution report for a plan run.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @category DomainModel
 */
export interface FileGenerationPlanService {
  readonly createPlan: (input: FileGenerationPlanInput) => FileGenerationPlan;
  readonly previewPlan: (plan: FileGenerationPlan) => ReadonlyArray<string>;
  readonly executePlan: (
    plan: FileGenerationPlan
  ) => Effect.Effect<FileGenerationExecutionResult, DomainError, FileSystem.FileSystem | Path.Path>;
}

const toPosixPath = (value: string): string => Str.replace(/\\/g, "/")(value);

const unique = (values: ReadonlyArray<string>): ReadonlyArray<string> => A.dedupe(values);

const byDirectoryDepthAscending: Order.Order<string> = Order.mapInput(Order.Number, (value: string) =>
  A.length(Str.split("/")(value))
);

const byDirectoryPathAscending: Order.Order<string> = Order.mapInput(Order.String, (value: string) => value);

const byDirectoryAscending: Order.Order<string> = Order.combine(byDirectoryDepthAscending, byDirectoryPathAscending);

const sortedDirectories = (values: ReadonlyArray<string>): ReadonlyArray<string> =>
  A.sort(values, byDirectoryAscending);

const sortedByRelativePath = <T extends { readonly relativePath: string }>(
  entries: ReadonlyArray<T>
): ReadonlyArray<T> =>
  A.sort(
    entries,
    Order.mapInput(Order.String, (entry: T) => toPosixPath(entry.relativePath))
  );

const parentDirectoriesOf = (relativePath: string): ReadonlyArray<string> => {
  const normalized = toPosixPath(relativePath);
  const segments = A.filter(Str.split("/")(normalized), Str.isNonEmpty);
  const lastSegmentIndex = A.length(segments) - 1;
  let currentSegments = A.empty<string>();
  let parentDirs = A.empty<string>();

  for (let index = 0; index < lastSegmentIndex; index += 1) {
    const segment = A.get(segments, index);
    if (O.isNone(segment)) {
      continue;
    }
    currentSegments = A.append(currentSegments, segment.value);
    parentDirs = A.append(parentDirs, A.join(currentSegments, "/"));
  }

  return parentDirs;
};

const readIfExists = Effect.fn(function* (absolutePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const exists = yield* fs.exists(absolutePath).pipe(Effect.orElseSucceed(() => false));
  if (!exists) {
    return O.none<string>();
  }
  return yield* fs.readFileString(absolutePath).pipe(Effect.map(O.some), Effect.orElseSucceed(O.none<string>));
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
 * @returns Deterministic plan preview and execution helpers.
 * @since 0.0.0
 * @category DomainModel
 */
export const createFileGenerationPlanService = (): FileGenerationPlanService => {
  const createPlan: FileGenerationPlanService["createPlan"] = (input) => {
    const symlinks = O.getOrElse(O.fromNullishOr(input.symlinks), A.empty<PlannedSymlink>);

    const directoryCandidates = A.filter(
      unique(
        A.flatMap(
          A.make(
            A.map(input.directories, toPosixPath),
            A.flatMap(input.files, (file) => parentDirectoriesOf(file.relativePath)),
            A.flatMap(symlinks, (symlink) => parentDirectoriesOf(symlink.relativePath))
          ),
          identity
        )
      ),
      Str.isNonEmpty
    );

    const mkdirActions = A.map(sortedDirectories(directoryCandidates), (relativePath) =>
      GenerationAction.mkdir({ relativePath })
    );

    const writeActions = A.map(sortedByRelativePath(input.files), (file) =>
      GenerationAction["write-file"]({
        relativePath: toPosixPath(file.relativePath),
        content: file.content,
      })
    );

    const symlinkActions = A.map(sortedByRelativePath(symlinks), (link) =>
      GenerationAction.symlink({
        relativePath: toPosixPath(link.relativePath),
        target: link.target,
      })
    );

    const actions: ReadonlyArray<GenerationAction> = A.appendAll(
      A.appendAll(mkdirActions, writeActions),
      symlinkActions
    );

    return {
      outputDir: input.outputDir,
      actions,
    } satisfies FileGenerationPlan;
  };

  const matchPlan = GenerationAction.$match({
    mkdir: (action) => `mkdir ${action.relativePath}`,
    ["write-file" as const]: (action) => `write ${action.relativePath}`,
    symlink: (action) => `symlink ${action.relativePath} -> ${action.target}`,
  });

  const previewPlan: FileGenerationPlanService["previewPlan"] = (plan) => A.map(plan.actions, matchPlan);

  const executePlan: FileGenerationPlanService["executePlan"] = Effect.fn(function* (plan) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    let createdDirectories = 0;
    let writtenFiles = 0;
    let skippedFileWrites = 0;
    let createdSymlinks = 0;
    let skippedSymlinks = 0;

    const runAction = (action: GenerationAction, absolutePath: string) =>
      GenerationAction.$match(action, {
        mkdir: () =>
          fs.makeDirectory(absolutePath, { recursive: true }).pipe(
            Effect.mapError(
              (cause) => new DomainError({ message: `Failed to create directory "${absolutePath}"`, cause })
            ),
            Effect.tap(() =>
              Effect.sync(() => {
                createdDirectories += 1;
              })
            )
          ),
        ["write-file" as const]: (writeAction) =>
          ensureDirectoryFor(absolutePath).pipe(
            Effect.andThen(() => readIfExists(absolutePath)),
            Effect.andThen((existing) =>
              O.isSome(existing) && existing.value === writeAction.content
                ? Effect.sync(() => {
                    skippedFileWrites += 1;
                  })
                : fs.writeFileString(absolutePath, writeAction.content).pipe(
                    Effect.mapError(
                      (cause) => new DomainError({ message: `Failed to write file "${absolutePath}"`, cause })
                    ),
                    Effect.tap(() =>
                      Effect.sync(() => {
                        writtenFiles += 1;
                      })
                    )
                  )
            )
          ),
        symlink: (linkAction) =>
          ensureDirectoryFor(absolutePath).pipe(
            Effect.andThen(() => fs.exists(absolutePath).pipe(Effect.orElseSucceed(() => false))),
            Effect.andThen((pathExists) =>
              pathExists
                ? fs.readLink(absolutePath).pipe(
                    Effect.map(O.some),
                    Effect.orElseSucceed(O.none<string>),
                    Effect.andThen((currentTarget) =>
                      O.isSome(currentTarget) && currentTarget.value === linkAction.target
                        ? Effect.sync(() => {
                            skippedSymlinks += 1;
                          })
                        : fs.remove(absolutePath, { recursive: true, force: true }).pipe(
                            Effect.mapError(
                              (cause) =>
                                new DomainError({ message: `Failed to remove existing path "${absolutePath}"`, cause })
                            ),
                            Effect.andThen(() =>
                              fs.symlink(linkAction.target, absolutePath).pipe(
                                Effect.mapError(
                                  (cause) =>
                                    new DomainError({ message: `Failed to create symlink "${absolutePath}"`, cause })
                                ),
                                Effect.tap(() =>
                                  Effect.sync(() => {
                                    createdSymlinks += 1;
                                  })
                                )
                              )
                            )
                          )
                    )
                  )
                : fs.symlink(linkAction.target, absolutePath).pipe(
                    Effect.mapError(
                      (cause) => new DomainError({ message: `Failed to create symlink "${absolutePath}"`, cause })
                    ),
                    Effect.tap(() =>
                      Effect.sync(() => {
                        createdSymlinks += 1;
                      })
                    )
                  )
            )
          ),
      });

    for (const action of plan.actions) {
      const absolutePath = path.join(plan.outputDir, action.relativePath);
      yield* runAction(action, absolutePath);
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
