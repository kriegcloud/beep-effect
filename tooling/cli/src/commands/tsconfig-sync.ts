/**
 * tsconfig-sync command - synchronize workspace tsconfig references and root aliases.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import {
  buildRepoDependencyIndex,
  type CyclicDependencyError,
  collectTsConfigPaths,
  DomainError,
  detectCycles,
  type FsUtils,
  findRepoRoot,
  type NoSuchFileError,
  resolveWorkspaceDirs,
  topologicalSort,
  type WorkspaceDeps,
} from "@beep/repo-utils";
import { LiteralKit } from "@beep/schema";
import { thunkFalse, thunkUndefined } from "@beep/utils";
import { Console, Effect, FileSystem, HashMap, HashSet, Path, Tuple } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Command, Flag } from "effect/unstable/cli";
import * as jsonc from "jsonc-parser";

/**
 * Formatting options used for jsonc edits.
 *
 * @since 0.0.0
 * @category Configuration
 */
const FORMATTING_OPTIONS: jsonc.FormattingOptions = {
  tabSize: 2,
  insertSpaces: true,
};

/**
 * Synthetic root key in repo-utils dependency maps.
 *
 * @since 0.0.0
 * @category Configuration
 */
const ROOT_DEP_INDEX_KEY = "@beep/root" as const;
const $I = $RepoCliId.create("commands/tsconfig-sync");

/**
 * Canonical alias key matcher managed by this command.
 *
 * Matches exactly:
 * - `@beep/<name>`
 * - `@beep/<name>/*`
 *
 * @since 0.0.0
 * @category Configuration
 */
