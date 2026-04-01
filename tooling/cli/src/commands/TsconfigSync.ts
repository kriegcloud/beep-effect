/**
 * tsconfig-sync command - synchronize workspace tsconfig references and root aliases.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import {
  buildRepoDependencyIndex,
  type CyclicDependencyError,
  collectTsConfigPaths,
  DomainError,
  decodePackageJsonEffect,
  detectCycles,
  type FsUtils,
  findRepoRoot,
  type NoSuchFileError,
  resolveWorkspaceDirs,
  topologicalSort,
  type WorkspaceDeps,
} from "@beep/repo-utils";
import { LiteralKit, normalizePath, TaggedErrorClass } from "@beep/schema";
import { decodeJsoncTextAs } from "@beep/schema/Jsonc";
import { thunkFalse, thunkUndefined } from "@beep/utils";
import { Console, Effect, FileSystem, HashMap, HashSet, Order, Path, pipe, Tuple } from "effect";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Command, Flag } from "effect/unstable/cli";
import * as jsonc from "jsonc-parser";
import {
  buildDocgenAliasSource,
  CanonicalDocgenConfigInput,
  collectDocgenWorkspaceDependencyNames,
  createCanonicalDocgenConfig,
  DocgenAliasSource,
  mergeManagedDocgenConfig,
} from "./Shared/DocgenConfig.js";
import { buildCanonicalAliasTargets, resolveRootExportTarget } from "./Shared/TsconfigAliasTargets.js";

export {
  /**
   * Build canonical tsconfig alias targets from a package root export.
   *
   * @category DomainModel
   * @since 0.0.0
   */
  buildCanonicalAliasTargets,
  /**
   * Resolve the canonical root export target from a package `exports` field.
   *
   * @category DomainModel
   * @since 0.0.0
   */
  resolveRootExportTarget,
} from "./Shared/TsconfigAliasTargets.js";

/**
 * Formatting options used for jsonc edits.
 *
 * @category Configuration
 * @since 0.0.0
 */
const FORMATTING_OPTIONS: jsonc.FormattingOptions = {
  tabSize: 2,
  insertSpaces: true,
};
const DOCGEN_CONFIG_FILENAME = "docgen.json" as const;

/**
 * Synthetic root key in repo-utils dependency maps.
 *
 * @category Configuration
 * @since 0.0.0
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
 * @category Configuration
 * @since 0.0.0
 */
