/**
 * Shared alias target helpers for tsconfig and docgen path mappings.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { pipe } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $RepoCliId.create("commands/Shared/TsconfigAliasTargets");
const EXPORT_CONDITION_PRIORITY = ["types", "import", "default", "require", "node", "bun", "browser"] as const;

type BuildDocgenAliasTargetsOptions = {
  readonly rootExportTarget: string;
  readonly wildcardExportTarget?: string | undefined;
};

/**
 * Canonical alias targets derived for a package root export.
 *
 * @example
 * ```ts
 * console.log("CanonicalAliasTargets")
 * ```
 * @category models
 * @since 0.0.0
 */
export class CanonicalAliasTargets extends S.Class<CanonicalAliasTargets>($I`CanonicalAliasTargets`)(
  {
    rootAliasTarget: S.String,
    wildcardAliasTarget: S.String,
  },
  $I.annote("CanonicalAliasTargets", {
    description: "Canonical root and wildcard alias targets derived for a package root export.",
  })
) {}

const isRelativeDotPath = (value: unknown): value is string => P.isString(value) && Str.startsWith("./")(value);

const isReadonlyUnknownRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  P.isObject(value) && !A.isArray(value);

const isSubpathExportKey = (key: string): boolean => key === "." || Str.startsWith("./")(key);

const firstRelativeDotPath = (value: unknown): O.Option<string> => {
  if (isRelativeDotPath(value)) {
    return O.some(value);
  }

  if (A.isArray(value)) {
    return pipe(value, A.map(firstRelativeDotPath), O.firstSomeOf);
  }

  if (isReadonlyUnknownRecord(value)) {
    const prioritizedCandidate = pipe(
      EXPORT_CONDITION_PRIORITY,
      A.map((key) => pipe(value, R.get(key), O.flatMap(firstRelativeDotPath))),
      O.firstSomeOf
    );

    return pipe(
      prioritizedCandidate,
      O.orElse(() => pipe(value, R.values, A.map(firstRelativeDotPath), O.firstSomeOf))
    );
  }

  return O.none();
};

/**
 * Resolve the canonical root export target from a package `exports` field.
 *
 * @param exportsField - Raw `exports` field value from `package.json`.
 * @returns The first relative `./...` target for the root export when one exists.
 * @example
 * ```ts
 * console.log("resolveRootExportTarget")
 * ```
 * @category models
 * @since 0.0.0
 */
export const resolveRootExportTarget = (exportsField: unknown): O.Option<string> => {
  if (isReadonlyUnknownRecord(exportsField)) {
    if (P.hasProperty(exportsField, ".")) {
      return firstRelativeDotPath(exportsField["."]);
    }
    if (A.some(R.keys(exportsField), isSubpathExportKey)) {
      return O.none();
    }
  }

  return firstRelativeDotPath(exportsField);
};

/**
 * Resolve a specific subpath export target from a package `exports` field.
 *
 * @param exportsField - Raw `exports` field value from `package.json`.
 * @param subpath - Package subpath key such as `"./*"`.
 * @returns The first relative `./...` target for the requested subpath when one exists.
 * @example
 * ```ts
 * console.log("resolveSubpathExportTarget")
 * ```
 * @category models
 * @since 0.0.0
 */
export const resolveSubpathExportTarget: {
  (exportsField: unknown, subpath: string): O.Option<string>;
  (subpath: string): (exportsField: unknown) => O.Option<string>;
} = dual(2, (exportsField: unknown, subpath: string): O.Option<string> => {
  if (isReadonlyUnknownRecord(exportsField)) {
    return pipe(exportsField, R.get(subpath), O.flatMap(firstRelativeDotPath));
  }

  return O.none();
});

/**
 * Resolve the wildcard export target from a package `exports` field.
 *
 * @param exportsField - Raw `exports` field value from `package.json`.
 * @returns The first relative `./...` target for the `"./*"` subpath when one exists.
 * @example
 * ```ts
 * console.log("resolveWildcardExportTarget")
 * ```
 * @category models
 * @since 0.0.0
 */
