/**
 * @file peer-deps-sync Package Synchronization Module
 *
 * Reclassifies package.json dependency sections for workspace libraries under
 * packages/** according to the live peer dependency policy.
 *
 * @module peer-deps-sync/package-sync
 * @since 0.1.0
 */

import {
  buildRepoDependencyIndex,
  enforceVersionSpecifiers,
  FsUtils,
  findRepoRoot,
  mapWorkspaceToPackageJsonPath,
  mergeSortedDeps,
  PackageJson,
  sortDependencies,
} from "@beep/tooling-utils";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Order from "effect/Order";
import * as Str from "effect/String";
import { PeerDepsSyncError } from "./errors.js";
import type { ReferencePolicy } from "./policy.js";
import type { SyncMode } from "./schemas.js";

const CODE_FILE_PATTERN = /\.(?:[cm]?[jt]sx?)$/;
const CODE_SCAN_IGNORE = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/.turbo/**",
  "**/coverage/**",
  "**/*.d.ts",
] as const;
const LOCAL_CODE_ROOTS = ["src", "test", "scripts"] as const;
const SOURCE_CODE_ROOTS = ["src"] as const;
const CLIENT_FRAMEWORK_PEERS = new Set(["next", "react", "react-dom", "scheduler", "solid-js", "vue"]);
const packageContextOrder: Order.Order<WorkspacePackageContext> = Order.mapInput(Order.string, (pkg) => pkg.name);
const dependencyEntryOrder: Order.Order<readonly [string, string]> = Order.mapInput(Order.string, ([name]) => name);

export interface PeerDependencyMetaEntry {
  readonly optional: true;
}

export interface ManagedPackageSections {
  readonly dependencies?: undefined | Record<string, string>;
  readonly devDependencies?: undefined | Record<string, string>;
  readonly peerDependencies?: undefined | Record<string, string>;
  readonly peerDependenciesMeta?: undefined | Record<string, PeerDependencyMetaEntry>;
}

export interface FieldDiff {
  readonly hasChanges: boolean;
  readonly reordered: boolean;
}

export interface ManagedPackageDiff {
  readonly hasChanges: boolean;
  readonly dependencies: FieldDiff;
  readonly devDependencies: FieldDiff;
  readonly peerDependencies: FieldDiff;
  readonly peerDependenciesMeta: FieldDiff;
}

export type PackageRole = "framework-adapter" | "integration" | "internal-runtime";

export interface ImportEvidence {
  readonly sourceImports: ReadonlySet<string>;
  readonly localImports: ReadonlySet<string>;
}

export interface WorkspacePackageContext {
  readonly name: string;
  readonly packageDir: string;
  readonly packageJsonPath: string;
  readonly relativePackageJsonPath: string;
  readonly manifest: PackageJson;
}

export interface DependencySortContext {
  readonly workspacePackages: HashSet.HashSet<string>;
  readonly adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>;
  readonly rootSpecifiers: ReadonlyMap<string, string>;
}

export interface PackageSyncResult {
  readonly hasChanges: boolean;
  readonly changedFields: readonly string[];
  readonly packageName: string;
  readonly packageJsonPath: string;
}

export interface PlannedPackageManifestSync extends PackageSyncResult {
  readonly expectedSections: ManagedPackageSections;
  readonly updatedManifest: Record<string, unknown>;
}

interface RawPackageJson {
  readonly [key: string]: unknown;
  readonly dependencies?: Record<string, string>;
  readonly devDependencies?: Record<string, string>;
  readonly peerDependencies?: Record<string, string>;
  readonly peerDependenciesMeta?: Record<string, { readonly optional?: boolean }>;
}

const MANAGED_KEYS = ["dependencies", "devDependencies", "peerDependencies", "peerDependenciesMeta"] as const;

const emptyRecordToUndefined = <T>(record: Record<string, T>): undefined | Record<string, T> =>
  Object.keys(record).length === 0 ? undefined : record;

const toNormalizedRelativePath = (pathValue: string): string => pathValue.replace(/\\/g, "/");

