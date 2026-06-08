import { createHash } from "node:crypto";
import { $RepoCliId } from "@beep/identity/packages";
import { RepoExportsCatalogPackage } from "@beep/repo-codegraph";
import { A, O, Str, thunkFalse } from "@beep/utils";
import { Effect, FileSystem, MutableHashMap, Path } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { Project } from "ts-morph";
import {
  declarationKind,
  defaultRepoRoot,
  discoverWorkspacePackages,
  escapeRegExp,
  formatJsonc,
  getJsDocText,
  ignoredSourceSuffixes,
  JsonRecord,
  listSourceFiles,
  normalizeSlashes,
  QualityArtifactGeneratorError,
  readJsonc,
  readText,
  repoRelative,
  summaryFromComment,
  tagsFromComment,
  topoSortPackageNames,
  valuesForTag,
} from "./QualityArtifactSupport.js";
import type * as Ordering from "effect/Ordering";
import type { ChildProcessSpawner } from "effect/unstable/process";
import type { Node, SourceFile } from "ts-morph";
import type { PackageJson, WorkspacePackageInfo } from "./QualityArtifactSupport.js";

const $I = $RepoCliId.create("commands/Quality/internal/RepoExportsCatalog");
const rootCatalogStandard = "repo-exports-catalog";
const rootCatalogSchemaVersion = "repo-exports-catalog/v1";
const rootCatalogIndexStandard = "repo-exports-catalog-index";
const rootCatalogIndexSchemaVersion = "repo-exports-catalog-index/v1";
const shardStandard = "repo-exports-catalog-shard";
const shardSchemaVersion = "repo-exports-catalog-shard/v1";
const fingerprintAlgorithm = "sha256";

type ExportMapEntry = {
  readonly subpath: string;
  readonly target: string | null | undefined;
  readonly denied: boolean;
};

type ActiveExportMapEntry = ExportMapEntry & {
  readonly target: string;
  readonly denied: false;
};

type ExportExposure = {
  readonly exportSubpath: string;
  readonly importSpecifier: string;
  readonly targetPath: string;
  readonly sourceFilePath: string;
};

type CatalogEntryInput = {
  readonly packageName: string;
  readonly packagePath: string;
  readonly importSpecifier: string;
  readonly exportSubpath: string;
  readonly symbolName: string;
  readonly exportKind: string;
  readonly summary: string;
  readonly categories: ReadonlyArray<string>;
  readonly sourcePath: string;
};

type CatalogEntry = CatalogEntryInput & {
  readonly topoOrder: number;
  readonly exportedFromPath: string;
  readonly sourceLine: number;
  readonly since: ReadonlyArray<string>;
  readonly tags: ReadonlyArray<string>;
  readonly searchText: string;
};

type PackageCatalog = {
  readonly packageName: string;
  readonly packagePath: string;
  readonly topoOrder: number;
  readonly status: "has-public-exports" | "no-public-exports" | "missing-workspace-metadata";
  readonly importSpecifiers: ReadonlyArray<string>;
  readonly counts: {
    readonly publicExportEntries: number;
    readonly uniqueSymbols: number;
    readonly sourceFiles: number;
  };
  readonly exports: ReadonlyArray<CatalogEntry>;
};

type Catalog = {
  readonly standard: string;
  readonly schemaVersion: string;
  readonly deterministic: boolean;
  readonly authority: JsonRecord;
  readonly source: JsonRecord;
  readonly totals: ReturnType<typeof catalogTotals>;
  readonly packages: ReadonlyArray<PackageCatalog>;
};

type CatalogIndexPackage = {
  readonly packageName: string;
  readonly packagePath: string;
  readonly topoOrder: number;
  readonly status: PackageCatalog["status"];
  readonly shardPath?: string;
};

type CatalogIndex = {
  readonly standard: typeof rootCatalogIndexStandard;
  readonly schemaVersion: typeof rootCatalogIndexSchemaVersion;
  readonly deterministic: true;
  readonly authority: JsonRecord;
  readonly source: JsonRecord;
  readonly totals: ReturnType<typeof catalogTotals>;
  readonly packages: ReadonlyArray<CatalogIndexPackage>;
};

type FingerprintInput = {
  readonly path: string;
  readonly sha256: string;
  readonly bytes: number;
};

type PackageCatalogFingerprint = {
  readonly algorithm: typeof fingerprintAlgorithm;
  readonly digest: string;
  readonly inputs: ReadonlyArray<FingerprintInput>;
};

type PackageCatalogShard = {
  readonly standard: typeof shardStandard;
  readonly schemaVersion: typeof shardSchemaVersion;
  readonly deterministic: true;
  readonly source: JsonRecord;
  readonly fingerprint: PackageCatalogFingerprint;
  readonly package: PackageCatalog;
};

const outputJsonRelativePath = "standards/repo-exports.catalog.jsonc";
const outputMarkdownRelativePath = "standards/repo-exports.catalog.md";
const outputShardRelativePath = ".beep/repo-exports/catalog.shard.jsonc";
const catalogGeneratorVersion = "repo-exports-catalog-generator/v2";
const generatorInputRelativePaths = [
  "packages/tooling/tool/cli/src/commands/Quality/internal/RepoExportsCatalog.ts",
  "packages/tooling/tool/cli/src/commands/Quality/internal/QualityArtifactSupport.ts",
  "packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts",
];
const conditionPreference = ["types", "import", "default", "require"];
const conditionNames = new Set(conditionPreference);
const compareText = (left: string, right: string): Ordering.Ordering => Str.localeCompare(right)(left);
const compareNumber = (left: number, right: number): Ordering.Ordering => {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
};