export const resolveWildcardExportTarget = (exportsField: unknown): O.Option<string> =>
  resolveSubpathExportTarget(exportsField, "./*");

/**
 * Build root and wildcard alias targets for a package export target.
 *
 * @param packagePath - Workspace-relative package path used in tsconfig alias targets.
 * @param rootExportTarget - Canonical root export target resolved from the package `exports` field.
 * @returns Canonical root and wildcard alias targets for tsconfig path mapping.
 * @example
 * ```ts
 * console.log("buildCanonicalAliasTargets")
 * ```
 * @category models
 * @since 0.0.0
 */
export const buildCanonicalAliasTargets: {
  (packagePath: string, rootExportTarget: string): CanonicalAliasTargets;
  (rootExportTarget: string): (packagePath: string) => CanonicalAliasTargets;
} = dual(2, (packagePath: string, rootExportTarget: string): CanonicalAliasTargets => {
  const normalizedRootExportTarget = Str.replace(/^\.\//, "")(rootExportTarget);
  const rootAliasTarget = `./${packagePath}/${normalizedRootExportTarget}`;
  const lastSlash = pipe(
    rootAliasTarget,
    Str.lastIndexOf("/"),
    O.getOrElse(() => -1)
  );

  return new CanonicalAliasTargets({
    rootAliasTarget,
    wildcardAliasTarget: lastSlash < 0 ? `./${packagePath}/*` : `${pipe(rootAliasTarget, Str.slice(0, lastSlash))}/*`,
  });
});

const deriveDocgenWildcardTarget = (rootExportTarget: string): string => {
  const normalizedRootExportTarget = Str.replace(/^\.\//, "")(rootExportTarget);
  const lastSlash = pipe(
    normalizedRootExportTarget,
    Str.lastIndexOf("/"),
    O.getOrElse(() => -1)
  );

  if (lastSlash < 0) {
    return Str.endsWith(".ts")(normalizedRootExportTarget) ? "*.ts" : "*";
  }

  const parentDir = pipe(normalizedRootExportTarget, Str.slice(0, lastSlash));
  return Str.endsWith(".ts")(normalizedRootExportTarget) ? `${parentDir}/*.ts` : `${parentDir}/*`;
};

/**
 * Build source-root and source-wildcard alias targets for docgen example resolution.
 *
 * Unlike root tsconfig aliases, docgen aliases should mirror source exports directly
 * so example imports resolve to concrete `*.ts` files.
 *
 * @param packagePath - Workspace-relative package path used in alias targets.
 * @param options - Canonical root target plus optional wildcard target resolved from package `exports`.
 * @returns Source alias targets suitable for docgen `examplesCompilerOptions.paths`.
 * @example
 * ```ts
 * console.log("buildDocgenAliasTargets")
 * ```
 * @category models
 * @since 0.0.0
 */
export const buildDocgenAliasTargets: {
  (packagePath: string, options: BuildDocgenAliasTargetsOptions): CanonicalAliasTargets;
  (options: BuildDocgenAliasTargetsOptions): (packagePath: string) => CanonicalAliasTargets;
} = dual(2, (packagePath: string, options: BuildDocgenAliasTargetsOptions): CanonicalAliasTargets => {
  const normalizedRootExportTarget = Str.replace(/^\.\//, "")(options.rootExportTarget);
  const normalizedWildcardExportTarget = Str.replace(
    /^\.\//,
    ""
  )(options.wildcardExportTarget ?? deriveDocgenWildcardTarget(options.rootExportTarget));

  return new CanonicalAliasTargets({
    rootAliasTarget: `./${packagePath}/${normalizedRootExportTarget}`,
    wildcardAliasTarget: `./${packagePath}/${normalizedWildcardExportTarget}`,
  });
});
