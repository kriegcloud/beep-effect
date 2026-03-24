import { $RepoCliId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $RepoCliId.create("commands/Shared/TsconfigAliasTargets");

/**
 * Canonical alias targets derived for a package root export.
 *
 * @category DomainModel
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

const firstRelativeDotPath = (value: unknown): O.Option<string> => {
  if (isRelativeDotPath(value)) {
    return O.some(value);
  }

  if (value === null) {
    return O.none();
  }

  if (A.isArray(value)) {
    for (const entry of value) {
      const candidate = firstRelativeDotPath(entry);
      if (O.isSome(candidate)) {
        return candidate;
      }
    }
    return O.none();
  }

  if (P.isObject(value)) {
    const entry = value as Record<string, unknown>;

    for (const key of ["types", "import", "default", "require", "node", "bun", "browser"]) {
      if (!(key in entry)) {
        continue;
      }
      const candidate = firstRelativeDotPath(entry[key]);
      if (O.isSome(candidate)) {
        return candidate;
      }
    }

    for (const nested of Object.values(entry)) {
      const candidate = firstRelativeDotPath(nested);
      if (O.isSome(candidate)) {
        return candidate;
      }
    }
  }

  return O.none();
};

/**
 * Resolve the canonical root export target from a package `exports` field.
 *
 * @param exportsField - Raw `exports` field value from `package.json`.
 * @returns The first relative `./...` target for the root export when one exists.
 * @category DomainModel
 * @since 0.0.0
 */
export const resolveRootExportTarget = (exportsField: unknown): O.Option<string> => {
  if (P.isObject(exportsField) && !A.isArray(exportsField)) {
    const exportsRecord = exportsField as Record<string, unknown>;
    if ("." in exportsRecord) {
      return firstRelativeDotPath(exportsRecord["."]);
    }
    if (Object.keys(exportsRecord).some((key) => key === "." || Str.startsWith("./")(key))) {
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
 * @category DomainModel
 * @since 0.0.0
 */
export const resolveSubpathExportTarget = (exportsField: unknown, subpath: string): O.Option<string> => {
  if (P.isObject(exportsField) && !A.isArray(exportsField)) {
    const exportsRecord = exportsField as Record<string, unknown>;
    if (subpath in exportsRecord) {
      return firstRelativeDotPath(exportsRecord[subpath]);
    }
  }

  return O.none();
};

/**
 * Resolve the wildcard export target from a package `exports` field.
 *
 * @param exportsField - Raw `exports` field value from `package.json`.
 * @returns The first relative `./...` target for the `"./*"` subpath when one exists.
 * @category DomainModel
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
 * @category DomainModel
 * @since 0.0.0
 */
export const buildCanonicalAliasTargets = (packagePath: string, rootExportTarget: string): CanonicalAliasTargets => {
  const normalizedRootExportTarget = Str.replace(/^\.\//, "")(rootExportTarget);
  const rootAliasTarget = `./${packagePath}/${normalizedRootExportTarget}`;
  const lastSlash = rootAliasTarget.lastIndexOf("/");

  return new CanonicalAliasTargets({
    rootAliasTarget,
    wildcardAliasTarget: lastSlash < 0 ? `./${packagePath}/*` : `${rootAliasTarget.slice(0, lastSlash)}/*`,
  });
};

const deriveDocgenWildcardTarget = (rootExportTarget: string): string => {
  const normalizedRootExportTarget = Str.replace(/^\.\//, "")(rootExportTarget);
  const lastSlash = normalizedRootExportTarget.lastIndexOf("/");

  if (lastSlash < 0) {
    return normalizedRootExportTarget.endsWith(".ts") ? "*.ts" : "*";
  }

  const parentDir = normalizedRootExportTarget.slice(0, lastSlash);
  return normalizedRootExportTarget.endsWith(".ts") ? `${parentDir}/*.ts` : `${parentDir}/*`;
};

/**
 * Build source-root and source-wildcard alias targets for docgen example resolution.
 *
 * Unlike root tsconfig aliases, docgen aliases should mirror source exports directly
 * so example imports resolve to concrete `*.ts` files.
 *
 * @param packagePath - Workspace-relative package path used in alias targets.
 * @param rootExportTarget - Canonical root export target resolved from package `exports`.
 * @param wildcardExportTarget - Optional explicit wildcard export target from package `exports`.
 * @returns Source alias targets suitable for docgen `examplesCompilerOptions.paths`.
 * @category DomainModel
 * @since 0.0.0
 */
export const buildDocgenAliasTargets = (
  packagePath: string,
  rootExportTarget: string,
  wildcardExportTarget?: string
): CanonicalAliasTargets => {
  const normalizedRootExportTarget = Str.replace(/^\.\//, "")(rootExportTarget);
  const normalizedWildcardExportTarget = Str.replace(
    /^\.\//,
    ""
  )(wildcardExportTarget ?? deriveDocgenWildcardTarget(rootExportTarget));

  return new CanonicalAliasTargets({
    rootAliasTarget: `./${packagePath}/${normalizedRootExportTarget}`,
    wildcardAliasTarget: `./${packagePath}/${normalizedWildcardExportTarget}`,
  });
};
