import { $RepoCliId } from "@beep/identity/packages";
import type { PackageJson } from "@beep/repo-utils";
import { Effect, Function as Fn, HashMap, HashSet, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  buildDocgenAliasTargets,
  resolveRootExportTarget,
  resolveWildcardExportTarget,
} from "./TsconfigAliasTargets.js";

const $I = $RepoCliId.create("commands/Shared/DocgenConfig");

const EMPTY_STRING_RECORD: R.ReadonlyRecord<string, string> = R.empty();
const byStringAscending: Order.Order<string> = Order.String;

const normalizeSlashes = (value: string): string => Str.replace(/\\/g, "/")(value);

const recordOrEmpty = (value: O.Option<Readonly<Record<string, string>>>): Readonly<Record<string, string>> =>
  O.getOrElse(value, () => EMPTY_STRING_RECORD);

const uniqueSortedStringValues = (values: ReadonlyArray<string>): ReadonlyArray<string> =>
  pipe(values, HashSet.fromIterable, A.fromIterable, A.sort(byStringAscending));
const withRootRelativePrefix: {
  (rootRelativePrefix: string, targetPath: string): string;
  (rootRelativePrefix: string): (targetPath: string) => string;
} = Fn.dual(
  2,
  (rootRelativePrefix: string, targetPath: string): string =>
    `${rootRelativePrefix}${Str.replace(/^\.\//, Str.empty)(targetPath)}`
);

/**
 * Default docgen exclude globs for repo packages.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const DEFAULT_DOCGEN_EXCLUDE = ["src/internal/**/*.ts"] as const;

/**
 * Workspace alias metadata used to build docgen example path mappings.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class DocgenAliasSource extends S.Class<DocgenAliasSource>($I`DocgenAliasSource`)(
  {
    packageName: S.String,
    rootAliasTarget: S.String,
    wildcardAliasTarget: S.String,
  },
  $I.annote("DocgenAliasSource", {
    description: "Workspace alias metadata used to build docgen example path mappings.",
  })
) {}

/**
 * Input used to build the canonical repo docgen config for a package.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class CanonicalDocgenConfigInput extends S.Class<CanonicalDocgenConfigInput>($I`CanonicalDocgenConfigInput`)(
  {
    rootDir: S.String,
    packageAbsolutePath: S.String,
    packageRelativePath: S.String,
    packageName: S.String,
    directWorkspaceDependencies: S.Array(S.String),
    workspaceAliasSources: S.Array(DocgenAliasSource),
  },
  $I.annote("CanonicalDocgenConfigInput", {
    description: "Input used to build the canonical repo docgen config for a package.",
  })
) {}

/**
 * Managed TypeScript compiler options used for docgen examples.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class CanonicalDocgenExamplesCompilerOptions extends S.Class<CanonicalDocgenExamplesCompilerOptions>(
  $I`CanonicalDocgenExamplesCompilerOptions`
)(
  {
    noEmit: S.Literal(true),
    strict: S.Literal(true),
    skipLibCheck: S.Literal(true),
    moduleResolution: S.Literal("bundler"),
    module: S.Literal("es2022"),
    target: S.Literal("es2022"),
    lib: S.Array(S.String),
    rewriteRelativeImportExtensions: S.Literal(true),
    allowImportingTsExtensions: S.Literal(true),
    moduleDetection: S.Literal("force"),
    verbatimModuleSyntax: S.Literal(true),
    allowJs: S.Literal(false),
    erasableSyntaxOnly: S.Literal(true),
    declaration: S.Literal(true),
    declarationMap: S.Literal(true),
    sourceMap: S.Literal(true),
    exactOptionalPropertyTypes: S.Literal(true),
    noUnusedLocals: S.Literal(true),
    noUnusedParameters: S.Literal(true),
    noImplicitOverride: S.Literal(true),
    noFallthroughCasesInSwitch: S.Literal(true),
    stripInternal: S.Literal(false),
    noErrorTruncation: S.Literal(true),
    types: S.Array(S.String),
    jsx: S.Literal("react-jsx"),
    paths: S.Record(S.String, S.Array(S.String)),
  },
  $I.annote("CanonicalDocgenExamplesCompilerOptions", {
    description: "Managed TypeScript compiler options used for docgen examples.",
  })
) {}

/**
 * Canonical repo docgen config payload.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class CanonicalDocgenConfig extends S.Class<CanonicalDocgenConfig>($I`CanonicalDocgenConfig`)(
  {
    $schema: S.String,
    exclude: S.Array(S.String),
    srcLink: S.String,
    examplesCompilerOptions: CanonicalDocgenExamplesCompilerOptions,
  },
  $I.annote("CanonicalDocgenConfig", {
    description: "Canonical repo docgen config payload.",
  })
) {}

const cloneStringArray = (values: ReadonlyArray<string>): ReadonlyArray<string> => A.fromIterable(values);

const isReadonlyUnknownRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  P.isObject(value) && !A.isArray(value);

/**
 * Convert canonical docgen compiler options to a plain JSON-compatible object.
 *
 * @param options - Canonical compiler options model.
 * @returns Plain JSON-compatible compiler options payload.
 * @category DomainModel
 * @since 0.0.0
 */
