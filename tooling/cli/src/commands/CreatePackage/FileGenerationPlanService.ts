/**
 * Deterministic file generation planning/execution service.
 *
 * @module @beep/repo-cli/commands/CreatePackage/FileGenerationPlanService
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { DomainError } from "@beep/repo-utils";
import { LiteralKit, normalizePath } from "@beep/schema";
import { Struct, thunkFalse } from "@beep/utils";
import { Context, Effect, FileSystem, flow, identity, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as Eq from "effect/Equal";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $RepoCliId.create("commands/CreatePackage/FileGenerationPlanService");
const relativePlanPathSegments = flow(normalizePath, Str.split("/"), A.filter(Str.isNonEmpty));

const isSafeRelativePlanPath = (value: string): boolean => {
  const normalized = normalizePath(value);
  const segments = relativePlanPathSegments(value);

  return (
    Str.isNonEmpty(normalized) &&
    !pipe(normalized, Str.startsWith("/")) &&
    A.isReadonlyArrayNonEmpty(segments) &&
    !A.some(segments, P.or(Eq.equals("."), Eq.equals("..")))
  );
};

const RelativePlanPathChecks = S.makeFilterGroup(
  [
    S.isNonEmpty({
      identifier: $I`RelativePlanPathNonEmptyCheck`,
      title: "Relative plan path non-empty",
      description: "Create-package plan paths must not be empty.",
      message: "Create-package plan paths must not be empty.",
    }),
    S.makeFilter(P.not(Str.startsWith("/")), {
      identifier: $I`RelativePlanPathNotAbsoluteCheck`,
      title: "Relative plan path not absolute",
      description: "Create-package plan paths must stay relative to the output directory.",
      message: "Create-package plan paths must stay relative to the output directory.",
    }),
    S.makeFilter(isSafeRelativePlanPath, {
      identifier: $I`RelativePlanPathTraversalCheck`,
      title: "Relative plan path traversal-safe",
      description: "Create-package plan paths must not contain traversal segments.",
      message: "Create-package plan paths must not contain '.' or '..' segments.",
    }),
  ],
  {
    identifier: $I`RelativePlanPathChecks`,
    title: "Relative plan path",
    description: "Validated relative path used by create-package plan entries.",
  }
);

const RelativePlanPath = S.String.check(RelativePlanPathChecks).pipe(
  S.annotate(
    $I.annote("RelativePlanPath", {
      description: "Validated output-relative path used by create-package plan entries.",
    })
  )
);

const SymlinkTargetPath = RelativePlanPath.pipe(
  S.annotate(
    $I.annote("SymlinkTargetPath", {
      description: "Validated relative symlink target path used by create-package plan entries.",
    })
  )
);

/**
 * A file write operation.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class PlannedFile extends S.Class<PlannedFile>($I`PlannedFile`)(
  {
    relativePath: RelativePlanPath,
    content: S.String,
  },
  $I.annote("PlannedFile", {
    description: "A file write operation.",
  })
) {}

/**
 * A symlink operation.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class PlannedSymlink extends S.Class<PlannedSymlink>($I`PlannedSymlink`)(
  {
    relativePath: RelativePlanPath,
    target: SymlinkTargetPath,
  },
  $I.annote("PlannedSymlink", {
    description: "A symlink operation.",
  })
) {}

/**
 * Input payload used to create a generation plan.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class FileGenerationPlanInput extends S.Class<FileGenerationPlanInput>($I`FileGenerationPlanInput`)(
  {
    outputDir: S.String,
    directories: S.Array(RelativePlanPath),
    files: S.Array(PlannedFile),
    symlinks: S.Array(PlannedSymlink).pipe(
      S.withConstructorDefault(Effect.succeed(A.empty<PlannedSymlink>())),
      S.withDecodingDefaultKey(Effect.succeed(A.empty<PlannedSymlink>()))
    ),
  },
  $I.annote("FileGenerationPlanInput", {
    description: "Input payload used to create a generation plan.",
  })
) {}

/**
 * Planned action kinds.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const GenerationActionKind = LiteralKit(["mkdir", "write-file", "symlink"]).annotate(
  $I.annote("GenerationActionKind", {
    description: "Planned action kinds for deterministic generation.",
  })
);
/**
 * Planned generation action.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type GenerationActionKind = typeof GenerationActionKind.Type;

class GenerationActionMkdir extends S.Class<GenerationActionMkdir>($I`GenerationActionMkdir`)(
  {
    kind: S.tag("mkdir"),
    relativePath: RelativePlanPath,
  },
  $I.annote("GenerationActionMkdir", {
    description: "Directory creation action.",
  })
) {}

class GenerationActionWriteFile extends S.Class<GenerationActionWriteFile>($I`GenerationActionWriteFile`)(
  {
    kind: S.tag("write-file"),
    relativePath: RelativePlanPath,
    content: S.String,
  },
  $I.annote("GenerationActionWriteFile", {
    description: "File write action.",
  })
) {}

class GenerationActionSymlink extends S.Class<GenerationActionSymlink>($I`GenerationActionSymlink`)(
  {
    kind: S.tag("symlink"),
    relativePath: RelativePlanPath,
    target: SymlinkTargetPath,
  },
  $I.annote("GenerationActionSymlink", {
    description: "Symlink creation action.",
  })
) {}

/**
 * Planned generation action schema.
 *
 * @returns Tagged union schema keyed by `kind`.
 * @category DomainModel
 * @since 0.0.0
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
 * @category DomainModel
 * @since 0.0.0
 */
