/**
 * Type-safe package.json schemas using Effect v4 Schema.
 *
 * The exported `NpmPackageJson` schema models the npm/package.json surface we
 * intentionally support from SchemaStore and npm docs. `PackageJson` extends it
 * with repo-local top-level fields used in this monorepo.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoUtilsId } from "@beep/identity/packages";
import type { Exit } from "effect";
import { Effect } from "effect";
import * as S from "effect/Schema";
import type { DomainError } from "../errors/index.js";
import { jsonStringifyPretty } from "../JsonUtils.js";

const $I = $RepoUtilsId.create("schemas/PackageJson");

const strictDecodeOptions = { onExcessProperty: "error" as const };

const npmPackageNamePattern = /^(?:(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?\/[a-z0-9-._~])|[a-z0-9-~])[a-z0-9-._~]*$/;
const repoPackageNamePattern =
  /^(?:(?:@(?:[A-Za-z0-9-*~][A-Za-z0-9-*._~]*)?\/[A-Za-z0-9-._~])|[A-Za-z0-9-~])[A-Za-z0-9-._~]*$/;
const packageManagerPattern = /^(npm|pnpm|yarn|bun)@\d+\.\d+\.\d+(-.+)?$/;
const packageTypePattern = /^(module|commonjs)$/;
const relativeDotPathPattern = /^\.\//;
const exportTopLevelPattern = /^(?:\.|\.\/.+)$/;
const importSpecifierPattern = /^#.+$/;
const exportConditionPattern = /^(?:[^.0-9]+|types@.+)$/;

const NpmPackageName = S.String.check(S.isMinLength(1))
  .check(S.isMaxLength(214))
  .check(S.isPattern(npmPackageNamePattern))
  .annotate(
    $I.annote("NpmPackageName", {
      title: "Npm Package Name",
      description: "An npm package name that satisfies the package.json SchemaStore constraints.",
    })
  );

const RepoPackageName = S.String.check(S.isMinLength(1))
  .check(S.isMaxLength(214))
  .check(S.isPattern(repoPackageNamePattern))
  .annotate(
    $I.annote("RepoPackageName", {
      title: "Repo Package Name",
      description:
        "A repo-local package name, including the legacy mixed-case workspace names currently present in this monorepo.",
    })
  );

const PackageManager = S.String.check(S.isPattern(packageManagerPattern)).annotate(
  $I.annote("PackageManager", {
    title: "Package Manager",
    description: "A Corepack-style package manager pin such as bun@1.3.10 or pnpm@9.0.0.",
  })
);

const RelativeDotPath = S.String.check(S.isPattern(relativeDotPathPattern)).annotate(
  $I.annote("RelativeDotPath", {
    title: "Relative Dot Path",
    description: "A relative path that starts with ./, used by exports and publishConfig.",
  })
);

const ExportTopLevelKey = S.String.check(S.isPattern(exportTopLevelPattern)).annotate(
  $I.annote("ExportTopLevelKey", {
    title: "Export Top Level Key",
    description: "A top-level package exports key such as . or ./subpath.",
  })
);

const ImportSpecifierKey = S.String.check(S.isPattern(importSpecifierPattern)).annotate(
  $I.annote("ImportSpecifierKey", {
    title: "Import Specifier Key",
    description: "A package imports specifier key such as #internal or #config/*.",
  })
);

const ExportConditionKey = S.String.check(S.isPattern(exportConditionPattern)).annotate(
  $I.annote("ExportConditionKey", {
    title: "Export Condition Key",
    description: "A conditional exports/imports key such as import, require, default, node, or types@>=5.",
  })
);

const StringArray = S.Array(S.String).annotate(
  $I.annote("StringArray", {
    title: "String Array",
    description: "An array of strings used for package metadata fields such as files, man, os, and cpu.",
  })
);

const NonEmptyStringValue = S.String.check(S.isMinLength(1)).annotate(
  $I.annote("NonEmptyStringValue", {
    title: "Non Empty String Value",
    description: "A non-empty string value used for package metadata fields that should not be blank.",
  })
);

const StringRecord = S.Record(S.String, S.String).annotate(
  $I.annote("StringRecord", {
    title: "String Record",
    description: "A record mapping string keys to string values, used for dependency maps, scripts, and engines.",
  })
);

const NpmDependencyRecord = S.Record(NpmPackageName, NonEmptyStringValue).annotate(
  $I.annote("NpmDependencyRecord", {
    title: "Npm Dependency Record",
    description: "A record of npm package names to non-empty version or protocol specifiers.",
  })
);

const RepoDependencyRecord = S.Record(RepoPackageName, NonEmptyStringValue).annotate(
  $I.annote("RepoDependencyRecord", {
    title: "Repo Dependency Record",
    description:
      "A record of repo-local package names to non-empty version or protocol specifiers, including legacy mixed-case workspace packages.",
  })
);

const NonEmptyStringRecord = S.Record(NonEmptyStringValue, NonEmptyStringValue).annotate(
  $I.annote("NonEmptyStringRecord", {
    title: "Non Empty String Record",
    description: "A record whose keys and values are non-empty strings.",
  })
);

const PackageTypeField = S.String.check(S.isPattern(packageTypePattern)).annotate(
  $I.annote("PackageTypeField", {
    title: "Package Type Field",
    description: "The package type field constrained to the supported Node.js package types.",
  })
);

type Json = string | number | boolean | null | ReadonlyArray<Json> | { readonly [key: string]: Json };

const Json: S.Codec<Json, Json> = S.suspend(() =>
  S.Union([S.String, S.Number, S.Boolean, S.Null, S.Array(Json), S.Record(S.String, Json)])
).annotate(
  $I.annote("Json", {
    title: "JSON Value",
    description: "A recursive JSON value used for schema-backed escape hatches like config and publishConfig extras.",
  })
);

const BrowserReplacement = S.Union([S.String, S.Literal(false)]).annotate(
  $I.annote("BrowserReplacement", {
    title: "Browser Replacement",
    description: "A browser field replacement target, either a module path string or false to disable the module.",
  })
);

class PersonObject extends S.Class<PersonObject>($I`PersonObject`)(
  {
    name: S.String,
    email: S.optionalKey(S.String),
    url: S.optionalKey(S.String),
  },
  $I.annote("PersonObject", {
    title: "Person Object",
    description: "Structured package person metadata with a required name and optional contact fields.",
  })
) {}

class RepositoryObject extends S.Class<RepositoryObject>($I`RepositoryObject`)(
  {
    type: S.String,
    url: S.String,
    directory: S.optionalKey(S.String),
  },
  $I.annote("RepositoryObject", {
    title: "Repository Object",
    description: "Structured repository metadata with required type and url fields and an optional directory.",
  })
) {}

class BugsObject extends S.Class<BugsObject>($I`BugsObject`)(
  {
    url: S.optionalKey(S.String),
    email: S.optionalKey(S.String),
  },
  $I.annote("BugsObject", {
    title: "Bugs Object",
    description: "Structured bug tracker metadata with optional URL and contact email fields.",
  })
) {}

class FundingEntry extends S.Class<FundingEntry>($I`FundingEntry`)(
  {
    url: S.String,
    type: S.optionalKey(S.String),
  },
  $I.annote("FundingEntry", {
    title: "Funding Entry",
    description: "Structured funding metadata with a required URL and an optional funding type label.",
  })
) {}

/**
 * A person involved with the package, represented as a string or structured object.
 *
 * @example
 * ```ts
 * import { Person } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = Person
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const Person = S.Union([S.String, PersonObject]).annotate(
  $I.annote("Person", {
    title: "Person",
    description:
      "A package author, contributor, or maintainer, either as a string or a structured object with a required name.",
  })
);

/**
 * The package author field.
 *
 * @example
 * ```ts
 * import { Author } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = Author
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const Author = Person.annotate(
  $I.annote("Author", {
    title: "Author",
    description: "Package author, either as a string or a structured object with a required name.",
  })
);

/**
 * The package contributors field.
 *
 * @example
 * ```ts
 * import { Contributors } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = Contributors
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const Contributors = S.Array(Person).annotate(
  $I.annote("Contributors", {
    title: "Contributors",
    description: "A list of people who contributed to the package.",
  })
);

/**
 * The package maintainers field.
 *
 * @example
 * ```ts
 * import { Maintainers } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = Maintainers
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const Maintainers = S.Array(Person).annotate(
  $I.annote("Maintainers", {
    title: "Maintainers",
    description: "A list of people who maintain the package.",
  })
);

/**
 * Schema for the `repository` field.
 *
 * @example
 * ```ts
 * import { Repository } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = Repository
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const Repository = S.Union([S.String, RepositoryObject]).annotate(
  $I.annote("Repository", {
    title: "Repository",
    description:
      "A package repository reference represented as a shorthand string or a structured object with required type and url.",
  })
);

/**
 * Schema for the `bugs` field.
 *
 * @example
 * ```ts
 * import { Bugs } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = Bugs
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const Bugs = S.Union([S.String, BugsObject]).annotate(
  $I.annote("Bugs", {
    title: "Bugs",
    description:
      "A package bug tracker reference represented as a URL string or a structured object with optional url and email.",
  })
);

/**
 * Schema for the `funding` field.
 *
 * @example
 * ```ts
 * import { Funding } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = Funding
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const Funding = S.Union([S.String, FundingEntry, S.NonEmptyArray(S.Union([S.String, FundingEntry]))]).annotate(
  $I.annote("Funding", {
    title: "Funding",
    description:
      "Package funding metadata represented as a URL string, a structured funding object, or a non-empty array of those.",
  })
);

/**
 * Schema for the `bin` field.
 *
 * @example
 * ```ts
 * import { Bin } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = Bin
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const Bin = S.Union([S.String, StringRecord]).annotate(
  $I.annote("Bin", {
    title: "Bin",
    description: "Executable binaries, either as a single file path string or a record mapping command names to paths.",
  })
);

/**
 * Schema for the `browser` field.
 *
 * @example
 * ```ts
 * import { Browser } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = Browser
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const Browser = S.Union([S.String, S.Record(S.String, BrowserReplacement)]).annotate(
  $I.annote("Browser", {
    title: "Browser",
    description:
      "Browser-specific entry points represented as a replacement path string or a record of module replacements.",
  })
);

/**
 * Schema for the `directories` field.
 *
 * @category validation
 * @since 0.0.0
 */