/**
 * Options for building, writing, or checking the repo export catalog.
 *
 * @category configuration
 * @since 0.0.0
 */
export class RepoExportsCatalogOptions extends S.Class<RepoExportsCatalogOptions>($I`RepoExportsCatalogOptions`)(
  {
    rootDir: S.optionalKey(S.String),
    outputJsonPath: S.optionalKey(S.String),
    outputMarkdownPath: S.optionalKey(S.String),
    outputShardPath: S.optionalKey(S.String),
    check: S.optionalKey(S.Boolean),
    fromShards: S.optionalKey(S.Boolean),
    packageShard: S.optionalKey(S.Boolean),
    packageName: S.optionalKey(S.String),
  },
  $I.annote("RepoExportsCatalogOptions", {
    description: "Options for building, writing, or checking the repo export catalog artifacts.",
  })
) {}

/**
 * Result returned after writing or checking repo export catalog artifacts.
 *
 * @category models
 * @since 0.0.0
 */
export class RepoExportsCatalogWriteResult extends S.Class<RepoExportsCatalogWriteResult>(
  $I`RepoExportsCatalogWriteResult`
)(
  {
    outputJsonPath: S.String,
    outputMarkdownPath: S.String,
    outputShardPath: S.optionalKey(S.String),
    totals: JsonRecord,
    findings: S.Array(S.String),
    checked: S.Boolean,
    written: S.Boolean,
  },
  $I.annote("RepoExportsCatalogWriteResult", {
    description: "Output metadata returned after writing or checking repo export catalog artifacts.",
  })
) {}

class RepoExportsCatalogShardFingerprintInput extends S.Class<RepoExportsCatalogShardFingerprintInput>(
  $I`RepoExportsCatalogShardFingerprintInput`
)(
  {
    path: S.String,
    sha256: S.String,
    bytes: S.Finite,
  },
  $I.annote("RepoExportsCatalogShardFingerprintInput", {
    description: "One package-shard input file included in the deterministic repo-export fingerprint.",
  })
) {}

class RepoExportsCatalogShardFingerprint extends S.Class<RepoExportsCatalogShardFingerprint>(
  $I`RepoExportsCatalogShardFingerprint`
)(
  {
    algorithm: S.Literal(fingerprintAlgorithm),
    digest: S.String,
    inputs: S.Array(RepoExportsCatalogShardFingerprintInput),
  },
  $I.annote("RepoExportsCatalogShardFingerprint", {
    description: "Deterministic fingerprint metadata for a package-local repo-export shard.",
  })
) {}

class RepoExportsCatalogShard extends S.Class<RepoExportsCatalogShard>($I`RepoExportsCatalogShard`)(
  {
    standard: S.Literal(shardStandard),
    schemaVersion: S.Literal(shardSchemaVersion),
    deterministic: S.Literal(true),
    source: JsonRecord,
    fingerprint: RepoExportsCatalogShardFingerprint,
    package: RepoExportsCatalogPackage,
  },
  $I.annote("RepoExportsCatalogShard", {
    description: "Package-local repo-export shard consumed by root catalog aggregation.",
  })
) {}

const resolveRepoExportsCatalogOptions = Effect.fn("RepoExportsCatalog.resolveOptions")(function* (
  options: RepoExportsCatalogOptions = {}
) {
  const path = yield* Path.Path;
  const repoRoot = options.rootDir ?? defaultRepoRoot;

  return {
    repoRoot,
    outputJsonPath: options.outputJsonPath ?? path.join(repoRoot, outputJsonRelativePath),
    outputMarkdownPath: options.outputMarkdownPath ?? path.join(repoRoot, outputMarkdownRelativePath),
    outputShardPath: options.outputShardPath,
    check: options.check ?? false,
    fromShards: options.fromShards ?? false,
    packageShard: options.packageShard ?? false,
    packageName: options.packageName,
  };
});

const markdownCell = (value: unknown): string =>
  Str.replace(/\|/g, "\\|")(Str.replace(/\r?\n/g, " ")(String(value ?? "")));

const isIgnoredSourceTarget = (target: unknown): target is string =>
  P.isString(target) && A.some(ignoredSourceSuffixes, (suffix) => Str.endsWith(suffix)(target));

const exportTargetFrom = (value: unknown): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (P.isString(value)) {
    return value;
  }
  if (!P.isObject(value)) {
    return undefined;
  }

  const record = value as JsonRecord;
  let ignoredSourceFallback: string | undefined;
  const selectTarget = (target: string | undefined): string | undefined => {
    if (target === undefined) {
      return undefined;
    }
    if (isIgnoredSourceTarget(target)) {
      ignoredSourceFallback ??= target;
      return undefined;
    }
    return target;
  };

  for (const condition of conditionPreference) {
    const target = exportTargetFrom(record[condition]);
    const selected = selectTarget(target);
    if (selected !== undefined) {
      return selected;
    }
  }

  for (const [key, nested] of Object.entries(record)) {
    if (conditionNames.has(key)) {
      continue;
    }
    const target = exportTargetFrom(nested);
    const selected = selectTarget(target);
    if (selected !== undefined) {
      return selected;
    }
  }

  return ignoredSourceFallback;
};

const hasExportSubpathKeys = (value: JsonRecord): boolean =>
  A.some(Object.keys(value), (key) => key === "." || Str.startsWith("./")(key));

const isRootConditionalExportMap = (value: JsonRecord): boolean =>
  !A.isArray(value) && !hasExportSubpathKeys(value) && A.some(Object.keys(value), (key) => conditionNames.has(key));

