import { String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";

/**
 * Canonical alias targets derived for a package root export.
 *
 * @since 0.0.0
 * @category Models
 */
export type CanonicalAliasTargets = {
  readonly rootAliasTarget: string;
  readonly wildcardAliasTarget: string;
};

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
 * @since 0.0.0
 * @category Constructors
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
 * Build root and wildcard alias targets for a package export target.
 *
 * @param packagePath - Workspace-relative package path used in tsconfig alias targets.
 * @param rootExportTarget - Canonical root export target resolved from the package `exports` field.
 * @returns Canonical root and wildcard alias targets for tsconfig path mapping.
 * @since 0.0.0
 * @category Constructors
 */
export const buildCanonicalAliasTargets = (packagePath: string, rootExportTarget: string): CanonicalAliasTargets => {
  const normalizedRootExportTarget = Str.replace(/^\.\//, "")(rootExportTarget);
  const rootAliasTarget = `./${packagePath}/${normalizedRootExportTarget}`;
  const lastSlash = rootAliasTarget.lastIndexOf("/");

  return {
    rootAliasTarget,
    wildcardAliasTarget: lastSlash < 0 ? `./${packagePath}/*` : `${rootAliasTarget.slice(0, lastSlash)}/*`,
  };
};