class DirectoriesShape extends S.Class<DirectoriesShape>($I`Directories`)(
  {
    bin: S.optionalKey(S.String),
    doc: S.optionalKey(S.String),
    example: S.optionalKey(S.String),
    lib: S.optionalKey(S.String),
    man: S.optionalKey(S.String),
    test: S.optionalKey(S.String),
  },
  $I.annote("Directories", {
    title: "Directories",
    description: "Directory metadata describing where package resources such as binaries, docs, and tests live.",
  })
) {}

/**
 * Schema for the `directories` field.
 *
 * @example
 * ```ts
 * import { Directories } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = Directories
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const Directories = DirectoriesShape;

const peerDependencyMetaEntryFields = {
  optional: S.optionalKey(S.Boolean),
} as const;

const PeerDependencyMetaEntry = S.Struct(peerDependencyMetaEntryFields).annotate(
  $I.annote("PeerDependencyMetaEntry", {
    title: "Peer Dependency Meta Entry",
    description: "Structured metadata for a peer dependency, including whether it is optional.",
  })
);

/**
 * Schema for the `man` field.
 *
 * @example
 * ```ts
 * import { Man } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = Man
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const Man = S.Union([S.String, StringArray]).annotate(
  $I.annote("Man", {
    title: "Man",
    description: "A man page reference represented as a single file path or an array of file paths.",
  })
);

/**
 * Schema for the `sideEffects` field.
 *
 * @example
 * ```ts
 * import { SideEffects } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = SideEffects
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const SideEffects = S.Union([S.Boolean, StringArray]).annotate(
  $I.annote("SideEffects", {
    title: "Side Effects",
    description: "Whether the package has side effects, represented as a boolean or an array of glob patterns.",
  })
);

/**
 * Schema for the `bundleDependencies` / `bundledDependencies` fields.
 *
 * @example
 * ```ts
 * import { BundleDependencies } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = BundleDependencies
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const BundleDependencies = S.Union([S.Boolean, StringArray]).annotate(
  $I.annote("BundleDependencies", {
    title: "Bundle Dependencies",
    description: "Bundled dependency metadata represented as a boolean or an array of package names.",
  })
);

/**
 * Schema for the `peerDependenciesMeta` field.
 *
 * @example
 * ```ts
 * import { PeerDependenciesMeta } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = PeerDependenciesMeta
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const PeerDependenciesMeta = S.Record(
  S.String,
  S.StructWithRest(PeerDependencyMetaEntry, [S.Record(S.String, Json)])
).annotate(
  $I.annote("PeerDependenciesMeta", {
    title: "Peer Dependencies Meta",
    description: "Metadata describing peer dependency usage, including whether a peer dependency is optional.",
  })
);

/**
 * Schema for the `typesVersions` field.
 *
 * @example
 * ```ts
 * import { TypesVersions } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = TypesVersions
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const TypesVersions = S.Record(S.String, S.Record(S.String, StringArray)).annotate(
  $I.annote("TypesVersions", {
    title: "Types Versions",
    description: "TypeScript version-specific path mappings for declarations.",
  })
);

/**
 * Schema for a development environment requirement entry.
 *
 * @category validation
 * @since 0.0.0
 */