export const toDocgenExamplesCompilerOptionsJson = (
  options: CanonicalDocgenExamplesCompilerOptions
): Readonly<Record<string, unknown>> => ({
  noEmit: options.noEmit,
  strict: options.strict,
  skipLibCheck: options.skipLibCheck,
  moduleResolution: options.moduleResolution,
  module: options.module,
  target: options.target,
  lib: cloneStringArray(options.lib),
  rewriteRelativeImportExtensions: options.rewriteRelativeImportExtensions,
  allowImportingTsExtensions: options.allowImportingTsExtensions,
  moduleDetection: options.moduleDetection,
  verbatimModuleSyntax: options.verbatimModuleSyntax,
  allowJs: options.allowJs,
  erasableSyntaxOnly: options.erasableSyntaxOnly,
  declaration: options.declaration,
  declarationMap: options.declarationMap,
  sourceMap: options.sourceMap,
  exactOptionalPropertyTypes: options.exactOptionalPropertyTypes,
  noUnusedLocals: options.noUnusedLocals,
  noUnusedParameters: options.noUnusedParameters,
  noImplicitOverride: options.noImplicitOverride,
  noFallthroughCasesInSwitch: options.noFallthroughCasesInSwitch,
  stripInternal: options.stripInternal,
  noErrorTruncation: options.noErrorTruncation,
  types: cloneStringArray(options.types),
  jsx: options.jsx,
  paths: pipe(
    options.paths,
    R.map((targets) => cloneStringArray(targets))
  ),
});

/**
 * Convert the canonical docgen config model to a plain JSON-compatible object.
 *
 * @param config - Canonical docgen config model.
 * @returns Plain JSON-compatible docgen config payload.
 * @category DomainModel
 * @since 0.0.0
 */
export const toCanonicalDocgenConfigJson = (
  config: CanonicalDocgenConfig
): {
  readonly $schema: string;
  readonly exclude: ReadonlyArray<string>;
  readonly srcLink: string;
  readonly examplesCompilerOptions: Readonly<Record<string, unknown>>;
} => ({
  $schema: config.$schema,
  exclude: cloneStringArray(config.exclude),
  srcLink: config.srcLink,
  examplesCompilerOptions: toDocgenExamplesCompilerOptionsJson(config.examplesCompilerOptions),
});

/**
 * Collect direct workspace package dependencies from a package manifest.
 *
 * @param packageJson - Parsed package manifest.
 * @returns Sorted unique `@beep/*` dependency names across all dependency sections.
 * @category DomainModel
 * @since 0.0.0
 */
export const collectDocgenWorkspaceDependencyNames = (packageJson: PackageJson.Type): ReadonlyArray<string> =>
  pipe(
    [
      ...pipe(packageJson.dependencies, recordOrEmpty, R.keys),
      ...pipe(packageJson.devDependencies, recordOrEmpty, R.keys),
      ...pipe(packageJson.peerDependencies, recordOrEmpty, R.keys),
      ...pipe(packageJson.optionalDependencies, recordOrEmpty, R.keys),
    ],
    A.filter((name) => Str.startsWith("@beep/")(name)),
    uniqueSortedStringValues
  );

/**
 * Build docgen alias targets for one workspace package from its exports.
 *
 * @param packageName - Scoped workspace package name.
 * @param packageRelativePath - Workspace-relative package path.
 * @param packageJson - Parsed package manifest.
 * @returns Alias metadata used by docgen example path mappings.
 * @category DomainModel
 * @since 0.0.0
 */
export const buildDocgenAliasSource = (
  packageName: string,
  packageRelativePath: string,
  packageJson: PackageJson.Type
): DocgenAliasSource => {
  const exportsField = O.isSome(packageJson.exports) ? packageJson.exports.value : undefined;
  const rootExportTarget = pipe(
    exportsField,
    resolveRootExportTarget,
    O.getOrElse(() => "./src/index.ts")
  );
  const wildcardExportTarget = pipe(exportsField, resolveWildcardExportTarget, O.getOrUndefined);
  const aliasTargets = buildDocgenAliasTargets(packageRelativePath, rootExportTarget, wildcardExportTarget);

  return new DocgenAliasSource({
    packageName,
    rootAliasTarget: aliasTargets.rootAliasTarget,
    wildcardAliasTarget: aliasTargets.wildcardAliasTarget,
  });
};

const buildDocgenAliasIndex = (sources: ReadonlyArray<DocgenAliasSource>): HashMap.HashMap<string, DocgenAliasSource> =>
  HashMap.fromIterable(A.map(sources, (source) => [source.packageName, source] as const));