const normalizeImportSpecifier = (specifier: string): undefined | string => {
  if (
    Str.startsWith(".")(specifier) ||
    Str.startsWith("/")(specifier) ||
    Str.startsWith("node:")(specifier) ||
    Str.startsWith("bun:")(specifier)
  ) {
    return undefined;
  }

  if (Str.startsWith("@")(specifier)) {
    const parts = specifier.split("/");
    if (parts.length < 2 || !parts[0] || !parts[1]) {
      return undefined;
    }
    return `${parts[0]}/${parts[1]}`;
  }

  const [name] = specifier.split("/");
  return name;
};

const collectSpecifiersFromContent = (content: string): ReadonlySet<string> => {
  const imports = new Set<string>();
  const patterns = [
    /(?:import|export)\s+(?:[^"'`]*?\s+from\s+)?["']([^"']+)["']/g,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g,
    /require\s*\(\s*["']([^"']+)["']\s*\)/g,
  ] as const;

  for (const pattern of patterns) {
    let match = pattern.exec(content);
    while (match) {
      const normalized = match[1] ? normalizeImportSpecifier(match[1]) : undefined;
      if (normalized) {
        imports.add(normalized);
      }
      match = pattern.exec(content);
    }
  }

  return imports;
};

const collectCodeFiles = (packageDir: string, roots: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    const utils = yield* FsUtils;
    const matched = yield* utils
      .glob(
        A.map(roots, (root) => `${root}/**/*`),
        {
          cwd: packageDir,
          absolute: true,
          nodir: true,
          ignore: [...CODE_SCAN_IGNORE],
        }
      )
      .pipe(Effect.mapError((cause) => new PeerDepsSyncError({ filePath: packageDir, operation: "glob-code", cause })));

    return F.pipe(
      matched,
      A.filter((filePath) => CODE_FILE_PATTERN.test(filePath)),
      A.dedupe
    );
  });

const collectImportedPackages = (packageDir: string, roots: ReadonlyArray<string>) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const files = yield* collectCodeFiles(packageDir, roots);
    const imports = new Set<string>();

    for (const filePath of files) {
      const content = yield* fs
        .readFileString(filePath)
        .pipe(Effect.mapError((cause) => new PeerDepsSyncError({ filePath, operation: "read-code", cause })));

      for (const specifier of collectSpecifiersFromContent(content)) {
        imports.add(specifier);
      }
    }

    return imports;
  });

export const collectImportEvidence = (packageDir: string) =>
  Effect.gen(function* () {
    const sourceImports = yield* collectImportedPackages(packageDir, SOURCE_CODE_ROOTS);
    const localImports = yield* collectImportedPackages(packageDir, LOCAL_CODE_ROOTS);

    return {
      sourceImports,
      localImports,
    } satisfies ImportEvidence;
  });

export const classifyPackageRole = (relativePackageJsonPath: string, importEvidence: ImportEvidence): PackageRole => {
  const normalizedPath = toNormalizedRelativePath(relativePackageJsonPath);
  const pathParts = normalizedPath.split("/");
  const packageLeaf = pathParts[pathParts.length - 2] ?? "";
  const hasFrameworkImports = A.some(Array.from(importEvidence.sourceImports), (name) =>
    CLIENT_FRAMEWORK_PEERS.has(name)
  );

  if (
    Str.startsWith("packages/ui/")(normalizedPath) ||
    packageLeaf === "client" ||
    packageLeaf === "ui" ||
    hasFrameworkImports
  ) {
    return "framework-adapter";
  }

  if (Str.startsWith("packages/integrations/")(normalizedPath) || packageLeaf === "ai") {
    return "integration";
  }

  return "internal-runtime";
};

const readRawPackageJson = (
  filePath: string
): Effect.Effect<RawPackageJson, PeerDepsSyncError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const content = yield* fs
      .readFileString(filePath)
      .pipe(Effect.mapError((cause) => new PeerDepsSyncError({ filePath, operation: "read-package-json", cause })));

    return yield* Effect.try({
      try: () => JSON.parse(content) as RawPackageJson,
      catch: (cause) => new PeerDepsSyncError({ filePath, operation: "parse-package-json", cause }),
    });
  });

const readDecodedPackageJson = (filePath: string) =>
  Effect.gen(function* () {
    const utils = yield* FsUtils;
    const rawJson = yield* utils
      .readJson(filePath)
      .pipe(Effect.mapError((cause) => new PeerDepsSyncError({ filePath, operation: "read-package-json", cause })));

    return yield* PackageJson.decodeUnknown(rawJson).pipe(
      Effect.mapError((cause) => new PeerDepsSyncError({ filePath, operation: "decode-package-json", cause }))
    );
  });