class DevEngineDependencyShape extends S.Class<DevEngineDependencyShape>($I`DevEngineDependency`)(
  {
    name: S.String,
    version: S.optionalKey(S.String),
    onFail: S.optionalKey(S.Literals(["ignore", "warn", "error", "download"] as const)),
  },
  $I.annote("DevEngineDependency", {
    title: "Dev Engine Dependency",
    description:
      "A development environment requirement such as a runtime, package manager, CPU, OS, or libc constraint.",
  })
) {}

/**
 * Schema for a development environment requirement entry.
 *
 * @example
 * ```ts
 * import { DevEngineDependency } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = DevEngineDependency
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const DevEngineDependency = DevEngineDependencyShape;

const DevEngineRequirement = S.Union([DevEngineDependency, S.Array(DevEngineDependency)]).annotate(
  $I.annote("DevEngineRequirement", {
    title: "Dev Engine Requirement",
    description:
      "A development environment requirement represented as a single dependency entry or an array of dependency entries.",
  })
);

/**
 * Schema for the `devEngines` field.
 *
 * @category validation
 * @since 0.0.0
 */
class DevEnginesShape extends S.Class<DevEnginesShape>($I`DevEngines`)(
  {
    os: S.optionalKey(DevEngineRequirement),
    cpu: S.optionalKey(DevEngineRequirement),
    libc: S.optionalKey(DevEngineRequirement),
    runtime: S.optionalKey(DevEngineRequirement),
    packageManager: S.optionalKey(DevEngineRequirement),
  },
  $I.annote("DevEngines", {
    title: "Dev Engines",
    description: "Development environment constraints for OS, CPU, libc, runtime, and package manager.",
  })
) {}

