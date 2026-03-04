/**
 * tsconfig-sync command - synchronize workspace tsconfig references and root aliases.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import {
    buildRepoDependencyIndex,
    collectTsConfigPaths,
    type CyclicDependencyError,
    detectCycles,
    DomainError,
    findRepoRoot,
    type FsUtils,
    type NoSuchFileError,
    resolveWorkspaceDirs,
    topologicalSort,
    type WorkspaceDeps,
} from "@beep/repo-utils";
import { LiteralKit } from "@beep/schema";
import { thunkFalse, thunkUndefined } from "@beep/utils";
import {
    Boolean as Bool,
    Console,
    Effect,
    FileSystem,
    HashMap,
    HashSet,
    Order,
    Path,
    pipe,
    SchemaTransformation,
    String as Str,
    Tuple
} from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { Command, Flag } from "effect/unstable/cli";
import * as jsonc from "jsonc-parser";
import { decodeJsoncTextAs, JsoncCodecServiceLive } from "./Shared/SchemaCodecs/index.js";

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
const $I = $RepoCliId.create("commands/TsconfigSync");
const RootDepIndexKey = S.Literal(ROOT_DEP_INDEX_KEY).annotate(
  $I.annote("RootDepIndexKey", {
    description: "Synthetic root dependency index key from repo-utils dependency maps.",
  })
);

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
const POSIX_PATH_PATTERN = /^[^\\]*$/;

const CanonicalAliasKey = S.String.check(S.isPattern(CANONICAL_ALIAS_KEY_PATTERN)).pipe(
  S.brand("CanonicalAliasKey"),
  S.annotate(
    $I.annote("CanonicalAliasKey", {
      description: "Canonical @beep path alias key in root tsconfig paths.",
    })
  )
);

const BeepScopedPackageName = S.String.check(S.isStartsWith("@beep/")).pipe(
  S.brand("BeepScopedPackageName"),
  S.annotate(
    $I.annote("BeepScopedPackageName", {
      description: "Package name under the @beep scope.",
    })
  )
);

const PosixPath = S.String.check(S.isPattern(POSIX_PATH_PATTERN)).pipe(
  S.brand("PosixPath"),
  S.annotate(
    $I.annote("PosixPath", {
      description: "Path string normalized to use '/' separators only.",
    })
  )
);

const NativePathToPosixPath = S.String.pipe(
  S.decodeTo(
    PosixPath,
    SchemaTransformation.transform({
      decode: (pathString) => Str.replaceAll("\\", "/")(pathString),
      encode: (pathString) => pathString,
    })
  ),
  S.annotate(
    $I.annote("NativePathToPosixPath", {
      description: "Schema transformation that normalizes native path separators to posix format.",
    })
  )
);

const StringArray = S.Array(S.String).annotate(
  $I.annote("StringArray", {
    description: "Reusable schema for arrays of strings.",
  })
);

const isCanonicalAliasKey = S.is(CanonicalAliasKey);
const isBeepScopedPackageName = S.is(BeepScopedPackageName);
const isRootDepIndexKey = S.is(RootDepIndexKey);
const decodePosixPath = S.decodeUnknownSync(NativePathToPosixPath);
const stringEquivalence = S.toEquivalence(S.String);
const stringArrayEquivalence = S.toEquivalence(StringArray);
const byStringAscending: Order.Order<string> = Order.String;

const isArrayEmpty = <T>(values: ReadonlyArray<T>): boolean =>
  A.match(values, {
    onEmpty: () => true,
    onNonEmpty: () => false,
  });

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
const TsconfigSyncModeKit = LiteralKit(["sync", "check", "dry-run"]);
/**
 * Command execution mode.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const TsconfigSyncMode = TsconfigSyncModeKit.annotate(
  $I.annote("TsconfigSyncMode", {
    description: "Command execution mode for tsconfig-sync.",
  })
);
export namespace TsconfigSyncMode {
  export const $match = TsconfigSyncModeKit.$match;
  export const Enum = TsconfigSyncModeKit.Enum;
  export const Options = TsconfigSyncModeKit.Options;
  export const is = TsconfigSyncModeKit.is;
  export const omitOptions = TsconfigSyncModeKit.omitOptions;
  export const pickOptions = TsconfigSyncModeKit.pickOptions;
  export const thunk = TsconfigSyncModeKit.thunk;
  export const toTaggedUnion = TsconfigSyncModeKit.toTaggedUnion;
}

type TsconfigSyncMode = typeof TsconfigSyncMode.Type;
const tsconfigSyncModeEquivalence = S.toEquivalence(TsconfigSyncMode);

class TsconfigSyncRunOptionsSync extends S.Class<TsconfigSyncRunOptionsSync>($I`TsconfigSyncRunOptionsSync`)(
  {
    mode: S.tag("sync"),
    filter: S.optionalKey(S.UndefinedOr(S.String)),
    verbose: S.Boolean,
  },
  $I.annote("TsconfigSyncRunOptionsSync", {
    description: "Runtime options for sync mode execution.",
  })
) {}

class TsconfigSyncRunOptionsCheck extends S.Class<TsconfigSyncRunOptionsCheck>($I`TsconfigSyncRunOptionsCheck`)(
  {
    mode: S.tag("check"),
    filter: S.optionalKey(S.UndefinedOr(S.String)),
    verbose: S.Boolean,
  },
  $I.annote("TsconfigSyncRunOptionsCheck", {
    description: "Runtime options for check mode execution.",
  })
) {}

class TsconfigSyncRunOptionsDryRun extends S.Class<TsconfigSyncRunOptionsDryRun>($I`TsconfigSyncRunOptionsDryRun`)(
  {
    mode: S.tag("dry-run"),
    filter: S.optionalKey(S.UndefinedOr(S.String)),
    verbose: S.Boolean,
  },
  $I.annote("TsconfigSyncRunOptionsDryRun", {
    description: "Runtime options for dry-run mode execution.",
  })
) {}

/**
 * Runtime options for executing tsconfig sync at a repo root.
 *
 * @returns Tagged union schema keyed by `mode`.
 * @since 0.0.0
 * @category DomainModel
 */
