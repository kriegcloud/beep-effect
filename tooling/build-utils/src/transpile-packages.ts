import { buildRepoDependencyIndex, mapWorkspaceToPackageJsonPath } from "@beep/tooling-utils/repo";
import { PackageJson } from "@beep/tooling-utils/schemas/PackageJson";
import * as FileSystem from "@effect/platform/FileSystem";
import { pipe } from "effect";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";

/**
 * Checks if a value (from exports, module, or main fields) points to TypeScript source.
 *
 * Returns true if the value:
 * - Is a string ending with `.ts`
 * - Is a string containing `/src/`
 * - Is an object/record where any nested value satisfies the above
 */
const isSourceExport = (value: unknown): boolean => {
  if (Str.isString(value)) {
    return P.or(Str.endsWith(".ts"), Str.includes("/src/"))(value);
  }
  if (P.and(P.isNotNullable, P.isObject)(value)) {
    return pipe(value, R.values, A.some(isSourceExport));
  }
  return false;
};

/**
 * Checks if a string path points to TypeScript source.
 */
const isTypeScriptSourcePath = P.or(Str.endsWith(".ts"), Str.includes("/src/"));

/**
 * Determines if a package at the given path needs transpilation.
 *
 * A package needs transpilation if its `exports`, `module`, or `main` fields
 * point to TypeScript source files (`.ts`) or source directories (`/src/`).
 *
 * @param packageJsonPath - Absolute path to the package.json file
 * @returns Effect that resolves to true if the package needs transpilation
 */
const checkPackageNeedsTranspilation = Effect.fn("checkPackageNeedsTranspilation")(function* (packageJsonPath: string) {
  const fsService = yield* FileSystem.FileSystem;

  const packageJsonRaw = yield* fsService.readFileString(packageJsonPath, "utf8");
  const packageJson = yield* S.decodeUnknown(S.parseJson(PackageJson))(packageJsonRaw);

  // Check exports field
  const exportsNeedsTranspile = pipe(
    O.fromNullable(packageJson.exports),
    O.map(isSourceExport),
    O.getOrElse(() => false)
  );
  if (exportsNeedsTranspile) return true;

  // Check module field
  const moduleNeedsTranspile = pipe(
    O.fromNullable(packageJson.module),
    O.map(isTypeScriptSourcePath),
    O.getOrElse(() => false)
  );
  if (moduleNeedsTranspile) return true;

  // Check main field
  const mainNeedsTranspile = pipe(
    O.fromNullable(packageJson.main),
    O.map(isTypeScriptSourcePath),
    O.getOrElse(() => false)
  );
  return !!mainNeedsTranspile;
});

/**
 * Options for computing transpile packages.
 */
export interface TranspilePackagesOptions {
  /**
   * The workspace package name to analyze (e.g., "@beep/web").
   */
  readonly target: `@beep/${string}`;
}

/**
 * Computes the list of workspace packages that need transpilation for a given target package.
 *
 * This analyzes the target package's dependencies (both regular and dev) and filters
 * to only include packages whose `exports`, `module`, or `main` fields point to
 * TypeScript source files rather than compiled output.
 *
 * @example
 * ```ts
 * import { computeTranspilePackages } from "@beep/build-utils/transpile-packages";
 * import * as Effect from "effect/Effect";
 *
 * const program = computeTranspilePackages({ target: "@beep/web" });
 *
 * Effect.runPromise(program);
 * ```
 *
 * @param options - Configuration options
 * @returns Effect that resolves to an array of package names requiring transpilation
 */
export const computeTranspilePackages = (options: TranspilePackagesOptions) =>
  Effect.gen(function* () {
    const { target } = options;

    const packagePathMap = yield* mapWorkspaceToPackageJsonPath;
    const dependencyIndex = yield* buildRepoDependencyIndex;

    // Get the target package's dependency info
    const targetDependencies = yield* HashMap.get(dependencyIndex, target);
    // Collect all workspace dependencies (both regular and dev)
    const regularDeps = HashSet.toValues(targetDependencies.dependencies.workspace);
    const devDeps = HashSet.toValues(targetDependencies.devDependencies.workspace);
    const allWorkspaceDependencies = HashSet.fromIterable([...regularDeps, ...devDeps]);

    // Filter to packages that need transpilation
    return yield* Effect.filter(
      HashSet.toValues(allWorkspaceDependencies),
      (packageName) => pipe(HashMap.get(packagePathMap, packageName), Effect.flatMap(checkPackageNeedsTranspilation)),
      { concurrency: HashSet.size(allWorkspaceDependencies) }
    );
  }).pipe(Effect.withSpan("computeTranspilePackages"), Effect.catchAll(Effect.die));