/**
 * Schema for the `devEngines` field.
 *
 * @example
 * ```ts
 * import { DevEngines } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = DevEngines
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const DevEngines = DevEnginesShape;

type PackageExportsEntry = string | null | { readonly [key: string]: PackageExportsEntryOrFallback };

type PackageExportsEntryOrFallback = PackageExportsEntry | ReadonlyArray<PackageExportsEntry>;

const PackageExportsEntryPath = S.Union([RelativeDotPath, S.Null]).annotate(
  $I.annote("PackageExportsEntryPath", {
    title: "Package Exports Entry Path",
    description: "An exports target path starting with ./, or null to explicitly block the target.",
  })
);

const PackageExportsEntryObject: S.Codec<
  { readonly [key: string]: PackageExportsEntryOrFallback },
  { readonly [key: string]: PackageExportsEntryOrFallback }
> = S.suspend(() => S.Record(ExportConditionKey, PackageExportsEntryOrFallback)).annotate(
  $I.annote("PackageExportsEntryObject", {
    title: "Package Exports Entry Object",
    description:
      "A conditional exports object keyed by conditions such as import, require, default, or types@ selectors.",
  })
);

const PackageExportsEntry: S.Codec<PackageExportsEntry, PackageExportsEntry> = S.suspend(() =>
  S.Union([PackageExportsEntryPath, PackageExportsEntryObject])
).annotate(
  $I.annote("PackageExportsEntry", {
    title: "Package Exports Entry",
    description: "A single exports entry represented as a relative path, null, or a conditional exports object.",
  })
);

const PackageExportsFallback = S.NonEmptyArray(PackageExportsEntry).annotate(
  $I.annote("PackageExportsFallback", {
    title: "Package Exports Fallback",
    description: "A non-empty fallback array of exports entries evaluated in order.",
  })
);

const PackageExportsEntryOrFallback: S.Codec<PackageExportsEntryOrFallback, PackageExportsEntryOrFallback> = S.suspend(
  () => S.Union([PackageExportsEntry, PackageExportsFallback])
).annotate(
  $I.annote("PackageExportsEntryOrFallback", {
    title: "Package Exports Entry Or Fallback",
    description: "An exports target represented as a single entry or a non-empty fallback array of entries.",
  })
);

const PackageExportsSubpathMap = S.Record(ExportTopLevelKey, PackageExportsEntryOrFallback).annotate(
  $I.annote("PackageExportsSubpathMap", {
    title: "Package Exports Subpath Map",
    description: "An exports map whose keys are . or ./subpath targets and whose values are exports entries.",
  })
);

/**
 * Schema for the `exports` field.
 *
 * @example
 * ```ts
 * import { PackageExports } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = PackageExports
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const PackageExports = S.Union([
  PackageExportsEntryPath,
  PackageExportsSubpathMap,
  PackageExportsEntryObject,
  PackageExportsFallback,
]).annotate(
  $I.annote("PackageExports", {
    title: "Package Exports",
    description:
      "The package exports field modeled as a path target, conditional exports object, subpath map, or fallback array.",
  })
);

type PackageImportsEntry = string | null | { readonly [key: string]: PackageImportsEntryOrFallback };

type PackageImportsEntryOrFallback = PackageImportsEntry | ReadonlyArray<PackageImportsEntry>;

const PackageImportsEntryPath = S.Union([S.String, S.Null]).annotate(
  $I.annote("PackageImportsEntryPath", {
    title: "Package Imports Entry Path",
    description: "An imports target path or null to explicitly block the target.",
  })
);

const PackageImportsEntryObject: S.Codec<
  { readonly [key: string]: PackageImportsEntryOrFallback },
  { readonly [key: string]: PackageImportsEntryOrFallback }
> = S.suspend(() => S.Record(ExportConditionKey, PackageImportsEntryOrFallback)).annotate(
  $I.annote("PackageImportsEntryObject", {
    title: "Package Imports Entry Object",
    description:
      "A conditional imports object keyed by conditions such as import, require, default, or types@ selectors.",
  })
);

const PackageImportsEntry: S.Codec<PackageImportsEntry, PackageImportsEntry> = S.suspend(() =>
  S.Union([PackageImportsEntryPath, PackageImportsEntryObject])
).annotate(
  $I.annote("PackageImportsEntry", {
    title: "Package Imports Entry",
    description: "A single imports entry represented as a path, null, or a conditional imports object.",
  })
);

const PackageImportsFallback = S.NonEmptyArray(PackageImportsEntry).annotate(
  $I.annote("PackageImportsFallback", {
    title: "Package Imports Fallback",
    description: "A non-empty fallback array of imports entries evaluated in order.",
  })
);

const PackageImportsEntryOrFallback: S.Codec<PackageImportsEntryOrFallback, PackageImportsEntryOrFallback> = S.suspend(
  () => S.Union([PackageImportsEntry, PackageImportsFallback])
).annotate(
  $I.annote("PackageImportsEntryOrFallback", {
    title: "Package Imports Entry Or Fallback",
    description: "An imports target represented as a single entry or a non-empty fallback array of entries.",
  })
);

/**
 * Schema for the `imports` field.
 *
 * @example
 * ```ts
 * import { PackageImports } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = PackageImports
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const PackageImports = S.Record(ImportSpecifierKey, PackageImportsEntryOrFallback).annotate(
  $I.annote("PackageImports", {
    title: "Package Imports",
    description: "Private package import mappings keyed by # specifiers.",
  })
);

type OverrideValue = string | { readonly [key: string]: OverrideValue };

const OverrideValue: S.Codec<OverrideValue, OverrideValue> = S.suspend(() =>
  S.Union([S.String, S.Record(S.String, OverrideValue)])
).annotate(
  $I.annote("OverrideValue", {
    title: "Override Value",
    description: "An npm overrides value represented as a version string or a nested override object.",
  })
);

class WorkspacesObject extends S.Class<WorkspacesObject>($I`WorkspacesObject`)(
  {
    packages: S.optionalKey(StringArray),
    nohoist: S.optionalKey(StringArray),
  },
  $I.annote("WorkspacesObject", {
    title: "Workspaces Object",
    description: "A Yarn-style workspaces object with package globs and optional nohoist rules.",
  })
) {}

const publishConfigBaseFields = {
  access: S.optionalKey(S.Literals(["public", "restricted"] as const)),
  tag: S.optionalKey(S.String),
  registry: S.optionalKey(S.String),
  provenance: S.optionalKey(S.Boolean),
  bin: S.optionalKey(Bin),
  exports: S.optionalKey(PackageExports),
} as const;

const PublishConfigBase = S.Struct(publishConfigBaseFields).annotate(
  $I.annote("PublishConfigBase", {
    title: "Publish Config Base",
    description:
      "Structured npm publish configuration fields modeled explicitly before allowing additional JSON-valued keys.",
  })
);

/**
 * Schema for the `workspaces` field.
 *
 * @example
 * ```ts
 * import { Workspaces } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = Workspaces
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const Workspaces = S.Union([StringArray, WorkspacesObject]).annotate(
  $I.annote("Workspaces", {
    title: "Workspaces",
    description:
      "Workspace package globs represented as an array of strings or an object with packages and optional nohoist.",
  })
);

/**
 * Schema for the `publishConfig` field.
 *
 * @example
 * ```ts
 * import { PublishConfig } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = PublishConfig
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const PublishConfig = S.StructWithRest(PublishConfigBase, [S.Record(S.String, Json)]).annotate(
  $I.annote("PublishConfig", {
    title: "Publish Config",
    description:
      "npm publish configuration with explicit support for access, tag, registry, provenance, bin, exports, and additional JSON-valued config keys.",
  })
);

const npmPackageJsonFields = {
  name: NpmPackageName,
  version: S.OptionFromOptionalKey(S.String),
  description: S.OptionFromOptionalKey(S.String),
  keywords: S.OptionFromOptionalKey(StringArray),
  homepage: S.OptionFromOptionalKey(S.String),
  bugs: S.OptionFromOptionalKey(Bugs),
  license: S.OptionFromOptionalKey(S.String),
  author: S.OptionFromOptionalKey(Author),
  contributors: S.OptionFromOptionalKey(Contributors),
  maintainers: S.OptionFromOptionalKey(Maintainers),
  funding: S.OptionFromOptionalKey(Funding),
  files: S.OptionFromOptionalKey(StringArray),
  exports: S.OptionFromOptionalKey(PackageExports),
  imports: S.OptionFromOptionalKey(PackageImports),
  main: S.OptionFromOptionalKey(S.String),
  module: S.OptionFromOptionalKey(S.String),
  browser: S.OptionFromOptionalKey(Browser),
  bin: S.OptionFromOptionalKey(Bin),
  man: S.OptionFromOptionalKey(Man),
  directories: S.OptionFromOptionalKey(Directories),
  repository: S.OptionFromOptionalKey(Repository),
  scripts: S.OptionFromOptionalKey(NonEmptyStringRecord),
  config: S.OptionFromOptionalKey(S.Record(S.String, Json)),
  dependencies: S.OptionFromOptionalKey(NpmDependencyRecord),
  devDependencies: S.OptionFromOptionalKey(NpmDependencyRecord),
  peerDependencies: S.OptionFromOptionalKey(NpmDependencyRecord),
  peerDependenciesMeta: S.OptionFromOptionalKey(PeerDependenciesMeta),
  bundleDependencies: S.OptionFromOptionalKey(BundleDependencies),
  bundledDependencies: S.OptionFromOptionalKey(BundleDependencies),
  optionalDependencies: S.OptionFromOptionalKey(NpmDependencyRecord),
  overrides: S.OptionFromOptionalKey(S.Record(S.String, OverrideValue)),
  engines: S.OptionFromOptionalKey(NonEmptyStringRecord),
  engineStrict: S.OptionFromOptionalKey(S.Boolean),
  os: S.OptionFromOptionalKey(StringArray),
  cpu: S.OptionFromOptionalKey(StringArray),
  libc: S.OptionFromOptionalKey(StringArray),
  devEngines: S.OptionFromOptionalKey(DevEngines),
  private: S.OptionFromOptionalKey(S.Boolean),
  publishConfig: S.OptionFromOptionalKey(PublishConfig),
  preferGlobal: S.OptionFromOptionalKey(S.Boolean),
  workspaces: S.OptionFromOptionalKey(Workspaces),
  packageManager: S.OptionFromOptionalKey(PackageManager),
  sideEffects: S.OptionFromOptionalKey(SideEffects),
  types: S.OptionFromOptionalKey(S.String),
  typings: S.OptionFromOptionalKey(S.String),
  type: S.OptionFromOptionalKey(PackageTypeField),
  typesVersions: S.OptionFromOptionalKey(TypesVersions),
  resolutions: S.OptionFromOptionalKey(StringRecord),
  readme: S.OptionFromOptionalKey(S.String),
} as const;

const NpmPackageJsonShape = S.Struct(npmPackageJsonFields);

const packageJsonFields = {
  ...npmPackageJsonFields,
  name: RepoPackageName,
  dependencies: S.OptionFromOptionalKey(RepoDependencyRecord),
  devDependencies: S.OptionFromOptionalKey(RepoDependencyRecord),
  peerDependencies: S.OptionFromOptionalKey(RepoDependencyRecord),
  optionalDependencies: S.OptionFromOptionalKey(RepoDependencyRecord),
  catalog: S.OptionFromOptionalKey(RepoDependencyRecord),
  "resolutions#": S.OptionFromOptionalKey(NonEmptyStringRecord),
} as const;

const PackageJsonShape = S.Struct(packageJsonFields);

/**
 * Type-safe schema for npm package.json files.
 *
 * Unexpected keys are rejected by the exported decode helpers.
 *
 * @example
 * ```ts
 * import { NpmPackageJson } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = NpmPackageJson
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export class NpmPackageJson extends S.Class<NpmPackageJson>($I`NpmPackageJson`)(
  NpmPackageJsonShape,
  $I.annote("NpmPackageJson", {
    description: "A strict npm-oriented package.json schema derived from SchemaStore and npm documentation.",
    messageUnexpectedKey: "Unexpected package.json key",
  })
) {}

/**
 * Type-safe schema for this repo's package.json files.
 *
 * Extends the npm surface with repo-local metadata fields used by the monorepo.
 *
 * @example
 * ```ts
 * import { PackageJson } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const schema = PackageJson
 * void schema
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export class PackageJson extends S.Class<PackageJson>($I`PackageJson`)(
  PackageJsonShape,
  $I.annote("PackageJson", {
    description: "A strict repo-aware package.json schema that extends the npm surface with monorepo-only metadata.",
    messageUnexpectedKey: "Unexpected package.json key",
  })
) {}

/**
 * Namespace helpers for the strict npm package-json schema.
 *
 * @example
 * ```ts
 * import type { NpmPackageJson } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const readName = (value: NpmPackageJson.Type) => value.name
 * void readName
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace NpmPackageJson {
  /**
   * Decoded runtime type for {@link NpmPackageJson}.
   *
   * @category models
   * @since 0.0.0
   */
  export type Type = S.Schema.Type<typeof NpmPackageJson>;
  /**
   * Encoded representation for {@link NpmPackageJson}.
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = S.Codec.Encoded<typeof NpmPackageJson>;
}

/**
 * Namespace helpers for the repo-aware package-json schema.
 *
 * @example
 * ```ts
 * import type { PackageJson } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const readName = (value: PackageJson.Type) => value.name
 * void readName
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace PackageJson {
  /**
   * Decoded runtime type for {@link PackageJson}.
   *
   * @category models
   * @since 0.0.0
   */
  export type Type = S.Schema.Type<typeof PackageJson>;
  /**
   * Encoded representation for {@link PackageJson}.
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded = S.Codec.Encoded<typeof PackageJson>;
}

/**
 * Runtime type for {@link Person}.
 *
 * @example
 * ```ts
 * import type { Person } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptPerson = (_value: Person) => undefined
 * void acceptPerson
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Person = (typeof Person)["Type"];
/**
 * Runtime type for {@link Author}.
 *
 * @example
 * ```ts
 * import type { Author } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptAuthor = (_value: Author) => undefined
 * void acceptAuthor
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Author = (typeof Author)["Type"];
/**
 * Runtime type for {@link Contributors}.
 *
 * @example
 * ```ts
 * import type { Contributors } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptContributors = (_value: Contributors) => undefined
 * void acceptContributors
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Contributors = (typeof Contributors)["Type"];
/**
 * Runtime type for {@link Maintainers}.
 *
 * @example
 * ```ts
 * import type { Maintainers } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptMaintainers = (_value: Maintainers) => undefined
 * void acceptMaintainers
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Maintainers = (typeof Maintainers)["Type"];
/**
 * Runtime type for {@link Repository}.
 *
 * @example
 * ```ts
 * import type { Repository } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptRepository = (_value: Repository) => undefined
 * void acceptRepository
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Repository = (typeof Repository)["Type"];
/**
 * Runtime type for {@link Bugs}.
 *
 * @example
 * ```ts
 * import type { Bugs } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptBugs = (_value: Bugs) => undefined
 * void acceptBugs
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Bugs = (typeof Bugs)["Type"];
/**
 * Runtime type for {@link Funding}.
 *
 * @example
 * ```ts
 * import type { Funding } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptFunding = (_value: Funding) => undefined
 * void acceptFunding
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Funding = (typeof Funding)["Type"];
/**
 * Runtime type for {@link Bin}.
 *
 * @example
 * ```ts
 * import type { Bin } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptBin = (_value: Bin) => undefined
 * void acceptBin
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Bin = (typeof Bin)["Type"];
/**
 * Runtime type for {@link Browser}.
 *
 * @example
 * ```ts
 * import type { Browser } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptBrowser = (_value: Browser) => undefined
 * void acceptBrowser
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Browser = (typeof Browser)["Type"];
/**
 * Runtime type for {@link Directories}.
 *
 * @example
 * ```ts
 * import type { Directories } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptDirectories = (_value: Directories) => undefined
 * void acceptDirectories
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Directories = (typeof Directories)["Type"];
/**
 * Runtime type for {@link Man}.
 *
 * @example
 * ```ts
 * import type { Man } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptMan = (_value: Man) => undefined
 * void acceptMan
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Man = (typeof Man)["Type"];
/**
 * Runtime type for {@link SideEffects}.
 *
 * @example
 * ```ts
 * import type { SideEffects } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptSideEffects = (_value: SideEffects) => undefined
 * void acceptSideEffects
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type SideEffects = (typeof SideEffects)["Type"];
/**
 * Runtime type for {@link BundleDependencies}.
 *
 * @example
 * ```ts
 * import type { BundleDependencies } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptBundleDependencies = (_value: BundleDependencies) => undefined
 * void acceptBundleDependencies
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BundleDependencies = (typeof BundleDependencies)["Type"];
/**
 * Runtime type for {@link PeerDependenciesMeta}.
 *
 * @example
 * ```ts
 * import type { PeerDependenciesMeta } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptPeerDependenciesMeta = (_value: PeerDependenciesMeta) => undefined
 * void acceptPeerDependenciesMeta
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type PeerDependenciesMeta = (typeof PeerDependenciesMeta)["Type"];
/**
 * Runtime type for {@link TypesVersions}.
 *
 * @example
 * ```ts
 * import type { TypesVersions } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptTypesVersions = (_value: TypesVersions) => undefined
 * void acceptTypesVersions
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type TypesVersions = (typeof TypesVersions)["Type"];
/**
 * Runtime type for {@link DevEngineDependency}.
 *
 * @example
 * ```ts
 * import type { DevEngineDependency } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptDevEngineDependency = (_value: DevEngineDependency) => undefined
 * void acceptDevEngineDependency
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type DevEngineDependency = (typeof DevEngineDependency)["Type"];
/**
 * Runtime type for {@link DevEngines}.
 *
 * @example
 * ```ts
 * import type { DevEngines } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptDevEngines = (_value: DevEngines) => undefined
 * void acceptDevEngines
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type DevEngines = (typeof DevEngines)["Type"];
/**
 * Runtime type for {@link PackageExports}.
 *
 * @example
 * ```ts
 * import type { PackageExports } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptPackageExports = (_value: PackageExports) => undefined
 * void acceptPackageExports
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type PackageExports = (typeof PackageExports)["Type"];
/**
 * Runtime type for {@link PackageImports}.
 *
 * @example
 * ```ts
 * import type { PackageImports } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptPackageImports = (_value: PackageImports) => undefined
 * void acceptPackageImports
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type PackageImports = (typeof PackageImports)["Type"];
/**
 * Runtime type for {@link Workspaces}.
 *
 * @example
 * ```ts
 * import type { Workspaces } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptWorkspaces = (_value: Workspaces) => undefined
 * void acceptWorkspaces
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Workspaces = (typeof Workspaces)["Type"];
/**
 * Runtime type for {@link PublishConfig}.
 *
 * @example
 * ```ts
 * import type { PublishConfig } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const acceptPublishConfig = (_value: PublishConfig) => undefined
 * void acceptPublishConfig
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type PublishConfig = (typeof PublishConfig)["Type"];

const decodePackageJsonUnknownSync = S.decodeUnknownSync(PackageJson);
const decodePackageJsonUnknownExit = S.decodeUnknownExit(PackageJson);
const decodePackageJsonUnknownEffect = S.decodeUnknownEffect(PackageJson);
const encodePackageJsonUnknownEffect = S.encodeUnknownEffect(PackageJson);
const encodePackageJsonJsonStringEffect = S.encodeUnknownEffect(S.fromJsonString(PackageJson));

/**
 * Synchronously decode an unknown value into a strict `PackageJson`.
 * Throws a `SchemaError` if validation fails.
 *
 * @example
 * ```ts
 * import { decodePackageJson } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const packageJson = decodePackageJson({ name: "@beep/example" })
 * void packageJson
 * ```
 *
 * @param input - Unknown package.json-shaped value to validate and decode.
 * @returns Decoded strict `PackageJson` value.
 * @category validation
 * @since 0.0.0
 */
