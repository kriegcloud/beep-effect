/**
 * Type-safe package.json schemas using Effect v4 Schema.
 *
 * The exported `NpmPackageJson` schema models the npm/package.json surface we
 * intentionally support from SchemaStore and npm docs. `PackageJson` extends it
 * with repo-local top-level fields used in this monorepo.
 *
 * @since 0.0.0
 * @module
 */
import { Effect } from "effect";
import type { Exit } from "effect";
import * as S from "effect/Schema";
import type { DomainError } from "../errors/index.js";
import { jsonStringifyPretty } from "../JsonUtils.js";
import { $RepoUtilsId } from "@beep/identity";

const $I = $RepoUtilsId.create("schemas/PackageJson");

const strictDecodeOptions = { onExcessProperty: "error" as const };

const packageNamePattern = /^(?:(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?\/[a-z0-9-._~])|[a-z0-9-~])[a-z0-9-._~]*$/;
const packageManagerPattern = /^(npm|pnpm|yarn|bun)@\d+\.\d+\.\d+(-.+)?$/;
const relativeDotPathPattern = /^\.\//;
const exportTopLevelPattern = /^(?:\.|\.\/.+)$/;
const importSpecifierPattern = /^#.+$/;
const exportConditionPattern = /^(?:[^.0-9]+|types@.+)$/;