export const discoverWorkspaceLibraryPackages = (
  repoRoot: string,
  options?: { readonly filter?: string; readonly packageNames?: ReadonlySet<string> }
) =>
  Effect.gen(function* () {
    const path_ = yield* Path.Path;
    const workspaceMap = yield* mapWorkspaceToPackageJsonPath;
    const contexts: Array<WorkspacePackageContext> = [];
    const packagesRoot = path_.join(repoRoot, "packages");

    for (const [name, packageJsonPath] of HashMap.entries(workspaceMap)) {
      const normalizedPackageJsonPath = toNormalizedRelativePath(packageJsonPath);
      if (!Str.startsWith(toNormalizedRelativePath(packagesRoot))(normalizedPackageJsonPath)) {
        continue;
      }
      const manifest = yield* readDecodedPackageJson(packageJsonPath);
      const relativePackageJsonPath = toNormalizedRelativePath(path_.relative(repoRoot, packageJsonPath));

      contexts.push({
        name,
        packageDir: path_.dirname(packageJsonPath),
        packageJsonPath,
        relativePackageJsonPath,
        manifest,
      });
    }

    return F.pipe(A.sort(contexts, packageContextOrder), (packages) => filterWorkspacePackages(packages, options));
  });

export const buildDependencySortContext = Effect.gen(function* () {
  const repoRoot = yield* findRepoRoot;
  const path_ = yield* Path.Path;
  const depIndex = yield* buildRepoDependencyIndex;
  const rootManifest = yield* readRawPackageJson(path_.join(repoRoot, "package.json"));
  let adjacencyList = HashMap.empty<string, HashSet.HashSet<string>>();
  let workspacePackages = HashSet.empty<string>();
  const rootSpecifiers = new Map<string, string>();

  for (const section of [rootManifest.dependencies, rootManifest.devDependencies, rootManifest.peerDependencies]) {
    for (const [name, specifier] of Object.entries(section ?? {})) {
      rootSpecifiers.set(name, specifier);
    }
  }

  for (const name of Object.keys((rootManifest as { readonly catalog?: Record<string, string> }).catalog ?? {})) {
    rootSpecifiers.set(name, "catalog:");
  }

  for (const [pkg, deps] of HashMap.entries(depIndex)) {
    if (pkg === "@beep/root") {
      continue;
    }

    workspacePackages = HashSet.add(workspacePackages, pkg);
    const workspaceDeps = F.pipe(
      deps.dependencies.workspace,
      HashSet.union(deps.devDependencies.workspace),
      HashSet.union(deps.peerDependencies.workspace)
    );
    adjacencyList = HashMap.set(adjacencyList, pkg, workspaceDeps as HashSet.HashSet<string>);
  }

  return {
    workspacePackages,
    adjacencyList,
    rootSpecifiers,
  } satisfies DependencySortContext;
});

const normalizeSpecifier = (dependencyName: string, specifier: string, sortContext: DependencySortContext): string => {
  if (HashSet.has(sortContext.workspacePackages, dependencyName)) {
    return "workspace:^";
  }

  return specifier;
};

const getExistingSpecifier = (manifest: PackageJson, dependencyName: string): undefined | string =>
  manifest.dependencies?.[dependencyName] ??
  manifest.peerDependencies?.[dependencyName] ??
  manifest.devDependencies?.[dependencyName];

const getPreferredSpecifier = (
  manifest: PackageJson,
  dependencyName: string,
  sortContext: DependencySortContext
): undefined | string =>
  getExistingSpecifier(manifest, dependencyName) ?? sortContext.rootSpecifiers.get(dependencyName);

export const filterWorkspacePackages = (
  workspacePackages: ReadonlyArray<WorkspacePackageContext>,
  options?: { readonly filter?: string; readonly packageNames?: ReadonlySet<string> }
): ReadonlyArray<WorkspacePackageContext> =>
  F.pipe(
    workspacePackages,
    A.filter((pkg) => (options?.filter ? pkg.name === options.filter : true)),
    A.filter((pkg) => (options?.packageNames ? options.packageNames.has(pkg.name) : true))
  );