export const decodePackageJson = (input: unknown): PackageJson.Type =>
  decodePackageJsonUnknownSync(input, strictDecodeOptions);

/**
 * Synchronously decode an unknown value into a strict `PackageJson`,
 * returning an `Exit` instead of throwing.
 *
 * @example
 * ```ts
 * import { decodePackageJsonExit } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const exit = decodePackageJsonExit({ name: "@beep/example" })
 * void exit
 * ```
 *
 * @param input - Unknown package.json-shaped value to validate and decode.
 * @returns Exit describing either the decoded package.json or the schema failure.
 * @category validation
 * @since 0.0.0
 */
export const decodePackageJsonExit: (input: unknown) => Exit.Exit<PackageJson.Type, S.SchemaError> = (input) =>
  decodePackageJsonUnknownExit(input, strictDecodeOptions);

/**
 * Decode an unknown value into a strict `PackageJson` as an Effect.
 *
 * @example
 * ```ts
 * import { decodePackageJsonEffect } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const program = decodePackageJsonEffect({ name: "@beep/example" })
 * void program
 * ```
 *
 * @param input - Unknown package.json-shaped value to validate and decode.
 * @returns Effect that yields a decoded strict package.json value.
 * @category validation
 * @since 0.0.0
 */
export const decodePackageJsonEffect: (input: unknown) => Effect.Effect<PackageJson.Type, S.SchemaError> = (input) =>
  decodePackageJsonUnknownEffect(input, strictDecodeOptions);