export type GenerationAction = typeof GenerationAction.Type;

/**
 * Deterministic generation plan.
 *
 * @category DomainModel
 * @since 0.0.0
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
 * @category DomainModel
 * @since 0.0.0
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
 * @category DomainModel
 * @since 0.0.0
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
 * @category PortContract
 * @since 0.0.0
 */
export class FileGenerationPlanService extends Context.Service<
  FileGenerationPlanService,
  FileGenerationPlanServiceShape
>()($I`FileGenerationPlanService`) {}

const toPosixPath = normalizePath;
const stringEquivalence = S.toEquivalence(S.String);

const unique = (values: ReadonlyArray<string>): ReadonlyArray<string> => A.dedupe(values);

const byDirectoryDepthAscending: Order.Order<string> = Order.mapInput(Order.Number, flow(Str.split("/"), A.length));

const byDirectoryPathAscending: Order.Order<string> = Order.mapInput(Order.String, identity);

const byDirectoryAscending: Order.Order<string> = Order.combine(byDirectoryDepthAscending, byDirectoryPathAscending);

const sortedDirectories = (values: ReadonlyArray<string>): ReadonlyArray<string> =>
  A.sort(values, byDirectoryAscending);

const sortedByRelativePath = <
  T extends {
    readonly relativePath: string;
  },
>(
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
    .pipe(Effect.mapError(DomainError.newCause(`Failed to create directory "${parentDir}"`)));
});

const resolveExistingAncestor = Effect.fn(function* (absolutePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  let candidate = absolutePath;

  while (true) {
    const exists = yield* fs
      .exists(candidate)
      .pipe(Effect.mapError(DomainError.newCause(`Failed to inspect path "${candidate}"`)));

    if (exists) {
      const canonicalPath = yield* fs
        .realPath(candidate)
        .pipe(Effect.mapError(DomainError.newCause(`Failed to resolve path "${candidate}"`)));

      return {
        canonicalPath,
        existingPath: candidate,
      } as const;
    }

    const parent = path.dirname(candidate);
    if (parent === candidate) {
      return yield* new DomainError({
        message: `Failed to find an existing ancestor for "${absolutePath}"`,
      });
    }
    candidate = parent;
  }
});