const classifyPeerKind = (
  dependencyName: string,
  role: PackageRole,
  referencePolicy: ReferencePolicy
): "none" | "optional" | "required" => {
  if (dependencyName === "effect") {
    return "required";
  }

  if (Str.startsWith("@beep/")(dependencyName)) {
    return "none";
  }

  if (referencePolicy.optionalPeerNames.has(dependencyName)) {
    return "optional";
  }

  if (CLIENT_FRAMEWORK_PEERS.has(dependencyName) && role === "framework-adapter") {
    return "required";
  }

  if (role === "integration" && referencePolicy.peerOnlyNames.has(dependencyName)) {
    return "required";
  }

  return "none";
};

const dependencyWasDeclaredOnlyInDev = (manifest: PackageJson, dependencyName: string): boolean =>
  manifest.devDependencies?.[dependencyName] !== undefined &&
  manifest.dependencies?.[dependencyName] === undefined &&
  manifest.peerDependencies?.[dependencyName] === undefined;

const buildDependencyCandidates = (
  manifest: PackageJson,
  role: PackageRole,
  importEvidence: ImportEvidence,
  referencePolicy: ReferencePolicy
): ReadonlyArray<string> => {
  const inferredPeerCandidates = A.filter(
    Array.from(importEvidence.sourceImports),
    (dependencyName) => classifyPeerKind(dependencyName, role, referencePolicy) !== "none"
  );

  return F.pipe(
    [
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.devDependencies ?? {}),
      ...Object.keys(manifest.peerDependencies ?? {}),
      ...inferredPeerCandidates,
    ],
    A.dedupe,
    A.sort(Str.Order)
  );
};

const sortDependencyRecord = (
  deps: undefined | Record<string, string>,
  sortContext: DependencySortContext
): Effect.Effect<undefined | Record<string, string>, never> =>
  Effect.gen(function* () {
    if (!deps || Object.keys(deps).length === 0) {
      return undefined;
    }

    const enforced = enforceVersionSpecifiers(deps, sortContext.workspacePackages);
    const sorted = yield* sortDependencies(enforced, sortContext.adjacencyList).pipe(
      Effect.catchAll(() =>
        Effect.succeed({
          workspace: A.sort(
            Object.entries(enforced).filter(([name]) => HashSet.has(sortContext.workspacePackages, name)) as Array<
              readonly [string, string]
            >,
            dependencyEntryOrder
          ),
          external: A.sort(
            Object.entries(enforced).filter(([name]) => !HashSet.has(sortContext.workspacePackages, name)) as Array<
              readonly [string, string]
            >,
            dependencyEntryOrder
          ),
        })
      )
    );

    return emptyRecordToUndefined(mergeSortedDeps(sorted));
  });

const sortPeerMeta = (
  peerDependenciesMeta: undefined | Record<string, PeerDependencyMetaEntry>,
  peerDependencies: undefined | Record<string, string>
): undefined | Record<string, PeerDependencyMetaEntry> => {
  if (!peerDependenciesMeta || !peerDependencies) {
    return undefined;
  }

  const sorted: Record<string, PeerDependencyMetaEntry> = {};
  for (const name of Object.keys(peerDependencies)) {
    const meta = peerDependenciesMeta[name];
    if (meta) {
      sorted[name] = meta;
    }
  }
  return emptyRecordToUndefined(sorted);
};