/**
 * Encode a strict `PackageJson` value back to its encoded form as an Effect.
 *
 * The input is first decoded with strict excess-property rejection so callers
 * do not accidentally encode malformed package.json objects.
 *
 * @example
 * ```ts
 * import { encodePackageJsonEffect } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const program = encodePackageJsonEffect({ name: "@beep/example" })
 * void program
 * ```
 *
 * @param input - Unknown package.json-shaped value to validate before encoding.
 * @returns Effect that yields the encoded package.json representation.
 * @category validation
 * @since 0.0.0
 */
export const encodePackageJsonEffect: (input: unknown) => Effect.Effect<PackageJson.Encoded, S.SchemaError> = Effect.fn(
  function* (input) {
    const validated = yield* decodePackageJsonEffect(input);
    return yield* encodePackageJsonUnknownEffect(validated);
  }
);

/**
 * Encode a strict `PackageJson` value to a compact JSON string as an Effect.
 *
 * @example
 * ```ts
 * import { encodePackageJsonToJsonEffect } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const program = encodePackageJsonToJsonEffect({ name: "@beep/example" })
 * void program
 * ```
 *
 * @param input - Unknown package.json-shaped value to validate before encoding.
 * @returns Effect that yields a compact JSON string.
 * @category validation
 * @since 0.0.0
 */
export const encodePackageJsonToJsonEffect: (input: unknown) => Effect.Effect<string, S.SchemaError> = Effect.fn(
  function* (input) {
    const validated = yield* decodePackageJsonEffect(input);
    return yield* encodePackageJsonJsonStringEffect(validated);
  }
);

/**
 * Encode a strict `PackageJson` value to a pretty-printed JSON string.
 *
 * @example
 * ```ts
 * import { encodePackageJsonPrettyEffect } from "@beep/repo-utils/schemas/PackageJson"
 *
 * const program = encodePackageJsonPrettyEffect({ name: "@beep/example" })
 * void program
 * ```
 *
 * @param input - Unknown package.json-shaped value to validate before encoding.
 * @returns Effect that yields a formatted JSON string or a domain formatting error.
 * @category validation
 * @since 0.0.0
 */
export const encodePackageJsonPrettyEffect: (input: unknown) => Effect.Effect<string, S.SchemaError | DomainError> =
  Effect.fn(function* (input) {
    const validated = yield* encodePackageJsonEffect(input);
    return yield* jsonStringifyPretty(validated);
  });
