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
import { Console, Effect, FileSystem, HashMap, HashSet, Path, Schema } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import { Command, Flag } from "effect/unstable/cli";
import * as jsonc from "jsonc-parser";

/**
 * Formatting options used for jsonc edits.
 *
 * @since 0.0.0
 * @category constants
 */
const FORMATTING_OPTIONS: jsonc.FormattingOptions = {
  tabSize: 2,
  insertSpaces: true,
};

/**
 * Synthetic root key in repo-utils dependency maps.
 *
 * @since 0.0.0
 * @category constants
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
 * @category constants
 */
const CANONICAL_ALIAS_KEY_PATTERN = /^@beep\/[^/*]+(?:\/\*)?$/;

/**
 * Drift error raised in check mode when changes are required.
 *
 * @since 0.0.0
 * @category errors
 */
export class TsconfigSyncDriftError extends Schema.TaggedErrorClass<TsconfigSyncDriftError>($I`TsconfigSyncDriftError`)(
  "TsconfigSyncDriftError",
  {
    fileCount: Schema.Number,
    summary: Schema.String,
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
 * @category errors
 */
export class TsconfigSyncCycleError extends Schema.TaggedErrorClass<TsconfigSyncCycleError>($I`TsconfigSyncCycleError`)(
  "TsconfigSyncCycleError",
  {
    cycles: Schema.Array(Schema.Array(Schema.String)),
    message: Schema.String,
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
 * @category errors
 */
export class TsconfigSyncFilterError extends Schema.TaggedErrorClass<TsconfigSyncFilterError>(
  $I`TsconfigSyncFilterError`
)(
  "TsconfigSyncFilterError",
  {
    filter: Schema.String,
    message: Schema.String,
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
 * @category models
 */
export type TsconfigSyncMode = "sync" | "check" | "dry-run";

/**
 * Runtime options for executing tsconfig sync at a repo root.
 *
 * @since 0.0.0
 * @category models
 */
export interface TsconfigSyncRunOptions {
  readonly mode: TsconfigSyncMode;
  readonly filter?: string | undefined;
  readonly verbose: boolean;
}

/**
 * Sync change section categories.
 *
 * @since 0.0.0
 * @category models
 */
export type TsconfigSyncSection = "root-references" | "root-aliases" | "package-references";

/**
 * A single planned file change.
 *
 * @since 0.0.0
 * @category models
 */
export interface TsconfigSyncChange {
  readonly filePath: string;
  readonly section: TsconfigSyncSection;
  readonly summary: string;
}

interface PlannedFileChange extends TsconfigSyncChange {
  readonly content: string;
}

/**
 * Result emitted after a sync run.
 *
 * @since 0.0.0
 * @category models
 */
export interface TsconfigSyncResult {
  readonly mode: TsconfigSyncMode;
  readonly changedFiles: number;
  readonly changes: ReadonlyArray<TsconfigSyncChange>;
}

type TsconfigSyncError =
  | DomainError
  | NoSuchFileError
  | CyclicDependencyError
  | TsconfigSyncCycleError
  | TsconfigSyncDriftError
  | TsconfigSyncFilterError;

interface WorkspaceDescriptor {
  readonly packageName: string;
  readonly absoluteDir: string;
  readonly relativeDir: string;
  readonly ownerTsconfigPath: string | undefined;
  readonly hasProjectTsconfig: boolean;
  readonly hasSourceIndex: boolean;
}

interface TsconfigWithReferences {
  readonly references?: ReadonlyArray<{ readonly path?: unknown }>;
}

interface TsconfigWithPaths {
  readonly compilerOptions?: {
    readonly paths?: Readonly<Record<string, unknown>>;
  };
}

const toPosixPath = (value: string): string => value.replaceAll("\\", "/");

const uniqueSorted = (values: ReadonlyArray<string>): ReadonlyArray<string> => {
  const unique = [...new Set(values)];
  unique.sort((left, right) => left.localeCompare(right));
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
    ...Object.keys(workspaceDeps.workspace.dependencies),
    ...Object.keys(workspaceDeps.workspace.devDependencies),
    ...Object.keys(workspaceDeps.workspace.peerDependencies),
    ...Object.keys(workspaceDeps.workspace.optionalDependencies),
  ]);

const parseJsonc = Effect.fn(function* <T>(content: string, filePath: string) {
  const parseErrors: Array<jsonc.ParseError> = [];
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
  const buildPath = A.findFirst(normalized, (entry) => entry.endsWith("/tsconfig.build.json"));
  if (O.isSome(buildPath)) {
    return buildPath.value;
  }

  const packageTsconfigPath = A.findFirst(normalized, (entry) => entry.endsWith("/tsconfig.json"));
  if (O.isSome(packageTsconfigPath)) {
    return packageTsconfigPath.value;
  }

  return undefined;
};

const workspaceContainsPath = (workspace: WorkspaceDescriptor, targetPath: string): boolean => {
  const workspaceDir = toPosixPath(workspace.absoluteDir);
  const normalizedTarget = toPosixPath(targetPath);
  return normalizedTarget === workspaceDir || normalizedTarget.startsWith(`${workspaceDir}/`);
};

const buildWorkspaceDescriptors = Effect.fn(function* (rootDir: string) {
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;

  const workspaceDirs = yield* resolveWorkspaceDirs(rootDir);
  const tsconfigPathsByPackage = yield* collectTsConfigPaths(rootDir);

  const descriptors: Array<WorkspaceDescriptor> = [];

  for (const [packageName, absoluteDir] of workspaceDirs) {
    const tsconfigPaths = O.getOrElse(HashMap.get(tsconfigPathsByPackage, packageName), () => A.empty<string>());

    const ownerTsconfigPath = chooseOwnerTsconfig(tsconfigPaths);
    const hasProjectTsconfig = A.some(tsconfigPaths, (entry) => toPosixPath(entry).endsWith("/tsconfig.json"));
    const hasSourceIndex = yield* fs
      .exists(path.join(absoluteDir, "src", "index.ts"))
      .pipe(Effect.orElseSucceed(() => false));

    descriptors.push({
      packageName,
      absoluteDir,
      relativeDir: toPosixPath(path.relative(rootDir, absoluteDir)),
      ownerTsconfigPath,
      hasProjectTsconfig,
      hasSourceIndex,
    });
  }

  const sorted = [...descriptors];
  sorted.sort((left, right) => left.relativeDir.localeCompare(right.relativeDir));
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
  const currentSet = new Set(currentItems);
  const expectedSet = new Set(expectedItems);

  let added = 0;
  let removed = 0;

  for (const entry of expectedSet) {
    if (!currentSet.has(entry)) {
      added += 1;
    }
  }
  for (const entry of currentSet) {
    if (!expectedSet.has(entry)) {
      removed += 1;
    }
  }

  const reordered = added === 0 && removed === 0 && !arraysEqual(currentItems, expectedItems);

  return `${noun}: ${String(currentItems.length)} -> ${String(expectedItems.length)} (add ${String(added)}, remove ${String(removed)}${reordered ? ", reorder" : ""})`;
};

const compareReferencePathsInOrder = (parsed: TsconfigWithReferences): ReadonlyArray<string> =>
  (parsed.references ?? A.empty()).flatMap((entry) => (typeof entry.path === "string" ? [entry.path] : []));

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

  return O.some({
    filePath,
    section: "root-references" as const,
    summary: summaryCounts(current, expected, "references"),
    content: nextContent,
  });
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
  if (!Array.isArray(currentValue)) {
    return false;
  }

  if (!currentValue.every((entry) => typeof entry === "string")) {
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

  const expectedAliases = new Map<string, ReadonlyArray<string>>();
  for (const workspace of workspaces) {
    for (const [aliasKey, aliasValue] of canonicalAliasEntriesForWorkspace(workspace)) {
      expectedAliases.set(aliasKey, aliasValue);
    }
  }

  const currentCanonicalKeys = uniqueSorted(Object.keys(currentPaths).filter(isCanonicalAliasKey));
  const expectedCanonicalKeys = uniqueSorted(Array.from(expectedAliases.keys()));

  const keysToRemove = A.filter(currentCanonicalKeys, (key) => !expectedAliases.has(key));
  const keysToSet = A.filter(expectedCanonicalKeys, (key) => {
    const expectedValue = expectedAliases.get(key);
    if (expectedValue === undefined) {
      return false;
    }
    return !pathValuesEqual(currentPaths[key], expectedValue);
  });

  if (keysToRemove.length === 0 && keysToSet.length === 0) {
    return O.none<PlannedFileChange>();
  }

  let nextContent = original;
  for (const key of keysToRemove) {
    nextContent = applyJsoncModification(nextContent, ["compilerOptions", "paths", key], undefined);
  }
  for (const key of keysToSet) {
    const expectedValue = expectedAliases.get(key);
    if (expectedValue === undefined) {
      continue;
    }
    nextContent = applyJsoncModification(nextContent, ["compilerOptions", "paths", key], expectedValue);
  }

  const additions = keysToSet.filter((key) => !currentCanonicalKeys.includes(key)).length;
  const updates = keysToSet.length - additions;

  return O.some({
    filePath,
    section: "root-aliases" as const,
    summary: `aliases: add ${String(additions)}, update ${String(updates)}, remove ${String(keysToRemove.length)}`,
    content: nextContent,
  });
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

  const exists = yield* fs.exists(resolvedTarget).pipe(Effect.orElseSucceed(() => false));
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

  const stat = yield* fs.stat(resolvedTarget).pipe(Effect.orElseSucceed(() => undefined));
  if (stat !== undefined && stat.type === "Directory") {
    const nestedTsconfigPath = path.join(resolvedTarget, "tsconfig.json");
    const nestedTsconfigExists = yield* fs.exists(nestedTsconfigPath).pipe(Effect.orElseSucceed(() => false));
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

  const workspaceByName = new Map(workspaces.map((workspace) => [workspace.packageName, workspace] as const));
  const normalizedFilter = filter === undefined ? undefined : toPosixPath(filter).replace(/^\.\//, "");

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

  const plannedChanges: Array<PlannedFileChange> = [];

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
      const descriptor = workspaceByName.get(depName);
      return descriptor !== undefined && descriptor.ownerTsconfigPath !== undefined;
    });

    const subsetAdjacency = buildSubsetAdjacency(directDeps, adjacency);
    const sortedDeps = directDeps.length === 0 ? A.empty<string>() : yield* topologicalSort(subsetAdjacency);

    const computedTargets = sortedDeps.flatMap((depName) => {
      const descriptor = workspaceByName.get(depName);
      if (descriptor?.ownerTsconfigPath === undefined) {
        return [];
      }
      return [descriptor.ownerTsconfigPath];
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
    const computedResolvedTargetSet = new Set(computedResolvedTargets);

    const extraTargets = existingResolvedTargets.filter((target) => !computedResolvedTargetSet.has(target));
    const finalTargets = [...computedResolvedTargets, ...extraTargets];

    const finalRefPaths = finalTargets.map((targetPath) => normalizeRelativeRef(sourceDir, targetPath, path));
    const currentResolvedRefPaths = existingResolvedTargets.map((targetPath) =>
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
    plannedChanges.push({
      filePath: sourceOwnerTsconfigPath,
      section: "package-references",
      summary,
      content: nextContent,
    });

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
    const fileCompare = left.filePath.localeCompare(right.filePath);
    if (fileCompare !== 0) {
      return fileCompare;
    }
    return left.section.localeCompare(right.section);
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
 * @category functions
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

    const plannedChanges: Array<PlannedFileChange> = [];

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
 * @category commands
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