export const TsconfigSyncRunOptions = TsconfigSyncMode.mapMembers(
  Tuple.evolve([
    () => TsconfigSyncRunOptionsSync,
    () => TsconfigSyncRunOptionsCheck,
    () => TsconfigSyncRunOptionsDryRun,
  ])
)
  .annotate(
    $I.annote("TsconfigSyncRunOptions", {
      description: "Runtime options for executing tsconfig sync at a repo root.",
    })
  )
  .pipe(S.toTaggedUnion("mode"));
/**
 * Runtime options for executing tsconfig sync at a repo root.
 *
 * @since 0.0.0
 * @category DomainModel
 */
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

/**
 * Sync change section categories.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type TsconfigSyncSection = typeof TsconfigSyncSection.Type;

class RootReferencesChange extends S.Class<RootReferencesChange>($I`RootReferencesChange`)(
  {
    filePath: S.String,
    summary: S.String,
    section: S.tag("root-references"),
  },
  $I.annote("RootReferencesChange", {
    description: "Planned change entry for root tsconfig references.",
  })
) {}

class RootAliasesChange extends S.Class<RootAliasesChange>($I`RootAliasesChange`)(
  {
    filePath: S.String,
    summary: S.String,
    section: S.tag("root-aliases"),
  },
  $I.annote("RootAliasesChange", {
    description: "Planned change entry for root tsconfig aliases.",
  })
) {}

class PackageReferencesChange extends S.Class<PackageReferencesChange>($I`PackageReferencesChange`)(
  {
    filePath: S.String,
    summary: S.String,
    section: S.tag("package-references"),
  },
  $I.annote("PackageReferencesChange", {
    description: "Planned change entry for package-level tsconfig references.",
  })
) {}

/**
 * A single planned file change.
 *
 * @returns Tagged union schema keyed by `section`.
 * @since 0.0.0
 * @category DomainModel
 */
export const TsconfigSyncChange = TsconfigSyncSection.mapMembers(
  Tuple.evolve([() => RootReferencesChange, () => RootAliasesChange, () => PackageReferencesChange])
)
  .annotate(
    $I.annote("TsconfigSyncChange", {
      description: "A single planned file change for tsconfig-sync.",
    })
  )
  .pipe(S.toTaggedUnion("section"));