const resolveContainedPath = Effect.fn(function* (rootDir: string, relativePath: string) {
  const path = yield* Path.Path;
  const resolvedRoot = path.resolve(rootDir);
  const resolvedPath = path.resolve(resolvedRoot, relativePath);
  const relativeFromRoot = normalizePath(path.relative(resolvedRoot, resolvedPath));

  if (path.isAbsolute(relativeFromRoot) || relativeFromRoot === ".." || Str.startsWith("../")(relativeFromRoot)) {
    return yield* new DomainError({
      message: `Generation action escapes output directory: "${relativePath}"`,
    });
  }

  const rootAncestor = yield* resolveExistingAncestor(resolvedRoot);
  if (rootAncestor.existingPath !== rootAncestor.canonicalPath) {
    return yield* new DomainError({
      message: `Generation output directory uses a symlinked ancestor: "${rootAncestor.existingPath}" -> "${rootAncestor.canonicalPath}"`,
    });
  }

  const pathAncestor = yield* resolveExistingAncestor(resolvedPath);
  if (pathAncestor.existingPath !== pathAncestor.canonicalPath) {
    return yield* new DomainError({
      message: `Generation action resolves through a symlinked ancestor: "${pathAncestor.existingPath}" -> "${pathAncestor.canonicalPath}"`,
    });
  }

  return resolvedPath;
});

/**
 * Construct the default generation plan service implementation.
 *
 * @returns Deterministic plan preview and execution helpers.
 * @category DomainModel
 * @since 0.0.0
 */
export const createFileGenerationPlanService = (): FileGenerationPlanServiceShape => {
  const createPlan: FileGenerationPlanServiceShape["createPlan"] = (input) => {
    const symlinks = input.symlinks;

    const parentDirsOf = flow(
      Struct.get<PlannedFile | PlannedSymlink, "relativePath">("relativePath"),
      parentDirectoriesOf
    );

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

    const mkdirActions = A.map(
      sortedDirectories(directoryCandidates),
      (relativePath) => new GenerationAction.cases.mkdir({ relativePath })
    );

    const writeActions = A.map(
      sortedByRelativePath(input.files),
      (file) =>
        new GenerationAction.cases["write-file"]({
          relativePath: toPosixPath(file.relativePath),
          content: file.content,
        })
    );

    const symlinkActions = A.map(
      sortedByRelativePath(symlinks),
      (link) =>
        new GenerationAction.cases.symlink({
          relativePath: toPosixPath(link.relativePath),
          target: toPosixPath(link.target),
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
            Effect.mapError(DomainError.newCause(`Failed to create directory "${absolutePath}"`)),
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
                    Effect.mapError(DomainError.newCause(`Failed to write file "${absolutePath}"`)),
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
                        : fs
                            .remove(absolutePath, {
                              recursive: true,
                              force: true,
                            })
                            .pipe(
                              Effect.mapError(DomainError.newCause(`Failed to remove existing path "${absolutePath}"`)),
                              Effect.andThen(() =>
                                fs.symlink(linkAction.target, absolutePath).pipe(
                                  Effect.mapError(DomainError.newCause(`Failed to create symlink "${absolutePath}"`)),
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
                    Effect.mapError(DomainError.newCause(`Failed to create symlink "${absolutePath}"`)),
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
      const absolutePath = yield* resolveContainedPath(plan.outputDir, action.relativePath);
      if (action.kind === "symlink") {
        const resolvedTarget = yield* resolveContainedPath(path.dirname(absolutePath), action.target);
        const relativeToOutputDir = normalizePath(path.relative(path.resolve(plan.outputDir), resolvedTarget));
        if (P.some([path.isAbsolute, Eq.equals(".."), Str.startsWith("../")])(relativeToOutputDir)) {
          return yield* new DomainError({
            message: `Symlink target escapes output directory: "${action.target}"`,
          });
        }
      }
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
