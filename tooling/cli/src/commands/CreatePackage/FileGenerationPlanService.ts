/**
 * Deterministic file generation planning/execution service.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { DomainError } from "@beep/repo-utils";
import { LiteralKit, normalizePath } from "@beep/schema";
import { thunkFalse, thunkSomeEmptyArray } from "@beep/utils";
import { Effect, FileSystem, flow, identity, Order, Path, ServiceMap, String as Str, Struct } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/CreatePackage/FileGenerationPlanService");
/**
 * A file write operation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PlannedFile extends S.Class<PlannedFile>($I`PlannedFile`)(
  {
    relativePath: S.String,
    content: S.String,
  },
  $I.annote("PlannedFile", {
    description: "A file write operation.",
  })
) {}

/**
 * A symlink operation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PlannedSymlink extends S.Class<PlannedSymlink>($I`PlannedSymlink`)(
  {
    relativePath: S.String,
    target: S.String,
  },
  $I.annote("PlannedSymlink", {
    description: "A symlink operation.",
  })
) {}

/**
 * Input payload used to create a generation plan.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class FileGenerationPlanInput extends S.Class<FileGenerationPlanInput>($I`FileGenerationPlanInput`)(
  {
    outputDir: S.String,
    directories: S.Array(S.String),
    files: S.Array(PlannedFile),
    symlinks: S.Array(PlannedSymlink).pipe(
      S.withConstructorDefault(thunkSomeEmptyArray<PlannedSymlink>),
      S.withDecodingDefaultKey(A.empty<PlannedSymlink>)
    ),
  },
  $I.annote("FileGenerationPlanInput", {
    description: "Input payload used to create a generation plan.",
  })
) {}

/**
 * Planned action kinds.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const GenerationActionKind = LiteralKit(["mkdir", "write-file", "symlink"]).annotate(
  $I.annote("GenerationActionKind", {
    description: "Planned action kinds for deterministic generation.",
  })
);
/**
 * Planned generation action.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type GenerationActionKind = typeof GenerationActionKind.Type;

class GenerationActionMkdir extends S.Class<GenerationActionMkdir>($I`GenerationActionMkdir`)(
  {
    kind: S.tag("mkdir"),
    relativePath: S.String,
  },
  $I.annote("GenerationActionMkdir", {
    description: "Directory creation action.",
  })
) {}

class GenerationActionWriteFile extends S.Class<GenerationActionWriteFile>($I`GenerationActionWriteFile`)(
  {
    kind: S.tag("write-file"),
    relativePath: S.String,
    content: S.String,
  },
  $I.annote("GenerationActionWriteFile", {
    description: "File write action.",
  })
) {}

class GenerationActionSymlink extends S.Class<GenerationActionSymlink>($I`GenerationActionSymlink`)(
  {
    kind: S.tag("symlink"),
    relativePath: S.String,
    target: S.String,
  },
  $I.annote("GenerationActionSymlink", {
    description: "Symlink creation action.",
  })
) {}

/**
 * Planned generation action schema.
 *
 * @returns Tagged union schema keyed by `kind`.
 * @since 0.0.0
 * @category DomainModel
 */
export const GenerationAction = S.Union([GenerationActionMkdir, GenerationActionWriteFile, GenerationActionSymlink])
  .annotate(
    $I.annote("GenerationAction", {
      description: "Planned generation action.",
    })
  )
  .pipe(S.toTaggedUnion("kind"));