/**
 * A single planned file change.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type TsconfigSyncChange = typeof TsconfigSyncChange.Type;

class RootReferencesPlannedFileChange extends S.Class<RootReferencesPlannedFileChange>(
  $I`RootReferencesPlannedFileChange`
)(
  {
    filePath: S.String,
    summary: S.String,
    section: S.tag("root-references"),
    content: S.String,
  },
  $I.annote("RootReferencesPlannedFileChange", {
    description: "Planned file content change for root tsconfig references.",
  })
) {}

class RootAliasesPlannedFileChange extends S.Class<RootAliasesPlannedFileChange>($I`RootAliasesPlannedFileChange`)(
  {
    filePath: S.String,
    summary: S.String,
    section: S.tag("root-aliases"),
    content: S.String,
  },
  $I.annote("RootAliasesPlannedFileChange", {
    description: "Planned file content change for root tsconfig aliases.",
  })
) {}

class PackageReferencesPlannedFileChange extends S.Class<PackageReferencesPlannedFileChange>(
  $I`PackageReferencesPlannedFileChange`
)(
  {
    filePath: S.String,
    summary: S.String,
    section: S.tag("package-references"),
    content: S.String,
  },
  $I.annote("PackageReferencesPlannedFileChange", {
    description: "Planned file content change for package tsconfig references.",
  })
) {}

/**
 * A planned file change with transformed file content.
 *
 * @returns Tagged union schema keyed by `section`.
 * @since 0.0.0
 * @category DomainModel
 */
export const PlannedFileChange = TsconfigSyncSection.mapMembers(
  Tuple.evolve([
    () => RootReferencesPlannedFileChange,
    () => RootAliasesPlannedFileChange,
    () => PackageReferencesPlannedFileChange,
  ])
)
  .annotate(
    $I.annote("TsconfigSyncChange", {
      description: "A single planned file change for tsconfig-sync.",
    })
  )
  .pipe(S.toTaggedUnion("section"));

/**
 * A planned file change with transformed file content.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PlannedFileChange = typeof PlannedFileChange.Type;

class TsconfigSyncResultSync extends S.Class<TsconfigSyncResultSync>($I`TsconfigSyncResultSync`)(
  {
    mode: S.tag("sync"),
    changedFiles: S.Number,
    changes: S.Array(TsconfigSyncChange),
  },
  $I.annote("TsconfigSyncResultSync", {
    description: "Sync mode result payload.",
  })
) {}

class TsconfigSyncResultCheck extends S.Class<TsconfigSyncResultCheck>($I`TsconfigSyncResultCheck`)(
  {
    mode: S.tag("check"),
    changedFiles: S.Number,
    changes: S.Array(TsconfigSyncChange),
  },
  $I.annote("TsconfigSyncResultCheck", {
    description: "Check mode result payload.",
  })
) {}

class TsconfigSyncResultDryRun extends S.Class<TsconfigSyncResultDryRun>($I`TsconfigSyncResultDryRun`)(
  {
    mode: S.tag("dry-run"),
    changedFiles: S.Number,
    changes: S.Array(TsconfigSyncChange),
  },
  $I.annote("TsconfigSyncResultDryRun", {
    description: "Dry-run mode result payload.",
  })
) {}

/**
 * Result emitted after a sync run.
 *
 * @returns Tagged union schema keyed by `mode`.
 * @since 0.0.0
 * @category DomainModel
 */
export const TsconfigSyncResult = TsconfigSyncMode.mapMembers(
  Tuple.evolve([() => TsconfigSyncResultSync, () => TsconfigSyncResultCheck, () => TsconfigSyncResultDryRun])
)
  .annotate(
    $I.annote("TsconfigSyncResult", {
      description: "Result emitted after a sync run.",
    })
  )
  .pipe(S.toTaggedUnion("mode"));

/**
 * Result emitted after a sync run.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type TsconfigSyncResult = typeof TsconfigSyncResult.Type;

type TsconfigSyncError =
  | DomainError
  | NoSuchFileError
  | CyclicDependencyError
  | TsconfigSyncCycleError
  | TsconfigSyncDriftError
  | TsconfigSyncFilterError;

/**
 * Workspace package descriptor with metadata for tsconfig synchronization.
 *
 * @since 0.0.0
 * @category DomainModel
 */
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

class TsconfigReferenceEntry extends S.Class<TsconfigReferenceEntry>($I`TsconfigReferenceEntry`)(
  {
    path: S.optionalKey(S.Unknown),
  },
  $I.annote("TsconfigReferenceEntry", {
    description: "Single tsconfig references entry with optional path field.",
  })
) {}