export const computeManagedSections = (
  manifest: Pick<PackageJson, "dependencies" | "devDependencies" | "peerDependencies" | "peerDependenciesMeta">,
  role: PackageRole,
  importEvidence: ImportEvidence,
  referencePolicy: ReferencePolicy,
  sortContext: DependencySortContext
): ManagedPackageSections => {
  const nextDependencies: Record<string, string> = {};
  const nextDevDependencies: Record<string, string> = {};
  const nextPeerDependencies: Record<string, string> = {};
  const nextPeerDependenciesMeta: Record<string, PeerDependencyMetaEntry> = {};

  for (const dependencyName of buildDependencyCandidates(
    manifest as PackageJson,
    role,
    importEvidence,
    referencePolicy
  )) {
    const specifier = getPreferredSpecifier(manifest as PackageJson, dependencyName, sortContext);
    if (!specifier) {
      continue;
    }

    const normalizedSpecifier = normalizeSpecifier(dependencyName, specifier, sortContext);
    const sourceUsed = importEvidence.sourceImports.has(dependencyName);
    const localUsed = importEvidence.localImports.has(dependencyName);
    const peerKind = classifyPeerKind(dependencyName, role, referencePolicy);

    if (peerKind === "required" || peerKind === "optional") {
      nextPeerDependencies[dependencyName] = normalizedSpecifier;

      if (peerKind === "optional") {
        nextPeerDependenciesMeta[dependencyName] = { optional: true };
      }

      if (localUsed) {
        nextDevDependencies[dependencyName] = normalizedSpecifier;
      }

      continue;
    }

    if (sourceUsed || manifest.dependencies?.[dependencyName] !== undefined) {
      nextDependencies[dependencyName] = normalizedSpecifier;
      continue;
    }

    if (dependencyWasDeclaredOnlyInDev(manifest as PackageJson, dependencyName) || localUsed) {
      nextDevDependencies[dependencyName] = normalizedSpecifier;
      continue;
    }

    nextDependencies[dependencyName] = normalizedSpecifier;
  }

  return {
    dependencies: emptyRecordToUndefined(nextDependencies),
    devDependencies: emptyRecordToUndefined(nextDevDependencies),
    peerDependencies: emptyRecordToUndefined(nextPeerDependencies),
    peerDependenciesMeta: emptyRecordToUndefined(nextPeerDependenciesMeta),
  };
};

export const normalizeManagedSections = (
  sections: ManagedPackageSections,
  sortContext: DependencySortContext
): Effect.Effect<ManagedPackageSections, never> =>
  Effect.gen(function* () {
    const dependencies = yield* sortDependencyRecord(sections.dependencies, sortContext);
    const devDependencies = yield* sortDependencyRecord(sections.devDependencies, sortContext);
    const peerDependencies = yield* sortDependencyRecord(sections.peerDependencies, sortContext);
    const peerDependenciesMeta = sortPeerMeta(sections.peerDependenciesMeta, peerDependencies);

    return {
      dependencies,
      devDependencies,
      peerDependencies,
      peerDependenciesMeta,
    } satisfies ManagedPackageSections;
  });

const computeStringFieldDiff = (
  current: undefined | Record<string, string>,
  expected: undefined | Record<string, string>
): FieldDiff => {
  const currentValue = current ?? {};
  const expectedValue = expected ?? {};
  const currentKeys = Object.keys(currentValue);
  const expectedKeys = Object.keys(expectedValue);
  const reordered =
    currentKeys.length !== expectedKeys.length || currentKeys.some((key, index) => key !== expectedKeys[index]);
  const valuesChanged = expectedKeys.some((key) => currentValue[key] !== expectedValue[key]);
  return {
    hasChanges: reordered || valuesChanged,
    reordered,
  };
};

const computeMetaFieldDiff = (
  current: undefined | Record<string, { readonly optional?: boolean }>,
  expected: undefined | Record<string, PeerDependencyMetaEntry>
): FieldDiff => {
  const currentValue = current ?? {};
  const expectedValue = expected ?? {};
  const currentKeys = Object.keys(currentValue);
  const expectedKeys = Object.keys(expectedValue);
  const reordered =
    currentKeys.length !== expectedKeys.length || currentKeys.some((key, index) => key !== expectedKeys[index]);
  const valuesChanged = expectedKeys.some(
    (key) => JSON.stringify(currentValue[key] ?? null) !== JSON.stringify(expectedValue[key] ?? null)
  );

  return {
    hasChanges: reordered || valuesChanged,
    reordered,
  };
};

export const computeManagedPackageDiff = (
  current: Pick<RawPackageJson, "dependencies" | "devDependencies" | "peerDependencies" | "peerDependenciesMeta">,
  expected: ManagedPackageSections
): ManagedPackageDiff => {
  const dependencies = computeStringFieldDiff(current.dependencies, expected.dependencies);
  const devDependencies = computeStringFieldDiff(current.devDependencies, expected.devDependencies);
  const peerDependencies = computeStringFieldDiff(current.peerDependencies, expected.peerDependencies);
  const peerDependenciesMeta = computeMetaFieldDiff(current.peerDependenciesMeta, expected.peerDependenciesMeta);

  return {
    hasChanges:
      dependencies.hasChanges ||
      devDependencies.hasChanges ||
      peerDependencies.hasChanges ||
      peerDependenciesMeta.hasChanges,
    dependencies,
    devDependencies,
    peerDependencies,
    peerDependenciesMeta,
  };
};