const exportMapEntriesFrom = (packageJson: PackageJson): ReadonlyArray<ExportMapEntry> => {
  const exportsField = packageJson.exports;
  if (exportsField === undefined) {
    return [];
  }

  if (typeof exportsField === "string" || exportsField === null) {
    return [
      {
        subpath: ".",
        target: exportsField as string | null,
        denied: exportsField === null,
      },
    ];
  }

  if (typeof exportsField !== "object" || A.isArray(exportsField)) {
    return [];
  }

  const exportsRecord = exportsField as JsonRecord;

  if (isRootConditionalExportMap(exportsRecord)) {
    return [
      {
        subpath: ".",
        target: exportTargetFrom(exportsRecord),
        denied: false,
      },
    ];
  }

  return A.map(Object.entries(exportsRecord), ([subpath, value]) => ({
    subpath,
    target: value === null ? null : exportTargetFrom(value),
    denied: value === null,
  }));
};

const isSourceTarget = (target: unknown): target is string =>
  P.isString(target) &&
  (Str.endsWith(".ts")(target) || Str.endsWith(".tsx")(target)) &&
  !A.some(ignoredSourceSuffixes, (suffix) => Str.endsWith(suffix)(target));

const isActiveSourceExportEntry = (entry: ExportMapEntry): entry is ActiveExportMapEntry =>
  !entry.denied && isSourceTarget(entry.target);

const capturesForPattern = (pattern: string, value: string): Array<string> | undefined => {
  const parts = A.map(Str.split("*")(normalizeSlashes(pattern)), escapeRegExp);
  const regex = new RegExp(`^${A.join(parts, "(.+)")}$`);
  const match = regex.exec(normalizeSlashes(value));
  return match === null ? undefined : match.slice(1);
};

const fillPattern = (pattern: string, captures: ReadonlyArray<string>): string => {
  let captureIndex = 0;
  return Str.replaceWith(/\*/g, () => captures[captureIndex++] ?? "")(normalizeSlashes(pattern));
};

const subpathDenied = (subpath: string, deniedEntries: ReadonlyArray<ExportMapEntry>): boolean =>
  deniedEntries.some((entry) =>
    Str.includes("*")(entry.subpath)
      ? capturesForPattern(entry.subpath, subpath) !== undefined
      : normalizeSlashes(entry.subpath) === normalizeSlashes(subpath)
  );

const importSpecifierFor = (packageName: string, subpath: string): string => {
  if (subpath === ".") {
    return packageName;
  }
  return `${packageName}/${Str.replace(/^\.\//, "")(subpath)}`;
};