const CANONICAL_ALIAS_KEY_PATTERN = /^@beep\/[^/*]+(?:\/\*)?$/;

/**
 * Drift error raised in check mode when changes are required.
 *
 * @since 0.0.0
 * @category CrossCutting
 */
export class TsconfigSyncDriftError extends S.TaggedErrorClass<TsconfigSyncDriftError>($I`TsconfigSyncDriftError`)(
  "TsconfigSyncDriftError",
  {
    fileCount: S.Number,
    summary: S.String,
  },
  $I.annote("TsconfigSyncDriftError", {
    title: "Tsconfig Sync Drift Error",
    description: "Raised when tsconfig-sync --check detects one or more files that are out of sync.",
  })
) {}

/**
 * Cycle error raised when workspace dependency cycles are detected.
 *
 * @since 0.0.0
 * @category CrossCutting
 */
export class TsconfigSyncCycleError extends S.TaggedErrorClass<TsconfigSyncCycleError>($I`TsconfigSyncCycleError`)(
  "TsconfigSyncCycleError",
  {
    cycles: S.Array(S.Array(S.String)),
    message: S.String,
  },
  $I.annote("TsconfigSyncCycleError", {
    title: "Tsconfig Sync Cycle Error",
    description: "Raised when workspace dependency graph contains one or more cycles.",
  })
) {}

/**
 * Filter error raised when `--filter` does not match any workspace package.
 *
 * @since 0.0.0
 * @category CrossCutting
 */
export class TsconfigSyncFilterError extends S.TaggedErrorClass<TsconfigSyncFilterError>($I`TsconfigSyncFilterError`)(
  "TsconfigSyncFilterError",
  {
    filter: S.String,
    message: S.String,
  },
  $I.annote("TsconfigSyncFilterError", {
    title: "Tsconfig Sync Filter Error",
    description: "Raised when tsconfig-sync filter does not match any workspace package name or path.",
  })
) {}

/**
 * Command execution mode.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const TsconfigSyncMode = LiteralKit(["sync", "check", "dry-run"]).annotate(
  $I.annote("TsconfigSyncMode", {
    description: "Command execution mode for tsconfig-sync.",
  })
);

type TsconfigSyncMode = typeof TsconfigSyncMode.Type;

const makeSyncRunOption = <T extends TsconfigSyncMode>(mode: S.Literal<T>) =>
  S.Struct({
    mode: S.tag(mode.literal),
    filter: S.optionalKey(S.UndefinedOr(S.String)),
    verbose: S.Boolean,
  });

/**
 * Runtime options for executing tsconfig sync at a repo root.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const TsconfigSyncRunOptions = TsconfigSyncMode.mapMembers(
  Tuple.evolve([makeSyncRunOption, makeSyncRunOption, makeSyncRunOption])
)
  .pipe(S.toTaggedUnion("mode"))
  .annotate(
    $I.annote("TsconfigSyncRunOptions", {
      description: "Runtime options for executing tsconfig sync at a repo root.",
    })
  );
export type TsconfigSyncRunOptions = typeof TsconfigSyncRunOptions.Type;

/**
 * Sync change section categories.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const TsconfigSyncSection = LiteralKit(["root-references", "root-aliases", "package-references"]).annotate(
  $I.annote("TsconfigSyncSection", {
    description: "Sync change section categories for tsconfig-sync.",
  })
);

export type TsconfigSyncSection = typeof TsconfigSyncSection.Type;
const baseChange = {
  filePath: S.String,
  summary: S.String,
} as const;
const makeTsconfigSyncChange = <T extends TsconfigSyncSection>(section: S.Literal<T>) =>
  S.Struct({ ...baseChange, section: S.tag(section.literal) });

/**
 * A single planned file change.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const TsconfigSyncChange = TsconfigSyncSection.mapMembers(
  Tuple.evolve([makeTsconfigSyncChange, makeTsconfigSyncChange, makeTsconfigSyncChange])
)
  .pipe(S.toTaggedUnion("section"))
  .annotate(
    $I.annote("TsconfigSyncChange", {
      description: "A single planned file change for tsconfig-sync.",
    })
  );

export type TsconfigSyncChange = typeof TsconfigSyncChange.Type;

// export interface TsconfigSyncChange {
//   readonly filePath: string;
//   readonly section: TsconfigSyncSection;
//   readonly summary: string;
// }
// interface PlannedFileChange extends TsconfigSyncChange {
//   readonly content: string;
// }
const makePlannedFileChange = <T extends TsconfigSyncSection>(section: S.Literal<T>) =>
  S.Struct({ ...baseChange, section: S.tag(section.literal), content: S.String });

export const PlannedFileChange = TsconfigSyncSection.mapMembers(
  Tuple.evolve([makePlannedFileChange, makePlannedFileChange, makePlannedFileChange])
)
  .pipe(S.toTaggedUnion("section"))
  .annotate(
    $I.annote("TsconfigSyncChange", {
      description: "A single planned file change for tsconfig-sync.",
    })
  );

export type PlannedFileChange = typeof PlannedFileChange.Type;

const makeTsconfigSyncResult = <T extends TsconfigSyncMode>(mode: S.Literal<T>) =>
  S.Struct({
    mode: S.tag(mode.literal),
    changedFiles: S.Number,
    changes: S.Array(TsconfigSyncChange),
  });

/**
 * Result emitted after a sync run.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const TsconfigSyncResult = TsconfigSyncMode.mapMembers(
  Tuple.evolve([makeTsconfigSyncResult, makeTsconfigSyncResult, makeTsconfigSyncResult])
)
  .pipe(S.toTaggedUnion("mode"))
  .annotate(
    $I.annote("TsconfigSyncResult", {
      description: "Result emitted after a sync run.",
    })
  );

export type TsconfigSyncResult = typeof TsconfigSyncResult.Type;

type TsconfigSyncError =
  | DomainError
  | NoSuchFileError
  | CyclicDependencyError
  | TsconfigSyncCycleError
  | TsconfigSyncDriftError
  | TsconfigSyncFilterError;

export class WorkspaceDescriptor extends S.Class<WorkspaceDescriptor>($I`WorkspaceDescriptor`)(
  {
    packageName: S.String,
    absoluteDir: S.String,
    relativeDir: S.String,
    ownerTsconfigPath: S.UndefinedOr(S.String),
    hasProjectTsconfig: S.Boolean,
    hasSourceIndex: S.Boolean,
  },
  $I.annote("WorkspaceDescriptor", {
    description: "A workspace package descriptor with metadata for tsconfig synchronization.",
  })
) {}

export class TsconfigWithReferences extends S.Class<TsconfigWithReferences>($I`TsconfigWithReferences`)(
  {
    references: S.optionalKey(S.Array(S.Struct({ path: S.optionalKey(S.Unknown) }))),
  },
  $I.annote("TsconfigWithReferences", {
    description: "A class representing a tsconfig.json file with references property.",
  })
) {}

export class TsconfigWithPaths extends S.Class<TsconfigWithPaths>($I`TsconfigWithPaths`)(
  {
    compilerOptions: S.optionalKey(S.Struct({ paths: S.optionalKey(S.Record(S.String, S.Unknown)) })),
  },
  $I.annote("TsconfigWithPaths", {
    description: "A class representing a tsconfig.json file with compilerOptions.paths property.",
  })
) {}

const toPosixPath = (value: string): string => value.replaceAll("\\", "/");

const uniqueSorted = (values: ReadonlyArray<string>): ReadonlyArray<string> => {
  const unique = [...HashSet.fromIterable(values)];
  unique.sort((left, right) => Str.localeCompare(right)(left));
  return unique;
};

const arraysEqual = (left: ReadonlyArray<string>, right: ReadonlyArray<string>): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
};

const referenceEntries = (paths: ReadonlyArray<string>): ReadonlyArray<{ readonly path: string }> =>
  A.map(paths, (entry) => ({ path: entry }));

const isCanonicalAliasKey = (key: string): boolean => CANONICAL_ALIAS_KEY_PATTERN.test(key);

const dependencyNamesFromWorkspaceDeps = (workspaceDeps: WorkspaceDeps): ReadonlyArray<string> =>
  uniqueSorted([
    ...R.keys(workspaceDeps.workspace.dependencies),
    ...R.keys(workspaceDeps.workspace.devDependencies),
    ...R.keys(workspaceDeps.workspace.peerDependencies),
    ...R.keys(workspaceDeps.workspace.optionalDependencies),
  ]);

const parseJsonc = Effect.fn(function* <T>(content: string, filePath: string) {
  const parseErrors = A.empty<jsonc.ParseError>();
  const parsed = jsonc.parse(content, parseErrors) as T;

  if (parseErrors.length > 0) {
    const firstError = parseErrors[0];
    return yield* new DomainError({
      message: `Failed to parse JSONC in "${filePath}" (offset ${String(firstError.offset)}).`,
      cause: parseErrors,
    });
  }

  return parsed;
});

const readFileString = Effect.fn(function* (filePath: string) {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs
    .readFileString(filePath)
    .pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to read file "${filePath}"`, cause })));
});

const writeFileString = Effect.fn(function* (filePath: string, content: string) {
  const fs = yield* FileSystem.FileSystem;
  yield* fs
    .writeFileString(filePath, content)
    .pipe(Effect.mapError((cause) => new DomainError({ message: `Failed to write file "${filePath}"`, cause })));
});

const applyJsoncModification = (
  content: string,
  path: jsonc.JSONPath,
  value: unknown,
  options?: jsonc.ModificationOptions
): string => {
  const edits = jsonc.modify(content, path, value, {
    formattingOptions: FORMATTING_OPTIONS,
    ...options,
  });
  return jsonc.applyEdits(content, edits);
};

const relativeFromRoot = (rootDir: string, filePath: string, path: Path.Path): string =>
  toPosixPath(path.relative(rootDir, filePath));

const normalizeRelativeRef = (sourceDir: string, targetPath: string, path: Path.Path): string =>
  toPosixPath(path.relative(sourceDir, targetPath));

const chooseOwnerTsconfig = (paths: ReadonlyArray<string>): string | undefined => {
  const normalized = A.map(paths, toPosixPath);
  const buildPath = A.findFirst(normalized, Str.endsWith("/tsconfig.build.json"));
  if (O.isSome(buildPath)) {
    return buildPath.value;
  }

  const packageTsconfigPath = A.findFirst(normalized, Str.endsWith("/tsconfig.json"));
  if (O.isSome(packageTsconfigPath)) {
    return packageTsconfigPath.value;
  }

  return undefined;
};

const workspaceContainsPath = (workspace: WorkspaceDescriptor, targetPath: string): boolean => {
  const workspaceDir = toPosixPath(workspace.absoluteDir);
  const normalizedTarget = toPosixPath(targetPath);
  return normalizedTarget === workspaceDir || Str.startsWith(`${workspaceDir}/`)(normalizedTarget);
};

const buildWorkspaceDescriptors = Effect.fn(function* (rootDir: string) {
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;

  const workspaceDirs = yield* resolveWorkspaceDirs(rootDir);
  const tsconfigPathsByPackage = yield* collectTsConfigPaths(rootDir);

  const descriptors = A.empty<WorkspaceDescriptor>();

  for (const [packageName, absoluteDir] of workspaceDirs) {
    const tsconfigPaths = O.getOrElse(HashMap.get(tsconfigPathsByPackage, packageName), A.empty<string>);

    const ownerTsconfigPath = chooseOwnerTsconfig(tsconfigPaths);
    const hasProjectTsconfig = A.some(tsconfigPaths, (entry) => Str.endsWith("/tsconfig.json")(toPosixPath(entry)));
    const hasSourceIndex = yield* fs
      .exists(path.join(absoluteDir, "src", "index.ts"))
      .pipe(Effect.orElseSucceed(thunkFalse));

    descriptors.push(
      new WorkspaceDescriptor({
        packageName,
        absoluteDir,
        relativeDir: toPosixPath(path.relative(rootDir, absoluteDir)),
        ownerTsconfigPath,
        hasProjectTsconfig,
        hasSourceIndex,
      })
    );
  }

  const sorted = [...descriptors];
  sorted.sort((left, right) => Str.localeCompare(right.relativeDir)(left.relativeDir));
  return sorted;
});

const buildAdjacency = (
  depIndex: HashMap.HashMap<string, WorkspaceDeps>
): HashMap.HashMap<string, HashSet.HashSet<string>> => {
  let adjacency = HashMap.empty<string, HashSet.HashSet<string>>();

  for (const [packageName, deps] of depIndex) {
    if (packageName === ROOT_DEP_INDEX_KEY) {
      continue;
    }

    let depSet = HashSet.empty<string>();
    for (const depName of dependencyNamesFromWorkspaceDeps(deps)) {
      depSet = HashSet.add(depSet, depName);
    }

    adjacency = HashMap.set(adjacency, packageName, depSet);
  }

  return adjacency;
};

const summaryCounts = (
  currentItems: ReadonlyArray<string>,
  expectedItems: ReadonlyArray<string>,
  noun: string
): string => {
  const currentSet = HashSet.fromIterable(currentItems);
  const expectedSet = HashSet.fromIterable(expectedItems);

  let added = 0;
  let removed = 0;

  for (const entry of expectedSet) {
    if (!HashSet.has(currentSet, entry)) {
      added += 1;
    }
  }
  for (const entry of currentSet) {
    if (!HashSet.has(expectedSet, entry)) {
      removed += 1;
    }
  }

  const reordered = added === 0 && removed === 0 && !arraysEqual(currentItems, expectedItems);

  return `${noun}: ${String(currentItems.length)} -> ${String(expectedItems.length)} (add ${String(added)}, remove ${String(removed)}${reordered ? ", reorder" : ""})`;
};

const compareReferencePathsInOrder = (parsed: TsconfigWithReferences): ReadonlyArray<string> =>
  (parsed.references ?? A.empty()).flatMap((entry) => (P.isString(entry.path) ? [entry.path] : []));

const planRootReferenceSync = Effect.fn(function* (rootDir: string, workspaces: ReadonlyArray<WorkspaceDescriptor>) {
  const path = yield* Path.Path;
  const filePath = path.join(rootDir, "tsconfig.packages.json");

  const original = yield* readFileString(filePath);
  const parsed = yield* parseJsonc<TsconfigWithReferences>(original, filePath);

  const expected = uniqueSorted(
    workspaces.flatMap((workspace) => (workspace.hasProjectTsconfig ? [workspace.relativeDir] : []))
  );

  const current = compareReferencePathsInOrder(parsed);
  if (arraysEqual(current, expected)) {
    return O.none<PlannedFileChange>();
  }

  const nextContent = applyJsoncModification(original, ["references"], referenceEntries(expected));

  return O.some(
    PlannedFileChange.cases["root-references"].makeUnsafe({
      filePath,
      summary: summaryCounts(current, expected, "references"),
      content: nextContent,
    })
  );
});

const canonicalAliasEntriesForWorkspace = (
  workspace: WorkspaceDescriptor
): ReadonlyArray<readonly [string, ReadonlyArray<string>]> => {
  if (!workspace.packageName.startsWith("@beep/") || !workspace.hasSourceIndex) {
    return A.empty();
  }

  return [
    [workspace.packageName, [`./${workspace.relativeDir}/src/index.ts`]],
    [`${workspace.packageName}/*`, [`./${workspace.relativeDir}/src/*.ts`]],
  ] as const;
};

const pathValuesEqual = (currentValue: unknown, expectedValue: ReadonlyArray<string>): boolean => {
  if (!A.isArray(currentValue)) {
    return false;
  }

  if (!A.every(currentValue, P.isString)) {
    return false;
  }

  return arraysEqual(currentValue, expectedValue);
};

const planRootAliasSync = Effect.fn(function* (rootDir: string, workspaces: ReadonlyArray<WorkspaceDescriptor>) {
  const path = yield* Path.Path;
  const filePath = path.join(rootDir, "tsconfig.json");

  const original = yield* readFileString(filePath);
  const parsed = yield* parseJsonc<TsconfigWithPaths>(original, filePath);

  const currentPaths = parsed.compilerOptions?.paths ?? {};

  let expectedAliases = HashMap.empty<string, ReadonlyArray<string>>();
  for (const workspace of workspaces) {
    for (const [aliasKey, aliasValue] of canonicalAliasEntriesForWorkspace(workspace)) {
      expectedAliases = HashMap.set(expectedAliases, aliasKey, aliasValue);
    }
  }

  const currentCanonicalKeys = uniqueSorted(A.filter(R.keys(currentPaths), isCanonicalAliasKey));
  const expectedCanonicalKeys = uniqueSorted([...HashMap.keys(expectedAliases)]);

  const keysToRemove = A.filter(currentCanonicalKeys, (key) => O.isNone(HashMap.get(expectedAliases, key)));
  const keysToSet = A.filter(expectedCanonicalKeys, (key) => {
    const expectedValue = HashMap.get(expectedAliases, key);
    if (O.isNone(expectedValue)) {
      return false;
    }
    return !pathValuesEqual(currentPaths[key], expectedValue.value);
  });

  if (keysToRemove.length === 0 && keysToSet.length === 0) {
    return O.none<PlannedFileChange>();
  }

  let nextContent = original;
  for (const key of keysToRemove) {
    nextContent = applyJsoncModification(nextContent, ["compilerOptions", "paths", key], undefined);
  }
  for (const key of keysToSet) {
    const expectedValue = HashMap.get(expectedAliases, key);
    if (O.isNone(expectedValue)) {
      continue;
    }
    nextContent = applyJsoncModification(nextContent, ["compilerOptions", "paths", key], expectedValue.value);
  }

  const additions = keysToSet.filter((key) => !currentCanonicalKeys.includes(key)).length;
  const updates = keysToSet.length - additions;

  return O.some(
    PlannedFileChange.cases["root-aliases"].makeUnsafe({
      filePath,
      summary: `aliases: add ${String(additions)}, update ${String(updates)}, remove ${String(keysToRemove.length)}`,
      content: nextContent,
    })
  );
});

const buildSubsetAdjacency = (
  packageNames: ReadonlyArray<string>,
  adjacency: HashMap.HashMap<string, HashSet.HashSet<string>>
): HashMap.HashMap<string, HashSet.HashSet<string>> => {
  const packageSet = HashSet.fromIterable(packageNames);
  let subset = HashMap.empty<string, HashSet.HashSet<string>>();

  for (const packageName of packageNames) {
    const depsOption = HashMap.get(adjacency, packageName);

    let filteredDeps = HashSet.empty<string>();
    if (O.isSome(depsOption)) {
      for (const depName of depsOption.value) {
        if (HashSet.has(packageSet, depName)) {
          filteredDeps = HashSet.add(filteredDeps, depName);
        }
      }
    }

    subset = HashMap.set(subset, packageName, filteredDeps);
  }

  return subset;
};

const canonicalizeExistingRefTarget = Effect.fn(function* (
  sourceWorkspace: WorkspaceDescriptor,
  sourceOwnerTsconfigPath: string,
  refPath: string,
  workspaces: ReadonlyArray<WorkspaceDescriptor>
) {
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;

  const sourceDir = path.dirname(sourceOwnerTsconfigPath);
  const resolvedTarget = path.resolve(sourceDir, refPath);

  const exists = yield* fs.exists(resolvedTarget).pipe(Effect.orElseSucceed(thunkFalse));
  if (!exists) {
    return O.none<string>();
  }

  const ownerWorkspace = A.findFirst(workspaces, (workspace) => workspace.packageName === sourceWorkspace.packageName);

  const targetWorkspace = A.findFirst(workspaces, (workspace) => workspaceContainsPath(workspace, resolvedTarget));
  if (
    O.isSome(targetWorkspace) &&
    O.isSome(ownerWorkspace) &&
    targetWorkspace.value.packageName !== ownerWorkspace.value.packageName
  ) {
    if (targetWorkspace.value.ownerTsconfigPath !== undefined) {
      return O.some(targetWorkspace.value.ownerTsconfigPath);
    }
  }

  const stat = yield* fs.stat(resolvedTarget).pipe(Effect.orElseSucceed(thunkUndefined));
  if (stat !== undefined && stat.type === "Directory") {
    const nestedTsconfigPath = path.join(resolvedTarget, "tsconfig.json");
    const nestedTsconfigExists = yield* fs.exists(nestedTsconfigPath).pipe(Effect.orElseSucceed(thunkFalse));
    if (nestedTsconfigExists) {
      return O.some(nestedTsconfigPath);
    }
  }

  return O.some(resolvedTarget);
});

const planPackageReferenceSync = Effect.fn(function* (
  rootDir: string,
  workspaces: ReadonlyArray<WorkspaceDescriptor>,
  depIndex: HashMap.HashMap<string, WorkspaceDeps>,
  adjacency: HashMap.HashMap<string, HashSet.HashSet<string>>,
  filter: string | undefined,
  verbose: boolean
) {
  const path = yield* Path.Path;

  const workspaceByName = HashMap.fromIterable(
    A.map(workspaces, (workspace) => [workspace.packageName, workspace] as const)
  );
  const normalizedFilter = filter === undefined ? undefined : Str.replace(/^\.\//, "")(toPosixPath(filter));

  const targetWorkspaces = A.filter(workspaces, (workspace) => {
    if (workspace.ownerTsconfigPath === undefined) {
      return false;
    }

    if (normalizedFilter === undefined) {
      return true;
    }

    return workspace.packageName === filter || workspace.relativeDir === normalizedFilter;
  });

  if (filter !== undefined && targetWorkspaces.length === 0) {
    return yield* new TsconfigSyncFilterError({
      filter,
      message: `No workspace matched filter "${filter}"`,
    });
  }

  const plannedChanges = A.empty<PlannedFileChange>();

  for (const workspace of targetWorkspaces) {
    if (workspace.ownerTsconfigPath === undefined) {
      continue;
    }

    const sourceOwnerTsconfigPath = workspace.ownerTsconfigPath;
    const sourceDir = path.dirname(sourceOwnerTsconfigPath);

    const workspaceDepsOption = HashMap.get(depIndex, workspace.packageName);
    if (O.isNone(workspaceDepsOption)) {
      continue;
    }

    const directDeps = dependencyNamesFromWorkspaceDeps(workspaceDepsOption.value).filter((depName) => {
      const descriptor = HashMap.get(workspaceByName, depName);
      return O.isSome(descriptor) && descriptor.value.ownerTsconfigPath !== undefined;
    });

    const subsetAdjacency = buildSubsetAdjacency(directDeps, adjacency);
    const sortedDeps = directDeps.length === 0 ? A.empty<string>() : yield* topologicalSort(subsetAdjacency);

    const computedTargets = sortedDeps.flatMap((depName) => {
      const descriptor = HashMap.get(workspaceByName, depName);
      if (O.isNone(descriptor) || descriptor.value.ownerTsconfigPath === undefined) {
        return [];
      }
      return [descriptor.value.ownerTsconfigPath];
    });

    const original = yield* readFileString(sourceOwnerTsconfigPath);
    const parsed = yield* parseJsonc<TsconfigWithReferences>(original, sourceOwnerTsconfigPath);

    const existingRefs = compareReferencePathsInOrder(parsed);
    const existingResolvedTargets: Array<string> = [];

    for (const refPath of existingRefs) {
      const canonicalTarget = yield* canonicalizeExistingRefTarget(
        workspace,
        sourceOwnerTsconfigPath,
        refPath,
        workspaces
      );
      if (O.isSome(canonicalTarget)) {
        const normalizedTarget = toPosixPath(canonicalTarget.value);
        if (!existingResolvedTargets.includes(normalizedTarget)) {
          existingResolvedTargets.push(normalizedTarget);
        }
      }
    }

    const computedResolvedTargets = uniqueSorted(A.map(computedTargets, toPosixPath));
    const computedResolvedTargetSet = HashSet.fromIterable(computedResolvedTargets);

    const extraTargets = existingResolvedTargets.filter((target) => !HashSet.has(computedResolvedTargetSet, target));
    const finalTargets = [...computedResolvedTargets, ...extraTargets];

    const finalRefPaths = A.map(finalTargets, (targetPath) => normalizeRelativeRef(sourceDir, targetPath, path));
    const currentResolvedRefPaths = A.map(existingResolvedTargets, (targetPath) =>
      normalizeRelativeRef(sourceDir, targetPath, path)
    );

    const existingHasReferences = parsed.references !== undefined;
    if (finalRefPaths.length === 0 && !existingHasReferences) {
      continue;
    }

    const nextContent = applyJsoncModification(original, ["references"], referenceEntries(finalRefPaths));
    if (nextContent === original) {
      continue;
    }

    const summary = summaryCounts(currentResolvedRefPaths, finalRefPaths, "references");
    plannedChanges.push(
      PlannedFileChange.cases["package-references"].makeUnsafe({
        filePath: sourceOwnerTsconfigPath,
        summary,
        content: nextContent,
      })
    );

    if (verbose) {
      const sourcePath = toPosixPath(path.relative(rootDir, sourceOwnerTsconfigPath));
      const computedCount = computedResolvedTargets.length;
      const preservedCount = extraTargets.length;
      yield* Console.log(
        `[verbose] ${sourcePath}: computed ${String(computedCount)} ref(s), preserved ${String(preservedCount)} existing ref(s)`
      );
    }
  }

  return plannedChanges;
});

const sortChanges = (changes: ReadonlyArray<PlannedFileChange>): ReadonlyArray<PlannedFileChange> =>
  [...changes].sort((left, right) => {
    const fileCompare = Str.localeCompare(right.filePath)(left.filePath);
    if (fileCompare !== 0) {
      return fileCompare;
    }
    return Str.localeCompare(right.section)(left.section);
  });

const toReportedChange = (change: PlannedFileChange): TsconfigSyncChange => ({
  filePath: change.filePath,
  section: change.section,
  summary: change.summary,
});

const renderChanges = Effect.fn(function* (
  rootDir: string,
  mode: TsconfigSyncMode,
  changes: ReadonlyArray<TsconfigSyncChange>
) {
  const path = yield* Path.Path;

  if (changes.length === 0) {
    if (mode === "check") {
      yield* Console.log("tsconfig-sync: no drift detected");
      return;
    }

    if (mode === "dry-run") {
      yield* Console.log("tsconfig-sync: dry-run found no changes");
      return;
    }

    yield* Console.log("tsconfig-sync: all files already in sync");
    return;
  }

  const prefix =
    mode === "check"
      ? "tsconfig-sync: drift detected"
      : mode === "dry-run"
        ? "tsconfig-sync: dry-run planned changes"
        : "tsconfig-sync: applied changes";

  yield* Console.log(`${prefix} (${String(changes.length)} file change(s))`);

  for (const change of changes) {
    const relativePath = relativeFromRoot(rootDir, change.filePath, path);
    yield* Console.log(`  - ${relativePath} [${change.section}] ${change.summary}`);
  }
});

/**
 * Synchronize tsconfig references and root aliases under a specific repository root.
 *
 * @param rootDir - Absolute repository root directory.
 * @param options - Mode and logging options.
 * @returns Summary of planned/applied changes.
 * @since 0.0.0
 * @category Utility
 */
export const syncTsconfigAtRoot: (
  rootDir: string,
  options: TsconfigSyncRunOptions
) => Effect.Effect<TsconfigSyncResult, TsconfigSyncError, FileSystem.FileSystem | Path.Path | FsUtils> = Effect.fn(
  function* (rootDir: string, options: TsconfigSyncRunOptions) {
    const workspaces = yield* buildWorkspaceDescriptors(rootDir);
    const depIndex = yield* buildRepoDependencyIndex(rootDir);

    const adjacency = buildAdjacency(depIndex);
    const cycles = yield* detectCycles(adjacency);

    if (cycles.length > 0) {
      return yield* new TsconfigSyncCycleError({
        cycles: A.map(cycles, (cycle) => [...cycle]),
        message: `Detected ${String(cycles.length)} workspace dependency cycle(s)`,
      });
    }

    const plannedChanges = A.empty<PlannedFileChange>();

    const rootReferenceChange = yield* planRootReferenceSync(rootDir, workspaces);
    if (O.isSome(rootReferenceChange)) {
      plannedChanges.push(rootReferenceChange.value);
    }

    const rootAliasChange = yield* planRootAliasSync(rootDir, workspaces);
    if (O.isSome(rootAliasChange)) {
      plannedChanges.push(rootAliasChange.value);
    }

    const packageChanges = yield* planPackageReferenceSync(
      rootDir,
      workspaces,
      depIndex,
      adjacency,
      options.filter,
      options.verbose
    );
    plannedChanges.push(...packageChanges);

    const sortedPlannedChanges = sortChanges(plannedChanges);

    if (options.mode === "sync") {
      yield* Effect.forEach(sortedPlannedChanges, (change) => writeFileString(change.filePath, change.content), {
        discard: true,
      });
    }

    const reportedChanges = A.map(sortedPlannedChanges, toReportedChange);
    yield* renderChanges(rootDir, options.mode, reportedChanges);

    if (options.mode === "check" && reportedChanges.length > 0) {
      return yield* new TsconfigSyncDriftError({
        fileCount: reportedChanges.length,
        summary: `Run "beep tsconfig-sync" to apply ${String(reportedChanges.length)} change(s).`,
      });
    }

    return {
      mode: options.mode,
      changedFiles: reportedChanges.length,
      changes: reportedChanges,
    } satisfies TsconfigSyncResult;
  }
);

const resolveMode = (check: boolean, dryRun: boolean): TsconfigSyncMode => {
  if (check) {
    return "check";
  }
  if (dryRun) {
    return "dry-run";
  }
  return "sync";
};

/**
 * CLI command for synchronizing root and workspace tsconfig state.
 *
 * @since 0.0.0
 * @category UseCase
 */
export const tsconfigSyncCommand = Command.make(
  "tsconfig-sync",
  {
    check: Flag.boolean("check").pipe(
      Flag.withDescription("Validate drift without writing files (non-zero exit on drift)")
    ),
    dryRun: Flag.boolean("dry-run").pipe(Flag.withDescription("Preview file changes without writing files")),
    filter: Flag.string("filter").pipe(
      Flag.withDescription("Limit package reference sync to a workspace package name or workspace-relative path"),
      Flag.optional
    ),
    verbose: Flag.boolean("verbose").pipe(
      Flag.withAlias("v"),
      Flag.withDescription("Include per-package detail output")
    ),
  },
  Effect.fn(function* ({ check, dryRun, filter, verbose }) {
    const rootDir = yield* findRepoRoot();
    const mode = resolveMode(check, dryRun);

    yield* syncTsconfigAtRoot(rootDir, {
      mode,
      filter: O.getOrUndefined(filter),
      verbose,
    }).pipe(
      Effect.catchTag(
        "TsconfigSyncDriftError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`tsconfig-sync: ${error.summary}`);
        })
      ),
      Effect.catchTag(
        "TsconfigSyncFilterError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`tsconfig-sync: ${error.message}`);
        })
      ),
      Effect.catchTag(
        "TsconfigSyncCycleError",
        Effect.fn(function* (error) {
          process.exitCode = 1;
          yield* Console.error(`tsconfig-sync: ${error.message}`);
          for (const cycle of error.cycles) {
            yield* Console.error(`  cycle: ${cycle.join(" -> ")}`);
          }
        })
      )
    );
  })
).pipe(
  Command.withDescription(
    "Synchronize workspace tsconfig references plus root tsconfig.packages.json and root @beep/* path aliases"
  )
);
