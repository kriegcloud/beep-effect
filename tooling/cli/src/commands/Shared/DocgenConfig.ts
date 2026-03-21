import { $RepoCliId } from "@beep/identity/packages";
import type { PackageJson } from "@beep/repo-utils";
import { Effect, HashMap, HashSet, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
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
} = dual(
  2,
  (rootRelativePrefix: string, targetPath: string): string =>
    `${rootRelativePrefix}${Str.replace(/^\.\//, Str.empty)(targetPath)}`
);

/**
 * Default docgen exclude globs for repo packages.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const DEFAULT_DOCGEN_EXCLUDE = ["src/internal/**/*.ts"] as const;

/**
 * Workspace alias metadata used to build docgen example path mappings.
 *
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
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
 * Canonical repo docgen config payload.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CanonicalDocgenConfig = {
  readonly $schema: string;
  readonly exclude: ReadonlyArray<string>;
  readonly srcLink: string;
  readonly examplesCompilerOptions: {
    readonly noEmit: true;
    readonly strict: true;
    readonly skipLibCheck: true;
    readonly moduleResolution: "Bundler";
    readonly module: "ES2022";
    readonly target: "ES2022";
    readonly lib: readonly ["ESNext", "DOM", "DOM.Iterable"];
    readonly rewriteRelativeImportExtensions: true;
    readonly allowImportingTsExtensions: true;
    readonly moduleDetection: "force";
    readonly verbatimModuleSyntax: true;
    readonly allowJs: false;
    readonly erasableSyntaxOnly: true;
    readonly declaration: true;
    readonly declarationMap: true;
    readonly sourceMap: true;
    readonly exactOptionalPropertyTypes: true;
    readonly noUnusedLocals: true;
    readonly noUnusedParameters: true;
    readonly noImplicitOverride: true;
    readonly noFallthroughCasesInSwitch: true;
    readonly stripInternal: false;
    readonly noErrorTruncation: true;
    readonly types: readonly [];
    readonly jsx: "react-jsx";
    readonly paths: Readonly<Record<string, ReadonlyArray<string>>>;
  };
};

/**
 * Collect direct workspace package dependencies from a package manifest.
 *
 * @param packageJson - Parsed package manifest.
 * @returns Sorted unique `@beep/*` dependency names across all dependency sections.
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
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
 * @since 0.0.0
 * @category DomainModel
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

  return {
    $schema: `${rootRelativePrefix}node_modules/@effect/docgen/schema.json`,
    exclude: [...DEFAULT_DOCGEN_EXCLUDE],
    srcLink: `https://github.com/kriegcloud/beep-effect/tree/main/${input.packageRelativePath}/src/`,
    examplesCompilerOptions: {
      noEmit: true,
      strict: true,
      skipLibCheck: true,
      moduleResolution: "Bundler",
      module: "ES2022",
      target: "ES2022",
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
    },
  };
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
 * @since 0.0.0
 * @category DomainModel
 */
export const mergeManagedDocgenConfig = (
  existing: Readonly<Record<string, unknown>>,
  canonical: CanonicalDocgenConfig
): Record<string, unknown> => {
  const merged = {
    ...existing,
    $schema: canonical.$schema,
    srcLink: canonical.srcLink,
    examplesCompilerOptions: canonical.examplesCompilerOptions,
  };

  return "exclude" in existing ? merged : { ...merged, exclude: [...canonical.exclude] };
};