const exportedSourceFilePath = (packagePath: string, target: string, path: Path.Path): string =>
  path.join(packagePath, Str.replace(/^\.\//, "")(normalizeSlashes(target)));

const expandExportMap = Effect.fn("RepoExportsCatalog.expandExportMap")(function* (
  packageInfo: WorkspacePackageInfo,
  sourceFilePaths: ReadonlyArray<string>,
  path: Path.Path
): Effect.fn.Return<ReadonlyArray<ExportExposure>, QualityArtifactGeneratorError, FileSystem.FileSystem> {
  const fs = yield* FileSystem.FileSystem;
  const exportEntries = exportMapEntriesFrom(packageInfo.packageJson);
  const deniedEntries = A.filter(exportEntries, (entry) => entry.denied);
  const activeEntries = A.filter(exportEntries, isActiveSourceExportEntry);
  const exposures: Array<ExportExposure> = [];
  const seen = new Set<string>();

  for (const entry of activeEntries) {
    if (Str.includes("*")(entry.target)) {
      for (const sourceFilePath of sourceFilePaths) {
        const packageTarget = `./${normalizeSlashes(path.relative(packageInfo.absolutePath, sourceFilePath))}`;
        const captures = capturesForPattern(entry.target, packageTarget);
        if (captures === undefined) {
          continue;
        }

        const subpath = fillPattern(entry.subpath, captures);
        if (subpathDenied(subpath, deniedEntries)) {
          continue;
        }

        const key = `${subpath}:${sourceFilePath}`;
        if (!seen.has(key)) {
          seen.add(key);
          A.appendInPlace(exposures, {
            exportSubpath: subpath,
            importSpecifier: importSpecifierFor(packageInfo.name, subpath),
            targetPath: packageTarget,
            sourceFilePath,
          });
        }
      }
      continue;
    }

    const sourceFilePath = exportedSourceFilePath(packageInfo.absolutePath, entry.target, path);
    const exists = yield* fs.exists(sourceFilePath).pipe(Effect.orElseSucceed(thunkFalse));
    if (!exists || subpathDenied(entry.subpath, deniedEntries)) {
      continue;
    }

    const key = `${entry.subpath}:${sourceFilePath}`;
    if (!seen.has(key)) {
      seen.add(key);
      A.appendInPlace(exposures, {
        exportSubpath: entry.subpath,
        importSpecifier: importSpecifierFor(packageInfo.name, entry.subpath),
        targetPath: normalizeSlashes(entry.target),
        sourceFilePath,
      });
    }
  }

  return A.sortInPlace(exposures, (left, right) =>
    compareText(`${left.importSpecifier}:${left.targetPath}`, `${right.importSpecifier}:${right.targetPath}`)
  );
});

const searchTextFor = (entry: CatalogEntryInput): string =>
  Str.trim(
    Str.replace(
      /\s+/g,
      " "
    )(
      Str.toLowerCase(
        A.join(
          [
            entry.packageName,
            entry.packagePath,
            entry.importSpecifier,
            entry.exportSubpath,
            entry.symbolName,
            entry.exportKind,
            entry.summary,
            ...entry.categories,
            entry.sourcePath,
          ],
          " "
        )
      )
    )
  );

const catalogEntryFor = (
  packageInfo: WorkspacePackageInfo,
  topoOrder: number,
  exposure: ExportExposure,
  symbolName: string,
  declaration: Node,
  repoRoot: string,
  path: Path.Path
): CatalogEntry => {
  const docText = getJsDocText(declaration);
  const categories = valuesForTag(docText, "@category");
  const sourcePath = repoRelative(declaration.getSourceFile().getFilePath(), repoRoot, path);
  const entry = {
    packageName: packageInfo.name,
    packagePath: packageInfo.path,
    topoOrder,
    importSpecifier: exposure.importSpecifier,
    exportSubpath: exposure.exportSubpath,
    exportedFromPath: repoRelative(exposure.sourceFilePath, repoRoot, path),
    symbolName,
    exportKind: declarationKind(declaration),
    sourcePath,
    sourceLine: declaration.getStartLineNumber(),
    summary: summaryFromComment(docText) ?? "",
    categories,
    since: valuesForTag(docText, "@since"),
    tags: tagsFromComment(docText),
  };

  return {
    ...entry,
    searchText: searchTextFor(entry),
  };
};

const packageStatusFor = (exportCount: number): PackageCatalog["status"] =>
  exportCount === 0 ? "no-public-exports" : "has-public-exports";

const isPackageCatalogStatus = (status: string): status is PackageCatalog["status"] =>
  status === "has-public-exports" || status === "no-public-exports" || status === "missing-workspace-metadata";

const analyzePackage = Effect.fn("RepoExportsCatalog.analyzePackage")(function* (
  packageInfo: WorkspacePackageInfo,
  topoOrder: number,
  repoRoot: string,
  path: Path.Path
): Effect.fn.Return<PackageCatalog, QualityArtifactGeneratorError, FileSystem.FileSystem> {
  const sourceRoot = path.join(packageInfo.absolutePath, "src");
  const sourceFilePaths = yield* listSourceFiles(sourceRoot, path);
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const sourceFileByPath = new Map<string, SourceFile>();

  for (const sourceFilePath of sourceFilePaths) {
    sourceFileByPath.set(sourceFilePath, project.addSourceFileAtPath(sourceFilePath));
  }

  const exports: Array<CatalogEntry> = [];
  const seen = new Set<string>();

  for (const exposure of yield* expandExportMap(packageInfo, sourceFilePaths, path)) {
    const sourceFile = sourceFileByPath.get(exposure.sourceFilePath);
    if (sourceFile === undefined) {
      continue;
    }

    for (const [symbolName, declarations] of sourceFile.getExportedDeclarations()) {
      for (const declaration of declarations) {
        const key = A.join(
          [
            exposure.importSpecifier,
            symbolName,
            declarationKind(declaration),
            repoRelative(declaration.getSourceFile().getFilePath(), repoRoot, path),
            `${declaration.getStartLineNumber()}`,
          ],
          ":"
        );

        if (seen.has(key)) {
          continue;
        }

        seen.add(key);
        A.appendInPlace(
          exports,
          catalogEntryFor(packageInfo, topoOrder, exposure, symbolName, declaration, repoRoot, path)
        );
      }
    }
  }

  A.sortInPlace(
    exports,
    (left, right) =>
      O.getOrUndefined(
        A.findFirst(
          [
            Str.localeCompare(right.importSpecifier)(left.importSpecifier),
            Str.localeCompare(right.symbolName)(left.symbolName),
            Str.localeCompare(right.exportKind)(left.exportKind),
            Str.localeCompare(right.sourcePath)(left.sourcePath),
            compareNumber(left.sourceLine, right.sourceLine),
          ],
          (result) => result !== 0
        )
      ) ?? 0
  );

  return {
    packageName: packageInfo.name,
    packagePath: packageInfo.path,
    topoOrder,
    status: packageStatusFor(exports.length),
    importSpecifiers: A.sort(
      A.map(A.fromIterable(new Set(A.map(exports, (entry) => entry.importSpecifier))), (specifier) => `${specifier}`),
      compareText
    ),
    counts: {
      publicExportEntries: exports.length,
      uniqueSymbols: new Set(A.map(exports, (entry) => entry.symbolName)).size,
      sourceFiles: sourceFilePaths.length,
    },
    exports,
  };
});

const analyzeMissingPackage = (packageName: string, topoOrder: number): PackageCatalog => ({
  packageName,
  packagePath: "<unresolved>",
  topoOrder,
  status: "missing-workspace-metadata",
  importSpecifiers: [],
  counts: {
    publicExportEntries: 0,
    uniqueSymbols: 0,
    sourceFiles: 0,
  },
  exports: [],
});

const repoExportsCatalogAuthority = {
  posture: "descriptive-current-state",
  canonicalStatus: "not-evaluated",
  boundaryDoctrine: ["standards/ARCHITECTURE.md", "standards/architecture/README.md", "package-local policy"],
  note: "This catalog lists legal public export facts. It does not decide whether an import path, package root, wildcard export, or symbol is the canonical architecture surface for new code.",
};

const repoExportsCatalogSource = (generator: string): JsonRecord => ({
  packageUniverseCommand: "bun run topo-sort",
  generator,
  inputs: ["package.json exports", "TypeScript exported declarations", "JSDoc comments"],
});

const catalogTotals = (packages: ReadonlyArray<PackageCatalog>) => ({
  packages: packages.length,
  packagesWithPublicExports: packages.filter((entry) => entry.status === "has-public-exports").length,
  packagesWithoutPublicExports: packages.filter((entry) => entry.status === "no-public-exports").length,
  missingWorkspaceMetadata: packages.filter((entry) => entry.status === "missing-workspace-metadata").length,
  importSpecifiers: packages.reduce((total, entry) => total + entry.importSpecifiers.length, 0),
  publicExportEntries: packages.reduce((total, entry) => total + entry.counts.publicExportEntries, 0),
  uniquePackageSymbols: packages.reduce((total, entry) => total + entry.counts.uniqueSymbols, 0),
});

const catalogFromPackages = (packages: ReadonlyArray<PackageCatalog>, generator: string): Catalog => ({
  standard: rootCatalogStandard,
  schemaVersion: rootCatalogSchemaVersion,
  deterministic: true,
  authority: repoExportsCatalogAuthority,
  source: repoExportsCatalogSource(generator),
  totals: catalogTotals(packages),
  packages,
});

const shardRelativePathForPackage = (pkg: PackageCatalog): string =>
  normalizeSlashes(pkg.packagePath === "." ? outputShardRelativePath : `${pkg.packagePath}/${outputShardRelativePath}`);

const catalogIndexPackageFromPackage = (pkg: PackageCatalog): CatalogIndexPackage => ({
  packageName: pkg.packageName,
  packagePath: pkg.packagePath,
  topoOrder: pkg.topoOrder,
  status: pkg.status,
  ...(pkg.status === "missing-workspace-metadata" ? {} : { shardPath: shardRelativePathForPackage(pkg) }),
});

const catalogIndexFromCatalog = (catalog: Catalog): CatalogIndex => ({
  standard: rootCatalogIndexStandard,
  schemaVersion: rootCatalogIndexSchemaVersion,
  deterministic: true,
  authority: catalog.authority,
  source: catalog.source,
  totals: catalog.totals,
  packages: A.map(catalog.packages, catalogIndexPackageFromPackage),
});

const allExports = (catalog: Catalog): ReadonlyArray<CatalogEntry> => catalog.packages.flatMap((pkg) => pkg.exports);

const renderUnknownRecordProof = (catalog: Catalog): ReadonlyArray<CatalogEntry> =>
  allExports(catalog).filter(
    (entry) =>
      entry.packageName === "@beep/schema" &&
      entry.importSpecifier === "@beep/schema" &&
      entry.symbolName === "UnknownRecord"
  );

const renderMarkdown = (catalog: Catalog): string => {
  const lines: Array<string> = [];
  A.appendInPlace(lines, "# Repo Export Catalog");
  A.appendInPlace(lines, "");
  A.appendInPlace(
    lines,
    "Generated deterministically from package export maps, TypeScript exported declarations, and JSDoc."
  );
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "## Authority");
  A.appendInPlace(lines, "");
  A.appendInPlace(
    lines,
    "This catalog is descriptive current-state metadata. It lists legal public export facts; it does not decide whether an import path, package root, wildcard export, or symbol is the canonical architecture surface for new code."
  );
  A.appendInPlace(lines, "");
  A.appendInPlace(
    lines,
    "Use `standards/ARCHITECTURE.md`, the numbered architecture doctrine, and package-local policy for canonical boundary choices."
  );
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "## Scope");
  A.appendInPlace(lines, "");
  A.appendInPlace(
    lines,
    "The package universe is the current `bun run topo-sort` output. This catalog exists so coding agents can answer symbol-discovery questions with repo topology before recreating local helpers."
  );
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "## Totals");
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "| Metric | Count |");
  A.appendInPlace(lines, "|---|---:|");
  for (const [key, value] of Object.entries(catalog.totals)) {
    A.appendInPlace(lines, `| ${key} | ${value} |`);
  }
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "## Seed Discovery Proof");
  A.appendInPlace(lines, "");
  A.appendInPlace(
    lines,
    "`UnknownRecord` is intentionally proven through generated source metadata, not a hand-maintained alias table."
  );
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "| Import | Symbol | Kind | Source | Summary |");
  A.appendInPlace(lines, "|---|---|---|---|---|");
  for (const entry of renderUnknownRecordProof(catalog)) {
    A.appendInPlace(
      lines,
      `| \`${markdownCell(entry.importSpecifier)}\` | \`${markdownCell(entry.symbolName)}\` | ${markdownCell(entry.exportKind)} | \`${markdownCell(entry.sourcePath)}:${entry.sourceLine}\` | ${markdownCell(entry.summary)} |`
    );
  }
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "## Package Summary");
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "| Order | Package | Path | Status | Import Specifiers | Export Entries | Unique Symbols |");
  A.appendInPlace(lines, "|---:|---|---|---|---:|---:|---:|");
  for (const pkg of catalog.packages) {
    A.appendInPlace(
      lines,
      `| ${pkg.topoOrder} | \`${markdownCell(pkg.packageName)}\` | \`${markdownCell(pkg.packagePath)}\` | ${markdownCell(pkg.status)} | ${pkg.importSpecifiers.length} | ${pkg.counts.publicExportEntries} | ${pkg.counts.uniqueSymbols} |`
    );
  }
  A.appendInPlace(lines, "");
  A.appendInPlace(lines, "## Public Exports");

  for (const pkg of catalog.packages.filter((entry) => entry.exports.length > 0)) {
    A.appendInPlace(lines, "");
    A.appendInPlace(lines, `### ${pkg.packageName}`);
    A.appendInPlace(lines, "");
    A.appendInPlace(lines, "| Import | Symbol | Kind | Source | Summary |");
    A.appendInPlace(lines, "|---|---|---|---|---|");
    for (const entry of pkg.exports) {
      A.appendInPlace(
        lines,
        `| \`${markdownCell(entry.importSpecifier)}\` | \`${markdownCell(entry.symbolName)}\` | ${markdownCell(entry.exportKind)} | \`${markdownCell(entry.sourcePath)}:${entry.sourceLine}\` | ${markdownCell(entry.summary)} |`
      );
    }
  }

  return `${A.join(lines, "\n")}\n`;
};