export const buildUpdatedManifest = (
  current: RawPackageJson,
  expected: ManagedPackageSections
): Record<string, unknown> => {
  const updated: Record<string, unknown> = {};
  const writtenManagedKeys = new Set<string>();

  for (const key of Object.keys(current)) {
    if (MANAGED_KEYS.includes(key as (typeof MANAGED_KEYS)[number])) {
      writtenManagedKeys.add(key);
      const managedValue = expected[key as keyof ManagedPackageSections];
      if (managedValue !== undefined) {
        updated[key] = managedValue;
      }
      continue;
    }

    updated[key] = current[key];
  }

  for (const key of MANAGED_KEYS) {
    if (writtenManagedKeys.has(key)) {
      continue;
    }

    const managedValue = expected[key];
    if (managedValue !== undefined) {
      updated[key] = managedValue;
    }
  }

  return updated;
};

const collectChangedFields = (diff: ManagedPackageDiff): ReadonlyArray<string> => {
  const changedFields: Array<string> = [];
  if (diff.dependencies.hasChanges) changedFields.push("dependencies");
  if (diff.devDependencies.hasChanges) changedFields.push("devDependencies");
  if (diff.peerDependencies.hasChanges) changedFields.push("peerDependencies");
  if (diff.peerDependenciesMeta.hasChanges) changedFields.push("peerDependenciesMeta");
  return changedFields;
};

export const planPackageManifestSync = (
  packageContext: WorkspacePackageContext,
  referencePolicy: ReferencePolicy,
  sortContext: DependencySortContext
) =>
  Effect.gen(function* () {
    const rawManifest = yield* readRawPackageJson(packageContext.packageJsonPath);
    const importEvidence = yield* collectImportEvidence(packageContext.packageDir);
    const role = classifyPackageRole(packageContext.relativePackageJsonPath, importEvidence);
    const expectedSections = yield* F.pipe(
      computeManagedSections(packageContext.manifest, role, importEvidence, referencePolicy, sortContext),
      (sections) => normalizeManagedSections(sections, sortContext)
    );

    const diff = computeManagedPackageDiff(rawManifest, expectedSections);
    const changedFields = collectChangedFields(diff);

    return {
      hasChanges: diff.hasChanges,
      changedFields,
      packageName: packageContext.name,
      packageJsonPath: packageContext.packageJsonPath,
      expectedSections,
      updatedManifest: buildUpdatedManifest(rawManifest, expectedSections),
    } satisfies PlannedPackageManifestSync;
  });

export const writePlannedPackageManifest = (plan: PlannedPackageManifestSync) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const nextContent = `${JSON.stringify(plan.updatedManifest, null, 2)}\n`;

    yield* fs.writeFileString(plan.packageJsonPath, nextContent).pipe(
      Effect.mapError(
        (cause) =>
          new PeerDepsSyncError({
            filePath: plan.packageJsonPath,
            operation: "write-package-json",
            cause,
          })
      )
    );
  });

export const syncPackageManifest = (
  packageContext: WorkspacePackageContext,
  referencePolicy: ReferencePolicy,
  sortContext: DependencySortContext,
  mode: SyncMode
) =>
  Effect.gen(function* () {
    const plan = yield* planPackageManifestSync(packageContext, referencePolicy, sortContext);

    if (!plan.hasChanges) {
      return {
        hasChanges: false,
        changedFields: plan.changedFields,
        packageName: packageContext.name,
        packageJsonPath: packageContext.packageJsonPath,
      } satisfies PackageSyncResult;
    }

    if (mode === "check" || mode === "dry-run") {
      return {
        hasChanges: true,
        changedFields: plan.changedFields,
        packageName: packageContext.name,
        packageJsonPath: packageContext.packageJsonPath,
      } satisfies PackageSyncResult;
    }

    yield* writePlannedPackageManifest(plan);

    return {
      hasChanges: true,
      changedFields: plan.changedFields,
      packageName: packageContext.name,
      packageJsonPath: packageContext.packageJsonPath,
    } satisfies PackageSyncResult;
  });