const PackageName = S.String.check(S.isMinLength(1))
  .check(S.isMaxLength(214))
  .check(S.isPattern(packageNamePattern))
  .annotate(
    $I.annote("PackageName", {
      title: "Package Name",
      description: "An npm package name that satisfies the package.json SchemaStore constraints.",
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

const StringRecord = S.Record(S.String, S.String).annotate(
  $I.annote("StringRecord", {
    title: "String Record",
    description: "A record mapping string keys to string values, used for dependency maps, scripts, and engines.",
  })
);

type Json = string | number | boolean | null | ReadonlyArray<Json> | { readonly [key: string]: Json };

const Json: S.Codec<Json, Json, never, never> = S.suspend(() =>
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

/**
 * A person involved with the package, represented as a string or structured object.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Person = S.Union([
  S.String,
  S.Struct({
    name: S.String,
    email: S.OptionFromOptionalKey(S.String),
    url: S.OptionFromOptionalKey(S.String),
  }),
]).annotate(
  $I.annote("Person", {
    title: "Person",
    description: "A package author, contributor, or maintainer, either as a string or a structured object with a required name.",
  })
);

/**
 * The package author field.
 *
 * @since 0.0.0
 * @category Validation
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
 * @since 0.0.0
 * @category Validation
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
 * @since 0.0.0
 * @category Validation
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
 * @since 0.0.0
 * @category Validation
 */
export const Repository = S.Union([
  S.String,
  S.Struct({
    type: S.String,
    url: S.String,
    directory: S.OptionFromOptionalKey(S.String),
  }),
]).annotate(
  $I.annote("Repository", {
    title: "Repository",
    description: "A package repository reference represented as a shorthand string or a structured object with required type and url.",
  })
);

/**
 * Schema for the `bugs` field.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Bugs = S.Union([
  S.String,
  S.Struct({
    url: S.OptionFromOptionalKey(S.String),
    email: S.OptionFromOptionalKey(S.String),
  }),
]).annotate(
  $I.annote("Bugs", {
    title: "Bugs",
    description: "A package bug tracker reference represented as a URL string or a structured object with optional url and email.",
  })
);

/**
 * Schema for the `funding` field.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Funding = S.Union([
  S.String,
  S.Struct({
    url: S.String,
    type: S.OptionFromOptionalKey(S.String),
  }),
  S.NonEmptyArray(
    S.Union([
      S.String,
      S.Struct({
        url: S.String,
        type: S.OptionFromOptionalKey(S.String),
      }),
    ])
  ),
]).annotate(
  $I.annote("Funding", {
    title: "Funding",
    description: "Package funding metadata represented as a URL string, a structured funding object, or a non-empty array of those.",
  })
);

/**
 * Schema for the `bin` field.
 *
 * @since 0.0.0
 * @category Validation
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
 * @since 0.0.0
 * @category Validation
 */
export const Browser = S.Union([S.String, S.Record(S.String, BrowserReplacement)]).annotate(
  $I.annote("Browser", {
    title: "Browser",
    description: "Browser-specific entry points represented as a replacement path string or a record of module replacements.",
  })
);

/**
 * Schema for the `directories` field.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Directories = S.Struct({
  bin: S.OptionFromOptionalKey(S.String),
  doc: S.OptionFromOptionalKey(S.String),
  example: S.OptionFromOptionalKey(S.String),
  lib: S.OptionFromOptionalKey(S.String),
  man: S.OptionFromOptionalKey(S.String),
  test: S.OptionFromOptionalKey(S.String),
}).annotate(
  $I.annote("Directories", {
    title: "Directories",
    description: "Directory metadata describing where package resources such as binaries, docs, and tests live.",
  })
);

/**
 * Schema for the `man` field.
 *
 * @since 0.0.0
 * @category Validation
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
 * @since 0.0.0
 * @category Validation
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
 * @since 0.0.0
 * @category Validation
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
 * @since 0.0.0
 * @category Validation
 */
export const PeerDependenciesMeta = S.Record(
  S.String,
  S.StructWithRest(
    S.Struct({
      optional: S.OptionFromOptionalKey(S.Boolean),
    }),
    [S.Record(S.String, Json)]
  )
).annotate(
  $I.annote("PeerDependenciesMeta", {
    title: "Peer Dependencies Meta",
    description: "Metadata describing peer dependency usage, including whether a peer dependency is optional.",
  })
);

/**
 * Schema for the `typesVersions` field.
 *
 * @since 0.0.0
 * @category Validation
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
 * @since 0.0.0
 * @category Validation
 */
export const DevEngineDependency = S.Struct({
  name: S.String,
  version: S.OptionFromOptionalKey(S.String),
  onFail: S.OptionFromOptionalKey(S.Literals(["ignore", "warn", "error", "download"] as const)),
}).annotate(
  $I.annote("DevEngineDependency", {
    title: "Dev Engine Dependency",
    description: "A development environment requirement such as a runtime, package manager, CPU, OS, or libc constraint.",
  })
);

const DevEngineRequirement = S.Union([DevEngineDependency, S.Array(DevEngineDependency)]).annotate(
  $I.annote("DevEngineRequirement", {
    title: "Dev Engine Requirement",
    description: "A development environment requirement represented as a single dependency entry or an array of dependency entries.",
  })
);

/**
 * Schema for the `devEngines` field.
 *
 * @since 0.0.0
 * @category Validation
 */
export const DevEngines = S.Struct({
  os: S.OptionFromOptionalKey(DevEngineRequirement),
  cpu: S.OptionFromOptionalKey(DevEngineRequirement),
  libc: S.OptionFromOptionalKey(DevEngineRequirement),
  runtime: S.OptionFromOptionalKey(DevEngineRequirement),
  packageManager: S.OptionFromOptionalKey(DevEngineRequirement),
}).annotate(
  $I.annote("DevEngines", {
    title: "Dev Engines",
    description: "Development environment constraints for OS, CPU, libc, runtime, and package manager.",
  })
);

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
  { readonly [key: string]: PackageExportsEntryOrFallback },
  never,
  never
> = S.suspend(() =>
  S.Record(ExportConditionKey, PackageExportsEntryOrFallback)
).annotate(
  $I.annote("PackageExportsEntryObject", {
    title: "Package Exports Entry Object",
    description: "A conditional exports object keyed by conditions such as import, require, default, or types@ selectors.",
  })
);

const PackageExportsEntry: S.Codec<PackageExportsEntry, PackageExportsEntry, never, never> = S.suspend(() =>
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

const PackageExportsEntryOrFallback: S.Codec<
  PackageExportsEntryOrFallback,
  PackageExportsEntryOrFallback,
  never,
  never
> = S.suspend(() =>
  S.Union([PackageExportsEntry, PackageExportsFallback])
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
 * @since 0.0.0
 * @category Validation
 */
export const PackageExports = S.Union([
  PackageExportsEntryPath,
  PackageExportsSubpathMap,
  PackageExportsEntryObject,
  PackageExportsFallback,
]).annotate(
  $I.annote("PackageExports", {
    title: "Package Exports",
    description: "The package exports field modeled as a path target, conditional exports object, subpath map, or fallback array.",
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
  { readonly [key: string]: PackageImportsEntryOrFallback },
  never,
  never
> = S.suspend(() =>
  S.Record(ExportConditionKey, PackageImportsEntryOrFallback)
).annotate(
  $I.annote("PackageImportsEntryObject", {
    title: "Package Imports Entry Object",
    description: "A conditional imports object keyed by conditions such as import, require, default, or types@ selectors.",
  })
);

const PackageImportsEntry: S.Codec<PackageImportsEntry, PackageImportsEntry, never, never> = S.suspend(() =>
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

const PackageImportsEntryOrFallback: S.Codec<
  PackageImportsEntryOrFallback,
  PackageImportsEntryOrFallback,
  never,
  never
> = S.suspend(() =>
  S.Union([PackageImportsEntry, PackageImportsFallback])
).annotate(
  $I.annote("PackageImportsEntryOrFallback", {
    title: "Package Imports Entry Or Fallback",
    description: "An imports target represented as a single entry or a non-empty fallback array of entries.",
  })
);

/**
 * Schema for the `imports` field.
 *
 * @since 0.0.0
 * @category Validation
 */
export const PackageImports = S.Record(ImportSpecifierKey, PackageImportsEntryOrFallback).annotate(
  $I.annote("PackageImports", {
    title: "Package Imports",
    description: "Private package import mappings keyed by # specifiers.",
  })
);

type OverrideValue = string | { readonly [key: string]: OverrideValue };

const OverrideValue: S.Codec<OverrideValue, OverrideValue, never, never> = S.suspend(() =>
  S.Union([S.String, S.Record(S.String, OverrideValue)])
).annotate(
  $I.annote("OverrideValue", {
    title: "Override Value",
    description: "An npm overrides value represented as a version string or a nested override object.",
  })
);

const WorkspacesObject = S.Struct({
  packages: S.OptionFromOptionalKey(StringArray),
  nohoist: S.OptionFromOptionalKey(StringArray),
}).annotate(
  $I.annote("WorkspacesObject", {
    title: "Workspaces Object",
    description: "A Yarn-style workspaces object with package globs and optional nohoist rules.",
  })
);

/**
 * Schema for the `workspaces` field.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Workspaces = S.Union([StringArray, WorkspacesObject]).annotate(
  $I.annote("Workspaces", {
    title: "Workspaces",
    description: "Workspace package globs represented as an array of strings or an object with packages and optional nohoist.",
  })
);

/**
 * Schema for the `publishConfig` field.
 *
 * @since 0.0.0
 * @category Validation
 */
export const PublishConfig = S.StructWithRest(
  S.Struct({
    access: S.OptionFromOptionalKey(S.Literals(["public", "restricted"] as const)),
    tag: S.OptionFromOptionalKey(S.String),
    registry: S.OptionFromOptionalKey(S.String),
    provenance: S.OptionFromOptionalKey(S.Boolean),
    bin: S.OptionFromOptionalKey(Bin),
    exports: S.OptionFromOptionalKey(PackageExports),
  }),
  [S.Record(S.String, Json)]
).annotate(
  $I.annote("PublishConfig", {
    title: "Publish Config",
    description:
      "npm publish configuration with explicit support for access, tag, registry, provenance, bin, exports, and additional JSON-valued config keys.",
  })
);

const npmPackageJsonFields = {
  name: PackageName,
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
  scripts: S.OptionFromOptionalKey(StringRecord),
  config: S.OptionFromOptionalKey(S.Record(S.String, Json)),
  dependencies: S.OptionFromOptionalKey(StringRecord),
  devDependencies: S.OptionFromOptionalKey(StringRecord),
  peerDependencies: S.OptionFromOptionalKey(StringRecord),
  peerDependenciesMeta: S.OptionFromOptionalKey(PeerDependenciesMeta),
  bundleDependencies: S.OptionFromOptionalKey(BundleDependencies),
  bundledDependencies: S.OptionFromOptionalKey(BundleDependencies),
  optionalDependencies: S.OptionFromOptionalKey(StringRecord),
  overrides: S.OptionFromOptionalKey(S.Record(S.String, OverrideValue)),
  engines: S.OptionFromOptionalKey(StringRecord),
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
  type: S.OptionFromOptionalKey(S.String),
  typesVersions: S.OptionFromOptionalKey(TypesVersions),
  resolutions: S.OptionFromOptionalKey(StringRecord),
  readme: S.OptionFromOptionalKey(S.String),
} as const;

const NpmPackageJsonShape = S.Struct(npmPackageJsonFields);

const packageJsonFields = {
  ...npmPackageJsonFields,
  catalog: S.OptionFromOptionalKey(StringRecord),
  "resolutions#": S.OptionFromOptionalKey(StringRecord),
} as const;

const PackageJsonShape = S.Struct(packageJsonFields);



/**
 * Type-safe schema for npm package.json files.
 *
 * Unexpected keys are rejected by the exported decode helpers.
 *
 * @since 0.0.0
 * @category Validation
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
 * @since 0.0.0
 * @category Validation
 */
export class PackageJson extends S.Class<PackageJson>($I`PackageJson`)(
  PackageJsonShape,
  $I.annote("PackageJson", {
    description: "A strict repo-aware package.json schema that extends the npm surface with monorepo-only metadata.",
    messageUnexpectedKey: "Unexpected package.json key",
  })
) {}

export declare namespace NpmPackageJson {
  export type Type = S.Schema.Type<typeof NpmPackageJson>;
  export type Encoded = S.Codec.Encoded<typeof NpmPackageJson>;
}

export declare namespace PackageJson {
  export type Type = S.Schema.Type<typeof PackageJson>;
  export type Encoded = S.Codec.Encoded<typeof PackageJson>;
}

export type Person = (typeof Person)["Type"];
export type Author = (typeof Author)["Type"];
export type Contributors = (typeof Contributors)["Type"];
export type Maintainers = (typeof Maintainers)["Type"];
export type Repository = (typeof Repository)["Type"];
export type Bugs = (typeof Bugs)["Type"];
export type Funding = (typeof Funding)["Type"];
export type Bin = (typeof Bin)["Type"];
export type Browser = (typeof Browser)["Type"];
export type Directories = (typeof Directories)["Type"];
export type Man = (typeof Man)["Type"];
export type SideEffects = (typeof SideEffects)["Type"];
export type BundleDependencies = (typeof BundleDependencies)["Type"];
export type PeerDependenciesMeta = (typeof PeerDependenciesMeta)["Type"];
export type TypesVersions = (typeof TypesVersions)["Type"];
export type DevEngineDependency = (typeof DevEngineDependency)["Type"];
export type DevEngines = (typeof DevEngines)["Type"];
export type PackageExports = (typeof PackageExports)["Type"];
export type PackageImports = (typeof PackageImports)["Type"];
export type Workspaces = (typeof Workspaces)["Type"];
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
 * @since 0.0.0
 * @category Validation
 */
export const decodePackageJson = (input: unknown): PackageJson.Type =>
  decodePackageJsonUnknownSync(input, strictDecodeOptions);

/**
 * Synchronously decode an unknown value into a strict `PackageJson`,
 * returning an `Exit` instead of throwing.
 *
 * @since 0.0.0
 * @category Validation
 */
export const decodePackageJsonExit: (input: unknown) => Exit.Exit<PackageJson.Type, S.SchemaError> = (input) =>
  decodePackageJsonUnknownExit(input, strictDecodeOptions);

/**
 * Decode an unknown value into a strict `PackageJson` as an Effect.
 *
 * @since 0.0.0
 * @category Validation
 */
export const decodePackageJsonEffect: (input: unknown) => Effect.Effect<PackageJson.Type, S.SchemaError, never> = (
  input
) =>
  decodePackageJsonUnknownEffect(input, strictDecodeOptions);

/**
 * Encode a strict `PackageJson` value back to its encoded form as an Effect.
 *
 * The input is first decoded with strict excess-property rejection so callers
 * do not accidentally encode malformed package.json objects.
 *
 * @since 0.0.0
 * @category Validation
 */
export const encodePackageJsonEffect: (input: unknown) => Effect.Effect<PackageJson.Encoded, S.SchemaError, never> =
  Effect.fn(function* (input) {
    const validated = yield* decodePackageJsonEffect(input);
    return yield* encodePackageJsonUnknownEffect(validated);
  });

/**
 * Encode a strict `PackageJson` value to a compact JSON string as an Effect.
 *
 * @since 0.0.0
 * @category Validation
 */
export const encodePackageJsonToJsonEffect: (input: unknown) => Effect.Effect<string, S.SchemaError, never> = Effect.fn(
  function* (input) {
    const validated = yield* decodePackageJsonEffect(input);
    return yield* encodePackageJsonJsonStringEffect(validated);
  }
);

/**
 * Encode a strict `PackageJson` value to a pretty-printed JSON string.
 *
 * @since 0.0.0
 * @category Validation
 */
export const encodePackageJsonPrettyEffect: (input: unknown) => Effect.Effect<string, S.SchemaError | DomainError> =
  Effect.fn(function* (input) {
    const validated = yield* encodePackageJsonEffect(input);
    return yield* jsonStringifyPretty(validated);
  });