/**
 * Build the deterministic repo export catalog for a repository.
 *
 * @category generators
 * @since 0.0.0
 */
export const buildRepoExportsCatalog = Effect.fn("RepoExportsCatalog.build")(function* (
  options: RepoExportsCatalogOptions = {}
): Effect.fn.Return<
  Catalog,
  QualityArtifactGeneratorError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const path = yield* Path.Path;
  const { repoRoot } = yield* resolveRepoExportsCatalogOptions(options);
  const packageByName = yield* discoverWorkspacePackages(repoRoot, path);
  const topoNames = yield* topoSortPackageNames(repoRoot);
  const packages = yield* Effect.forEach(
    topoNames,
    (packageName, index) => {
      const packageInfo = MutableHashMap.get(packageByName, packageName);
      return O.isNone(packageInfo)
        ? Effect.succeed(analyzeMissingPackage(packageName, index + 1))
        : analyzePackage(packageInfo.value, index + 1, repoRoot, path);
    },
    { concurrency: 1 }
  );

  return catalogFromPackages(packages, "bun run beep quality repo-exports-catalog");
});

const isInsideDirectory = (candidate: string, directory: string, path: Path.Path): boolean => {
  const relativePath = normalizeSlashes(path.relative(directory, candidate));
  return relativePath === "" || (!Str.startsWith("../")(relativePath) && relativePath !== "..");
};