const buildDocgenExamplesPaths = (
  packageName: string,
  directWorkspaceDependencies: ReadonlyArray<string>,
  workspaceAliasIndex: HashMap.HashMap<string, DocgenAliasSource>,
  rootRelativePrefix: string
): Readonly<Record<string, ReadonlyArray<string>>> => {
  const packageSequence = [
    packageName,
    ...A.filter(
      uniqueSortedStringValues(directWorkspaceDependencies),
      (dependencyName) => dependencyName !== packageName
    ),
  ];

  let mappings: Record<string, ReadonlyArray<string>> = {};
  for (const dependencyName of packageSequence) {
    const aliasSource = HashMap.get(workspaceAliasIndex, dependencyName);
    if (O.isNone(aliasSource)) {
      continue;
    }

    mappings = {
      ...mappings,
      [aliasSource.value.packageName]: [withRootRelativePrefix(rootRelativePrefix, aliasSource.value.rootAliasTarget)],
      [`${aliasSource.value.packageName}/*`]: [
        withRootRelativePrefix(rootRelativePrefix, aliasSource.value.wildcardAliasTarget),
      ],
    };
  }

  return mappings;
};

/**
 * Build the canonical repo docgen config for a package.
 *
 * @param input - Package metadata plus workspace alias sources.
 * @returns Canonical docgen config payload used by init and sync workflows.
 * @category DomainModel
 * @since 0.0.0
 */
export const createCanonicalDocgenConfig: (
  input: CanonicalDocgenConfigInput
) => Effect.Effect<CanonicalDocgenConfig, never, Path.Path> = Effect.fn(function* (input: CanonicalDocgenConfigInput) {
  const path = yield* Path.Path;
  const rootRelative = normalizeSlashes(path.relative(input.packageAbsolutePath, input.rootDir));
  const rootRelativePrefix = rootRelative.length === 0 ? "./" : `${rootRelative}/`;
  const workspaceAliasIndex = buildDocgenAliasIndex(input.workspaceAliasSources);
  const examplesPaths = buildDocgenExamplesPaths(
    input.packageName,
    input.directWorkspaceDependencies,
    workspaceAliasIndex,
    rootRelativePrefix
  );

  return new CanonicalDocgenConfig({
    $schema: `${rootRelativePrefix}tooling/docgen/schema.json`,
    exclude: [...DEFAULT_DOCGEN_EXCLUDE],
    srcLink: `https://github.com/kriegcloud/beep-effect/tree/main/${input.packageRelativePath}/src/`,
    examplesCompilerOptions: new CanonicalDocgenExamplesCompilerOptions({
      noEmit: true,
      strict: true,
      skipLibCheck: true,
      moduleResolution: "bundler",
      module: "es2022",
      target: "es2022",
      lib: ["ESNext", "DOM", "DOM.Iterable"],
      rewriteRelativeImportExtensions: true,
      allowImportingTsExtensions: true,
      moduleDetection: "force",
      verbatimModuleSyntax: true,
      allowJs: false,
      erasableSyntaxOnly: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      exactOptionalPropertyTypes: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitOverride: true,
      noFallthroughCasesInSwitch: true,
      stripInternal: false,
      noErrorTruncation: true,
      types: [],
      jsx: "react-jsx",
      paths: examplesPaths,
    }),
  });
});

/**
 * Merge managed docgen fields into an existing parsed `docgen.json` document.
 *
 * Existing package-local extras are preserved. The default `exclude` field is only
 * backfilled when it is absent so package-specific exclusions survive sync.
 *
 * @param existing - Parsed existing `docgen.json` document.
 * @param canonical - Canonical managed docgen config payload.
 * @returns Next `docgen.json` object with managed fields synchronized.
 * @category DomainModel
 * @since 0.0.0
 */
export const mergeManagedDocgenConfig = (
  existing: Readonly<Record<string, unknown>>,
  canonical: CanonicalDocgenConfig
): Record<string, unknown> => {
  const canonicalJson = toCanonicalDocgenConfigJson(canonical);
  const existingExamplesCompilerOptions = isReadonlyUnknownRecord(existing.examplesCompilerOptions)
    ? existing.examplesCompilerOptions
    : undefined;
  const mergedExamplesCompilerOptions =
    existingExamplesCompilerOptions === undefined
      ? canonicalJson.examplesCompilerOptions
      : {
          ...existingExamplesCompilerOptions,
          ...canonicalJson.examplesCompilerOptions,
          ...(A.isArray(existingExamplesCompilerOptions.types) ? { types: existingExamplesCompilerOptions.types } : {}),
        };
  const merged = {
    ...existing,
    $schema: canonicalJson.$schema,
    srcLink: canonicalJson.srcLink,
    examplesCompilerOptions: mergedExamplesCompilerOptions,
  };

  return "exclude" in existing ? merged : { ...merged, exclude: [...canonicalJson.exclude] };
};