/**
 * Planned generation action.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type GenerationAction = typeof GenerationAction.Type;

/**
 * Deterministic generation plan.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class FileGenerationPlan extends S.Class<FileGenerationPlan>($I`FileGenerationPlan`)(
  {
    outputDir: S.String,
    actions: S.Array(GenerationAction),
  },
  $I.annote("FileGenerationPlan", {
    description: "Deterministic generation plan.",
  })
) {}

/**
 * Execution report for a plan run.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class FileGenerationExecutionResult extends S.Class<FileGenerationExecutionResult>(
  $I`FileGenerationExecutionResult`
)(
  {
    createdDirectories: S.Number,
    writtenFiles: S.Number,
    skippedFileWrites: S.Number,
    createdSymlinks: S.Number,
    skippedSymlinks: S.Number,
  },
  $I.annote("FileGenerationExecutionResult", {
    description: "Execution report for a plan run.",
  })
) {}

/**
 * Service contract for deterministic generation plan orchestration.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type FileGenerationPlanServiceShape = {
  readonly createPlan: (input: FileGenerationPlanInput) => FileGenerationPlan;
  readonly previewPlan: (plan: FileGenerationPlan) => ReadonlyArray<string>;
  readonly executePlan: (
    plan: FileGenerationPlan
  ) => Effect.Effect<FileGenerationExecutionResult, DomainError, FileSystem.FileSystem | Path.Path>;
};

/**
 * Service tag for deterministic file-generation planning and execution.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class FileGenerationPlanService extends ServiceMap.Service<
  FileGenerationPlanService,
  FileGenerationPlanServiceShape
>()($I`FileGenerationPlanService`) {}

const toPosixPath = normalizePath;
const stringEquivalence = S.toEquivalence(S.String);

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
  const exists = yield* fs.exists(absolutePath).pipe(Effect.orElseSucceed(thunkFalse));
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
export const createFileGenerationPlanService = (): FileGenerationPlanServiceShape => {
  const createPlan: FileGenerationPlanServiceShape["createPlan"] = (input) => {
    const symlinks = input.symlinks;

    const parentDirsOf = flow((i: PlannedFile | PlannedSymlink) => Struct.get(i, "relativePath"), parentDirectoriesOf);

    const directoryCandidates = A.filter(
      unique(
        A.flatMap(
          A.make(
            A.map(input.directories, toPosixPath),
            A.flatMap(input.files, parentDirsOf),
            A.flatMap(symlinks, parentDirsOf)
          ),
          identity
        )
      ),
      Str.isNonEmpty
    );

    const mkdirActions = A.map(sortedDirectories(directoryCandidates), (relativePath) =>
      GenerationAction.cases.mkdir.makeUnsafe({ relativePath })
    );

    const writeActions = A.map(sortedByRelativePath(input.files), (file) =>
      GenerationAction.cases["write-file"].makeUnsafe({
        relativePath: toPosixPath(file.relativePath),
        content: file.content,
      })
    );

    const symlinkActions = A.map(sortedByRelativePath(symlinks), (link) =>
      GenerationAction.cases.symlink.makeUnsafe({
        relativePath: toPosixPath(link.relativePath),
        target: link.target,
      })
    );

    const actions: ReadonlyArray<GenerationAction> = A.appendAll(
      A.appendAll(mkdirActions, writeActions),
      symlinkActions
    );

    return new FileGenerationPlan({
      outputDir: input.outputDir,
      actions,
    });
  };

  const matchPlan = GenerationAction.match({
    mkdir: (action) => `mkdir ${action.relativePath}`,
    "write-file": (action) => `write ${action.relativePath}`,
    symlink: (action) => `symlink ${action.relativePath} -> ${action.target}`,
  });

  const previewPlan: FileGenerationPlanServiceShape["previewPlan"] = (plan) => A.map(plan.actions, matchPlan);

  const executePlan: FileGenerationPlanServiceShape["executePlan"] = Effect.fn(function* (plan) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    let createdDirectories = 0;
    let writtenFiles = 0;
    let skippedFileWrites = 0;
    let createdSymlinks = 0;
    let skippedSymlinks = 0;

    const runAction = (action: GenerationAction, absolutePath: string) =>
      GenerationAction.match(action, {
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
        "write-file": (writeAction) =>
          ensureDirectoryFor(absolutePath).pipe(
            Effect.andThen(() => readIfExists(absolutePath)),
            Effect.andThen((existing) =>
              O.isSome(existing) && stringEquivalence(existing.value, writeAction.content)
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
            Effect.andThen(() => fs.exists(absolutePath).pipe(Effect.orElseSucceed(thunkFalse))),
            Effect.andThen((pathExists) =>
              pathExists
                ? fs.readLink(absolutePath).pipe(
                    Effect.map(O.some),
                    Effect.orElseSucceed(O.none<string>),
                    Effect.andThen((currentTarget) =>
                      O.isSome(currentTarget) && stringEquivalence(currentTarget.value, linkAction.target)
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

    return new FileGenerationExecutionResult({
      createdDirectories,
      writtenFiles,
      skippedFileWrites,
      createdSymlinks,
      skippedSymlinks,
    });
  });

  return {
    createPlan,
    previewPlan,
    executePlan,
  };
};