const currentWorkspacePackage = Effect.fn("RepoExportsCatalog.currentWorkspacePackage")(function* (
  repoRoot: string,
  path: Path.Path,
  packageName?: string
): Effect.fn.Return<WorkspacePackageInfo, QualityArtifactGeneratorError, FileSystem.FileSystem> {
  const packageByName = yield* discoverWorkspacePackages(repoRoot, path);

  if (packageName !== undefined) {
    const namedPackage = MutableHashMap.get(packageByName, packageName);
    if (O.isSome(namedPackage)) {
      return namedPackage.value;
    }

    return yield* QualityArtifactGeneratorError.make({
      filePath: repoRoot,
      message: `Workspace package ${packageName} was not found.`,
    });
  }

  const cwd = path.resolve(process.cwd());
  const matchingPackages: ReadonlyArray<WorkspacePackageInfo> = A.filter(
    A.fromIterable(MutableHashMap.values(packageByName)),
    (packageInfo) => isInsideDirectory(cwd, packageInfo.absolutePath, path)
  );
  const matches = A.sort(matchingPackages, (left: WorkspacePackageInfo, right: WorkspacePackageInfo) =>
    compareNumber(right.absolutePath.length, left.absolutePath.length)
  );
  const match = A.head(matches);

  if (O.isSome(match)) {
    return match.value;
  }

  return yield* QualityArtifactGeneratorError.make({
    filePath: cwd,
    message: `Could not resolve the current workspace package from ${cwd}.`,
  });
});

const sha256Hex = (content: string): string => createHash(fingerprintAlgorithm).update(content).digest("hex");

const fingerprintInputFromContent = (inputPath: string, content: string): FingerprintInput => ({
  path: inputPath,
  sha256: sha256Hex(content),
  bytes: new TextEncoder().encode(content).byteLength,
});

const catalogGeneratorVersionInput = (): FingerprintInput =>
  fingerprintInputFromContent("generator:repo-exports-catalog", catalogGeneratorVersion);

const fingerprintInputFor = Effect.fn("RepoExportsCatalog.fingerprintInputFor")(function* (
  filePath: string,
  repoRoot: string,
  path: Path.Path
): Effect.fn.Return<FingerprintInput, QualityArtifactGeneratorError, FileSystem.FileSystem> {
  const content = yield* readText(filePath);
  return fingerprintInputFromContent(repoRelative(filePath, repoRoot, path), content);
});

const packageFingerprint = Effect.fn("RepoExportsCatalog.packageFingerprint")(function* (
  packageInfo: WorkspacePackageInfo,
  repoRoot: string,
  path: Path.Path
): Effect.fn.Return<PackageCatalogFingerprint, QualityArtifactGeneratorError, FileSystem.FileSystem> {
  const fs = yield* FileSystem.FileSystem;
  const packageJsonPath = path.join(packageInfo.absolutePath, "package.json");
  const packageSourceFiles = yield* listSourceFiles(path.join(packageInfo.absolutePath, "src"), path);
  const generatorInputPaths = A.map(generatorInputRelativePaths, (relativePath) => path.join(repoRoot, relativePath));
  const generatorInputOptions = yield* Effect.forEach(
    generatorInputPaths,
    (inputPath) =>
      fs.exists(inputPath).pipe(
        Effect.orElseSucceed(thunkFalse),
        Effect.map((exists) => (exists ? O.some(inputPath) : O.none<string>()))
      ),
    { concurrency: 4 }
  );
  const existingGeneratorInputPaths = A.getSomes(generatorInputOptions);
  const inputPaths = A.sort([packageJsonPath, ...packageSourceFiles, ...existingGeneratorInputPaths], compareText);
  const fileInputs = yield* Effect.forEach(inputPaths, (inputPath) => fingerprintInputFor(inputPath, repoRoot, path), {
    concurrency: 8,
  });
  const inputs = A.sort(
    [catalogGeneratorVersionInput(), ...fileInputs] as ReadonlyArray<FingerprintInput>,
    (left: FingerprintInput, right: FingerprintInput) => compareText(left.path, right.path)
  );
  const digest = sha256Hex(
    A.join(
      A.map(inputs, (input) => `${input.path}\u0000${input.sha256}\u0000${input.bytes}`),
      "\u0000"
    )
  );

  return {
    algorithm: fingerprintAlgorithm,
    digest,
    inputs,
  };
});