const CANONICAL_ALIAS_KEY_PATTERN = /^@beep\/[^/*]+(?:\/\*)?$/;

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

const StringArray = S.Array(S.String).annotate(
  $I.annote("StringArray", {
    description: "Reusable schema for arrays of strings.",
  })
);

const isCanonicalAliasKey = S.is(CanonicalAliasKey);
const isBeepScopedPackageName = S.is(BeepScopedPackageName);
const isRootDepIndexKey = S.is(RootDepIndexKey);
const stringEquivalence = S.toEquivalence(S.String);
const stringArrayEquivalence = S.toEquivalence(StringArray);
const byStringAscending: Order.Order<string> = Order.String;

const isArrayEmpty = <T>(values: ReadonlyArray<T>): boolean =>
  A.match(values, {
    onEmpty: () => true,
    onNonEmpty: thunkFalse,
  });

/**
 * Drift error raised in check mode when changes are required.
 *
 * @category CrossCutting
 * @since 0.0.0
 */
export class TsconfigSyncDriftError extends TaggedErrorClass<TsconfigSyncDriftError>($I`TsconfigSyncDriftError`)(
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
 * @category CrossCutting
 * @since 0.0.0
 */
export class TsconfigSyncCycleError extends TaggedErrorClass<TsconfigSyncCycleError>($I`TsconfigSyncCycleError`)(
  "TsconfigSyncCycleError",
  {
    cycles: S.String.pipe(S.Array, S.Array),
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
 * @category CrossCutting
 * @since 0.0.0
 */
export class TsconfigSyncFilterError extends TaggedErrorClass<TsconfigSyncFilterError>($I`TsconfigSyncFilterError`)(
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
 * @category DomainModel
 * @since 0.0.0
 */
const TsconfigSyncModeKit = LiteralKit(["sync", "check", "dry-run"]);
/**
 * Command execution mode.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const TsconfigSyncMode = TsconfigSyncModeKit.annotate(
  $I.annote("TsconfigSyncMode", {
    description: "Command execution mode for tsconfig-sync.",
  })
);
const TsconfigSyncModeMatch = TsconfigSyncModeKit.$match;

type TsconfigSyncMode = typeof TsconfigSyncMode.Type;
const tsconfigSyncModeEquivalence = S.toEquivalence(TsconfigSyncMode);

class TsconfigSyncRunOptionsSync extends S.Class<TsconfigSyncRunOptionsSync>($I`TsconfigSyncRunOptionsSync`)(
  {
    mode: S.tag("sync"),
    filter: S.String.pipe(S.UndefinedOr, S.optionalKey),
    verbose: S.Boolean,
  },
  $I.annote("TsconfigSyncRunOptionsSync", {
    description: "Runtime options for sync mode execution.",
  })
) {}

class TsconfigSyncRunOptionsCheck extends S.Class<TsconfigSyncRunOptionsCheck>($I`TsconfigSyncRunOptionsCheck`)(
  {
    mode: S.tag("check"),
    filter: S.String.pipe(S.UndefinedOr, S.optionalKey),
    verbose: S.Boolean,
  },
  $I.annote("TsconfigSyncRunOptionsCheck", {
    description: "Runtime options for check mode execution.",
  })
) {}

class TsconfigSyncRunOptionsDryRun extends S.Class<TsconfigSyncRunOptionsDryRun>($I`TsconfigSyncRunOptionsDryRun`)(
  {
    mode: S.tag("dry-run"),
    filter: S.String.pipe(S.UndefinedOr, S.optionalKey),
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
 * @category DomainModel
 * @since 0.0.0
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
 * @category DomainModel
 * @since 0.0.0
 */
export type TsconfigSyncRunOptions = typeof TsconfigSyncRunOptions.Type;

/**
 * Sync change section categories.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const TsconfigSyncSection = LiteralKit([
  "root-references",
  "root-quality-references",
  "root-aliases",
  "root-tstyche",
  "root-syncpack",
  "package-references",
  "package-docgen",
]).annotate(
  $I.annote("TsconfigSyncSection", {
    description: "Sync change section categories for tsconfig-sync.",
  })
);

/**
 * Sync change section categories.
 *
 * @category DomainModel
 * @since 0.0.0
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

class RootQualityReferencesChange extends S.Class<RootQualityReferencesChange>($I`RootQualityReferencesChange`)(
  {
    filePath: S.String,
    summary: S.String,
    section: S.tag("root-quality-references"),
  },
  $I.annote("RootQualityReferencesChange", {
    description: "Planned change entry for root quality tsconfig references.",
  })
) {}

class RootTstycheChange extends S.Class<RootTstycheChange>($I`RootTstycheChange`)(
  {
    filePath: S.String,
    summary: S.String,
    section: S.tag("root-tstyche"),
  },
  $I.annote("RootTstycheChange", {
    description: "Planned change entry for root tstyche config.",
  })
) {}

class RootSyncpackChange extends S.Class<RootSyncpackChange>($I`RootSyncpackChange`)(
  {
    filePath: S.String,
    summary: S.String,
    section: S.tag("root-syncpack"),
  },
  $I.annote("RootSyncpackChange", {
    description: "Planned change entry for root syncpack config.",
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

class PackageDocgenChange extends S.Class<PackageDocgenChange>($I`PackageDocgenChange`)(
  {
    filePath: S.String,
    summary: S.String,
    section: S.tag("package-docgen"),
  },
  $I.annote("PackageDocgenChange", {
    description: "Planned change entry for package docgen configs.",
  })
) {}

/**
 * A single planned file change.
 *
 * @returns Tagged union schema keyed by `section`.
 * @category DomainModel
 * @since 0.0.0
 */
export const TsconfigSyncChange = TsconfigSyncSection.mapMembers(
  Tuple.evolve([
    () => RootReferencesChange,
    () => RootQualityReferencesChange,
    () => RootAliasesChange,
    () => RootTstycheChange,
    () => RootSyncpackChange,
    () => PackageReferencesChange,
    () => PackageDocgenChange,
  ])
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
 * @category DomainModel
 * @since 0.0.0
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

class RootQualityReferencesPlannedFileChange extends S.Class<RootQualityReferencesPlannedFileChange>(
  $I`RootQualityReferencesPlannedFileChange`
)(
  {
    filePath: S.String,
    summary: S.String,
    section: S.tag("root-quality-references"),
    content: S.String,
  },
  $I.annote("RootQualityReferencesPlannedFileChange", {
    description: "Planned file content change for root quality tsconfig references.",
  })
) {}

class RootTstychePlannedFileChange extends S.Class<RootTstychePlannedFileChange>($I`RootTstychePlannedFileChange`)(
  {
    filePath: S.String,
    summary: S.String,
    section: S.tag("root-tstyche"),
    content: S.String,
  },
  $I.annote("RootTstychePlannedFileChange", {
    description: "Planned file content change for root tstyche config.",
  })
) {}

class RootSyncpackPlannedFileChange extends S.Class<RootSyncpackPlannedFileChange>($I`RootSyncpackPlannedFileChange`)(
  {
    filePath: S.String,
    summary: S.String,
    section: S.tag("root-syncpack"),
    content: S.String,
  },
  $I.annote("RootSyncpackPlannedFileChange", {
    description: "Planned file content change for root syncpack config.",
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

class PackageDocgenPlannedFileChange extends S.Class<PackageDocgenPlannedFileChange>(
  $I`PackageDocgenPlannedFileChange`
)(
  {
    filePath: S.String,
    summary: S.String,
    section: S.tag("package-docgen"),
    content: S.String,
  },
  $I.annote("PackageDocgenPlannedFileChange", {
    description: "Planned file content change for package docgen configs.",
  })
) {}

/**
 * A planned file change with transformed file content.
 *
 * @returns Tagged union schema keyed by `section`.
 * @category DomainModel
 * @since 0.0.0
 */
export const PlannedFileChange = TsconfigSyncSection.mapMembers(
  Tuple.evolve([
    () => RootReferencesPlannedFileChange,
    () => RootQualityReferencesPlannedFileChange,
    () => RootAliasesPlannedFileChange,
    () => RootTstychePlannedFileChange,
    () => RootSyncpackPlannedFileChange,
    () => PackageReferencesPlannedFileChange,
    () => PackageDocgenPlannedFileChange,
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
 * @category DomainModel
 * @since 0.0.0
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
 * @category DomainModel
 * @since 0.0.0
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
 * @category DomainModel
 * @since 0.0.0
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
 * @category DomainModel
 * @since 0.0.0
 */
export class WorkspaceDescriptor extends S.Class<WorkspaceDescriptor>($I`WorkspaceDescriptor`)(
  {
    packageName: S.String,
    absoluteDir: S.String,
    relativeDir: S.String,
    ownerTsconfigPath: S.UndefinedOr(S.String),
    hasProjectTsconfig: S.Boolean,
    hasDocgenConfig: S.Boolean,
    directWorkspaceDependencies: S.Array(S.String),
    rootAliasTarget: S.String.pipe(S.UndefinedOr, S.optionalKey),
    wildcardAliasTarget: S.String.pipe(S.UndefinedOr, S.optionalKey),
    docgenRootAliasTarget: S.String.pipe(S.UndefinedOr, S.optionalKey),
    docgenWildcardAliasTarget: S.String.pipe(S.UndefinedOr, S.optionalKey),
  },
  $I.annote("WorkspaceDescriptor", {
    description: "A workspace package descriptor with metadata for tsconfig synchronization.",
  })
) {}

const JsonObject = S.Record(S.String, S.Unknown).annotate(
  $I.annote("JsonObject", {
    description: "Generic JSON object document used for parsed docgen configs.",
  })
);

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
 * @category DomainModel
 * @since 0.0.0
 */
export class TsconfigWithReferences extends S.Class<TsconfigWithReferences>($I`TsconfigWithReferences`)(
  {
    references: TsconfigReferenceEntry.pipe(S.Array, S.optionalKey),
  },
  $I.annote("TsconfigWithReferences", {
    description: "A class representing a tsconfig.json file with references property.",
  })
) {}

/**
 * Minimal tsconfig shape containing optional `compilerOptions.paths`.
 *
 * @category DomainModel
 * @since 0.0.0
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

const toPosixPath = normalizePath;

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
    Effect.mapError(
      (cause) =>
        new DomainError({
          message: `Failed to parse JSONC in "${filePath}": ${cause.message}`,
          cause,
        })
    )
  );
});

const parseJsonObject = Effect.fn(function* (content: string, filePath: string) {
  return yield* Effect.try({
    try: () => S.decodeUnknownSync(S.fromJsonString(JsonObject))(content),
    catch: (cause) =>
      new DomainError({
        message: `Failed to parse JSON in "${filePath}"`,
        cause,
      }),
  });
});

const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);
const renderJson = (value: unknown): string => {
  const encoded = encodeJson(value);
  const edits = jsonc.format(encoded, undefined, FORMATTING_OPTIONS);
  return `${jsonc.applyEdits(encoded, edits)}\n`;
};

const readRootPackageJson = Effect.fn(function* (rootDir: string) {
  const path = yield* Path.Path;
  const filePath = path.join(rootDir, "package.json");
  const content = yield* readFileString(filePath);
  const parsed = yield* parseJsonObject(content, filePath);
  const packageJson = yield* decodePackageJsonEffect(parsed).pipe(
    Effect.mapError(
      (cause) =>
        new DomainError({
          message: `Failed to decode package.json at "${filePath}"`,
          cause,
        })
    )
  );

  return {
    filePath,
    content,
    packageJson,
  } as const;
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

const workspacePatternsFromPackageJson = (
  workspaces: O.Option<ReadonlyArray<string> | { readonly packages?: ReadonlyArray<string> }>
): ReadonlyArray<string> => {
  if (O.isNone(workspaces)) {
    return A.empty();
  }

  const value: unknown = workspaces.value;
  if (A.isArray(value) && A.every(value, P.isString)) {
    return value;
  }

  if (
    P.isObject(value) &&
    P.hasProperty(value, "packages") &&
    A.isArray(value.packages) &&
    A.every(value.packages, P.isString)
  ) {
    return value.packages;
  }

  return A.empty();
};

const pathSegments = (value: string): ReadonlyArray<string> =>
  pipe(value, toPosixPath, Str.split("/"), A.filter(Str.isNonEmpty));

const uniqueInInputOrder = (values: ReadonlyArray<string>): ReadonlyArray<string> => {
  const results = A.empty<string>();
  let seen = HashSet.empty<string>();

  for (const value of values) {
    if (HashSet.has(seen, value)) {
      continue;
    }
    seen = HashSet.add(seen, value);
    results.push(value);
  }

  return results;
};

const readStringArray = (value: unknown): ReadonlyArray<string> =>
  A.isArray(value) && A.every(value, P.isString) ? value : A.empty<string>();

const readTstycheTestFileMatch = (parsed: Record<string, unknown>): ReadonlyArray<string> =>
  readStringArray(parsed.testFileMatch);

const isManagedTstycheWorkspace = (relativeDir: string): boolean =>
  Str.startsWith("packages/")(relativeDir) ||
  Str.startsWith("tooling/")(relativeDir) ||
  Str.startsWith("apps/")(relativeDir);

const isCoveredByTopLevelTstychePattern = (relativeDir: string): boolean => {
  const segments = pathSegments(relativeDir);
  return (
    A.length(segments) === 2 &&
    A.some(["packages", "tooling", "apps"], (prefix) => stringEquivalence(segments[0] ?? "", prefix))
  );
};

const buildCanonicalTstycheTestFileMatch = (workspaces: ReadonlyArray<WorkspaceDescriptor>): ReadonlyArray<string> => {
  const topLevelPatterns = uniqueInInputOrder(
    [
      A.some(workspaces, (workspace) => Str.startsWith("packages/")(workspace.relativeDir))
        ? "packages/*/dtslint/**/*.tst.*"
        : undefined,
      A.some(workspaces, (workspace) => Str.startsWith("tooling/")(workspace.relativeDir))
        ? "tooling/*/dtslint/**/*.tst.*"
        : undefined,
      A.some(workspaces, (workspace) => Str.startsWith("apps/")(workspace.relativeDir))
        ? "apps/*/dtslint/**/*.tst.*"
        : undefined,
    ].filter(P.isString)
  );

  const explicitWorkspacePatterns = pipe(
    workspaces,
    A.map((workspace) => workspace.relativeDir),
    A.filter(isManagedTstycheWorkspace),
    A.filter((relativeDir) => !isCoveredByTopLevelTstychePattern(relativeDir)),
    A.map((relativeDir) => `${relativeDir}/dtslint/**/*.tst.*`),
    A.sort(byStringAscending)
  );

  return uniqueInInputOrder([...topLevelPatterns, ...explicitWorkspacePatterns]);
};

const SYNCPACK_SOURCE_ARRAY_PATTERN = /source:\s*\[(?<body>[\s\S]*?)\],/m;
const SYNC_SOURCE_ENTRY_PATTERN = /"([^"]+)"/g;

const readSyncpackSources = (content: string): Effect.Effect<ReadonlyArray<string>, DomainError> => {
  const match = SYNCPACK_SOURCE_ARRAY_PATTERN.exec(content);
  if (match === null) {
    return Effect.fail(new DomainError({ message: "Failed to read syncpack source array: source array not found" }));
  }

  return Effect.succeed(
    pipe(
      [...(match.groups?.body ?? "").matchAll(SYNC_SOURCE_ENTRY_PATTERN)],
      A.map((entry) => entry[1] ?? "")
    )
  );
};

const renderSyncpackSourcesBlock = (sources: ReadonlyArray<string>): string =>
  `source: [\n${pipe(
    sources,
    A.map((source) => `    "${source}",`),
    A.join("\n")
  )}\n  ],`;

const replaceSyncpackSources = (content: string, sources: ReadonlyArray<string>): Effect.Effect<string, DomainError> =>
  SYNCPACK_SOURCE_ARRAY_PATTERN.test(content)
    ? Effect.succeed(content.replace(SYNCPACK_SOURCE_ARRAY_PATTERN, renderSyncpackSourcesBlock(sources)))
    : Effect.fail(new DomainError({ message: "Failed to replace syncpack source array: source array not found" }));

const buildCanonicalSyncpackSources = (workspacePatterns: ReadonlyArray<string>): ReadonlyArray<string> =>
  uniqueInInputOrder(["package.json", ...A.map(workspacePatterns, (pattern) => `${pattern}/package.json`)]);

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
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const workspaceDirs = yield* resolveWorkspaceDirs(rootDir);
  const tsconfigPathsByPackage = yield* collectTsConfigPaths(rootDir);

  const descriptors = A.empty<WorkspaceDescriptor>();

  for (const [packageName, absoluteDir] of workspaceDirs) {
    const tsconfigPaths = O.getOrElse(HashMap.get(tsconfigPathsByPackage, packageName), A.empty<string>);

    const ownerTsconfigPath = chooseOwnerTsconfig(tsconfigPaths);
    const hasProjectTsconfig = A.some(tsconfigPaths, (entry) => Str.endsWith("/tsconfig.json")(toPosixPath(entry)));
    const relativeDir = toPosixPath(path.relative(rootDir, absoluteDir));
    const packageJsonPath = path.join(absoluteDir, "package.json");
    const packageJsonContent = yield* readFileString(packageJsonPath);
    const packageJson = yield* Effect.try({
      try: () => S.decodeUnknownSync(S.fromJsonString(S.Unknown))(packageJsonContent),
      catch: (cause) =>
        new DomainError({
          message: `Failed to parse JSON in "${packageJsonPath}"`,
          cause,
        }),
    }).pipe(
      Effect.flatMap((parsed) =>
        decodePackageJsonEffect(parsed).pipe(
          Effect.mapError(
            (cause) =>
              new DomainError({
                message: `Failed to decode package.json at "${packageJsonPath}"`,
                cause,
              })
          )
        )
      )
    );
    const hasDocgenConfig = yield* fs
      .exists(path.join(absoluteDir, DOCGEN_CONFIG_FILENAME))
      .pipe(Effect.orElseSucceed(thunkFalse));
    const directWorkspaceDependencies = collectDocgenWorkspaceDependencyNames(packageJson);
    const aliasTargets = pipe(
      packageJson.exports,
      O.flatMap(resolveRootExportTarget),
      O.map((rootExportTarget) => buildCanonicalAliasTargets(relativeDir, rootExportTarget))
    );
    const docgenAliasSource = buildDocgenAliasSource(packageName, relativeDir, packageJson);

    descriptors.push(
      new WorkspaceDescriptor({
        packageName,
        absoluteDir,
        relativeDir,
        ownerTsconfigPath,
        hasProjectTsconfig,
        hasDocgenConfig,
        directWorkspaceDependencies: [...directWorkspaceDependencies],
        rootAliasTarget: O.getOrUndefined(O.map(aliasTargets, (targets) => targets.rootAliasTarget)),
        wildcardAliasTarget: O.getOrUndefined(O.map(aliasTargets, (targets) => targets.wildcardAliasTarget)),
        docgenRootAliasTarget: docgenAliasSource.rootAliasTarget,
        docgenWildcardAliasTarget: docgenAliasSource.wildcardAliasTarget,
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

const planRootQualityReferenceSync = Effect.fn(function* (
  rootDir: string,
  workspaces: ReadonlyArray<WorkspaceDescriptor>
) {
  const path = yield* Path.Path;
  const filePath = path.join(rootDir, "tsconfig.quality.packages.json");

  const original = yield* readFileString(filePath);
  const parsed = yield* parseJsonc(original, filePath, TsconfigWithReferences);

  const expected = uniqueSorted(
    pipe(
      workspaces,
      A.flatMap((workspace) =>
        workspace.hasProjectTsconfig && !stringEquivalence(workspace.relativeDir, "scratchpad")
          ? A.make(workspace.relativeDir)
          : A.empty<string>()
      )
    )
  );

  const current = compareReferencePathsInOrder(parsed);
  if (arraysEqual(current, expected)) {
    return O.none<PlannedFileChange>();
  }

  const nextContent = applyJsoncModification(original, ["references"], referenceEntries(expected));

  return O.some(
    PlannedFileChange.cases["root-quality-references"].makeUnsafe({
      filePath,
      summary: summaryCounts(current, expected, "references"),
      content: nextContent,
    })
  );
});

const canonicalAliasEntriesForWorkspace = (
  workspace: WorkspaceDescriptor
): ReadonlyArray<readonly [string, ReadonlyArray<string>]> => {
  if (
    !isBeepScopedPackageName(workspace.packageName) ||
    workspace.rootAliasTarget === undefined ||
    workspace.wildcardAliasTarget === undefined
  ) {
    return A.empty();
  }

  return [
    [workspace.packageName, [workspace.rootAliasTarget]],
    [`${workspace.packageName}/*`, [workspace.wildcardAliasTarget]],
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

const planRootTstycheSync = Effect.fn(function* (rootDir: string, workspaces: ReadonlyArray<WorkspaceDescriptor>) {
  const path = yield* Path.Path;
  const filePath = path.join(rootDir, "tstyche.config.json");

  const original = yield* readFileString(filePath);
  const parsed = yield* parseJsonObject(original, filePath);
  const current = readTstycheTestFileMatch(parsed);
  const expected = buildCanonicalTstycheTestFileMatch(workspaces);

  if (arraysEqual(current, expected)) {
    return O.none<PlannedFileChange>();
  }

  const nextContent = renderJson({
    ...parsed,
    testFileMatch: expected,
  });

  return O.some(
    PlannedFileChange.cases["root-tstyche"].makeUnsafe({
      filePath,
      summary: summaryCounts(current, expected, "testFileMatch"),
      content: nextContent,
    })
  );
});

const planRootSyncpackSync = Effect.fn(function* (rootDir: string) {
  const path = yield* Path.Path;
  const { packageJson } = yield* readRootPackageJson(rootDir);
  const syncpackFilePath = path.join(rootDir, "syncpack.config.ts");
  const original = yield* readFileString(syncpackFilePath);
  const current = yield* readSyncpackSources(original);
  const workspacePatterns = workspacePatternsFromPackageJson(packageJson.workspaces);
  const expected = buildCanonicalSyncpackSources(workspacePatterns);

  if (arraysEqual(current, expected)) {
    return O.none<PlannedFileChange>();
  }

  const nextContent = yield* replaceSyncpackSources(original, expected);
  return O.some(
    PlannedFileChange.cases["root-syncpack"].makeUnsafe({
      filePath: syncpackFilePath,
      summary: summaryCounts(current, expected, "sources"),
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

const resolveTargetWorkspacesForPackageSync = (
  workspaces: ReadonlyArray<WorkspaceDescriptor>,
  filter: string | undefined
): Effect.Effect<ReadonlyArray<WorkspaceDescriptor>, TsconfigSyncFilterError> => {
  const normalizedFilter = filter === undefined ? undefined : Str.replace(/^\.\//, "")(toPosixPath(filter));

  const targetWorkspaces = A.filter(workspaces, (workspace) => {
    if (workspace.ownerTsconfigPath === undefined) {
      return false;
    }

    if (normalizedFilter === undefined) {
      return true;
    }

    const packageNameMatchesFilter = O.match(O.fromUndefinedOr(filter), {
      onNone: thunkFalse,
      onSome: (filterValue) => stringEquivalence(workspace.packageName, filterValue),
    });

    return packageNameMatchesFilter || stringEquivalence(workspace.relativeDir, normalizedFilter);
  });

  if (filter !== undefined && isArrayEmpty(targetWorkspaces)) {
    return Effect.fail(
      new TsconfigSyncFilterError({
        filter,
        message: `No workspace matched filter "${filter}"`,
      })
    );
  }

  return Effect.succeed(targetWorkspaces);
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
  const targetWorkspaces = yield* resolveTargetWorkspacesForPackageSync(workspaces, filter);

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
          : A.of(descriptor.value.ownerTsconfigPath);
      })
    );

    const original = yield* readFileString(sourceOwnerTsconfigPath);
    const parsed = yield* parseJsonc(original, sourceOwnerTsconfigPath, TsconfigWithReferences);

    const existingRefs = compareReferencePathsInOrder(parsed);
    const existingResolvedTargets = A.empty<string>();

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

const planPackageDocgenSync = Effect.fn(function* (
  rootDir: string,
  workspaces: ReadonlyArray<WorkspaceDescriptor>,
  filter: string | undefined
) {
  const path = yield* Path.Path;
  const targetWorkspaces = yield* resolveTargetWorkspacesForPackageSync(workspaces, filter);
  const workspaceAliasSources = A.map(
    workspaces,
    (workspace) =>
      new DocgenAliasSource({
        packageName: workspace.packageName,
        rootAliasTarget: O.getOrUndefined(O.fromUndefinedOr(workspace.docgenRootAliasTarget)) ?? "",
        wildcardAliasTarget: O.getOrUndefined(O.fromUndefinedOr(workspace.docgenWildcardAliasTarget)) ?? "",
      })
  );
  const plannedChanges = A.empty<PlannedFileChange>();

  for (const workspace of targetWorkspaces) {
    if (!workspace.hasDocgenConfig) {
      continue;
    }

    const filePath = path.join(workspace.absoluteDir, DOCGEN_CONFIG_FILENAME);
    const original = yield* readFileString(filePath);
    const parsed = yield* parseJsonObject(original, filePath);
    const canonicalConfig = yield* createCanonicalDocgenConfig(
      new CanonicalDocgenConfigInput({
        rootDir,
        packageAbsolutePath: workspace.absoluteDir,
        packageRelativePath: workspace.relativeDir,
        packageName: workspace.packageName,
        directWorkspaceDependencies: [...workspace.directWorkspaceDependencies],
        workspaceAliasSources,
      })
    );
    const nextDocument = mergeManagedDocgenConfig(parsed, canonicalConfig);
    const nextContent = renderJson(nextDocument);

    if (stringEquivalence(nextContent, original)) {
      continue;
    }

    plannedChanges.push(
      PlannedFileChange.cases["package-docgen"].makeUnsafe({
        filePath,
        summary: "managed docgen fields synchronized",
        content: nextContent,
      })
    );
  }

  return plannedChanges;
});

const sortChanges = (changes: ReadonlyArray<PlannedFileChange>): ReadonlyArray<PlannedFileChange> =>
  A.sort(changes, byPlannedChangeAscending);

const toReportedChange = (change: PlannedFileChange): TsconfigSyncChange =>
  PlannedFileChange.match(change, {
    "root-references": ({ filePath, summary }): TsconfigSyncChange =>
      TsconfigSyncChange.cases["root-references"].makeUnsafe({ filePath, summary }),
    "root-quality-references": ({ filePath, summary }): TsconfigSyncChange =>
      TsconfigSyncChange.cases["root-quality-references"].makeUnsafe({ filePath, summary }),
    "root-aliases": ({ filePath, summary }): TsconfigSyncChange =>
      TsconfigSyncChange.cases["root-aliases"].makeUnsafe({ filePath, summary }),
    "root-tstyche": ({ filePath, summary }): TsconfigSyncChange =>
      TsconfigSyncChange.cases["root-tstyche"].makeUnsafe({ filePath, summary }),
    "root-syncpack": ({ filePath, summary }): TsconfigSyncChange =>
      TsconfigSyncChange.cases["root-syncpack"].makeUnsafe({ filePath, summary }),
    "package-references": ({ filePath, summary }): TsconfigSyncChange =>
      TsconfigSyncChange.cases["package-references"].makeUnsafe({ filePath, summary }),
    "package-docgen": ({ filePath, summary }): TsconfigSyncChange =>
      TsconfigSyncChange.cases["package-docgen"].makeUnsafe({ filePath, summary }),
  });

const renderChanges = Effect.fn(function* (
  rootDir: string,
  mode: TsconfigSyncMode,
  changes: ReadonlyArray<TsconfigSyncChange>
) {
  const path = yield* Path.Path;

  if (isArrayEmpty(changes)) {
    yield* TsconfigSyncModeMatch(mode, {
      check: () => Console.log("tsconfig-sync: no drift detected"),
      "dry-run": () => Console.log("tsconfig-sync: dry-run found no changes"),
      sync: () => Console.log("tsconfig-sync: all files already in sync"),
    });
    return;
  }

  const prefix = TsconfigSyncModeMatch(mode, {
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
 * @category Utility
 * @since 0.0.0
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

    const rootQualityReferenceChange = yield* planRootQualityReferenceSync(rootDir, workspaces);
    if (O.isSome(rootQualityReferenceChange)) {
      plannedChanges.push(rootQualityReferenceChange.value);
    }

    const rootAliasChange = yield* planRootAliasSync(rootDir, workspaces);
    if (O.isSome(rootAliasChange)) {
      plannedChanges.push(rootAliasChange.value);
    }

    const rootTstycheChange = yield* planRootTstycheSync(rootDir, workspaces);
    if (O.isSome(rootTstycheChange)) {
      plannedChanges.push(rootTstycheChange.value);
    }

    const rootSyncpackChange = yield* planRootSyncpackSync(rootDir);
    if (O.isSome(rootSyncpackChange)) {
      plannedChanges.push(rootSyncpackChange.value);
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

    const docgenChanges = yield* planPackageDocgenSync(rootDir, workspaces, options.filter);
    plannedChanges.push(...docgenChanges);

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

    const result: TsconfigSyncResult = TsconfigSyncModeMatch(options.mode, {
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
 * @category UseCase
 * @since 0.0.0
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
    "Synchronize repo-managed config files including root tsconfig references, aliases, tstyche, syncpack, and package docgen"
  )
);