class TsconfigCompilerOptionsPaths extends S.Class<TsconfigCompilerOptionsPaths>($I`TsconfigCompilerOptionsPaths`)(
  {
    paths: S.optionalKey(S.Record(S.String, S.Unknown)),
  },
  $I.annote("TsconfigCompilerOptionsPaths", {
    description: "Subset of tsconfig compilerOptions containing optional paths map.",
  })
) {}

/**
 * Minimal tsconfig shape containing optional `references`.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TsconfigWithReferences extends S.Class<TsconfigWithReferences>($I`TsconfigWithReferences`)(
  {
    references: S.optionalKey(S.Array(TsconfigReferenceEntry)),
  },
  $I.annote("TsconfigWithReferences", {
    description: "A class representing a tsconfig.json file with references property.",
  })
) {}

/**
 * Minimal tsconfig shape containing optional `compilerOptions.paths`.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TsconfigWithPaths extends S.Class<TsconfigWithPaths>($I`TsconfigWithPaths`)(
  {
    compilerOptions: S.optionalKey(TsconfigCompilerOptionsPaths),
  },
  $I.annote("TsconfigWithPaths", {
    description: "A class representing a tsconfig.json file with compilerOptions.paths property.",
  })
) {}

const byWorkspaceRelativeDirAscending: Order.Order<WorkspaceDescriptor> = Order.mapInput(
  Order.String,
  (descriptor: WorkspaceDescriptor) => descriptor.relativeDir
);
const byPlannedChangeFileAscending: Order.Order<PlannedFileChange> = Order.mapInput(
  Order.String,
  (change: PlannedFileChange) => change.filePath
);
const byPlannedChangeSectionAscending: Order.Order<PlannedFileChange> = Order.mapInput(
  Order.String,
  (change: PlannedFileChange) => change.section
);
const byPlannedChangeAscending = Order.combine(byPlannedChangeFileAscending, byPlannedChangeSectionAscending);

const toPosixPath = (value: string): string => decodePosixPath(value);

const uniqueSorted = (values: ReadonlyArray<string>): ReadonlyArray<string> => {
  return pipe(values, HashSet.fromIterable, A.fromIterable, A.sort(byStringAscending));
};

const arraysEqual = (left: ReadonlyArray<string>, right: ReadonlyArray<string>): boolean =>
  stringArrayEquivalence(left, right);

const referenceEntries = (paths: ReadonlyArray<string>): ReadonlyArray<{ readonly path: string }> =>
  A.map(paths, (entry) => ({ path: entry }));

const dependencyNamesFromWorkspaceDeps = (workspaceDeps: WorkspaceDeps): ReadonlyArray<string> =>
  uniqueSorted([
    ...R.keys(workspaceDeps.workspace.dependencies),
    ...R.keys(workspaceDeps.workspace.devDependencies),
    ...R.keys(workspaceDeps.workspace.peerDependencies),
    ...R.keys(workspaceDeps.workspace.optionalDependencies),
  ]);

const parseJsonc = Effect.fn(function* <Schema extends S.Top>(content: string, filePath: string, schema: Schema) {
  return yield* decodeJsoncTextAs(schema)(content).pipe(
    Effect.provide(JsoncCodecServiceLive),
    Effect.mapError(
      (cause) =>
        new DomainError({
          message: `Failed to parse JSONC in "${filePath}": ${cause.message}`,
          cause,
        })
    )
  );
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
  return stringEquivalence(normalizedTarget, workspaceDir) || Str.startsWith(`${workspaceDir}/`)(normalizedTarget);
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

  return A.sort(descriptors, byWorkspaceRelativeDirAscending);
});

const buildAdjacency = (
  depIndex: HashMap.HashMap<string, WorkspaceDeps>
): HashMap.HashMap<string, HashSet.HashSet<string>> => {
  let adjacency = HashMap.empty<string, HashSet.HashSet<string>>();

  for (const [packageName, deps] of depIndex) {
    if (isRootDepIndexKey(packageName)) {
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

  return `${noun}: ${currentItems.length} -> ${expectedItems.length} (add ${added}, remove ${removed}${reordered ? ", reorder" : ""})`;
};

const compareReferencePathsInOrder = (parsed: TsconfigWithReferences): ReadonlyArray<string> =>
  pipe(
    parsed.references ?? A.empty(),
    A.flatMap((entry) => (P.isString(entry.path) ? A.make(entry.path) : A.empty<string>()))
  );

const planRootReferenceSync = Effect.fn(function* (rootDir: string, workspaces: ReadonlyArray<WorkspaceDescriptor>) {
  const path = yield* Path.Path;
  const filePath = path.join(rootDir, "tsconfig.packages.json");

  const original = yield* readFileString(filePath);
  const parsed = yield* parseJsonc(original, filePath, TsconfigWithReferences);

  const expected = uniqueSorted(
    pipe(
      workspaces,
      A.flatMap((workspace) => (workspace.hasProjectTsconfig ? A.make(workspace.relativeDir) : A.empty<string>()))
    )
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
  if (!isBeepScopedPackageName(workspace.packageName) || !workspace.hasSourceIndex) {
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
  const parsed = yield* parseJsonc(original, filePath, TsconfigWithPaths);

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

  if (isArrayEmpty(keysToRemove) && isArrayEmpty(keysToSet)) {
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

  const additions = A.length(
    A.filter(keysToSet, (key) => !A.some(currentCanonicalKeys, (current) => stringEquivalence(current, key)))
  );
  const updates = A.length(keysToSet) - additions;

  return O.some(
    PlannedFileChange.cases["root-aliases"].makeUnsafe({
      filePath,
      summary: `aliases: add ${additions}, update ${updates}, remove ${keysToRemove.length}`,
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

  const ownerWorkspace = A.findFirst(workspaces, (workspace) =>
    stringEquivalence(workspace.packageName, sourceWorkspace.packageName)
  );

  const targetWorkspace = A.findFirst(workspaces, (workspace) => workspaceContainsPath(workspace, resolvedTarget));
  if (
    O.isSome(targetWorkspace) &&
    O.isSome(ownerWorkspace) &&
    !stringEquivalence(targetWorkspace.value.packageName, ownerWorkspace.value.packageName)
  ) {
    if (targetWorkspace.value.ownerTsconfigPath !== undefined) {
      return O.some(targetWorkspace.value.ownerTsconfigPath);
    }
  }

  const stat = yield* fs.stat(resolvedTarget).pipe(Effect.orElseSucceed(thunkUndefined));
  if (stat !== undefined && stringEquivalence(stat.type, "Directory")) {
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

    const packageNameMatchesFilter = O.match(O.fromUndefinedOr(filter), {
      onNone: () => false,
      onSome: (filterValue) => stringEquivalence(workspace.packageName, filterValue),
    });

    return packageNameMatchesFilter || stringEquivalence(workspace.relativeDir, normalizedFilter);
  });

  if (filter !== undefined && isArrayEmpty(targetWorkspaces)) {
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

    const directDeps = A.filter(dependencyNamesFromWorkspaceDeps(workspaceDepsOption.value), (depName) => {
      const descriptor = HashMap.get(workspaceByName, depName);
      return O.isSome(descriptor) && descriptor.value.ownerTsconfigPath !== undefined;
    });

    const subsetAdjacency = buildSubsetAdjacency(directDeps, adjacency);
    const sortedDeps = yield* A.match(directDeps, {
      onEmpty: () => Effect.succeed(A.empty<string>()),
      onNonEmpty: () => topologicalSort(subsetAdjacency),
    });

    const computedTargets = pipe(
      sortedDeps,
      A.flatMap((depName) => {
        const descriptor = HashMap.get(workspaceByName, depName);
        return O.isNone(descriptor) || descriptor.value.ownerTsconfigPath === undefined
          ? A.empty<string>()
          : A.make(descriptor.value.ownerTsconfigPath);
      })
    );

    const original = yield* readFileString(sourceOwnerTsconfigPath);
    const parsed = yield* parseJsonc(original, sourceOwnerTsconfigPath, TsconfigWithReferences);

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
        if (!A.some(existingResolvedTargets, (existingTarget) => stringEquivalence(existingTarget, normalizedTarget))) {
          existingResolvedTargets.push(normalizedTarget);
        }
      }
    }

    const computedResolvedTargets = uniqueSorted(A.map(computedTargets, toPosixPath));
    const computedResolvedTargetSet = HashSet.fromIterable(computedResolvedTargets);

    const extraTargets = A.filter(existingResolvedTargets, (target) => !HashSet.has(computedResolvedTargetSet, target));
    const finalTargets = [...computedResolvedTargets, ...extraTargets];

    const finalRefPaths = A.map(finalTargets, (targetPath) => normalizeRelativeRef(sourceDir, targetPath, path));
    const currentResolvedRefPaths = A.map(existingResolvedTargets, (targetPath) =>
      normalizeRelativeRef(sourceDir, targetPath, path)
    );

    const existingHasReferences = parsed.references !== undefined;
    if (isArrayEmpty(finalRefPaths) && !existingHasReferences) {
      continue;
    }

    const nextContent = applyJsoncModification(original, ["references"], referenceEntries(finalRefPaths));
    if (stringEquivalence(nextContent, original)) {
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
        `[verbose] ${sourcePath}: computed ${computedCount} ref(s), preserved ${preservedCount} existing ref(s)`
      );
    }
  }

  return plannedChanges;
});

const sortChanges = (changes: ReadonlyArray<PlannedFileChange>): ReadonlyArray<PlannedFileChange> =>
  A.sort(changes, byPlannedChangeAscending);

const toReportedChange = (change: PlannedFileChange): TsconfigSyncChange =>
  PlannedFileChange.match(change, {
    "root-references": ({ filePath, summary }): TsconfigSyncChange =>
      TsconfigSyncChange.cases["root-references"].makeUnsafe({ filePath, summary }),
    "root-aliases": ({ filePath, summary }): TsconfigSyncChange =>
      TsconfigSyncChange.cases["root-aliases"].makeUnsafe({ filePath, summary }),
    "package-references": ({ filePath, summary }): TsconfigSyncChange =>
      TsconfigSyncChange.cases["package-references"].makeUnsafe({ filePath, summary }),
  });

const renderChanges = Effect.fn(function* (
  rootDir: string,
  mode: TsconfigSyncMode,
  changes: ReadonlyArray<TsconfigSyncChange>
) {
  const path = yield* Path.Path;

  if (isArrayEmpty(changes)) {
    yield* TsconfigSyncMode.$match(mode, {
      check: () => Console.log("tsconfig-sync: no drift detected"),
      "dry-run": () => Console.log("tsconfig-sync: dry-run found no changes"),
      sync: () => Console.log("tsconfig-sync: all files already in sync"),
    });
    return;
  }

  const prefix = TsconfigSyncMode.$match(mode, {
    check: () => "tsconfig-sync: drift detected",
    "dry-run": () => "tsconfig-sync: dry-run planned changes",
    sync: () => "tsconfig-sync: applied changes",
  });

  yield* Console.log(`${prefix} (${changes.length} file change(s))`);

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

    if (!isArrayEmpty(cycles)) {
      return yield* new TsconfigSyncCycleError({
        cycles: A.map(cycles, (cycle) => [...cycle]),
        message: `Detected ${cycles.length} workspace dependency cycle(s)`,
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

    if (tsconfigSyncModeEquivalence(options.mode, "sync")) {
      yield* Effect.forEach(sortedPlannedChanges, (change) => writeFileString(change.filePath, change.content), {
        discard: true,
      });
    }

    const reportedChanges = A.map(sortedPlannedChanges, toReportedChange);
    yield* renderChanges(rootDir, options.mode, reportedChanges);

    if (tsconfigSyncModeEquivalence(options.mode, "check") && !isArrayEmpty(reportedChanges)) {
      return yield* new TsconfigSyncDriftError({
        fileCount: reportedChanges.length,
        summary: `Run "beep tsconfig-sync" to apply ${reportedChanges.length} change(s).`,
      });
    }

    const result: TsconfigSyncResult = TsconfigSyncMode.$match(options.mode, {
      sync: () =>
        TsconfigSyncResult.cases.sync.makeUnsafe({
          mode: "sync",
          changedFiles: A.length(reportedChanges),
          changes: reportedChanges,
        }),
      check: () =>
        TsconfigSyncResult.cases.check.makeUnsafe({
          mode: "check",
          changedFiles: A.length(reportedChanges),
          changes: reportedChanges,
        }),
      "dry-run": () =>
        TsconfigSyncResult.cases["dry-run"].makeUnsafe({
          mode: "dry-run",
          changedFiles: A.length(reportedChanges),
          changes: reportedChanges,
        }),
    });
    return result;
  }
);

const resolveMode = (check: boolean, dryRun: boolean): TsconfigSyncMode => {
  return Bool.match(check, {
    onTrue: () => "check",
    onFalse: () =>
      Bool.match(dryRun, {
        onTrue: () => "dry-run",
        onFalse: () => "sync",
      }),
  });
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