const shardPathForPackage = (repoRoot: string, packageInfo: WorkspacePackageInfo, path: Path.Path): string =>
  path.join(repoRoot, packageInfo.path, outputShardRelativePath);

const buildPackageCatalogShard = Effect.fn("RepoExportsCatalog.buildPackageShard")(function* (
  packageInfo: WorkspacePackageInfo,
  topoOrder: number,
  repoRoot: string,
  path: Path.Path
): Effect.fn.Return<PackageCatalogShard, QualityArtifactGeneratorError, FileSystem.FileSystem> {
  const packageCatalog = yield* analyzePackage(packageInfo, topoOrder, repoRoot, path);
  const fingerprint = yield* packageFingerprint(packageInfo, repoRoot, path);

  return {
    standard: shardStandard,
    schemaVersion: shardSchemaVersion,
    deterministic: true,
    source: repoExportsCatalogSource("bun run beep quality repo-exports-catalog --package-shard"),
    fingerprint,
    package: packageCatalog,
  };
});

const decodeRepoExportsCatalogShard = S.decodeUnknownEffect(RepoExportsCatalogShard);

const readPackageCatalogShard = Effect.fn("RepoExportsCatalog.readPackageShard")(function* (
  shardPath: string
): Effect.fn.Return<RepoExportsCatalogShard, QualityArtifactGeneratorError, FileSystem.FileSystem> {
  const parsed = yield* readJsonc(shardPath);
  return yield* decodeRepoExportsCatalogShard(parsed).pipe(
    QualityArtifactGeneratorError.mapError(`Failed to decode repo export shard ${shardPath}.`, {
      filePath: shardPath,
    })
  );
});

const packageCatalogFromShard = Effect.fn("RepoExportsCatalog.packageCatalogFromShard")(function* (
  shardPath: string,
  packageInfo: WorkspacePackageInfo,
  shard: RepoExportsCatalogShard,
  topoOrder: number
): Effect.fn.Return<PackageCatalog, QualityArtifactGeneratorError> {
  if (shard.package.packageName !== packageInfo.name) {
    return yield* QualityArtifactGeneratorError.make({
      filePath: shardPath,
      message: `Repo export shard package mismatch: expected ${packageInfo.name}, found ${shard.package.packageName}.`,
    });
  }
  if (shard.package.packagePath !== packageInfo.path) {
    return yield* QualityArtifactGeneratorError.make({
      filePath: shardPath,
      message: `Repo export shard path mismatch for ${packageInfo.name}: expected ${packageInfo.path}, found ${shard.package.packagePath}.`,
    });
  }
  if (!isPackageCatalogStatus(shard.package.status)) {
    return yield* QualityArtifactGeneratorError.make({
      filePath: shardPath,
      message: `Repo export shard ${shardPath} has unsupported package status ${shard.package.status}.`,
    });
  }

  return {
    packageName: shard.package.packageName,
    packagePath: shard.package.packagePath,
    topoOrder,
    status: shard.package.status,
    importSpecifiers: shard.package.importSpecifiers,
    counts: shard.package.counts,
    exports: A.map(shard.package.exports, (entry) => ({ ...entry, topoOrder })),
  };
});

const buildRepoExportsCatalogFromShards = Effect.fn("RepoExportsCatalog.buildFromShards")(function* (
  options: RepoExportsCatalogOptions = {}
): Effect.fn.Return<
  Catalog,
  QualityArtifactGeneratorError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const path = yield* Path.Path;
  const { repoRoot } = yield* resolveRepoExportsCatalogOptions(options);
  const packageByName = yield* discoverWorkspacePackages(repoRoot, path);
  const topoNames = yield* topoSortPackageNames(repoRoot);
  const packages = yield* Effect.forEach(
    topoNames,
    (packageName, index) => {
      const packageInfo = MutableHashMap.get(packageByName, packageName);
      if (O.isNone(packageInfo)) {
        return Effect.succeed(analyzeMissingPackage(packageName, index + 1));
      }

      const shardPath = shardPathForPackage(repoRoot, packageInfo.value, path);
      return readPackageCatalogShard(shardPath).pipe(
        Effect.flatMap((shard) => packageCatalogFromShard(shardPath, packageInfo.value, shard, index + 1))
      );
    },
    { concurrency: 8 }
  );

  return catalogFromPackages(packages, "bun run beep quality repo-exports-catalog");
});

const checkFile = Effect.fn("RepoExportsCatalog.checkFile")(function* (
  filePath: string,
  content: string,
  repoRoot: string,
  path: Path.Path
): Effect.fn.Return<ReadonlyArray<string>, QualityArtifactGeneratorError, FileSystem.FileSystem> {
  const fs = yield* FileSystem.FileSystem;
  const exists = yield* fs.exists(filePath).pipe(Effect.orElseSucceed(thunkFalse));
  if (!exists) {
    return [`${repoRelative(filePath, repoRoot, path)} is missing`];
  }

  const current = yield* readText(filePath);
  return current === content ? [] : [`${repoRelative(filePath, repoRoot, path)} is stale`];
});

const packageCatalogPayload = (value: unknown): O.Option<unknown> =>
  P.isObject(value) && P.hasProperty(value, "package") ? O.some(value.package) : O.none();

const packageCatalogMatches = (left: unknown, right: PackageCatalogShard): boolean => {
  const leftPackage = packageCatalogPayload(left);
  return O.isSome(leftPackage) && JSON.stringify(leftPackage.value) === JSON.stringify(right.package);
};

const checkPackageShardFile = Effect.fn("RepoExportsCatalog.checkPackageShardFile")(function* (
  shardPath: string,
  shardContent: string,
  expectedShard: PackageCatalogShard,
  repoRoot: string,
  path: Path.Path
): Effect.fn.Return<ReadonlyArray<string>, QualityArtifactGeneratorError, FileSystem.FileSystem> {
  const findings = yield* checkFile(shardPath, shardContent, repoRoot, path);

  if (findings.length === 0) {
    return findings;
  }

  return yield* readJsonc(shardPath).pipe(
    Effect.map((currentShard) => (packageCatalogMatches(currentShard, expectedShard) ? A.empty<string>() : findings)),
    Effect.orElseSucceed(() => findings)
  );
});

const writePackageCatalogShard = Effect.fn("RepoExportsCatalog.writePackageShard")(function* (
  options: RepoExportsCatalogOptions = {}
): Effect.fn.Return<
  RepoExportsCatalogWriteResult,
  QualityArtifactGeneratorError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const { check, outputJsonPath, outputMarkdownPath, outputShardPath, packageName, repoRoot } =
    yield* resolveRepoExportsCatalogOptions(options);
  const packageInfo = yield* currentWorkspacePackage(repoRoot, path, packageName);
  const shard = yield* buildPackageCatalogShard(packageInfo, 0, repoRoot, path);
  const shardPath = outputShardPath ?? shardPathForPackage(repoRoot, packageInfo, path);
  const shardContent = yield* formatJsonc(shard);

  if (check) {
    const findings = yield* checkPackageShardFile(shardPath, shardContent, shard, repoRoot, path);

    return {
      outputJsonPath,
      outputMarkdownPath,
      outputShardPath: shardPath,
      totals: shard.package.counts,
      findings,
      checked: true,
      written: false,
    };
  }

  yield* fs.makeDirectory(path.dirname(shardPath), { recursive: true }).pipe(
    QualityArtifactGeneratorError.mapError(`Failed to create artifact directory for ${shardPath}.`, {
      filePath: shardPath,
    })
  );
  yield* fs
    .writeFileString(shardPath, shardContent)
    .pipe(QualityArtifactGeneratorError.mapError(`Failed to write ${shardPath}.`, { filePath: shardPath }));

  return {
    outputJsonPath,
    outputMarkdownPath,
    outputShardPath: shardPath,
    totals: shard.package.counts,
    findings: [],
    checked: false,
    written: true,
  };
});

/**
 * Write or freshness-check repo export catalog JSONC and Markdown artifacts.
 *
 * @category generators
 * @since 0.0.0
 */
export const writeOrCheckRepoExportsCatalog = Effect.fn("RepoExportsCatalog.writeOrCheck")(function* (
  options: RepoExportsCatalogOptions = {}
): Effect.fn.Return<
  RepoExportsCatalogWriteResult,
  QualityArtifactGeneratorError,
  FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner
> {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const { check, fromShards, outputJsonPath, outputMarkdownPath, packageShard, repoRoot } =
    yield* resolveRepoExportsCatalogOptions(options);

  if (packageShard) {
    return yield* writePackageCatalogShard(options);
  }

  const catalog = yield* fromShards ? buildRepoExportsCatalogFromShards(options) : buildRepoExportsCatalog(options);
  const jsonContent = yield* formatJsonc(catalogIndexFromCatalog(catalog));
  const markdownContent = renderMarkdown(catalog);

  if (check) {
    const findings = [
      ...(yield* checkFile(outputJsonPath, jsonContent, repoRoot, path)),
      ...(yield* checkFile(outputMarkdownPath, markdownContent, repoRoot, path)),
    ];

    return {
      outputJsonPath,
      outputMarkdownPath,
      totals: catalog.totals,
      findings,
      checked: true,
      written: false,
    };
  }

  yield* fs.makeDirectory(path.dirname(outputJsonPath), { recursive: true }).pipe(
    QualityArtifactGeneratorError.mapError(`Failed to create artifact directory for ${outputJsonPath}.`, {
      filePath: outputJsonPath,
    })
  );
  yield* fs
    .writeFileString(outputJsonPath, jsonContent)
    .pipe(QualityArtifactGeneratorError.mapError(`Failed to write ${outputJsonPath}.`, { filePath: outputJsonPath }));
  yield* fs.writeFileString(outputMarkdownPath, markdownContent).pipe(
    QualityArtifactGeneratorError.mapError(`Failed to write ${outputMarkdownPath}.`, {
      filePath: outputMarkdownPath,
    })
  );

  return {
    outputJsonPath,
    outputMarkdownPath,
    totals: catalog.totals,
    findings: [],
    checked: false,
    written: true,
  };
});
